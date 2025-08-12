import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner, { 
  PageSpinner, 
  ButtonSpinner, 
  CardSpinner, 
  InlineSpinner 
} from './LoadingSpinner';

const SpinnerDemo = () => {
  const [selectedSize, setSelectedSize] = useState('md');
  const [selectedColor, setSelectedColor] = useState('indigo');
  const [selectedVariant, setSelectedVariant] = useState('pulse');

  const variants = [
    { name: 'pulse', description: 'Smooth pulsing circle animation' },
    { name: 'dots', description: 'Three dots with staggered animation' },
    { name: 'ring', description: 'Rotating ring with stroke animation' },
    { name: 'bars', description: 'Vertical bars with wave effect' },
    { name: 'wave', description: 'Horizontal wave animation' },
    { name: 'spinner', description: 'Classic spinning circle' },
    { name: 'cube', description: '3D rotating cube effect' },
    { name: 'orbit', description: 'Orbiting dots animation' }
  ];

  const sizes = [
    { name: 'sm', label: 'Small' },
    { name: 'md', label: 'Medium' },
    { name: 'lg', label: 'Large' },
    { name: 'xl', label: 'Extra Large' }
  ];

  const colors = [
    { name: 'indigo', label: 'Indigo' },
    { name: 'blue', label: 'Blue' },
    { name: 'purple', label: 'Purple' },
    { name: 'green', label: 'Green' },
    { name: 'red', label: 'Red' },
    { name: 'gray', label: 'Gray' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Professional Loading Spinners
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A collection of smooth, professional loading animations built with Framer Motion
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customize Your Spinner</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Variant Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Animation Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {variants.map((variant) => (
                  <motion.button
                    key={variant.name}
                    onClick={() => setSelectedVariant(variant.name)}
                    className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedVariant === variant.name
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {variant.name.charAt(0).toUpperCase() + variant.name.slice(1)}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Size
              </label>
              <div className="grid grid-cols-2 gap-2">
                {sizes.map((size) => (
                  <motion.button
                    key={size.name}
                    onClick={() => setSelectedSize(size.name)}
                    className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedSize === size.name
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {size.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Color
              </label>
              <div className="grid grid-cols-3 gap-2">
                {colors.map((color) => (
                  <motion.button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedColor === color.name
                        ? 'ring-2 ring-indigo-600 shadow-lg'
                        : 'hover:bg-gray-100'
                    }`}
                    style={{
                      backgroundColor: color.name === 'indigo' ? '#4f46e5' :
                                    color.name === 'blue' ? '#2563eb' :
                                    color.name === 'purple' ? '#7c3aed' :
                                    color.name === 'green' ? '#16a34a' :
                                    color.name === 'red' ? '#dc2626' :
                                    color.name === 'gray' ? '#6b7280' : '#4f46e5',
                      color: 'white'
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {color.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Preview</h2>
          <div className="flex items-center justify-center min-h-32">
            <LoadingSpinner
              size={selectedSize}
              variant={selectedVariant}
              color={selectedColor}
              text={`${selectedVariant.charAt(0).toUpperCase() + selectedVariant.slice(1)} Loading...`}
              showText={true}
            />
          </div>
        </motion.div>

        {/* All Variants */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Animation Variants</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {variants.map((variant, index) => (
              <motion.div
                key={variant.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="mb-4">
                  <LoadingSpinner
                    size="md"
                    variant={variant.name}
                    color="indigo"
                    showText={false}
                  />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {variant.name.charAt(0).toUpperCase() + variant.name.slice(1)}
                </h3>
                <p className="text-sm text-gray-600">
                  {variant.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Usage Examples */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Usage Examples</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Page Spinner */}
            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Page Loading</h3>
              <div className="bg-gray-50 rounded-lg p-4 h-32 flex items-center justify-center">
                <PageSpinner text="Loading page..." />
              </div>
              <div className="mt-4">
                <code className="text-sm bg-gray-100 p-2 rounded block">
                  {`<PageSpinner text="Loading page..." />`}
                </code>
              </div>
            </div>

            {/* Button Spinner */}
            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Button Loading</h3>
              <div className="bg-gray-50 rounded-lg p-4 h-32 flex items-center justify-center">
                <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2">
                  <ButtonSpinner size="sm" color="white" />
                  <span>Processing...</span>
                </button>
              </div>
              <div className="mt-4">
                <code className="text-sm bg-gray-100 p-2 rounded block">
                  {`<ButtonSpinner size="sm" color="white" />`}
                </code>
              </div>
            </div>

            {/* Card Spinner */}
            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Card Loading</h3>
              <div className="bg-gray-50 rounded-lg p-4 h-32 flex items-center justify-center">
                <CardSpinner text="Loading data..." />
              </div>
              <div className="mt-4">
                <code className="text-sm bg-gray-100 p-2 rounded block">
                  {`<CardSpinner text="Loading data..." />`}
                </code>
              </div>
            </div>

            {/* Inline Spinner */}
            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Inline Loading</h3>
              <div className="bg-gray-50 rounded-lg p-4 h-32 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-700">Processing</span>
                  <InlineSpinner size="sm" color="indigo" />
                  <span className="text-gray-700">please wait...</span>
                </div>
              </div>
              <div className="mt-4">
                <code className="text-sm bg-gray-100 p-2 rounded block">
                  {`<InlineSpinner size="sm" color="indigo" />`}
                </code>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Code Examples */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-gray-900 rounded-2xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Implementation</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Basic Usage</h3>
              <pre className="bg-gray-800 p-4 rounded-lg text-green-400 text-sm overflow-x-auto">
{`import LoadingSpinner from './LoadingSpinner';

// Basic spinner
<LoadingSpinner />

// Customized spinner
<LoadingSpinner 
  size="lg"
  variant="ring"
  color="purple"
  text="Loading data..."
  showText={true}
/>`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Convenience Components</h3>
              <pre className="bg-gray-800 p-4 rounded-lg text-green-400 text-sm overflow-x-auto">
{`import { 
  PageSpinner, 
  ButtonSpinner, 
  CardSpinner, 
  InlineSpinner 
} from './LoadingSpinner';

// Full page loading
<PageSpinner text="Loading..." />

// Button loading state
<ButtonSpinner size="sm" color="white" />

// Card content loading
<CardSpinner text="Loading data..." />

// Inline loading indicator
<InlineSpinner size="sm" color="indigo" />`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Available Props</h3>
              <pre className="bg-gray-800 p-4 rounded-lg text-green-400 text-sm overflow-x-auto">
{`LoadingSpinner Props:
- size: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- variant: 'pulse' | 'dots' | 'ring' | 'bars' | 'wave' | 'spinner' | 'cube' | 'orbit' (default: 'pulse')
- color: 'indigo' | 'blue' | 'purple' | 'green' | 'red' | 'gray' | 'white' (default: 'indigo')
- text: string (default: 'Loading...')
- showText: boolean (default: true)
- className: string (default: '')`}
              </pre>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SpinnerDemo;

