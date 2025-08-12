import React, { useState } from 'react';

const ClickBasedDragDrop = () => {
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
          <h1 className="text-3xl font-bold text-gray-800 mb-4">🎯 Click-Based Item Categorization</h1>
          <p className="text-lg text-gray-600 mb-2">No drag and drop needed - just click to move items!</p>
          <p className="text-sm text-gray-500">Click on any item to move it to a category</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Items */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">📦 Available Items</h2>
              <div className="min-h-[300px] p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <div className="space-y-3">
                  {getAvailableItems().map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        // Show category selection
                        const category = prompt(`Where would you like to move "${item.content}"?\n\nType:\n- "Frontend" for Frontend category\n- "Backend" for Backend category\n- "Cancel" to cancel`);
                        
                        if (category === 'Frontend' || category === 'Backend') {
                          moveToCategory(item.id, category);
                        }
                      }}
                      className="p-4 bg-white border-2 border-gray-300 rounded-lg shadow-sm cursor-pointer transition-all duration-200 select-none font-medium text-center hover:border-blue-300 hover:shadow-md hover:bg-blue-50"
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
                  <div className="min-h-[300px] p-4 bg-gray-50">
                    <div className="space-y-3">
                      {getItemsByCategory(category).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => moveBackToAvailable(item.id)}
                          className="p-4 bg-green-100 border-2 border-green-300 rounded-lg cursor-pointer transition-all duration-200 select-none font-medium text-center hover:shadow-md hover:border-green-400 hover:bg-green-200"
                        >
                          {item.content}
                          <div className="text-xs text-green-600 mt-1">(Click to move back)</div>
                        </div>
                      ))}
                    </div>
                    {getItemsByCategory(category).length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-400 italic text-lg">No items here yet</p>
                        <p className="text-xs text-gray-500 mt-2">Click items from the left to move them here</p>
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
              <p>• Click on any item in "Available Items" to move it to a category</p>
              <p>• A prompt will appear asking which category you want to move it to</p>
              <p>• Type "Frontend" or "Backend" to move the item</p>
              <p>• Click on items in categories to move them back to "Available Items"</p>
              <p>• No drag and drop needed - just simple clicks!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClickBasedDragDrop;

