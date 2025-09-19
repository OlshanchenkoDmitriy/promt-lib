import React, { useState, useMemo } from 'react';
import { Prompt, Folder } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import PromptList from './components/PromptList';
import PromptModal from './components/PromptModal';
import PlaceholderModal from './components/PlaceholderModal';
import { samplePrompts, sampleFolders } from './sampleData';
import { PlusIcon, FileCodeIcon, FileTextIcon, XIcon } from './components/icons';
import { IMAGE_PROMPT_TYPE } from './constants';

export type SortOrder = 'createdAt_desc' | 'createdAt_asc' | 'title_asc' | 'title_desc' | 'promptType_asc' | 'promptType_desc';

function App() {
  const [prompts, setPrompts] = useLocalStorage<Prompt[]>('prompts', samplePrompts);
  const [folders, setFolders] = useLocalStorage<Folder[]>('folders', sampleFolders);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedPromptType, setSelectedPromptType] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [placeholderPrompt, setPlaceholderPrompt] = useState<Prompt | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('createdAt_desc');

  const handleNewPromptClick = () => {
    setEditingPrompt(null);
    setIsModalOpen(true);
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setIsModalOpen(true);
  };
  
  const handleDeletePrompt = (promptId: string) => {
    setPrompts(prev => prev.filter(p => p.id !== promptId));
  };
  
  const handleSavePrompt = (promptToSave: Prompt) => {
    if (editingPrompt) {
      setPrompts(prev => prev.map(p => p.id === promptToSave.id ? promptToSave : p));
    } else {
      setPrompts(prev => [promptToSave, ...prev]);
    }
    setIsModalOpen(false);
    setEditingPrompt(null);
  };

  const handleAddFolder = (name: string) => {
    if (name.trim() === '') return;
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };
    setFolders(prev => [...prev, newFolder]);
  };
  
  const handleDeleteFolder = (folderId: string) => {
    if (confirm('Вы уверены, что хотите удалить эту папку? Промпты в ней станут без категории.')) {
        setFolders(prev => prev.filter(f => f.id !== folderId));
        setPrompts(prev => prev.map(p => p.folderId === folderId ? { ...p, folderId: null } : p));
        
        if(selectedFolderId === folderId) {
            setSelectedFolderId('all');
        }
    }
  };

  const handleRenameFolder = (folderId: string, newName: string) => {
    if (newName.trim() === '') return;
    setFolders(prev => 
        prev.map(f => f.id === folderId ? { ...f, name: newName.trim() } : f)
    );
  };

  const handleOpenPlaceholderModal = (prompt: Prompt) => {
    setPlaceholderPrompt(prompt);
  };
  
  const handleClosePlaceholderModal = () => {
    setPlaceholderPrompt(null);
  };

  const filteredPrompts = useMemo(() => {
    const filtered = prompts.filter(prompt => {
      const inFolder = 
        selectedFolderId === 'all' || 
        prompt.folderId === selectedFolderId;
      
      const matchesSearch = 
        prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.promptType.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesColor = selectedColor === null || prompt.color === selectedColor;
      
      const matchesPromptType = selectedPromptType === null || prompt.promptType === selectedPromptType;

      return inFolder && matchesSearch && matchesColor && matchesPromptType;
    });

    return filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'createdAt_asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'createdAt_desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'title_desc':
          return b.title.localeCompare(a.title);
        case 'promptType_asc':
          return a.promptType.localeCompare(b.promptType);
        case 'promptType_desc':
          return b.promptType.localeCompare(b.promptType);
        default:
          return 0;
      }
    });

  }, [prompts, selectedFolderId, searchTerm, selectedColor, selectedPromptType, sortOrder]);
  
  const handleExportData = (format: 'json' | 'txt') => {
    const date = new Date().toISOString().split('T')[0];
    let content = '';
    let mimeType = '';
    let filename = '';

    if (format === 'json') {
        content = JSON.stringify({ prompts, folders }, null, 2);
        mimeType = 'application/json';
        filename = `promptsave_backup_${date}.json`;
    } else { // txt format
        mimeType = 'text/plain';
        filename = `promptsave_export_${date}.txt`;
        const promptsByFolder = new Map<string | null, Prompt[]>();
        
        const sortedPrompts = [...prompts].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        sortedPrompts.forEach(p => {
            if (!promptsByFolder.has(p.folderId)) {
                promptsByFolder.set(p.folderId, []);
            }
            promptsByFolder.get(p.folderId)?.push(p);
        });
        
        const formatPrompt = (p: Prompt) => {
            let str = `Title: ${p.title}\n`;
            str += `Model: ${p.model}\n`;
            str += `Type: ${p.promptType}\n`;
            str += `Color: ${p.color}\n`;
            str += `--- PROMPT ---\n${p.content}\n`;
            if (p.promptType === IMAGE_PROMPT_TYPE) {
                if (p.negativePrompt) str += `--- NEGATIVE PROMPT ---\n${p.negativePrompt}\n`;
                if (p.parameters) str += `--- PARAMETERS ---\n${p.parameters}\n`;
            }
            return str;
        };

        const sortedFolders = [...folders].sort((a, b) => a.name.localeCompare(b.name));

        // Uncategorized first
        if (promptsByFolder.has(null)) {
            content += '## Без категории\n\n';
            content += promptsByFolder.get(null)?.map(formatPrompt).join('\n====================\n\n') ?? '';
            content += '\n\n';
        }

        sortedFolders.forEach(folder => {
            if (promptsByFolder.has(folder.id)) {
                content += `## Папка: ${folder.name}\n\n`;
                content += promptsByFolder.get(folder.id)?.map(formatPrompt).join('\n====================\n\n') ?? '';
                content += '\n\n';
            }
        });
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsExportModalOpen(false);
  };

  const handleImportData = () => {
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
                const { prompts: importedPrompts, folders: importedFolders } = JSON.parse(content);

                if (!Array.isArray(importedPrompts) || !Array.isArray(importedFolders)) {
                    throw new Error('Неверный формат файла JSON.');
                }
                
                if (confirm(`Вы собираетесь импортировать ${importedPrompts.length} промптов и ${importedFolders.length} папок. Существующие папки с одинаковыми именами не будут дублироваться. Продолжить?`)) {
                    const newFoldersToAdd: Folder[] = [];
                    const folderIdMap = new Map<string, string>();

                    const existingFolderNames = new Set(folders.map(f => f.name.toLowerCase()));
                    
                    importedFolders.forEach((folder: Folder) => {
                        const existingFolder = folders.find(f => f.name.toLowerCase() === folder.name.toLowerCase());
                        if (existingFolder) {
                            folderIdMap.set(folder.id, existingFolder.id);
                        } else if (!existingFolderNames.has(folder.name.toLowerCase())) {
                            const newId = crypto.randomUUID();
                            folderIdMap.set(folder.id, newId);
                            newFoldersToAdd.push({ ...folder, id: newId });
                            existingFolderNames.add(folder.name.toLowerCase());
                        }
                    });

                    const newPromptsToAdd: Prompt[] = importedPrompts.map((prompt: Prompt) => ({
                        ...prompt,
                        id: crypto.randomUUID(),
                        folderId: prompt.folderId ? (folderIdMap.get(prompt.folderId) ?? null) : null,
                    }));
                    
                    setFolders(prev => [...prev, ...newFoldersToAdd]);
                    setPrompts(prev => [...newPromptsToAdd, ...prev]);
                    
                    alert('Импорт успешно завершен!');
                }
            } catch (err) {
                alert('Не удалось импортировать файл. Убедитесь, что это корректный JSON файл, экспортированный из этого приложения.');
                console.error(err);
            }
        };
        reader.readAsText(file);
    };
    input.click();
  };


  return (
    <div className="flex h-screen w-full bg-gray-900 text-white font-sans overflow-hidden">
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        folders={folders}
        selectedFolderId={selectedFolderId}
        onSelectFolder={(id) => {
            setSelectedFolderId(id);
            setIsSidebarOpen(false);
        }}
        onAddFolder={handleAddFolder}
        onDeleteFolder={handleDeleteFolder}
        onRenameFolder={handleRenameFolder}
        selectedColor={selectedColor}
        onSelectColor={setSelectedColor}
        selectedPromptType={selectedPromptType}
        onSelectPromptType={setSelectedPromptType}
        onImport={handleImportData}
        onExport={() => setIsExportModalOpen(true)}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuClick={() => setIsSidebarOpen(true)}
          onNewPrompt={handleNewPromptClick} 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
        />
        <PromptList 
          prompts={filteredPrompts}
          folders={folders}
          onEdit={handleEditPrompt}
          onDelete={handleDeletePrompt}
          viewMode={viewMode}
          onFillAndCopy={handleOpenPlaceholderModal}
        />
      </main>
      {isModalOpen && (
        <PromptModal 
          onClose={() => setIsModalOpen(false)}
          onSave={handleSavePrompt}
          folders={folders}
          promptToEdit={editingPrompt}
        />
      )}
      {placeholderPrompt && (
        <PlaceholderModal
          prompt={placeholderPrompt}
          onClose={handleClosePlaceholderModal}
        />
      )}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-sm border border-gray-700 animate-scale-in">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Экспорт данных</h2>
                   <button onClick={() => setIsExportModalOpen(false)} className="p-1 rounded-full text-gray-500 hover:bg-gray-700 hover:text-white">
                      <XIcon className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-gray-400 mb-6">Выберите формат для экспорта вашей библиотеки промптов.</p>
                <div className="space-y-4">
                    <button onClick={() => handleExportData('json')} className="w-full flex items-center gap-4 text-left bg-gray-700 hover:bg-gray-600/80 text-white font-semibold py-3 px-4 rounded-md transition-colors">
                        <FileCodeIcon className="w-8 h-8 text-blue-accent flex-shrink-0" />
                        <div>
                            <p>JSON</p>
                            <p className="text-xs font-normal text-gray-400">Для резервного копирования и восстановления.</p>
                        </div>
                    </button>
                    <button onClick={() => handleExportData('txt')} className="w-full flex items-center gap-4 text-left bg-gray-700 hover:bg-gray-600/80 text-white font-semibold py-3 px-4 rounded-md transition-colors">
                        <FileTextIcon className="w-8 h-8 text-green-400 flex-shrink-0" />
                        <div>
                            <p>TXT</p>
                            <p className="text-xs font-normal text-gray-400">Для чтения и обмена с другими.</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
      )}
       <button
        onClick={handleNewPromptClick}
        className="fixed bottom-6 right-6 bg-blue-accent hover:bg-blue-accent-hover text-white rounded-full p-4 shadow-lg sm:hidden z-20 transition-transform duration-200 transform hover:scale-110 animate-scale-in"
        aria-label="Создать новый промпт"
        title="Создать новый промпт"
      >
        <PlusIcon className="w-6 h-6" />
      </button>
    </div>
  );
}

export default App;