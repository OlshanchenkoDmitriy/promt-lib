

import React, { useState, useEffect, useMemo } from 'react';
import { Prompt } from '../types';
import { EditIcon, TrashIcon, CopyIcon, CheckIcon, FolderIcon, ImageIcon, SparklesIcon } from './icons';
import { IMAGE_PROMPT_TYPE } from '../constants';

interface PromptRowProps {
  prompt: Prompt;
  folderName?: string;
  onEdit: () => void;
  onDelete: () => void;
  onFillAndCopy: () => void;
}

const PromptRow: React.FC<PromptRowProps> = ({ prompt, folderName, onEdit, onDelete, onFillAndCopy }) => {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);
  const isImagePrompt = prompt.promptType === IMAGE_PROMPT_TYPE;

  const hasPlaceholders = useMemo(() => /\[(.*?)\]/.test(prompt.content), [prompt.content]);

  useEffect(() => {
    setImageError(false);
  }, [prompt.imageUrl]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = isImagePrompt
      ? [
          prompt.content,
          prompt.parameters,
          prompt.negativePrompt ? `--no ${prompt.negativePrompt}` : ''
        ].filter(Boolean).join(' ').trim()
      : prompt.content;
      
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit();
  }

  const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete();
  }

  const handleFillAndCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFillAndCopy();
  }


  return (
    <div 
        className="bg-gray-800 border border-gray-700 rounded-lg flex items-center p-3 gap-4 h-full hover:border-blue-accent transition-all duration-200 group cursor-pointer"
        onClick={onEdit}
    >
        <div className="w-1.5 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: prompt.color }}></div>
        {isImagePrompt && (
            <div className="flex-shrink-0 w-12 h-10 bg-gray-700 rounded overflow-hidden flex items-center justify-center">
                {prompt.imageUrl && !imageError ? (
                    <img 
                        src={prompt.imageUrl} 
                        alt={`Предпросмотр для ${prompt.title}`}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <ImageIcon className="w-6 h-6 text-gray-500" />
                )}
            </div>
        )}
        <div className="flex-grow truncate">
            <h3 className="font-semibold text-md text-white truncate" title={prompt.title}>{prompt.title}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                <span className="bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-medium truncate">{prompt.promptType}</span>
                <span className="font-mono">&middot;</span>
                <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-mono font-medium truncate">{prompt.model}</span>
                {folderName && (
                    <>
                        <span className="font-mono">&middot;</span>
                        <div className="flex items-center gap-1.5 truncate text-gray-500">
                            <FolderIcon className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate" title={folderName}>{folderName}</span>
                        </div>
                    </>
                )}
            </div>
        </div>
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {hasPlaceholders && (
            <button onClick={handleFillAndCopy} className="p-2 text-gray-400 hover:text-blue-accent hover:bg-gray-700 rounded-md transition-colors" title="Заполнить и скопировать">
                <SparklesIcon className="w-5 h-5" />
            </button>
          )}
          <button onClick={handleCopy} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors" title="Копировать содержимое">
            {copied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <CopyIcon className="w-5 h-5" />}
          </button>
          <button onClick={handleEdit} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors" title="Редактировать промпт">
            <EditIcon className="w-5 h-5" />
          </button>
          <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-700 rounded-md transition-colors" title="Удалить промпт">
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
    </div>
  );
};

export default PromptRow;