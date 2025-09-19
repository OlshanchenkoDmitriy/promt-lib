import React from 'react';
import { PlusIcon, SearchIcon, MenuIcon, XIcon, ViewGridIcon, ViewListIcon } from './icons';
import { SortOrder } from '../App';

interface HeaderProps {
  onNewPrompt: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onMenuClick: () => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  sortOrder: SortOrder;
  onSortOrderChange: (order: SortOrder) => void;
}

const Header: React.FC<HeaderProps> = ({ 
    onNewPrompt, 
    searchTerm, 
    onSearchChange, 
    onMenuClick, 
    viewMode, 
    onViewModeChange,
    sortOrder,
    onSortOrderChange
}) => {
  return (
    <header className="flex-shrink-0 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 p-4 flex items-center justify-between z-10 gap-2 sm:gap-4">
      <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="p-1 text-gray-400 hover:text-white md:hidden" aria-label="Открыть меню">
              <MenuIcon className="w-6 h-6"/>
          </button>
          <h1 className="text-xl font-bold text-white hidden sm:block">PromptSave</h1>
      </div>
      <div className="flex items-center justify-end gap-2 sm:gap-4 w-full">
        <div className="relative w-full max-w-xs md:max-w-md flex items-center">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            <SearchIcon className="w-5 h-5 text-gray-500" />
          </span>
          <input
            type="text"
            placeholder="Поиск промптов..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 pl-10 pr-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-accent"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white"
              aria-label="Очистить поиск"
            >
              <XIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2">
            <div className="relative">
                <select
                    value={sortOrder}
                    onChange={(e) => onSortOrderChange(e.target.value as SortOrder)}
                    className="bg-gray-800 border border-gray-700 rounded-md py-2 pl-3 pr-8 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent appearance-none"
                    aria-label="Сортировать промпты"
                >
                    <option value="createdAt_desc">Дата (сначала новые)</option>
                    <option value="createdAt_asc">Дата (сначала старые)</option>
                    <option value="title_asc">Название (А-Я)</option>
                    <option value="title_desc">Название (Я-А)</option>
                    <option value="promptType_asc">Тип (А-Я)</option>
                    <option value="promptType_desc">Тип (Я-А)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>
            
            <div className="flex items-center bg-gray-800 border border-gray-700 rounded-md p-1">
                <button 
                    onClick={() => onViewModeChange('grid')}
                    className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-blue-accent text-white' : 'text-gray-400 hover:text-white'}`}
                    aria-label="Вид сеткой"
                    title="Вид сеткой"
                >
                    <ViewGridIcon className="w-5 h-5"/>
                </button>
                <button 
                    onClick={() => onViewModeChange('list')}
                    className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-blue-accent text-white' : 'text-gray-400 hover:text-white'}`}
                    aria-label="Вид списком"
                    title="Вид списком"
                >
                    <ViewListIcon className="w-5 h-5"/>
                </button>
            </div>
        </div>
        

        <button
          onClick={onNewPrompt}
          className="hidden sm:flex items-center gap-2 bg-blue-accent hover:bg-blue-accent-hover text-white font-semibold py-2 px-3 sm:px-4 rounded-md transition-colors duration-200 whitespace-nowrap"
        >
          <PlusIcon className="w-5 h-5" />
          <span className="hidden sm:inline">Новый промпт</span>
        </button>
      </div>
    </header>
  );
};

export default Header;