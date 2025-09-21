

import React, { useState, useEffect, useMemo } from 'react';
import { Prompt, ArtistStyle } from '../types';
import { EditIcon, TrashIcon, CopyIcon, CheckIcon, FolderIcon, ImageIcon, SparklesIcon } from './icons';
import { IMAGE_PROMPT_TYPE, ARTIST_STYLE_PROMPT_TYPE } from '../constants';

interface PromptCardProps {
  prompt: Prompt;
  folderName?: string;
  onEdit: () => void;
  onDelete: () => void;
  onFillAndCopy: () => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt, folderName, onEdit, onDelete, onFillAndCopy }) => {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);
  const isImagePrompt = prompt.promptType === IMAGE_PROMPT_TYPE;
  const isArtistStylePrompt = prompt.promptType === ARTIST_STYLE_PROMPT_TYPE;

  const hasPlaceholders = useMemo(() => !isArtistStylePrompt && /\[(.*?)\]/.test(prompt.content), [prompt.content, isArtistStylePrompt]);

  useEffect(() => {
    setImageError(false);
  }, [prompt.imageUrl]);

  const handleCopy = () => {
    let textToCopy;
    if (isArtistStylePrompt) {
        try {
            const data = JSON.parse(prompt.content) as ArtistStyle;
            const titleAsVar = prompt.title.replace(/[^a-zA-Z0-9]/g, '') || 'artistStyle';
            textToCopy = `const ${titleAsVar} = {\n` +
                Object.entries(data).map(([key, value]) => `  ${key}: "${String(value || '').replace(/"/g, '\\"')}"`).join(',\n') +
            `\n};`;
        } catch {
            textToCopy = prompt.content;
        }
    } else if (isImagePrompt) {
       textToCopy = [
          prompt.content,
          prompt.parameters,
          prompt.negativePrompt ? `--no ${prompt.negativePrompt}` : ''
        ].filter(Boolean).join(' ').trim();
    } else {
        textToCopy = prompt.content;
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const renderContentWithPlaceholders = (content: string) => {
    // Split by a regex that captures any text within square brackets.
    const parts = content.split(/(\[.*?\])/g);
    return parts.map((part, index) => {
      // Check if the part is a valid placeholder (e.g., [placeholder]).
      if (part.startsWith('[') && part.endsWith(']') && part.length > 2) {
        return (
          <span 
            key={index} 
            className="font-mono font-medium text-blue-300 bg-blue-500/20 rounded-md px-1 py-0.5 border border-blue-500/30 mx-0.5 inline-block"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const renderArtistStyleContent = () => {
    try {
      const data = JSON.parse(prompt.content) as ArtistStyle;
      return (
        <ul className="text-xs space-y-1 text-gray-400">
          {Object.entries(data).slice(0, 3).map(([key, value]) => (
            value && <li key={key} className="truncate">
              <span className="font-semibold text-gray-300 capitalize">{key}: </span>
              <span>{value}</span>
            </li>
          ))}
        </ul>
      );
    } catch (e) {
      return <p className="line-clamp-4 font-mono text-xs">{prompt.content}</p>;
    }
  };


  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg flex flex-col h-full hover:border-blue-accent transition-all duration-200 group">
      {isImagePrompt && (
        <div className="relative aspect-video w-full bg-gray-700 rounded-t-lg overflow-hidden flex items-center justify-center">
          {prompt.imageUrl && !imageError ? (
            <img 
                src={prompt.imageUrl} 
                alt={`Предпросмотр для ${prompt.title}`} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={() => setImageError(true)}
            />
          ) : (
             <div className="flex flex-col items-center text-center text-gray-500 p-2">
                <ImageIcon className="w-10 h-10 mb-1" />
                <span className="text-xs font-medium">
                    {prompt.imageUrl ? <>Не удалось<br/>загрузить</> : 'Нет изображения'}
                </span>
            </div>
          )}
        </div>
      )}
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-lg text-white pr-2 flex-1" title={prompt.title}>{prompt.title}</h3>
          <span className="w-4 h-4 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: prompt.color }}></span>
        </div>
        <div className="flex items-center gap-2 mb-3 text-xs">
          <span className="bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-medium">{prompt.promptType}</span>
          <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-mono font-medium">{prompt.model}</span>
        </div>
        <div className="text-sm text-gray-400 mb-4 h-20 overflow-hidden relative flex-grow">
            {isArtistStylePrompt ? renderArtistStyleContent() : <p className="line-clamp-4">{renderContentWithPlaceholders(prompt.content)}</p>}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-800 to-transparent"></div>
        </div>
      </div>
      <div className="p-4 border-t border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-1.5 truncate text-xs text-gray-500">
            {folderName && (
                <>
                    <FolderIcon className="w-4 h-4" />
                    <span className="truncate" title={folderName}>{folderName}</span>
                </>
            )}
        </div>
        <div className="flex items-center justify-end gap-1">
          {hasPlaceholders && (
            <button onClick={onFillAndCopy} className="p-2 text-gray-400 hover:text-blue-accent hover:bg-gray-700 rounded-md transition-colors" title="Заполнить и скопировать">
                <SparklesIcon className="w-5 h-5" />
            </button>
          )}
          <button onClick={handleCopy} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors" title="Копировать содержимое">
            {copied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <CopyIcon className="w-5 h-5" />}
          </button>
          <button onClick={onEdit} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors" title="Редактировать промпт">
            <EditIcon className="w-5 h-5" />
          </button>
          <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-700 rounded-md transition-colors" title="Удалить промпт">
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptCard;