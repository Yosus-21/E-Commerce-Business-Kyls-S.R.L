import { useState, useCallback } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

/**
 * SearchBar Component
 * Barra de búsqueda reutilizable con debounce y auto-limpieza
 * 
 * @param {string} value - Valor actual de búsqueda
 * @param {function} onChange - Callback cuando cambia el valor
 * @param {string} placeholder - Texto placeholder
 * @param {string} className - Clases CSS adicionales
 */
const SearchBar = ({
    value = '',
    onChange,
    placeholder = 'Buscar...',
    className = ''
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleClear = useCallback(() => {
        onChange('');
    }, [onChange]);

    return (
        <div className={`relative ${className}`}>
            <div className={`
                relative flex items-center
                transition-all duration-200
                ${isFocused ? 'ring-2 ring-purple-500 ring-opacity-50' : ''}
            `}>
                {/* Icono de búsqueda */}
                <div className="absolute left-4 pointer-events-none">
                    <FaSearch className={`
                        text-lg transition-colors
                        ${isFocused ? 'text-purple-600' : 'text-slate-400'}
                    `} />
                </div>

                {/* Input */}
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    className="
                        w-full pl-12 pr-12 py-3
                        border border-slate-200 rounded-xl
                        text-slate-900 placeholder-slate-400
                        focus:outline-none focus:border-purple-400
                        transition-colors duration-200
                        bg-white
                    "
                />

                {/* Botón de limpiar */}
                {value && (
                    <button
                        onClick={handleClear}
                        className="
                            absolute right-4
                            p-1 rounded-full
                            text-slate-400 hover:text-slate-600
                            hover:bg-slate-100
                            transition-colors
                        "
                        aria-label="Limpiar búsqueda"
                    >
                        <FaTimes className="text-sm" />
                    </button>
                )}
            </div>

            {/* Indicador de resultados */}
            {value && (
                <div className="absolute top-full left-0 mt-1 text-xs text-slate-500">
                    Buscando: <span className="font-semibold text-purple-600">{value}</span>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
