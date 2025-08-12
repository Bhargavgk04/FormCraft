import React, { useState } from 'react';

const ButtonBasedDragDrop = () => {
  const [items, setItems] = useState([
    { id: '1', content: 'JavaScript', category: null },
    { id: '2', content: 'Python', category: null },
    { id: '3', content: 'React', category: null },
    { id: '4', content: 'Node.js', category: null },
    { id: '5', content: 'Django', category: null },
    { id: '6', content: 'Vue.js', category: null },
  ]);

  const categories = ['Frontend', 'Backend'];

  const moveToCategory = (itemId, targetCategory) => {
    console.log('Moving item:', itemId, 'to category:', targetCategory);
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, category: targetCategory }
          : item
      )
    );
  };

  const moveBackToAvailable = (itemId) => {
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
          <h1 className="text-3xl font-bold text-gray-800 mb-4">🎯 Button-Based Item Categorization</h1>
          <p className="text-lg text-gray-600 mb-2">Simple buttons - no drag and drop needed!</p>
          <p className="text-sm text-gray-500">Click buttons to move items between categories</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Items */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">📦 Available Items</h2>
              <div className="min-h-[300px] p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <div className="space-y-4">
                  {getAvailableItems().map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-white border-2 border-gray-300 rounded-lg shadow-sm"
                    >
                      <div className="text-center font-medium mb-3">{item.content}</div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => moveToCategory(item.id, 'Frontend')}
                          className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                        >
                          → Frontend
                        </button>
                        <button
                          onClick={() => moveToCategory(item.id, 'Backend')}
                          className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                        >
                          → Backend
                        </button>
                      </div>
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
                  <div className="min-h-[300px] p-4 bg-gray-50">
                    <div className="space-y-3">
                      {getItemsByCategory(category).map((item) => (
                        <div
                          key={item.id}
                          className="p-4 bg-green-100 border-2 border-green-300 rounded-lg"
                        >
                          <div className="text-center font-medium mb-3">{item.content}</div>
                          <button
                            onClick={() => moveBackToAvailable(item.id)}
                            className="w-full px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                          >
                            ← Move Back
                          </button>
                        </div>
                      ))}
                    </div>
                    {getItemsByCategory(category).length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-400 italic text-lg">No items here yet</p>
                        <p className="text-xs text-gray-500 mt-2">Use buttons from the left to move items here</p>
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
              <p>• Click "→ Frontend" or "→ Backend" buttons to move items to categories</p>
              <p>• Click "← Move Back" buttons to move items back to "Available Items"</p>
              <p>• No drag and drop needed - just simple button clicks!</p>
              <p>• This will work on any device or browser</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ButtonBasedDragDrop;

