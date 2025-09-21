import React from 'react';
import { Prompt, Folder } from '../types';
import PromptCard from './PromptCard';
import PromptRow from './PromptRow';
import { FileTextIcon } from './icons';

interface PromptListProps {
  prompts: Prompt[];
  folders: Folder[];
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
  viewMode: 'grid' | 'list';
  onFillAndCopy: (prompt: Prompt) => void;
}

const PromptList: React.FC<PromptListProps> = ({ prompts, folders, onEdit, onDelete, viewMode, onFillAndCopy }) => {
  if (prompts.length === 0) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-600 p-4 text-center">
            <FileTextIcon className="w-24 h-24 mb-4" />
            <h2 className="text-2xl font-semibold">Промпты не найдены</h2>
            <p>Создайте новый промпт или измените условия поиска.</p>
        </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:pb-4 overflow-y-auto">
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {prompts.map(prompt => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              folderName={folders.find(f => f.id === prompt.folderId)?.name}
              onEdit={() => onEdit(prompt)}
              onDelete={() => onDelete(prompt.id)}
              onFillAndCopy={() => onFillAndCopy(prompt)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-w-4xl mx-auto">
           {prompts.map(prompt => (
            <PromptRow
              key={prompt.id}
              prompt={prompt}
              folderName={folders.find(f => f.id === prompt.folderId)?.name}
              onEdit={() => onEdit(prompt)}
              onDelete={() => onDelete(prompt.id)}
              onFillAndCopy={() => onFillAndCopy(prompt)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PromptList;