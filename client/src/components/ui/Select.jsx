import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

const Select = ({ options, value, onChange, placeholder = "Select an option", className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef(null);
  const listboxRef = useRef(null);

  const selectedIndex = options.indexOf(value);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => (prev < options.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0) {
          onChange(options[focusedIndex]);
          setIsOpen(false);
        }
        break;
      default:
        break;
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listboxRef.current) {
      const items = listboxRef.current.querySelectorAll('[role="option"]');
      const activeItem = items[focusedIndex];
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex, isOpen]);

  return (
    <div 
      className={`relative ${className}`} 
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
        }}
        className={`w-full flex items-center justify-between h-[44px] px-4 bg-white border border-[#DCEEFF] rounded-xl text-[14px] font-medium text-slate-700 outline-none transition-all duration-200
          hover:border-[#93C5FD] hover:bg-[#F8FBFF]
          focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/10 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)]
          ${isOpen ? 'border-[#3B82F6] ring-4 ring-[#3B82F6]/10 bg-[#F8FBFF]' : ''}
        `}
      >
        <span className="truncate">{value || placeholder}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 15 }}
          className="text-slate-400 shrink-0 ml-2"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.98 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
            className="absolute z-50 w-full min-w-[160px] bg-white border border-[#E2F0FF] rounded-[14px] shadow-[0_10px_40px_-10px_rgba(59,130,246,0.15)] overflow-hidden"
          >
            <ul 
              ref={listboxRef}
              role="listbox"
              tabIndex={-1}
              className="max-h-[260px] overflow-y-auto p-2 space-y-1.5 custom-scrollbar focus:outline-none"
            >
              {options.map((option, index) => {
                const isSelected = value === option;
                const isFocused = focusedIndex === index;

                return (
                  <li
                    key={option}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(option);
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setFocusedIndex(index)}
                    className={`
                      relative flex items-center justify-between h-[40px] px-3 rounded-lg text-[14px] font-medium cursor-pointer transition-colors duration-150
                      ${isSelected ? 'bg-[#3B82F6] text-white' : 'text-slate-700'}
                      ${isFocused && !isSelected ? 'bg-[#F0F7FF] text-[#3B82F6]' : ''}
                    `}
                  >
                    <span className="truncate pr-6">{option}</span>
                    
                    {isSelected && (
                      <Check className="w-4 h-4 shrink-0" />
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Select;
