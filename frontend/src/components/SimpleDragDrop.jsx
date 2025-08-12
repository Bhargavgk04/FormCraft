import React, { useState } from 'react';

const SimpleDragDrop = () => {
  const [items, setItems] = useState([
    { id: '1', content: 'JavaScript', category: null },
    { id: '2', content: 'Python', category: null },
    { id: '3', content: 'React', category: null },
    { id: '4', content: 'Node.js', category: null },
    { id: '5', content: 'Django', category: null },
    { id: '6', content: 'Vue.js', category: null },
  ]);

  const categories = ['Frontend', 'Backend'];

  const handleDragStart = (e, itemId) => {
    e.dataTransfer.setData('text/plain', itemId);
    console.log('Drag started for item:', itemId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetCategory) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    console.log('Dropping item:', itemId, 'into category:', targetCategory);
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, category: targetCategory }
          : item
      )
    );
  };

  const handleDragBack = (e) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    console.log('Moving item back to available:', itemId);
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, category: null }
          : item
      )
    );
  };

  const getItemsByCategory = (category) => {
    return items.filter(item => item.category === category);
  };

  const getAvailableItems = () => {
    return items.filter(item => item.category === null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">🧪 Simple Drag and Drop Test</h1>
          <p className="text-lg text-gray-600 mb-2">Using HTML5 Drag and Drop - Should work on any PC</p>
          <p className="text-sm text-gray-500">Click and drag items between the sections below</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Items */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">📦 Available Items</h2>
              <div 
                className="min-h-[300px] p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50"
                onDragOver={handleDragOver}
                onDrop={handleDragBack}
              >
                <div className="space-y-3">
                  {getAvailableItems().map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.id)}
                      className="p-4 bg-white border-2 border-gray-300 rounded-lg shadow-sm cursor-grab active:cursor-grabbing transition-all duration-200 select-none font-medium text-center hover:border-blue-300 hover:shadow-md"
                    >
                      {item.content}
                    </div>
                  ))}
                </div>
                {getAvailableItems().length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 italic text-lg">All items moved!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((category) => (
                <div key={category} className="bg-white rounded-xl shadow-lg">
                  <div className="p-4 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 text-center">{category}</h2>
                  </div>
                  <div 
                    className="min-h-[300px] p-4 bg-gray-50"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, category)}
                  >
                    <div className="space-y-3">
                      {getItemsByCategory(category).map((item) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item.id)}
                          className="p-4 bg-green-100 border-2 border-green-300 rounded-lg cursor-grab active:cursor-grabbing transition-all duration-200 select-none font-medium text-center hover:shadow-md hover:border-green-400"
                        >
                          {item.content}
                        </div>
                      ))}
                    </div>
                    {getItemsByCategory(category).length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-400 italic text-lg">Drop items here</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Instructions</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Click and hold on any item to start dragging</p>
              <p>• Drag items from "Available Items" to either "Frontend" or "Backend" categories</p>
              <p>• You can also drag items back from categories to the available items</p>
              <p>• This uses native HTML5 drag and drop - should work on any browser</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDragDrop;

