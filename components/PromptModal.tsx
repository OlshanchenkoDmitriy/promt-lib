import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Prompt, Folder, ArtistStyle, LastUsedSettings } from '../types';
import { AI_MODELS, COLOR_PALETTE, PROMPT_TYPES, IMAGE_PROMPT_TYPE, ARTIST_STYLE_PROMPT_TYPE } from '../constants';
import { XIcon, CheckIcon, UploadIcon, ImportIcon, ExportIcon, FileCodeIcon, FileTextIcon, ChevronDownIcon, SparklesIcon, CodeIcon } from './icons';
import AIAssistantModal from './AIAssistantModal';
import { PillSelector } from './PillSelector';

interface PromptModalProps {
  onClose: () => void;
  onSave: (prompt: Prompt) => void;
  folders: Folder[];
  promptToEdit: Prompt | null;
  lastUsedSettings?: LastUsedSettings;
}

const initialArtistStyleState: ArtistStyle = {
  era: "",
  genre: "",
  style: "",
  vocals: "",
  mood: "",
  instrumentation: "",
  mastering: ""
};

const artistStyleFields: { key: keyof ArtistStyle; label: string; placeholder: string; isTextarea?: boolean }[] = [
    { key: 'era', label: 'Era', placeholder: 'e.g., 2020s, 1980s' },
    { key: 'genre', label: 'Genre', placeholder: 'e.g., alt-R&B, trap, synthwave' },
    { key: 'style', label: 'Style', placeholder: 'Describe the overall style...', isTextarea: true },
    { key: 'vocals', label: 'Vocals', placeholder: 'Describe vocal characteristics...', isTextarea: true },
    { key: 'mood', label: 'Mood', placeholder: 'e.g., grandiose, nocturnal, otherworldly', isTextarea: true },
    { key: 'instrumentation', label: 'Instrumentation', placeholder: 'e.g., analog synth walls, cosmic pads...', isTextarea: true },
    { key: 'mastering', label: 'Mastering', placeholder: 'Describe mastering details...', isTextarea: true },
];

const ArtistStyleForm: React.FC<{data: ArtistStyle, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void}> = ({data, onChange}) => (
    <div className="space-y-4">
        {artistStyleFields.map(field => (
            <div key={field.key}>
                <label htmlFor={field.key} className="block text-sm font-medium text-gray-400 mb-1 capitalize">{field.label}</label>
                {field.isTextarea ? (
                    <textarea
                        id={field.key}
                        name={field.key}
                        value={data[field.key]}
                        onChange={onChange}
                        placeholder={field.placeholder}
                        rows={3}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-accent font-mono text-sm"
                    />
                ) : (
                    <input
                        id={field.key}
                        name={field.key}
                        type="text"
                        value={data[field.key]}
                        onChange={onChange}
                        placeholder={field.placeholder}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-accent"
                    />
                )}
            </div>
        ))}
    </div>
);


