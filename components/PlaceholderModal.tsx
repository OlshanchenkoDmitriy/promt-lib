import React, { useState, useMemo } from 'react';
import { Prompt } from '../types';
import { XIcon, CopyIcon, CheckIcon } from './icons';

interface PlaceholderModalProps {
  prompt: Prompt;
  onClose: () => void;
}

const PlaceholderModal: React.FC<PlaceholderModalProps> = ({ prompt, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  const placeholders = useMemo(() => {
    const regex = /\[(.*?)\]/g;
    const matches = prompt.content.match(regex) || [];
    return [...new Set(matches)]; // Get unique placeholders
  }, [prompt.content]);

  // Helper to escape regex special characters
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
  };
  
  const finalContent = useMemo(() => {
    return placeholders.reduce((acc, placeholder) => {
      const value = values[placeholder] || '';
      // Use a regex with the 'g' flag to replace all occurrences
      return acc.replace(new RegExp(escapeRegExp(placeholder), 'g'), value);
    }, prompt.content);
  }, [prompt.content, placeholders, values]);

  const handleValueChange = (placeholder: string, value: string) => {
    setValues(prev => ({ ...prev, [placeholder]: value }));
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(finalContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLabelForPlaceholder = (placeholder: string) => {
    return placeholder.substring(1, placeholder.length - 1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-0 sm:p-4 animate-fade-in">
      <div className="bg-gray-800 rounded-none sm:rounded-lg shadow-2xl w-full h-full sm:h-auto sm:w-full sm:max-w-2xl border-gray-700 sm:border flex flex-col sm:max-h-[90vh] animate-scale-in">
        <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-white truncate pr-4">Заполнить: {prompt.title}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-700 hover:text-white">
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-300">Переменные</h3>
                {placeholders.length > 0 ? placeholders.map((p, index) => (
                    <div key={index}>
                        <label htmlFor={`placeholder-${index}`} className="block text-sm font-medium text-gray-400 mb-1 capitalize">
                            {getLabelForPlaceholder(p)}
                        </label>
                        <input
                            id={`placeholder-${index}`}
                            type="text"
                            value={values[p] || ''}
                            onChange={(e) => handleValueChange(p, e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-accent"
                        />
                    </div>
                )) : (
                    <p className="text-gray-500">В этом промпте нет переменных.</p>
                )}
            </div>

            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-300">Результат</h3>
                <div className="relative">
                    <textarea
                        readOnly
                        value={finalContent}
                        rows={8}
                        className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-gray-300 focus:outline-none font-mono text-sm"
                    />
                     <button 
                        onClick={handleCopy} 
                        className="absolute top-2 right-2 p-2 bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600 rounded-md transition-colors" 
                        title="Копировать результат"
                    >
                        {copied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <CopyIcon className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>

        <footer className="flex items-center justify-end p-4 border-t border-gray-700 flex-shrink-0 bg-gray-800 sm:rounded-b-lg">
            <button onClick={onClose} type="button" className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md transition-colors">
                Закрыть
            </button>
        </footer>
      </div>
    </div>
  );
};

export default PlaceholderModal;
