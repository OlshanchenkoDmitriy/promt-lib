import React, { useState, useMemo, useEffect } from 'react';
import { XIcon } from './icons';

interface AIAssistantModalProps {
  initialTemplate: string;
  onClose: () => void;
  onApply: (newContent: string) => void;
}

const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ initialTemplate, onClose, onApply }) => {
    const [templateText, setTemplateText] = useState(initialTemplate);
    const [jsonInput, setJsonInput] = useState('');
    const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});
    const [jsonError, setJsonError] = useState<string | null>(null);

    const placeholderKeys = useMemo(() => {
        const regex = /\[(.*?)\]/g;
        const matches = templateText.match(regex) || [];
        // Extract unique keys without brackets
        return [...new Set(matches.map(p => p.substring(1, p.length - 1)))];
    }, [templateText]);

    useEffect(() => {
        const newValues: Record<string, string> = {};
        placeholderKeys.forEach(key => {
            newValues[key] = placeholderValues[key] || '';
        });
        setPlaceholderValues(newValues);
    }, [placeholderKeys]);

    const handleJsonInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newJsonInput = e.target.value;
        setJsonInput(newJsonInput);
        
        if (newJsonInput.trim() === '') {
            setJsonError(null);
            return;
        }

        try {
            const data = JSON.parse(newJsonInput);
            if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                 setJsonError('JSON должен быть объектом.');
                 return;
            }

            const newValues = { ...placeholderValues };
            Object.keys(data).forEach(key => {
                if (placeholderKeys.includes(key)) {
                    newValues[key] = String(data[key]);
                }
            });
            setPlaceholderValues(newValues);
            setJsonError(null);
        } catch (error) {
            setJsonError('Неверный формат JSON.');
        }
    };
    
    const handleFieldChange = (key: string, value: string) => {
        setPlaceholderValues(prev => ({ ...prev, [key]: value }));
    };

    const finalContent = useMemo(() => {
        return placeholderKeys.reduce((acc, key) => {
            const regex = new RegExp(`\\[${key}\\]`, 'g');
            return acc.replace(regex, placeholderValues[key] || '');
        }, templateText);
    }, [templateText, placeholderKeys, placeholderValues]);
    
    const jsonOutput = useMemo(() => {
        const output: Record<string, string> = {};
        placeholderKeys.forEach(key => {
            output[key] = placeholderValues[key] || '';
        });
        return JSON.stringify(output, null, 2);
    }, [placeholderKeys, placeholderValues]);

    const handleApply = () => {
        onApply(finalContent);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4 animate-fade-in" aria-modal="true" role="dialog">
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-6xl border-gray-700 border flex flex-col max-h-[90vh] animate-scale-in">
                <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-white">Помощник по шаблонам</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-700 hover:text-white">
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>

                <div className="p-6 flex-grow overflow-y-auto min-h-0">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Left Column: Template & Result */}
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col">
                                <label htmlFor="templateText" className="block text-sm font-medium text-gray-400 mb-1">Шаблон промпта</label>
                                <textarea
                                    id="templateText"
                                    value={templateText}
                                    onChange={(e) => setTemplateText(e.target.value)}
                                    rows={10}
                                    className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-accent font-mono text-sm resize-none"
                                />
                            </div>
                            <div className="flex flex-col">
                                 <label htmlFor="finalContent" className="block text-sm font-medium text-gray-400 mb-1">Результат</label>
                                <textarea
                                    id="finalContent"
                                    value={finalContent}
                                    readOnly
                                    rows={10}
                                    className="w-full bg-gray-900 border-gray-600 rounded-md py-2 px-3 text-gray-400 focus:outline-none font-mono text-sm resize-none"
                                />
                            </div>
                        </div>

                        {/* Middle Column: Dynamic Fields */}
                        <div className="flex flex-col">
                             <label className="block text-sm font-medium text-gray-400 mb-1">Поля для заполнения</label>
                             <div className="space-y-3">
                                {placeholderKeys.length > 0 ? placeholderKeys.map((key) => (
                                    <div key={key}>
                                        <label htmlFor={`field-${key}`} className="block text-sm font-medium text-gray-400 mb-1 capitalize">
                                            {key}
                                        </label>
                                        <input
                                            id={`field-${key}`}
                                            type="text"
                                            value={placeholderValues[key] || ''}
                                            onChange={(e) => handleFieldChange(key, e.target.value)}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-accent"
                                        />
                                    </div>
                                )) : (
                                    <p className="text-gray-500 text-sm mt-2">В шаблоне не найдены переменные (например, [переменная]).</p>
                                )}
                             </div>
                        </div>

                        {/* Right Column: JSON Input/Output */}
                         <div className="flex flex-col gap-6">
                            <div className="flex flex-col">
                                <label htmlFor="jsonInput" className="block text-sm font-medium text-gray-400 mb-1">Входной JSON</label>
                                <textarea 
                                    id="jsonInput"
                                    value={jsonInput}
                                    onChange={handleJsonInputChange}
                                    placeholder='{ "ключ": "значение" }'
                                    rows={10}
                                    className={`w-full bg-gray-900 border rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 font-mono text-sm resize-none ${jsonError ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-accent'}`}
                                />
                                {jsonError && <p className="text-red-400 text-xs mt-1">{jsonError}</p>}
                            </div>
                            <div className="flex flex-col">
                                 <label htmlFor="jsonOutput" className="block text-sm font-medium text-gray-400 mb-1">Выходной JSON</label>
                                <textarea
                                    id="jsonOutput"
                                    value={jsonOutput}
                                    readOnly
                                    rows={10}
                                    className="w-full bg-gray-900 border-gray-600 rounded-md py-2 px-3 text-gray-400 focus:outline-none font-mono text-sm resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="flex items-center justify-end p-4 border-t border-gray-700 flex-shrink-0 bg-gray-800 sm:rounded-b-lg gap-2">
                    <button onClick={onClose} type="button" className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md transition-colors">
                        Отмена
                    </button>
                    <button 
                        onClick={handleApply} 
                        type="button" 
                        className="bg-blue-accent hover:bg-blue-accent-hover text-white font-semibold py-2 px-4 rounded-md transition-colors"
                    >
                        Применить
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default AIAssistantModal;