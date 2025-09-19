import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Prompt, Folder } from '../types';
import { AI_MODELS, COLOR_PALETTE, PROMPT_TYPES, IMAGE_PROMPT_TYPE } from '../constants';
import { XIcon, CheckIcon, UploadIcon, ImportIcon, ExportIcon, FileCodeIcon, FileTextIcon, ChevronDownIcon } from './icons';

interface PromptModalProps {
  onClose: () => void;
  onSave: (prompt: Prompt) => void;
  folders: Folder[];
  promptToEdit: Prompt | null;
}

const PromptModal: React.FC<PromptModalProps> = ({ onClose, onSave, folders, promptToEdit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [parameters, setParameters] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [folderId, setFolderId] = useState<string | null>(null);
  const [model, setModel] = useState(AI_MODELS[0]);
  const [color, setColor] = useState(COLOR_PALETTE[7]);
  const [promptType, setPromptType] = useState(PROMPT_TYPES[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [isImageSettingsOpen, setIsImageSettingsOpen] = useState(true);


  const isImagePrompt = useMemo(() => promptType === IMAGE_PROMPT_TYPE, [promptType]);

  useEffect(() => {
    if (promptToEdit) {
      setTitle(promptToEdit.title);
      setContent(promptToEdit.content);
      setNegativePrompt(promptToEdit.negativePrompt ?? '');
      setParameters(promptToEdit.parameters ?? '');
      setImageUrl(promptToEdit.imageUrl ?? '');
      setFolderId(promptToEdit.folderId);
      setModel(promptToEdit.model);
      setColor(promptToEdit.color);
      setPromptType(promptToEdit.promptType);
    }
  }, [promptToEdit]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() === '' || content.trim() === '') return;

    const newPrompt: Prompt = {
      id: promptToEdit ? promptToEdit.id : crypto.randomUUID(),
      title: title.trim(),
      content: content.trim(),
      folderId,
      promptType,
      model,
      color,
      createdAt: promptToEdit ? promptToEdit.createdAt : new Date().toISOString(),
      ...(isImagePrompt && {
        negativePrompt: negativePrompt.trim(),
        parameters: parameters.trim(),
        imageUrl: imageUrl.trim()
      })
    };
    onSave(newPrompt);
  };

  const folderOptions = useMemo(() => {
    return folders
      .slice()
      .sort((a,b) => a.name.localeCompare(b.name));
  }, [folders]);

    const handleFileSelect = (file: File | null) => {
        if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setImageUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
        } else if (file) {
            alert("Пожалуйста, выберите файл изображения.");
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        handleFileSelect(file);
    };

    const handleRemoveImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setImageUrl('');
        if (fileInputRef.current) {
        fileInputRef.current.value = '';
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0] || null;
        handleFileSelect(file);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };
    
    const handleExportPrompt = (format: 'json' | 'txt') => {
        const currentPromptData = {
            title: title.trim(),
            content: content.trim(),
            promptType,
            model,
            color,
            ...(isImagePrompt && {
                negativePrompt: negativePrompt.trim(),
                parameters: parameters.trim(),
                imageUrl: '' // We don't export local data URLs for privacy and portability
            })
        };

        const safeTitle = (title.trim().replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'prompt').substring(0, 30);
        let fileContent = '';
        let mimeType = '';
        let filename = '';

        if (format === 'json') {
            fileContent = JSON.stringify(currentPromptData, null, 2);
            mimeType = 'application/json';
            filename = `${safeTitle}.json`;
        } else { // txt
            mimeType = 'text/plain';
            filename = `${safeTitle}.txt`;
            
            let str = `Title: ${currentPromptData.title}\n`;
            str += `Model: ${currentPromptData.model}\n`;
            str += `Type: ${currentPromptData.promptType}\n`;
            str += `Color: ${currentPromptData.color}\n`;
            str += `--- PROMPT ---\n${currentPromptData.content}\n`;
            if (isImagePrompt) {
                if (currentPromptData.negativePrompt) str += `--- NEGATIVE PROMPT ---\n${currentPromptData.negativePrompt}\n`;
                if (currentPromptData.parameters) str += `--- PARAMETERS ---\n${currentPromptData.parameters}\n`;
            }
            fileContent = str;
        }

        const blob = new Blob([fileContent], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsExportMenuOpen(false);
    };
    
    const handleImportPrompt = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (readerEvent) => {
                try {
                    const content = readerEvent.target?.result as string;
                    const importedPrompt = JSON.parse(content);
                    
                    if (typeof importedPrompt.title !== 'string' || typeof importedPrompt.content !== 'string') {
                        throw new Error('Неверный формат файла промпта.');
                    }

                    setTitle(importedPrompt.title || '');
                    setContent(importedPrompt.content || '');
                    setPromptType(PROMPT_TYPES.includes(importedPrompt.promptType) ? importedPrompt.promptType : PROMPT_TYPES[0]);
                    setModel(AI_MODELS.includes(importedPrompt.model) ? importedPrompt.model : AI_MODELS[0]);
                    setColor(COLOR_PALETTE.includes(importedPrompt.color) ? importedPrompt.color : COLOR_PALETTE[7]);
                    
                    const isImportedImagePrompt = importedPrompt.promptType === IMAGE_PROMPT_TYPE;
                    
                    setNegativePrompt(isImportedImagePrompt ? (importedPrompt.negativePrompt || '') : '');
                    setParameters(isImportedImagePrompt ? (importedPrompt.parameters || '') : '');
                    setImageUrl(''); // Never import image URL, user should re-upload

                    alert('Данные промпта успешно импортированы!');

                } catch (err) {
                    alert('Не удалось импортировать файл. Убедитесь, что это корректный JSON файл промпта.');
                    console.error(err);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-0 sm:p-4 animate-fade-in">
      <div className="bg-gray-800 rounded-none sm:rounded-lg shadow-2xl w-full h-full sm:h-auto sm:w-full sm:max-w-2xl border-gray-700 sm:border flex flex-col sm:max-h-[90vh] animate-scale-in">
        <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-white">{promptToEdit ? 'Редактировать промпт' : 'Создать новый промпт'}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-700 hover:text-white">
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        <div className="flex-grow overflow-y-auto">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="p-4 sm:p-6 space-y-6 flex-grow">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-1">Название</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="например, Создать маркетинговые слоганы"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-accent"
                  required
                />
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-400 mb-1">{isImagePrompt ? 'Основной промпт' : 'Содержимое промпта'}</label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Используйте [переменные] для динамического контента..."
                  rows={isImagePrompt ? 5 : 8}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-accent font-mono text-sm"
                  required
                />
                 <p className="text-xs text-gray-500 mt-1">Используйте квадратные скобки, например [переменная], для создания плейсхолдеров.</p>
              </div>

              {isImagePrompt && (
                 <div className="bg-gray-900/30 rounded-lg border border-gray-700">
                    <button
                        type="button"
                        onClick={() => setIsImageSettingsOpen(!isImageSettingsOpen)}
                        className="w-full flex items-center justify-between p-3 text-left"
                        aria-expanded={isImageSettingsOpen}
                    >
                        <h3 className="font-semibold text-gray-300">Настройки генерации изображений</h3>
                        <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isImageSettingsOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isImageSettingsOpen && (
                        <div className="p-4 border-t border-gray-700 space-y-6 animate-fade-in">
                            <div>
                                <label htmlFor="negativePrompt" className="block text-sm font-medium text-gray-400 mb-1">Негативный промпт <span className="text-gray-500">(опционально)</span></label>
                                <textarea
                                    id="negativePrompt"
                                    value={negativePrompt}
                                    onChange={(e) => setNegativePrompt(e.target.value)}
                                    placeholder="например, размытый, мультяшный, искаженные руки..."
                                    rows={3}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-accent font-mono text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="parameters" className="block text-sm font-medium text-gray-400 mb-1">Параметры <span className="text-gray-500">(опционально)</span></label>
                                <input
                                    id="parameters"
                                    type="text"
                                    value={parameters}
                                    onChange={(e) => setParameters(e.target.value)}
                                    placeholder="--ar 16:9 --v 6"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-accent font-mono text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Изображение <span className="text-gray-500">(опционально)</span></label>
                                {imageUrl ? (
                                    <div className="relative group">
                                        <img src={imageUrl} alt="Предпросмотр" className="w-full h-auto max-h-60 object-contain rounded-md bg-gray-700/50" />
                                        <button 
                                            onClick={handleRemoveImage} 
                                            className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            aria-label="Удалить изображение"
                                            title="Удалить изображение"
                                        >
                                            <XIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`flex justify-center items-center w-full px-6 py-10 border-2 border-dashed rounded-md cursor-pointer transition-colors
                                        ${isDragging ? 'border-blue-accent bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'}`}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            id="imageUpload"
                                        />
                                        <div className="text-center pointer-events-none">
                                            <UploadIcon className="mx-auto h-10 w-10 text-gray-500" />
                                            <p className="mt-2 text-sm text-gray-400">
                                                <span className="font-semibold text-blue-accent">Загрузите файл</span> или перетащите его сюда
                                            </p>
                                            <p className="text-xs text-gray-500">PNG, JPG, GIF</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                  <label htmlFor="promptType" className="block text-sm font-medium text-gray-400 mb-1">Тип промпта</label>
                  <select
                    id="promptType"
                    value={promptType}
                    onChange={(e) => setPromptType(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-accent"
                  >
                    {PROMPT_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="folder" className="block text-sm font-medium text-gray-400 mb-1">Папка</label>
                  <select
                    id="folder"
                    value={folderId ?? 'none'}
                    onChange={(e) => setFolderId(e.target.value === 'none' ? null : e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-accent"
                  >
                    <option value="none">Без категории</option>
                    {folderOptions.map(f => (
                      <option key={f.id} value={f.id}>
                          {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                  <label htmlFor="model" className="block text-sm font-medium text-gray-400 mb-1">AI Модель</label>
                  <select
                    id="model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-accent"
                  >
                    {AI_MODELS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Цветовая метка</label>
                  <div className="flex flex-wrap gap-3">
                      {COLOR_PALETTE.map(c => (
                          <button 
                              type="button"
                              key={c}
                              onClick={() => setColor(c)}
                              className="w-8 h-8 rounded-full transition-transform duration-150 transform hover:scale-110 focus:outline-none"
                              style={{ backgroundColor: c }}
                              aria-label={`Выбрать цвет ${c}`}
                          >
                              {color === c && <CheckIcon className="w-6 h-6 text-white m-auto drop-shadow-md"/>}
                          </button>
                      ))}
                  </div>
              </div>
            </div>
            <footer className="relative flex items-center justify-between p-4 border-t border-gray-700 flex-shrink-0 bg-gray-800 sm:rounded-b-lg">
                <div className="flex items-center gap-2">
                    <button type="button" onClick={handleImportPrompt} title="Импортировать промпт из JSON" className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold py-2 px-3 rounded-md transition-colors text-sm">
                        <ImportIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Импорт</span>
                    </button>
                    <button type="button" onClick={() => setIsExportMenuOpen(prev => !prev)} title="Экспортировать текущий промпт" className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold py-2 px-3 rounded-md transition-colors text-sm">
                        <ExportIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Экспорт</span>
                    </button>
                </div>

                {isExportMenuOpen && (
                    <div ref={exportMenuRef} className="absolute bottom-full mb-2 left-4 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-10 w-48 text-sm animate-fade-in">
                        <button onClick={() => handleExportPrompt('json')} className="w-full text-left px-3 py-2.5 hover:bg-gray-600/80 flex items-center gap-3 rounded-t-md text-white">
                            <FileCodeIcon className="w-5 h-5 text-blue-accent flex-shrink-0" />
                            <span>Экспорт в JSON</span>
                        </button>
                         <button onClick={() => handleExportPrompt('txt')} className="w-full text-left px-3 py-2.5 hover:bg-gray-600/80 flex items-center gap-3 rounded-b-md text-white">
                            <FileTextIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                            <span>Экспорт в TXT</span>
                        </button>
                    </div>
                )}
                
                <div>
                    <button onClick={onClose} type="button" className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md transition-colors mr-2">
                        Отмена
                    </button>
                    <button type="submit" className="bg-blue-accent hover:bg-blue-accent-hover text-white font-semibold py-2 px-4 rounded-md transition-colors">
                        {promptToEdit ? 'Сохранить изменения' : 'Создать промпт'}
                    </button>
                </div>
            </footer>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PromptModal;