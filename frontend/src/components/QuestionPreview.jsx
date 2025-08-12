import { useState, useEffect, useCallback, Fragment } from 'react';

const QuestionPreview = ({ question, onAnswerChange, userAnswer }) => {
  const [categorizeItems, setCategorizeItems] = useState([]);
  const [clozeAnswers, setClozeAnswers] = useState({});
  const [comprehensionAnswers, setComprehensionAnswers] = useState({});

  // Initialize state when question changes
  useEffect(() => {
    console.log('QuestionPreview: Question changed:', question);
    console.log('QuestionPreview: User answer:', userAnswer);
    console.log('QuestionPreview: onAnswerChange provided:', !!onAnswerChange);
    
    if (question.type === 'categorize' && question.items) {
      console.log('QuestionPreview: Categorize question data:', {
        categories: question.categories,
        items: question.items,
        itemAssignments: question.itemAssignments
      });
      
      const items = question.items.map((item, index) => {
        let category = null;
        
        // If user has provided answers (form filling mode), use those
        if (userAnswer?.categories) {
          category = Object.keys(userAnswer.categories).find(cat => 
            (userAnswer.categories[cat] || []).includes(item)
          ) || null;
          console.log(`QuestionPreview: Using user answer for item ${index} (${item}):`, category);
        } 
        // Otherwise, use the saved assignments from the question data (preview mode)
        else if (question.itemAssignments && question.itemAssignments[index] !== undefined) {
          const categoryIndex = question.itemAssignments[index];
          category = question.categories?.[categoryIndex] || null;
          console.log(`QuestionPreview: Using saved assignment for item ${index} (${item}): index=${categoryIndex}, category=${category}`);
        } else {
          console.log(`QuestionPreview: No assignment found for item ${index} (${item})`);
        }
        
        return {
          id: `item-${index}`,
          content: item,
          category: category
        };
      });
      
      console.log('QuestionPreview: Final initialized categorize items:', items);
      setCategorizeItems(items);
    }

    if (question.type === 'cloze') {
      console.log('QuestionPreview: Initializing cloze answers');
      console.log('QuestionPreview: Blanks:', question.blanks);
      console.log('QuestionPreview: Sentence:', question.sentence);
      
      // Initialize cloze answers from userAnswer or create empty ones
      const answers = {};
      if (userAnswer?.answers && Array.isArray(userAnswer.answers)) {
        userAnswer.answers.forEach((answer, index) => {
          answers[index] = answer || '';
        });
      } else {
        // Create empty answers for each blank
        const blankCount = question.sentence ? (question.sentence.match(/\[blank\]/g) || []).length : 0;
        for (let i = 0; i < blankCount; i++) {
          answers[i] = '';
        }
      }
      console.log('QuestionPreview: Initialized cloze answers:', answers);
      setClozeAnswers(answers);
    }

    if (question.type === 'comprehension' && question.questions) {
      const answers = question.questions.reduce((acc, _q, index) => ({
        ...acc,
        [index]: userAnswer?.answers?.[index] || null
      }), {});
      setComprehensionAnswers(answers);
    }
  }, [question, userAnswer]);

  // Debounced answer update to prevent excessive calls
  const debouncedAnswerUpdate = useCallback(
    (() => {
      let timeoutId;
      return (questionId, answer) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (onAnswerChange && typeof onAnswerChange === 'function') {
            onAnswerChange(questionId, answer);
          } else {
            console.log('QuestionPreview: onAnswerChange not provided, skipping answer update');
          }
        }, 300);
      };
    })(),
    [onAnswerChange]
  );

  const renderCategorizeQuestion = () => {
    console.log('QuestionPreview: Rendering categorize question with items:', categorizeItems);
    
    // Helper functions
    const getItemsInCategory = (category) => 
      categorizeItems.filter(item => item.category === category);
    
    const getUnassignedItems = () => 
      categorizeItems.filter(item => item.category === null);
    
    // If not interactive (no onAnswerChange), show read-only view
    if (!onAnswerChange) {
      return (
        <div className="space-y-6">
          {/* Read-only Categories Display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {question.categories?.map((category, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 min-h-[120px]"
              >
                <h4 className="font-medium text-gray-900 mb-3 text-center">{category}</h4>
                <div className="space-y-2">
                  {getItemsInCategory(category).map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    >
                      {item.content}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Show unassigned items if any */}
          {getUnassignedItems().length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Unassigned Items</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {getUnassignedItems().map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-center"
                  >
                    {item.content}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Interactive mode - keep existing drag and drop functionality
    const handleDragStart = (e, itemId) => {
      e.dataTransfer.setData('text/plain', itemId);
    };

    const handleDragOver = (e) => {
      e.preventDefault();
    };

    const computeCategoriesFromItems = (itemsArray) => {
      const categories = {};
      for (const item of itemsArray) {
        if (item.category) {
          if (!categories[item.category]) categories[item.category] = [];
          categories[item.category].push(item.content);
        }
      }
      return categories;
    };

    const handleDrop = (e, targetCategory) => {
      e.preventDefault();
      const itemId = e.dataTransfer.getData('text/plain');
      
      setCategorizeItems(prevItems => {
        const updated = prevItems.map(item => 
          item.id === itemId ? { ...item, category: targetCategory } : item
        );
        
        // Only update answer if onAnswerChange is provided (interactive mode)
        if (onAnswerChange && typeof onAnswerChange === 'function') {
          setTimeout(() => {
            const categories = computeCategoriesFromItems(updated);
            console.log('QuestionPreview: Categorize answer update:', { categories, targetCategory, itemId });
            debouncedAnswerUpdate(question.id, { categories });
          }, 0);
        }
        
        return updated;
      });
    };

    const handleDragBack = (e) => {
      e.preventDefault();
      const itemId = e.dataTransfer.getData('text/plain');
      
      setCategorizeItems(prevItems => {
        const updated = prevItems.map(item => 
          item.id === itemId ? { ...item, category: null } : item
        );
        
        // Only update answer if onAnswerChange is provided (interactive mode)
        if (onAnswerChange && typeof onAnswerChange === 'function') {
          setTimeout(() => {
            const categories = computeCategoriesFromItems(updated);
            console.log('QuestionPreview: Categorize answer update (drag back):', { categories, itemId });
            debouncedAnswerUpdate(question.id, { categories });
          }, 0);
        }
        
        return updated;
      });
    };

    return (
      <div className="space-y-6">
        {/* Interactive Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {question.categories?.map((category, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-4 min-h-[120px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, category)}
            >
              <h4 className="font-medium text-gray-900 mb-3 text-center">{category}</h4>
              <div className="space-y-2">
                {getItemsInCategory(category).map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm cursor-move hover:shadow-sm transition-shadow"
                  >
                    {item.content}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Unassigned Items */}
        {getUnassignedItems().length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Unassigned Items</h4>
            <div 
              className="grid grid-cols-2 sm:grid-cols-3 gap-2"
              onDragOver={handleDragOver}
              onDrop={handleDragBack}
            >
              {getUnassignedItems().map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm cursor-move hover:shadow-sm transition-shadow text-center"
                >
                  {item.content}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderClozeQuestion = () => {
    console.log('QuestionPreview: Rendering cloze question');
    console.log('QuestionPreview: Current cloze answers:', clozeAnswers);
    
    const handleAnswerChange = (index, value) => {
      console.log('QuestionPreview: Answer changed for index', index, 'to value:', value);
      const updated = { ...clozeAnswers, [index]: value };
      setClozeAnswers(updated);
      
      // Convert to array format expected by backend
      const answersArray = Object.values(updated);
      console.log('QuestionPreview: Sending answers array:', answersArray);
      debouncedAnswerUpdate(question.id, { answers: answersArray });
    };

    // Handle both old format (with word/position) and new format (with [blank] placeholders)
    const sentence = question.sentence || '';
    
    console.log('QuestionPreview: Sentence:', sentence);
    console.log('QuestionPreview: Contains [blank]:', sentence.includes('[blank]'));
    
    // Check if sentence contains [blank] placeholders
    if (sentence.includes('[blank]')) {
      const parts = sentence.split('[blank]');
      console.log('QuestionPreview: Split parts:', parts);
      
      return (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            {parts.map((part, index, array) => (
              <Fragment key={index}>
                {part}
                {index < array.length - 1 && (
                  <input
                    type="text"
                    value={clozeAnswers[index] || ''}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    className="mx-2 px-3 py-1 border-b-2 border-indigo-500 focus:outline-none focus:border-indigo-700 text-center min-w-[100px] relative z-10"
                    placeholder="Answer"
                    style={{ pointerEvents: 'auto' }}
                    onFocus={() => console.log('Input focused:', index)}
                    onBlur={() => console.log('Input blurred:', index)}
                  />
                )}
              </Fragment>
            ))}
          </p>
        </div>
      );
    } else {
      // Handle old format or fallback
      console.log('QuestionPreview: Using fallback ___ split');
      return (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            {sentence.split('___').map((part, index, array) => (
              <Fragment key={index}>
                {part}
                {index < array.length - 1 && (
                  <input
                    type="text"
                    value={clozeAnswers[index] || ''}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    className="mx-2 px-3 py-1 border-b-2 border-indigo-500 focus:outline-none focus:border-indigo-700 text-center min-w-[100px] relative z-10"
                    placeholder="Answer"
                    style={{ pointerEvents: 'auto' }}
                    onFocus={() => console.log('Fallback input focused:', index)}
                    onBlur={() => console.log('Fallback input blurred:', index)}
                  />
                )}
              </Fragment>
            ))}
          </p>
        </div>
      );
    }
  };

  const renderComprehensionQuestion = () => {
    const handleAnswerChange = (index, value) => {
      const updated = { ...comprehensionAnswers, [index]: value };
      setComprehensionAnswers(updated);
      
      // Convert to array format expected by backend
      const answersArray = Object.values(updated);
      debouncedAnswerUpdate(question.id, { answers: answersArray });
    };

    return (
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700 leading-relaxed">{question.passage}</p>
        </div>
        
        <div className="space-y-4">
          {question.questions?.map((subQ, index) => (
            <div key={subQ.id} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">
                {index + 1}. {subQ.question}
              </h4>
              <div className="space-y-2">
                {subQ.options?.map((option, optIndex) => (
                  <label key={optIndex} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name={`comprehension-${question.id}-${index}`}
                      value={optIndex}
                      checked={comprehensionAnswers[index] === optIndex}
                      onChange={() => handleAnswerChange(index, optIndex)}
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
        return <p className="text-gray-500">Unsupported question type</p>;
    }
  };

  return (
    <div className="space-y-4">
      {renderQuestion()}
    </div>
  );
};

export default QuestionPreview;