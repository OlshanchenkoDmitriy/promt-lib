import React, { useState, useMemo } from 'react';
import { Folder } from '../types';
import { 
    FolderIcon, PlusIcon, TrashIcon, InboxIcon, EditIcon, XIcon, TagIcon, CheckIcon, ChevronDownIcon, ImportIcon, ExportIcon
} from './icons';
import { PROMPT_TYPES, COLOR_PALETTE } from '../constants';

interface SidebarProps {
  folders: Folder[];
  selectedFolderId: string | null;
  onSelectFolder: (id: string | null) => void;
  onAddFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
  onRenameFolder: (id: string, newName: string) => void;
  isOpen: boolean;
  onClose: () => void;
  selectedColor: string | null;
  onSelectColor: (color: string | null) => void;
  selectedPromptType: string | null;
  onSelectPromptType: (type: string | null) => void;
  onImport: () => void;
  onExport: () => void;
}

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode; rightSlot?: React.ReactNode }> = ({ title, children, rightSlot }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    return (
        <div className="pt-4">
            <div className="flex items-center justify-between mb-2">
                <button className="flex items-center gap-2 w-full text-left" onClick={() => setIsCollapsed(!isCollapsed)}>
                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h2>
                    <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isCollapsed ? '-rotate-90' : 'rotate-0'}`} />
                </button>
                {rightSlot}
            </div>
            {!isCollapsed && children}
        </div>
    );
};


const Sidebar: React.FC<SidebarProps> = ({ 
    folders, 
    selectedFolderId, 
    onSelectFolder, 
    onAddFolder, 
    onDeleteFolder, 
    onRenameFolder, 
    isOpen, 
    onClose,
    selectedColor,
    onSelectColor,
    selectedPromptType,
    onSelectPromptType,
    onImport,
    onExport
}) => {
  const [newFolderName, setNewFolderName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  const sortedFolders = useMemo(() => {
    return folders.slice().sort((a,b) => a.name.localeCompare(b.name));
  }, [folders]);

  const handleAddFolder = () => {
    onAddFolder(newFolderName);
    setNewFolderName('');
    setIsAdding(false);
  };
  
  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      ></div>

      <aside className={`w-64 bg-gray-800 border-r border-gray-700 flex flex-col p-4 fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-4 md:hidden">
            <h2 className="text-lg font-bold text-white">Меню</h2>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-white" aria-label="Закрыть меню">
                <XIcon className="w-6 h-6" />
            </button>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto pr-1">
          <nav className="space-y-1">
            <div 
              className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-150 ${selectedFolderId === 'all' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
              onClick={() => onSelectFolder('all')}
            >
              <div className="flex items-center gap-3"><InboxIcon className="w-5 h-5" /><span className="truncate">Все промпты</span></div>
            </div>
            <div 
              className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-150 ${selectedFolderId === null ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
              onClick={() => onSelectFolder(null)}
            >
              <div className="flex items-center gap-3"><FolderIcon className="w-5 h-5" /><span className="truncate">Без категории</span></div>
            </div>
          </nav>
          
          <CollapsibleSection
             title="Папки"
             rightSlot={
                <button onClick={() => setIsAdding(!isAdding)} className="text-gray-500 hover:text-white p-1 rounded-full" title="Добавить новую папку">
                    <PlusIcon className="w-4 h-4"/>
                </button>
             }
          >
              {isAdding && (
                  <div className="flex items-center gap-2 mb-2">
                      <input
                          type="text"
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()}
                          placeholder="Название новой папки..."
                          className="w-full bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-accent"
                          autoFocus
                          onBlur={() => { if(newFolderName === '') setIsAdding(false)}}
                      />
                      <button onClick={handleAddFolder} className="bg-blue-accent p-1.5 rounded-md hover:bg-blue-accent-hover"><PlusIcon className="w-4 h-4"/></button>
                  </div>
              )}
              <div className="space-y-1">
                  {sortedFolders.map(folder => (
                      <FolderItem 
                          key={folder.id}
                          folder={folder}
                          isSelected={selectedFolderId === folder.id}
                          onSelect={() => onSelectFolder(folder.id)}
                          onDelete={() => onDeleteFolder(folder.id)}
                          onRename={(newName) => onRenameFolder(folder.id, newName)}
                      />
                  ))}
              </div>
          </CollapsibleSection>
          
          <CollapsibleSection title="Типы">
              <nav className="space-y-1">
                <div 
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-150 ${selectedPromptType === null ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                  onClick={() => onSelectPromptType(null)}
                >
                  <TagIcon className="w-5 h-5" />
                  <span className="truncate">Все типы</span>
                </div>
                {PROMPT_TYPES.map(type => (
                  <div
                    key={type}
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-150 ${selectedPromptType === type ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                    onClick={() => onSelectPromptType(type)}
                  >
                    <div className="w-5 h-5 flex-shrink-0"></div>
                    <span className="truncate">{type}</span>
                  </div>
                ))}
              </nav>
            </CollapsibleSection>

            <CollapsibleSection 
              title="Цветовые метки"
              rightSlot={
                selectedColor && (
                  <button onClick={() => onSelectColor(null)} className="text-gray-500 hover:text-white p-1 rounded-full" title="Сбросить цвет">
                    <XIcon className="w-4 h-4"/>
                  </button>
                )
              }
            >
                <div className="flex flex-wrap gap-3">
                    {COLOR_PALETTE.map(c => (
                        <button 
                            type="button"
                            key={c}
                            onClick={() => onSelectColor(selectedColor === c ? null : c)}
                            className={`w-7 h-7 rounded-full transition-transform duration-150 transform hover:scale-110 focus:outline-none ${selectedColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800' : ''}`}
                            style={{ backgroundColor: c }}
                            aria-label={`Фильтр по цвету ${c}`}
                        >
                           {selectedColor === c && <CheckIcon className="w-5 h-5 text-white m-auto drop-shadow-md"/>}
                        </button>
                    ))}
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="Действия">
                <nav className="space-y-1">
                    <div
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-150 text-gray-400 hover:bg-gray-700 hover:text-white"
                        onClick={onImport}
                    >
                        <ImportIcon className="w-5 h-5" />
                        <span className="truncate">Импорт из JSON</span>
                    </div>
                    <div
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-150 text-gray-400 hover:bg-gray-700 hover:text-white"
                        onClick={onExport}
                    >
                        <ExportIcon className="w-5 h-5" />
                        <span className="truncate">Экспорт</span>
                    </div>
                </nav>
            </CollapsibleSection>
        </div>
      </aside>
    </>
  );
};

interface FolderItemProps {
    folder: Folder;
    isSelected: boolean;
    onSelect: () => void;
    onDelete: () => void;
    onRename: (newName: string) => void;
}

const FolderItem: React.FC<FolderItemProps> = ({ folder, isSelected, onSelect, onDelete, onRename }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editingName, setEditingName] = useState(folder.name);

    const handleRenameSubmit = () => {
        if (editingName.trim() !== folder.name) {
            onRename(editingName);
        }
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="py-1">
                <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={handleRenameSubmit}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameSubmit();
                        if (e.key === 'Escape') setIsEditing(false);
                    }}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-accent"
                    autoFocus
                />
            </div>
        );
    }
    
    return (
        <div
            className={`group flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-150 ${isSelected ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
            onClick={onSelect}
        >
            <div className="flex items-center gap-3 truncate">
                <FolderIcon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{folder.name}</span>
            </div>
            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="p-1 text-gray-500 hover:text-white rounded-md" title="Переименовать папку"><EditIcon className="w-4 h-4" /></button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-gray-500 hover:text-red-500 rounded-md" title="Удалить папку"><TrashIcon className="w-4 h-4" /></button>
            </div>
        </div>
    );
}

export default Sidebar;