import React, { useState, useEffect } from 'react';

const SimpleQuestionPreview = ({ question, questionNumber }) => {
  const [categorizeItems, setCategorizeItems] = useState([]);
  
  const [clozeAnswers, setClozeAnswers] = useState(
    question.type === 'cloze' 
      ? question.blanks.reduce((acc, blank) => ({ ...acc, [blank.id]: '' }), {})
      : {}
  );

  const [comprehensionAnswers, setComprehensionAnswers] = useState(
    question.type === 'comprehension'
      ? question.questions.reduce((acc, q) => ({ ...acc, [q.id]: null }), {})
      : {}
  );

  // Initialize categorize items when question changes
  useEffect(() => {
    if (question.type === 'categorize' && question.items) {
      setCategorizeItems(
        question.items.map((item, index) => ({ 
          id: `item-${index}`, 
          content: item, 
          category: null 
        }))
      );
    }
  }, [question]);

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
    
    setCategorizeItems(prevItems => 
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
    
    setCategorizeItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, category: null }
          : item
      )
    );
  };

  const getItemsByCategory = (category) => {
    return categorizeItems.filter(item => item.category === category);
  };

  const getAvailableItems = () => {
    return categorizeItems.filter(item => item.category === null);
  };

  const renderCategorizeQuestion = () => {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Drag and Drop Instructions</h3>
          <p className="text-sm text-gray-600">Click and drag items from the left to the categories on the right</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Items */}
          <div>
            <h4 className="font-medium text-gray-700 mb-4 text-center">📦 Available Items</h4>
            <div 
              className="min-h-[200px] p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50"
              onDragOver={handleDragOver}
              onDrop={handleDragBack}
            >
              <div className="flex flex-wrap gap-3">
                {getAvailableItems().map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    className="px-4 py-3 bg-white border-2 border-gray-300 rounded-lg shadow-sm cursor-grab active:cursor-grabbing transition-all duration-200 select-none font-medium hover:border-blue-300 hover:shadow-md"
                  >
                    {item.content}
                  </div>
                ))}
              </div>
              {getAvailableItems().length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 italic text-lg">🎉 All items have been categorized!</p>
                </div>
              )}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-medium text-gray-700 mb-4 text-center">📂 Categories</h4>
            <div className="space-y-4">
              {question.categories?.map((category) => (
                <div key={category} className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="p-4 border-b border-gray-100">
                    <h5 className="font-semibold text-gray-800 text-center">{category}</h5>
                  </div>
                  <div 
                    className="min-h-[120px] p-4 bg-gray-50"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, category)}
                  >
                    <div className="space-y-2">
                      {getItemsByCategory(category).map((item) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item.id)}
                          className="px-3 py-2 bg-green-100 border border-green-300 rounded-lg cursor-grab active:cursor-grabbing transition-all duration-200 select-none font-medium hover:shadow-md hover:border-green-400"
                        >
                          {item.content}
                        </div>
                      ))}
                    </div>
                    {getItemsByCategory(category).length === 0 && (
                      <div className="text-center py-6">
                        <p className="text-gray-400 italic text-sm">Drop items here</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderClozeQuestion = () => {
    const parts = question.sentence.split('[blank]');
    
    return (
      <div className="space-y-4">
        <div className="text-lg leading-relaxed">
          {parts.map((part, index) => (
            <span key={index}>
              {part}
              {index < parts.length - 1 && (
                <select
                  value={clozeAnswers[question.blanks[index].id] || ''}
                  onChange={(e) => setClozeAnswers(prev => ({
                    ...prev,
                    [question.blanks[index].id]: e.target.value
                  }))}
                  className="mx-2 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-yellow-50"
                >
                  <option value="">Choose...</option>
                  {question.blanks[index].options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
            </span>
          ))}
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Your answers:</h4>
          <div className="space-y-1">
            {question.blanks.map((blank, index) => (
              <div key={blank.id} className="text-sm">
                <span className="text-blue-600">Blank {index + 1}:</span>{' '}
                <span className="font-medium">
                  {clozeAnswers[blank.id] || 'Not answered'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderComprehensionQuestion = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-medium text-gray-800 mb-3">Passage:</h4>
          <p className="text-gray-700 leading-relaxed">{question.passage}</p>
        </div>
        
        <div className="space-y-4">
          {question.questions.map((q) => (
            <div key={q.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-800 mb-3">{q.question}</h5>
              <div className="space-y-2">
                {q.options.map((option, index) => (
                  <label key={index} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      value={index}
                      checked={comprehensionAnswers[q.id] === index}
                      onChange={() => setComprehensionAnswers(prev => ({
                        ...prev,
                        [q.id]: index
                      }))}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderQuestion = () => {
    switch (question.type) {
      case 'categorize':
        return renderCategorizeQuestion();
      case 'cloze':
        return renderClozeQuestion();
      case 'comprehension':
        return renderComprehensionQuestion();
      default:
        return <div>Unknown question type</div>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Question {questionNumber}
          </h3>
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
            {question.type}
          </span>
        </div>
        <p className="text-gray-600">{question.title}</p>
      </div>
      
      {renderQuestion()}
    </div>
  );
};

export default SimpleQuestionPreview;

