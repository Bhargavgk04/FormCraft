import React from 'react';
import { motion } from 'framer-motion';
import { animations } from '../utils/animations';

// Animated Button Component
export const AnimatedButton = ({ 
  children, 
  onClick, 
  className = '', 
  disabled = false,
  variant = 'primary',
  size = 'md',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <motion.button
      whileHover={!disabled ? animations.button.hover : {}}
      whileTap={!disabled ? animations.button.tap : {}}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Animated Card Component
export const AnimatedCard = ({ 
  children, 
  className = '', 
  onClick,
  hover = true,
  ...props 
}) => {
  return (
    <motion.div
      variants={animations.card}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : {}}
      onClick={onClick}
      className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Animated Container Component
export const AnimatedContainer = ({ 
  children, 
  className = '', 
  delay = 0,
  ...props 
}) => {
  return (
    <motion.div
      variants={animations.container}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Animated Modal Component
export const AnimatedModal = ({ 
  isOpen, 
  onClose, 
  children, 
  className = '' 
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={animations.modal.overlay.initial}
      animate={animations.modal.overlay.animate}
      exit={animations.modal.overlay.exit}
      transition={animations.modal.overlay.transition}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={animations.modal.content.initial}
        animate={animations.modal.content.animate}
        exit={animations.modal.content.exit}
        transition={animations.modal.content.transition}
        className={`bg-white rounded-2xl shadow-2xl w-full ${className || 'max-w-md'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

// Animated Loading Spinner
export const AnimatedSpinner = ({ size = 'md', className = '', color = 'indigo' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const colors = {
    indigo: 'border-indigo-500 border-t-transparent',
    blue: 'border-blue-500 border-t-transparent',
    green: 'border-green-500 border-t-transparent',
    red: 'border-red-500 border-t-transparent',
    white: 'border-white border-t-transparent'
  };

  return (
    <motion.div
      animate={animations.spinner.animate}
      transition={animations.spinner.transition}
      className={`${sizes[size]} border-2 ${colors[color]} rounded-full ${className}`}
    />
  );
};

// Animated Form Field
export const AnimatedFormField = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <motion.div
      whileFocus={{ scale: 1.02 }}
      transition={animations.formField.transition}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Animated List Item
export const AnimatedListItem = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <motion.div
      variants={animations.listItem}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Animated Notification
export const AnimatedNotification = ({ 
  children, 
  type = 'info',
  className = '',
  ...props 
}) => {
  const types = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  return (
    <motion.div
      initial={animations.notification.initial}
      animate={animations.notification.animate}
      exit={animations.notification.exit}
      transition={animations.notification.transition}
      className={`border rounded-lg p-4 ${types[type]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Animated Page Transition
export const AnimatedPage = ({ 
  children, 
  className = '' 
}) => {
  return (
    <motion.div
      initial={animations.pageTransition.initial}
      animate={animations.pageTransition.animate}
      exit={animations.pageTransition.exit}
      transition={animations.pageTransition.transition}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Animated Sidebar
export const AnimatedSidebar = ({ 
  children, 
  className = '' 
}) => {
  return (
    <motion.div
      initial={animations.sidebar.initial}
      animate={animations.sidebar.animate}
      exit={animations.sidebar.exit}
      transition={animations.sidebar.transition}
      className={className}
    >
      {children}
    </motion.div>
  );
}; 