const PromptModal: React.FC<PromptModalProps> = ({ onClose, onSave, folders, promptToEdit, lastUsedSettings }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [parameters, setParameters] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [folderId, setFolderId] = useState<string | null>(lastUsedSettings?.folderId ?? null);
  const [model, setModel] = useState(lastUsedSettings?.model ?? AI_MODELS[0]);
  const [color, setColor] = useState(COLOR_PALETTE[7]);
  const [promptType, setPromptType] = useState(lastUsedSettings?.promptType ?? PROMPT_TYPES[0]);
  const [artistStyle, setArtistStyle] = useState<ArtistStyle>(initialArtistStyleState);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [isImageSettingsOpen, setIsImageSettingsOpen] = useState(true);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [showSnippetImporter, setShowSnippetImporter] = useState(false);
  const [snippetText, setSnippetText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);

  const isImagePrompt = useMemo(() => promptType === IMAGE_PROMPT_TYPE, [promptType]);
  const isArtistStylePrompt = useMemo(() => promptType === ARTIST_STYLE_PROMPT_TYPE, [promptType]);

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
       if (promptToEdit.promptType === ARTIST_STYLE_PROMPT_TYPE) {
            try {
                const parsedContent = JSON.parse(promptToEdit.content);
                setArtistStyle({ ...initialArtistStyleState, ...parsedContent });
            } catch (e) {
                console.error("Failed to parse artist style content", e);
                setArtistStyle(initialArtistStyleState);
            }
        } else {
             setArtistStyle(initialArtistStyleState);
        }
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
    
    const finalContent = isArtistStylePrompt ? JSON.stringify(artistStyle) : content.trim();

    if (title.trim() === '' || (!isArtistStylePrompt && finalContent === '')) return;

    const newPrompt: Prompt = {
      id: promptToEdit ? promptToEdit.id : crypto.randomUUID(),
      title: title.trim(),
      content: finalContent,
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
   
  const handleArtistStyleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setArtistStyle(prev => ({ ...prev, [name]: value }));
  };

  const handleParseAndFill = () => {
    setParseError(null);
    if (!snippetText.trim()) {
        setParseError("Поле не может быть пустым.");
        return;
    }

    try {
        // Extract variable name
        const varNameMatch = snippetText.match(/const\s+([\w\s_]+)\s*=/);
        if (!varNameMatch || !varNameMatch[1]) {
            throw new Error('Не удалось найти имя переменной в формате `const name = ...`');
        }
        
        const variableName = varNameMatch[1].trim();
        let newTitle = '';
        
        // Step 1: Convert variable name into a list of words
        // Handles snake_case, camelCase, and spaces.
        const words = variableName
            .replace(/_/g, ' ') // snake_case to spaces
            .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase to spaces e.g. helloWorld -> hello World
            .replace(/\s+/g, ' ') // normalize spaces
            .trim()
            .split(' ');

        // Step 2: Define keywords that describe the prompt type, not the name
        const keywords = new Set(['sound', 'producer', 'lyrical', 'profile', 'artistic']);

        // Step 3: Partition the words into groups based on keywords
        const nameGroups: string[][] = [];
        let currentGroup: string[] = [];
        
        words.forEach(word => {
            if (keywords.has(word.toLowerCase())) {
                // If we hit a keyword and have a group, push it.
                if (currentGroup.length > 0) {
                    nameGroups.push(currentGroup);
                }
                currentGroup = []; // Reset for the next name part.
            } else {
                // It's a name part, add to the current group.
                currentGroup.push(word);
            }
        });

        // Add any trailing group
        if (currentGroup.length > 0) {
            nameGroups.push(currentGroup);
        }

        // Step 4: Construct the title from the groups
        if (nameGroups.length > 0) {
            newTitle = nameGroups.map(group => group.join(' ')).join(', ');
        } else {
            newTitle = variableName; // fallback if all words were keywords
        }

        const objectStartIndex = snippetText.indexOf('{');
        const objectEndIndex = snippetText.lastIndexOf('}');

        if (objectStartIndex === -1 || objectEndIndex === -1) {
            throw new Error('Не найден JS-объект. Убедитесь, что код содержит `{ ... }`.');
        }

        const objectStr = snippetText.substring(objectStartIndex, objectEndIndex + 1);
        
        // Using new Function is safer than eval
        const parser = new Function('return ' + objectStr);
        const parsedData = parser();

        if (typeof parsedData !== 'object' || parsedData === null) {
            throw new Error('Не удалось распознать объект в коде.');
        }

        if (newTitle) {
            setTitle(newTitle);
        }

        const updatedStyle = { ...initialArtistStyleState };
        for (const key in updatedStyle) {
            if (Object.prototype.hasOwnProperty.call(parsedData, key)) {
                 updatedStyle[key as keyof ArtistStyle] = String(parsedData[key]);
            }
        }
        
        setArtistStyle(updatedStyle);
        setShowSnippetImporter(false);
        setSnippetText('');

    } catch (e: any) {
        console.error("Parsing error:", e);
        setParseError(e.message || "Неверный формат JS-сниппета.");
    }
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
            content: isArtistStylePrompt ? JSON.stringify(artistStyle) : content.trim(),
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
            fileContent = isArtistStylePrompt ? JSON.stringify({ ...currentPromptData, content: artistStyle }, null, 2) : JSON.stringify(currentPromptData, null, 2);
            mimeType = 'application/json';
            filename = `${safeTitle}.json`;
        } else { // txt
            mimeType = 'text/plain';
            filename = `${safeTitle}.txt`;
            
            let str = `Title: ${currentPromptData.title}\n`;
            str += `Model: ${currentPromptData.model}\n`;
            str += `Type: ${currentPromptData.promptType}\n`;
            str += `Color: ${currentPromptData.color}\n`;
            
            if (isArtistStylePrompt) {
                 str += `--- STYLE DETAILS ---\n`;
                 str += Object.entries(artistStyle).map(([k,v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`).join('\n');
            } else {
                 str += `--- PROMPT ---\n${currentPromptData.content}\n`;
            }

            if (isImagePrompt) {
                if (negativePrompt.trim()) str += `--- NEGATIVE PROMPT ---\n${negativePrompt.trim()}\n`;
                if (parameters.trim()) str += `--- PARAMETERS ---\n${parameters.trim()}\n`;
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
                    const fileContent = readerEvent.target?.result as string;
                    const importedPrompt = JSON.parse(fileContent);
                    
                    const isImportedArtistStyle = importedPrompt.promptType === ARTIST_STYLE_PROMPT_TYPE;

                    if (typeof importedPrompt.title !== 'string' || (isImportedArtistStyle ? typeof importedPrompt.content !== 'object' : typeof importedPrompt.content !== 'string')) {
                        throw new Error('Неверный формат файла промпта.');
                    }

                    setTitle(importedPrompt.title || '');
                    setPromptType(PROMPT_TYPES.includes(importedPrompt.promptType) ? importedPrompt.promptType : PROMPT_TYPES[0]);
                    setModel(AI_MODELS.includes(importedPrompt.model) ? importedPrompt.model : AI_MODELS[0]);
                    setColor(COLOR_PALETTE.includes(importedPrompt.color) ? importedPrompt.color : COLOR_PALETTE[7]);
                    
                    const isImportedImagePrompt = importedPrompt.promptType === IMAGE_PROMPT_TYPE;

                    if (isImportedArtistStyle) {
                        setArtistStyle({ ...initialArtistStyleState, ...importedPrompt.content });
                        setContent('');
                    } else {
                        setContent(importedPrompt.content || '');
                        setArtistStyle(initialArtistStyleState);
                    }
                    
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
    <>
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-0 sm:p-4 animate-fade-in">
        <div className="bg-gray-800 rounded-none sm:rounded-lg shadow-2xl w-full h-full sm:h-auto sm:w-full sm:max-w-2xl border-gray-700 sm:border flex flex-col sm:max-h-[90vh] animate-scale-in relative">
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
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="content" className="block text-sm font-medium text-gray-400">
                        {isImagePrompt ? 'Основной промпт' : isArtistStylePrompt ? 'Описание стиля' : 'Содержимое промпта'}
                    </label>
                    {isArtistStylePrompt && (
                        <button type="button" onClick={() => setShowSnippetImporter(true)} className="flex items-center gap-1.5 text-sm text-blue-accent hover:text-blue-400 transition-colors" title="Импортировать из JS-сниппета">
                            <CodeIcon className="w-4 h-4" />
                            <span>Импорт из JS</span>
                        </button>
                    )}
                    {!isArtistStylePrompt && !isImagePrompt && (
                        <button type="button" onClick={() => setIsAIAssistantOpen(true)} className="flex items-center gap-1.5 text-sm text-blue-accent hover:text-blue-400 transition-colors" title="Помощник по шаблонам">
                            <SparklesIcon className="w-4 h-4" />
                            <span>Помощник по шаблонам</span>
                        </button>
                    )}
                  </div>
                  {isArtistStylePrompt ? (
                      <ArtistStyleForm data={artistStyle} onChange={handleArtistStyleChange} />
                  ) : (
                    <>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Используйте [переменные] для динамического контента..."
                        rows={isImagePrompt ? 5 : 8}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-accent font-mono text-sm"
                        required={!isArtistStylePrompt}
                    />
                    {!isImagePrompt && <p className="text-xs text-gray-500 mt-1">Используйте квадратные скобки, например [переменная], для создания плейсхолдеров.</p>}
                    </>
                  )}
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Тип промпта</label>
                  <PillSelector
                    options={PROMPT_TYPES.map(t => ({ value: t, label: t }))}
                    selectedValue={promptType}
                    onChange={(newType: string) => {
                      if (newType === ARTIST_STYLE_PROMPT_TYPE) {
                        setContent('');
                      } else {
                        setArtistStyle(initialArtistStyleState);
                      }
                      setPromptType(newType);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Папка</label>
                   <PillSelector
                      options={[
                        { value: null, label: 'Без категории' },
                        ...folderOptions.map(f => ({ value: f.id, label: f.name }))
                      ]}
                      selectedValue={folderId}
                      onChange={setFolderId}
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">AI Модель</label>
                    <PillSelector
                      options={AI_MODELS.map(m => ({ value: m, label: m }))}
                      selectedValue={model}
                      onChange={(value) => setModel(value as string)}
                    />
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

          {showSnippetImporter && (
            <div className="absolute inset-0 bg-gray-800 bg-opacity-95 z-10 flex items-center justify-center p-6 animate-fade-in">
                <div className="bg-gray-700 p-6 rounded-lg w-full max-w-lg border border-gray-600 shadow-2xl">
                    <h3 className="text-lg font-bold text-white mb-4">Импорт из JS-сниппета</h3>
                    <p className="text-sm text-gray-400 mb-2">Вставьте код, например: <code>const name = {'{...}'};</code></p>
                    <textarea 
                        value={snippetText}
                        onChange={(e) => setSnippetText(e.target.value)}
                        rows={8}
                        className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-accent font-mono text-sm"
                        placeholder={`const eminemSound_drdreProducer = {\n  era: "2000s",\n  genre: "hip-hop, rap",\n  ...\n};`}
                    />
                    {parseError && <p className="text-red-400 text-xs mt-2">{parseError}</p>}
                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={() => setShowSnippetImporter(false)} className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-md transition-colors">
                            Отмена
                        </button>
                        <button type="button" onClick={handleParseAndFill} className="bg-blue-accent hover:bg-blue-accent-hover text-white font-semibold py-2 px-4 rounded-md transition-colors">
                            Заполнить поля
                        </button>
                    </div>
                </div>
            </div>
        )}

        </div>
      </div>
      {isAIAssistantOpen && (
        <AIAssistantModal
            initialTemplate={content}
            onClose={() => setIsAIAssistantOpen(false)}
            onApply={(newContent) => {
                setContent(newContent);
                setIsAIAssistantOpen(false);
            }}
        />
      )}
    </>
  );
};

export default PromptModal;