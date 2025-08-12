import React from 'react';
import { motion } from 'framer-motion';
import { useToast } from './Toast';

const ToastDemo = () => {
  const { success, error, warning, info } = useToast();

  const showSuccessToast = () => {
    success('Success!', 'Your action has been completed successfully.');
  };

  const showErrorToast = () => {
    error('Error Occurred', 'Something went wrong. Please try again.');
  };

  const showWarningToast = () => {
    warning('Warning', 'Please review your input before proceeding.');
  };

  const showInfoToast = () => {
    info('Information', 'Here is some helpful information for you.');
  };

  const showFormSuccessToast = () => {
    success('Form Saved', 'Your form has been successfully saved to the database.');
  };

  const showFormErrorToast = () => {
    error('Save Failed', 'Unable to save your form. Please check your connection.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Professional Toast System
          </h1>
          <p className="text-xl text-gray-600">
            Beautiful, animated notifications that match your UI design
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Toast Types */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Types</h3>
            <div className="space-y-3">
              <button
                onClick={showSuccessToast}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
              >
                Success Toast
              </button>
              <button
                onClick={showErrorToast}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                Error Toast
              </button>
              <button
                onClick={showWarningToast}
                className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-200"
              >
                Warning Toast
              </button>
              <button
                onClick={showInfoToast}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                Info Toast
              </button>
            </div>
          </motion.div>

          {/* Form-specific Toasts */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Form Operations</h3>
            <div className="space-y-3">
              <button
                onClick={showFormSuccessToast}
                className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200"
              >
                Form Saved Success
              </button>
              <button
                onClick={showFormErrorToast}
                className="w-full px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors duration-200"
              >
                Form Save Error
              </button>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Features</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Auto-dismiss after 5 seconds</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Progress bar animation</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Smooth spring animations</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Backdrop blur effect</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span>Gradient backgrounds</span>
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-500">
            Toasts appear in the top-right corner with smooth animations and professional styling
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ToastDemo;
