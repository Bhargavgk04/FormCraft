import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const DragDropTest = () => {
  const [items, setItems] = useState([
    { id: '1', content: 'JavaScript' },
    { id: '2', content: 'Python' },
    { id: '3', content: 'React' },
    { id: '4', content: 'Node.js' },
    { id: '5', content: 'Django' },
    { id: '6', content: 'Vue.js' },
  ]);

  const [categories, setCategories] = useState({
    'category-1': { name: 'Frontend', items: [] },
    'category-2': { name: 'Backend', items: [] },
  });

  const onDragEnd = (result) => {
    console.log('Test drag end:', result);
    
    if (!result.destination) {
      console.log('No destination, drag cancelled');
      return;
    }

    const { source, destination, draggableId } = result;
    console.log('Dragging from', source.droppableId, 'to', destination.droppableId);

    if (source.droppableId === 'items' && destination.droppableId.startsWith('category-')) {
      // Moving from items to category
      const item = items.find(item => item.id === draggableId);
      if (item) {
        console.log('Moving item to category:', item.content);
        setCategories(prev => ({
          ...prev,
          [destination.droppableId]: {
            ...prev[destination.droppableId],
            items: [...prev[destination.droppableId].items, item]
          }
        }));
        setItems(prev => prev.filter(item => item.id !== draggableId));
      }
    } else if (source.droppableId.startsWith('category-') && destination.droppableId === 'items') {
      // Moving from category back to items
      const category = categories[source.droppableId];
      const item = category.items.find(item => item.id === draggableId);
      if (item) {
        console.log('Moving item back to items:', item.content);
        setItems(prev => [...prev, item]);
        setCategories(prev => ({
          ...prev,
          [source.droppableId]: {
            ...prev[source.droppableId],
            items: prev[source.droppableId].items.filter(item => item.id !== draggableId)
          }
        }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">🧪 Drag and Drop Test</h1>
          <p className="text-lg text-gray-600 mb-2">Test the drag and drop functionality</p>
          <p className="text-sm text-gray-500">Click and drag items between the sections below</p>
        </div>
        
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">📦 Available Items</h2>
                <Droppable droppableId="items">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[300px] p-4 border-2 border-dashed rounded-lg transition-all duration-300 ${
                        snapshot.isDraggingOver 
                          ? 'border-blue-500 bg-blue-50 shadow-lg' 
                          : 'border-gray-300 bg-gray-50'
                      }`}
                      style={{
                        background: snapshot.isDraggingOver ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' : undefined
                      }}
                    >
                      <div className="space-y-3">
                        {items.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-4 bg-white border-2 rounded-lg shadow-sm cursor-grab active:cursor-grabbing transition-all duration-200 select-none font-medium text-center ${
                                  snapshot.isDragging 
                                    ? 'shadow-xl rotate-2 scale-105 border-blue-400 z-50' 
                                    : 'border-gray-300 hover:border-blue-300 hover:shadow-md'
                                }`}
                                style={{
                                  ...provided.draggableProps.style,
                                  userSelect: 'none',
                                  transform: snapshot.isDragging ? provided.draggableProps.style?.transform : 'none'
                                }}
                              >
                                {item.content}
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </div>
                      {provided.placeholder}
                      {items.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-gray-500 italic text-lg">All items moved!</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>

            {/* Categories */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(categories).map(([categoryId, category]) => (
                  <div key={categoryId} className="bg-white rounded-xl shadow-lg">
                    <div className="p-4 border-b border-gray-100">
                      <h2 className="text-xl font-semibold text-gray-800 text-center">{category.name}</h2>
                    </div>
                    <Droppable droppableId={categoryId}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`min-h-[300px] p-4 transition-all duration-300 ${
                            snapshot.isDraggingOver 
                              ? 'bg-green-50 border-2 border-green-400 shadow-lg' 
                              : 'bg-gray-50'
                          }`}
                          style={{
                            background: snapshot.isDraggingOver ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' : undefined
                          }}
                        >
                          <div className="space-y-3">
                            {category.items.map((item, index) => (
                              <Draggable key={item.id} draggableId={item.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`p-4 bg-green-100 border-2 border-green-300 rounded-lg cursor-grab active:cursor-grabbing transition-all duration-200 select-none font-medium text-center ${
                                      snapshot.isDragging 
                                        ? 'shadow-lg rotate-1 scale-105 border-green-500 z-50' 
                                        : 'hover:shadow-md hover:border-green-400'
                                    }`}
                                    style={{
                                      ...provided.draggableProps.style,
                                      userSelect: 'none',
                                      transform: snapshot.isDragging ? provided.draggableProps.style?.transform : 'none'
                                    }}
                                  >
                                    {item.content}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          </div>
                          {provided.placeholder}
                          {category.items.length === 0 && (
                            <div className="text-center py-8">
                              <p className="text-gray-400 italic text-lg">Drop items here</p>
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DragDropContext>

        <div className="mt-8 text-center">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Instructions</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Click and hold on any item to start dragging</p>
              <p>• Drag items from "Available Items" to either "Frontend" or "Backend" categories</p>
              <p>• You can also drag items back from categories to the available items</p>
              <p>• Check the browser console (F12) to see drag events</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DragDropTest;
