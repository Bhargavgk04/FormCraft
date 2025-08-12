import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { animations, easing } from '../utils/animations';
import { AnimatedButton, AnimatedSpinner } from './AnimatedComponents';

const QuestionEditor = ({ 
  question, 
  onUpdate = () => console.warn('QuestionEditor: onUpdate not provided'), 
  onCancel = () => console.warn('QuestionEditor: onCancel not provided'), 
  onSave = () => console.warn('QuestionEditor: onSave not provided') 
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  // Edit toggles for categorize question configuration
  const [editCategories, setEditCategories] = useState(true);
  const [editItems, setEditItems] = useState(true);
  const [showDragDrop, setShowDragDrop] = useState(false);
  
  // Local state for input values to prevent focus loss
  const [localQuestion, setLocalQuestion] = useState(question);
  
  // Debug: Log props to see what's being received
  console.log('QuestionEditor rendered with props:', { 
    question: !!question, 
    onUpdate: typeof onUpdate, 
    onCancel: typeof onCancel, 
    onSave: typeof onSave,
    onCancelValue: onCancel
  });
  
  // Update local state when question prop changes
  useEffect(() => {
    setLocalQuestion(question);
  }, [question]);
  
  if (!question) {
    console.log('QuestionEditor: No question provided, returning null');
    return null;
  }

  // Safety check for required props - no longer needed with default values
  // if (!onCancel) {
  //   console.error('QuestionEditor: onCancel prop is missing! Props received:', { question, onUpdate, onCancel, onSave });
  //   return <div className="p-4 text-red-600">Error: Missing required onCancel prop</div>;
  // }

  // if (!onUpdate) {
  //   console.error('QuestionEditor: onUpdate prop is missing! Props received:', { question, onUpdate, onCancel, onSave });
  //   return <div className="p-4 text-red-600">Error: Missing required onUpdate prop</div>;
  // }

  const updateField = (field, value) => {
    console.log(`QuestionEditor: Updating field "${field}" with value:`, value);
    
    if (field === 'itemAssignments') {
      console.log('QuestionEditor: itemAssignments update details:', {
        value,
        type: typeof value,
        keys: Object.keys(value || {}),
        stringified: JSON.stringify(value)
      });
    }
    
    // Update local state immediately to prevent input from disappearing
    const updatedQuestion = { ...localQuestion, [field]: value };
    setLocalQuestion(updatedQuestion);
    
    // Mark that there are unsaved changes
    setHasChanges(true);
    
    // For itemAssignments, immediately update parent state to persist changes
    if (field === 'itemAssignments') {
      console.log('QuestionEditor: Immediately updating parent state with itemAssignments');
      onUpdate(updatedQuestion);
    }
    
    // Don't update parent state immediately for other fields - wait for save button
  };

  const handleCancel = () => {
    // Safety check no longer needed with default values
    // if (!onCancel) {
    //   console.error('QuestionEditor: onCancel is not defined in handleCancel');
    //   return;
    // }
    
    if (hasChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to close without saving?');
      if (confirmed) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Ensure itemAssignments are properly formatted
    let finalQuestion = { ...localQuestion };
    
    if (localQuestion.type === 'categorize') {
      // Ensure itemAssignments is a proper object with numeric keys
      const cleanedAssignments = {};
      if (localQuestion.itemAssignments) {
        Object.keys(localQuestion.itemAssignments).forEach(key => {
          const itemIndex = parseInt(key);
          const categoryIndex = localQuestion.itemAssignments[key];
          if (!isNaN(itemIndex) && !isNaN(categoryIndex)) {
            cleanedAssignments[itemIndex] = categoryIndex;
          }
        });
      }
      finalQuestion.itemAssignments = cleanedAssignments;
    }
    
    // Debug: Log the question data before saving
    console.log('Saving question with data:', {
      type: finalQuestion.type,
      categories: finalQuestion.categories,
      items: finalQuestion.items,
      itemAssignments: finalQuestion.itemAssignments
    });
    
    // Update parent state with all local changes
    onUpdate(finalQuestion);
    
    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSaving(false);
    setHasChanges(false);
    
    // Call onSave to close the modal and save the question
    if (onSave) {
      onSave();
    } else {
      onCancel(); // Fallback
    }
  };

  const renderCategorizeEditor = () => {
    console.log('Rendering categorize editor with question:', question);
    
    const handleDragStart = (e, itemIndex) => {
      e.dataTransfer.setData('text/plain', itemIndex.toString());
      console.log('Drag started for item:', itemIndex);
    };

    const handleDragOver = (e) => {
      e.preventDefault();
    };

    const handleDrop = (e, categoryIndex) => {
      e.preventDefault();
      const itemIndex = parseInt(e.dataTransfer.getData('text/plain'));
      console.log('QuestionEditor: Dropping item:', itemIndex, 'into category:', categoryIndex);
      
      const newItemAssignments = { ...(localQuestion.itemAssignments || {}) };
      newItemAssignments[itemIndex] = categoryIndex;
      updateField('itemAssignments', newItemAssignments);
    };

    const handleDragBack = (e) => {
      e.preventDefault();
      const itemIndex = parseInt(e.dataTransfer.getData('text/plain'));
      console.log('QuestionEditor: Moving item back to available:', itemIndex);
      
      const newItemAssignments = { ...(localQuestion.itemAssignments || {}) };
      delete newItemAssignments[itemIndex];
      updateField('itemAssignments', newItemAssignments);
    };

    const getAssignedItems = (categoryIndex) => {
      return localQuestion.items?.filter((_, itemIndex) => 
        (localQuestion.itemAssignments || {})[itemIndex] === categoryIndex
      ) || [];
    };

    const getUnassignedItems = () => {
      return localQuestion.items?.filter((_, itemIndex) => 
        !(localQuestion.itemAssignments || {})[itemIndex]
      ) || [];
    };

    return (
      <div className="space-y-8">
        {/* Categories Section */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <label className="text-lg font-bold text-indigo-800">📂 Categories</label>
              <span className="text-xs text-indigo-600 bg-white px-2 py-1 rounded-full font-medium">
                {localQuestion.categories?.length || 0} categories
              </span>
            </div>
            <button
              type="button"
              onClick={() => setEditCategories(prev => !prev)}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium bg-white px-3 py-1 rounded-lg border border-indigo-200"
            >
              {editCategories ? 'Done' : 'Edit'}
            </button>
          </div>

          {editCategories ? (
            <>
              <div className="space-y-3">
                {localQuestion.categories?.map((category, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 transition-all duration-200"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-xs font-bold text-indigo-600">{index + 1}</span>
                    </div>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => {
                        const newCategories = [...localQuestion.categories];
                        newCategories[index] = e.target.value; // Don't trim while typing
                        console.log(`Updating category ${index} to: "${newCategories[index]}"`);
                        updateField('categories', newCategories);
                      }}
                      onBlur={(e) => {
                        // Trim only when user finishes editing
                        const newCategories = [...localQuestion.categories];
                        newCategories[index] = e.target.value.trim();
                        updateField('categories', newCategories);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 font-medium transition-all duration-200"
                      placeholder="Enter category name"
                    />
                    <motion.button
                      onClick={() => {
                        const newCategories = localQuestion.categories.filter((_, i) => i !== index);
                        updateField('categories', newCategories);
                      }}
                      className="text-red-400 hover:text-red-600 transition-colors duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
              
              {/* Add Category Button */}
              <motion.button
                onClick={() => {
                  const newCategories = [...(localQuestion.categories || []), `Category ${(localQuestion.categories?.length || 0) + 1}`];
                  updateField('categories', newCategories);
                }}
                className="w-full mt-3 py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-all duration-200 flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </motion.button>
            </>
          ) : (
            // Read-only view for categories
            <div className="flex flex-wrap gap-2">
              {localQuestion.categories?.map((category, index) => (
                <span key={index} className="px-3 py-1 bg-indigo-200 text-indigo-800 rounded-full text-sm font-medium border border-indigo-300">
                  {category}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Drag and Drop Interface */}
        {localQuestion.categories?.length > 0 && localQuestion.items?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold text-gray-800">🎯 Preview: Drag & Drop Assignment</h4>
              <button
                type="button"
                onClick={() => setShowDragDrop(prev => !prev)}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                {showDragDrop ? 'Close' : 'Assign Items'}
              </button>
            </div>
            
            {/* Current Assignments Display */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h5 className="text-sm font-medium text-blue-700 mb-2">Current Assignments:</h5>
              <div className="text-xs text-gray-600">
                {Object.keys(localQuestion.itemAssignments || {}).length === 0 ? (
                  <span className="text-gray-500">No items assigned yet. Drag items to categories below.</span>
                ) : (
                  Object.entries(localQuestion.itemAssignments || {}).map(([itemIndex, categoryIndex]) => {
                    const item = localQuestion.items?.[parseInt(itemIndex)];
                    const category = localQuestion.categories?.[categoryIndex];
                    return (
                      <div key={itemIndex} className="mb-1">
                        <span className="font-medium">{item}</span> → <span className="font-medium text-blue-600">{category}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            
            {showDragDrop && (

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Items Column */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-4">📦 Available Items</h5>
                   <div 
                     className="min-h-[250px] p-4 rounded-lg border-2 border-dashed transition-colors duration-200 border-gray-300 bg-gray-50 hover:border-indigo-400"
                     onDragOver={handleDragOver}
                     onDrop={handleDragBack}
                   >
                     {localQuestion.items?.map((item, index) => {
                                               const isAssigned = localQuestion.itemAssignments && localQuestion.itemAssignments[index] !== undefined;
                       if (isAssigned) return null; // Skip assigned items
                       
                       return (
                         <div
                           key={`item-${index}`}
                           draggable
                           onDragStart={(e) => handleDragStart(e, index)}
                           className="mb-3 p-4 rounded-lg border transition-all duration-200 select-none cursor-grab bg-white border-gray-200 hover:border-indigo-300 hover:shadow-md"
                         >
                           <div className="flex items-center space-x-3">
                             <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                               <span className="text-xs font-bold text-white">{index + 1}</span>
                             </div>
                             <span className="flex-1 text-sm font-medium text-gray-700">{item}</span>
                           </div>
                         </div>
                       );
                     })}
                   </div>
                </div>

                {/* Categories Column */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-4">📂 Categories</h5>
                  <div className="space-y-4">
                    {localQuestion.categories?.map((category, catIndex) => {
                      const assignedItems = getAssignedItems(catIndex);
                      
                      return (
                        <div
                          key={`category-${catIndex}`}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, catIndex)}
                          className={`min-h-[120px] p-4 rounded-lg border-2 border-dashed transition-colors duration-200 ${
                            assignedItems.length > 0
                              ? 'border-indigo-400 bg-indigo-50 hover:border-indigo-500' 
                              : 'border-gray-300 bg-gray-50 hover:border-indigo-400'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-800">{category}</span>
                            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                              {assignedItems.length} items
                            </span>
                          </div>
                          
                          <div className="space-y-1">
                            {assignedItems.map((item, itemIndex) => {
                              // Find the original item index
                              const originalIndex = localQuestion.items?.findIndex((_, index) => 
                                (localQuestion.itemAssignments || {})[index] === catIndex
                              );
                              
                              return (
                                <div
                                  key={itemIndex}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, originalIndex)}
                                  className="p-3 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium cursor-grab hover:bg-indigo-200 transition-colors hover:shadow-sm"
                                >
                                  {item}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Items Management Section */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <label className="text-lg font-bold text-purple-800">🎯 Manage Items</label>
              <span className="text-xs text-purple-600 bg-white px-2 py-1 rounded-full font-medium">
                {localQuestion.items?.length || 0} items
              </span>
            </div>
            <button
              type="button"
              onClick={() => setEditItems(prev => !prev)}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium bg-white px-3 py-1 rounded-lg border border-purple-200"
            >
              {editItems ? 'Done' : 'Edit'}
            </button>
          </div>

          {editItems ? (
            <>
              <div className="space-y-3">
                {localQuestion.items?.map((item, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 transition-all duration-200"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{index + 1}</span>
                    </div>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const newItems = [...localQuestion.items];
                        newItems[index] = e.target.value;
                        updateField('items', newItems);
                      }}
                      onBlur={(e) => {
                        // Trim only when user finishes editing
                        const newItems = [...localQuestion.items];
                        newItems[index] = e.target.value.trim();
                        updateField('items', newItems);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-700 transition-all duration-200"
                      placeholder="Enter item name"
                    />
                    <motion.button
                      onClick={() => {
                        const newItems = localQuestion.items.filter((_, i) => i !== index);
                        updateField('items', newItems);
                      }}
                      className="text-red-400 hover:text-red-600 transition-colors duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
              
              {/* Add Item Button */}
              <motion.button
                onClick={() => {
                  const newItems = [...(localQuestion.items || []), `Item ${(localQuestion.items?.length || 0) + 1}`];
                  updateField('items', newItems);
                }}
                className="w-full mt-3 py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-all duration-200 flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </motion.button>
            </>
          ) : (
            // Read-only view for items
            <div className="flex flex-wrap gap-2">
              {localQuestion.items?.map((item, index) => (
                <span key={index} className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm font-medium border border-purple-300">
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-white">💡</span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-800 mb-1">How to set up this question</h4>
              <p className="text-xs text-blue-700">
                <strong>Step 1:</strong> Add and edit categories in the "Categories" section above.<br/>
                <strong>Step 2:</strong> Add and edit items in the "Manage Items" section below.<br/>
                <strong>Step 3:</strong> Use the preview interface to assign items to categories by dragging them.<br/>
                <strong>Step 4:</strong> Users will see this same interface when taking the form.
              </p>
            </div>
          </div>
        </div>
    </div>
  );
  };

  const renderClozeEditor = () => (
    <div className="space-y-6">
      {/* Sentence Editor */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-semibold text-gray-700">
            📝 Text with Blanks
        </label>
          <motion.button
            onClick={() => {
              const currentSentence = localQuestion.sentence || '';
              const newSentence = currentSentence + ' [blank]';
              updateField('sentence', newSentence);
            }}
            className="px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-1"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-3 h-3" />
            <span>Make Blank</span>
          </motion.button>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
        <textarea
            value={localQuestion.sentence || ''}
          onChange={(e) => {
            const newSentence = e.target.value;
            updateField('sentence', newSentence);
            
            // Auto-create blanks from [blank] markers
            const blankCount = (newSentence.match(/\[blank\]/g) || []).length;
            const currentBlanks = localQuestion.blanks || [];
            
            if (blankCount > currentBlanks.length) {
              // Add new blanks
              const newBlanks = [...currentBlanks];
              for (let i = currentBlanks.length; i < blankCount; i++) {
                newBlanks.push({
                  id: Date.now() + i,
                  answer: '',
                  inputType: 'options',
                  options: ['Option 1', 'Option 2', 'Option 3']
                });
              }
              updateField('blanks', newBlanks);
            } else if (blankCount < currentBlanks.length) {
              // Remove extra blanks
              updateField('blanks', currentBlanks.slice(0, blankCount));
            }
          }}
            className="w-full border-0 bg-transparent focus:ring-0 focus:outline-none text-gray-700 resize-none"
            rows="4"
            placeholder="Enter your text here. Click 'Make Blank' to add blanks, or type [blank] manually. For example: 'The quick [brown] fox jumps over the [lazy] dog.'"
        />
      </div>

        {/* Live Preview */}
        {localQuestion.sentence && (
          <motion.div 
            className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs font-semibold text-blue-700">👁️ Preview:</span>
            </div>
            <div className="text-sm text-gray-700">
              {localQuestion.sentence.split('[blank]').map((part, index, array) => (
                <span key={index}>
                  {part}
                  {index < array.length - 1 && (
                    <span className="inline-block mx-1 px-2 py-1 bg-white border border-gray-300 rounded text-gray-500 min-w-[60px] text-center">
                      blank
                    </span>
                  )}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Blanks Configuration */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-semibold text-gray-700">
            🎯 Blank Answers
        </label>
          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
            {localQuestion.blanks?.length || 0} blanks
          </span>
        </div>
        
        <div className="space-y-3">
          {localQuestion.blanks?.map((blank, index) => (
            <motion.div 
              key={blank.id || index} 
              className="bg-white rounded-lg border border-gray-200 p-4 hover:border-indigo-300 transition-all duration-200"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-blue-400 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{index + 1}</span>
                  </div>
                  <span className="font-medium text-gray-700">Blank {index + 1}</span>
                </div>
                <motion.button
                onClick={() => {
                  const newBlanks = localQuestion.blanks.filter((_, i) => i !== index);
                  updateField('blanks', newBlanks);
                }}
                  className="text-red-400 hover:text-red-600 transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
              >
                <Trash2 className="w-4 h-4" />
                </motion.button>
            </div>
            
              <div className="space-y-3">
                {/* Input Type Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600">Input Type:</label>
                  <div className="flex space-x-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`inputType-${index}`}
                        value="options"
                        checked={blank.inputType !== 'text'}
                        onChange={(e) => {
                          const newBlanks = [...localQuestion.blanks];
                          newBlanks[index] = { 
                            ...blank, 
                            inputType: 'options',
                            options: blank.options || ['Option 1', 'Option 2', 'Option 3']
                          };
                          updateField('blanks', newBlanks);
                        }}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">📋 Multiple Choice</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`inputType-${index}`}
                        value="text"
                        checked={blank.inputType === 'text'}
                        onChange={(e) => {
                          const newBlanks = [...localQuestion.blanks];
                          newBlanks[index] = { 
                            ...blank, 
                            inputType: 'text'
                          };
                          updateField('blanks', newBlanks);
                        }}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">✏️ Free Text</span>
                    </label>
                  </div>
                </div>

                {/* Correct Answer */}
                <div>
                  <label className="text-xs font-medium text-gray-600">Correct Answer:</label>
                  <input
                    type="text"
                    value={blank.answer || ''}
                    onChange={(e) => {
                      const newBlanks = [...localQuestion.blanks];
                      newBlanks[index] = { ...blank, answer: e.target.value };
                      updateField('blanks', newBlanks);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter correct answer"
                  />
                </div>

                {/* Options (only show for multiple choice) */}
                {blank.inputType !== 'text' && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-600">Options:</label>
                    {blank.options?.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newBlanks = [...localQuestion.blanks];
                            const newOptions = [...blank.options];
                            newOptions[optionIndex] = e.target.value;
                            newBlanks[index] = { ...blank, options: newOptions };
                            updateField('blanks', newBlanks);
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                          placeholder={`Option ${optionIndex + 1}`}
                        />
                        <motion.button
                          onClick={() => {
                            const newBlanks = [...localQuestion.blanks];
                            const newOptions = blank.options.filter((_, i) => i !== optionIndex);
                            newBlanks[index] = { ...blank, options: newOptions };
                            updateField('blanks', newBlanks);
                          }}
                          className="text-red-400 hover:text-red-600 transition-colors duration-200 p-1"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    ))}
                    
                    {/* Add Option Button */}
                    <motion.button
                      onClick={() => {
                        const newBlanks = [...localQuestion.blanks];
                        const newOptions = [...(blank.options || []), `Option ${(blank.options?.length || 0) + 1}`];
                        newBlanks[index] = { ...blank, options: newOptions };
                        updateField('blanks', newBlanks);
                      }}
                      className="w-full py-2 px-3 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-all duration-200 text-sm"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      + Add Option
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
        ))}
        </div>
        
        <motion.button
          onClick={() => {
            const currentSentence = localQuestion.sentence || '';
            const newSentence = currentSentence + ' [blank]';
            updateField('sentence', newSentence);
            
            // Auto-create a new blank when adding [blank] to sentence
            const blankCount = (newSentence.match(/\[blank\]/g) || []).length;
            const currentBlanks = localQuestion.blanks || [];
            
            if (blankCount > currentBlanks.length) {
              // Add new blank
              const newBlanks = [...currentBlanks];
              for (let i = currentBlanks.length; i < blankCount; i++) {
                newBlanks.push({
                  id: Date.now() + i,
                  answer: '',
                  inputType: 'text',
                  options: []
                });
              }
              updateField('blanks', newBlanks);
            }
          }}
          className="w-full mt-3 py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-400 hover:text-green-600 transition-all duration-200 flex items-center justify-center space-x-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-4 h-4" />
          <span>Add Blank</span>
        </motion.button>
      </div>

      {/* Instructions */}
      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs font-bold text-white">💡</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-green-800 mb-1">How it works</h4>
            <p className="text-xs text-green-700">
              Students will see the sentence with blank spaces and need to fill in the correct words. 
              Each blank can have multiple options for students to choose from.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderComprehensionEditor = () => (
    <div className="space-y-6">
      {/* Passage Editor */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-semibold text-gray-700">
            📖 Reading Passage
        </label>
          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
            {localQuestion.passage?.length || 0} characters
          </span>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
        <textarea
            value={localQuestion.passage || ''}
          onChange={(e) => updateField('passage', e.target.value)}
            className="w-full border-0 bg-transparent focus:ring-0 focus:outline-none text-gray-700 resize-none"
            rows="8"
            placeholder="Enter the reading passage here. This will be displayed to students before they answer the questions below."
        />
      </div>

        {/* Word Count */}
        {localQuestion.passage && (
          <motion.div 
            className="mt-3 text-xs text-gray-500 text-right"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {localQuestion.passage.split(' ').length} words
          </motion.div>
        )}
      </div>

      {/* Questions Section */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-semibold text-gray-700">
            ❓ Comprehension Questions
        </label>
          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
            {localQuestion.questions?.length || 0} questions
          </span>
        </div>
        
        <div className="space-y-4">
          {localQuestion.questions?.map((q, index) => (
            <motion.div 
              key={q.id || index} 
              className="bg-white rounded-lg border border-gray-200 p-4 hover:border-indigo-300 transition-all duration-200"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{index + 1}</span>
                  </div>
                  <span className="font-medium text-gray-700">Question {index + 1}</span>
                </div>
                <motion.button
                onClick={() => {
                  const newQuestions = localQuestion.questions.filter((_, i) => i !== index);
                  updateField('questions', newQuestions);
                }}
                  className="text-red-400 hover:text-red-600 transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
              >
                <Trash2 className="w-4 h-4" />
                </motion.button>
            </div>
            
              <div className="space-y-3">
            <input
              type="text"
                  placeholder="Enter your question here"
                  value={q.question || ''}
              onChange={(e) => {
                const newQuestions = [...localQuestion.questions];
                newQuestions[index] = { ...q, question: e.target.value };
                updateField('questions', newQuestions);
              }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />

            <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600">Options:</label>
                  {q.options?.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                  <input
                    type="radio"
                        name={`question-${q.id || index}`}
                    checked={q.correctAnswer === optionIndex}
                    onChange={() => {
                      const newQuestions = [...localQuestion.questions];
                      newQuestions[index] = { ...q, correctAnswer: optionIndex };
                      updateField('questions', newQuestions);
                    }}
                        className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                        value={option || ''}
                    onChange={(e) => {
                      const newQuestions = [...localQuestion.questions];
                      const newOptions = [...q.options];
                      newOptions[optionIndex] = e.target.value;
                      newQuestions[index] = { ...q, options: newOptions };
                      updateField('questions', newQuestions);
                    }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                  />
                      {q.correctAnswer === optionIndex && (
                        <span className="text-xs text-green-600 font-medium">✓ Correct</span>
                      )}
                </div>
              ))}
            </div>
          </div>
            </motion.div>
        ))}
        </div>
        
        <motion.button
          onClick={() => {
            const newQuestion = {
              id: Date.now(),
              question: '',
              options: ['Option A', 'Option B', 'Option C', 'Option D'],
              correctAnswer: 0
            };
            updateField('questions', [...(localQuestion.questions || []), newQuestion]);
          }}
          className="w-full mt-3 py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-orange-400 hover:text-orange-600 transition-all duration-200 flex items-center justify-center space-x-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-4 h-4" />
          <span>Add Question</span>
        </motion.button>
      </div>

      {/* Instructions */}
      <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs font-bold text-white">💡</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-orange-800 mb-1">How it works</h4>
            <p className="text-xs text-orange-700">
              Students will read the passage first, then answer multiple choice questions based on the content. 
              Each question can have 4 options with one correct answer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easing.easeOut }}
      className="bg-white rounded-xl shadow-lg p-6 w-full"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">Q</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {localQuestion.type === 'categorize' && '📂'}
              {localQuestion.type === 'cloze' && '✏️'}
              {localQuestion.type === 'comprehension' && '📖'}
              {' '}{localQuestion.type.charAt(0).toUpperCase() + localQuestion.type.slice(1)} Question
            </h2>
            <p className="text-sm text-gray-600">Configure your question settings</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full"
            >
              Unsaved changes
            </motion.span>
          )}
          <motion.button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Title
          </label>
          <input
            type="text"
            value={localQuestion.title}
            onChange={(e) => updateField('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter question title"
          />
        </motion.div>

        

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
        {localQuestion.type === 'categorize' && renderCategorizeEditor()}
        {localQuestion.type === 'cloze' && renderClozeEditor()}
        {localQuestion.type === 'comprehension' && renderComprehensionEditor()}
        </motion.div>

        {/* Save Button at Bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="pt-6 border-t border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {hasChanges && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full"
                >
                  Unsaved changes
                </motion.span>
              )}
              {/* Duplicate points control at bottom for convenience */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Points:</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={localQuestion.points ?? 1}
                  onChange={(e) => updateField('points', parseFloat(e.target.value) || 0)}
                  className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button
                onClick={handleCancel}
                disabled={isSaving}
                className="flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Cancel</span>
              </motion.button>
              
              <motion.button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  hasChanges 
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-md' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSaving ? (
                  <AnimatedSpinner size="sm" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSaving ? 'Saving...' : 'Save Question'}</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default QuestionEditor;