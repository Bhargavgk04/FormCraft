import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const CustomDropdown = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select option",
  className = "",
  minWidth = "140px"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(option => option.value === value);

  return (
    <div ref={dropdownRef} className={`relative ${className}`} style={{ minWidth }}>
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full pl-4 pr-10 py-3.5 bg-gray-50 border-0 rounded-xl text-gray-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:shadow-lg transition-all duration-300 ease-out cursor-pointer hover:bg-gray-100 appearance-none focus:outline-none text-left"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="block truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.div 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="py-1 max-h-60 overflow-auto">
              {options.map((option, index) => (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors duration-150 ${
                    value === option.value ? 'bg-indigo-50 text-indigo-700' : ''
                  }`}
                  whileHover={{ backgroundColor: value === option.value ? '#eef2ff' : '#f9fafb' }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomDropdown; 