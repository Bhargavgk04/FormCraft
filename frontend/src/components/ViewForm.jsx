import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, Eye, Clock, User, Award } from 'lucide-react';
import { api } from '../services/api';
import { animations } from '../utils/animations';
import { useAuth } from '../context/AuthContext';

const ViewForm = () => {
  const { formId, responseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('Loading response data for:', { formId, responseId });
        
        // Load response data (which includes populated form data)
        const responseData = await api.getResponseById(formId, responseId);
        console.log('Response data loaded:', responseData);
        console.log('Response formId field:', responseData.formId);
        console.log('Response formId type:', typeof responseData.formId);
        console.log('Response formId has title:', responseData.formId?.title);
        
        // The response includes populated form data
        // Check if formId is populated with form data or just an ID
        if (responseData.formId && typeof responseData.formId === 'object' && responseData.formId.title) {
          // formId is populated with form data
          console.log('Using populated form data from response');
          setForm(responseData.formId);
        } else {
          // formId is just an ID, we need to load the form separately
          console.log('Loading form data separately');
          const formData = await api.getForm(formId);
          console.log('Form data loaded separately:', formData);
          setForm(formData);
        }
        setResponse(responseData);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError(err.message || 'Failed to load response data');
      } finally {
        setLoading(false);
      }
    };
    
    if (formId && responseId) {
      loadData();
    }
  }, [formId, responseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading response...</p>
        </div>
      </div>
    );
  }

  if (error || !form || !response) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Response Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The response you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const getBackLink = () => {
    if (user?.role === 'admin') {
      return `/responses/${formId}`;
    } else {
      return `/user-dashboard`;
    }
  };

  const renderQuestion = (question, index) => {
    const userAnswer = response.answers?.[question.id];
    
    return (
      <motion.div
        key={question.id}
        variants={animations.card}
        className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Q{index + 1}. {question.title}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <Award className="w-4 h-4 mr-1" />
                {question.points || 1} point{question.points !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Question Content */}
        {question.type === 'categorize' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {question.categories?.map((category, catIndex) => (
                <div key={catIndex} className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3">{category}</h4>
                  <div className="space-y-2">
                    {question.items?.map((item, itemIndex) => {
                      const isUserSelected = userAnswer?.categories?.[category]?.includes(item);
                      const correctCategoryIndex = question.itemAssignments?.[itemIndex];
                      const isCorrectCategory = correctCategoryIndex === catIndex;
                      const isCorrect = isUserSelected && isCorrectCategory;
                      const shouldBeHereButNotPlaced = !isUserSelected && isCorrectCategory;
                      
                      return (
                        <div
                          key={itemIndex}
                          className={`p-3 rounded-lg border-2 ${
                            isUserSelected
                              ? isCorrect
                                ? 'bg-green-50 border-green-300 text-green-800'
                                : 'bg-red-50 border-red-300 text-red-800'
                              : shouldBeHereButNotPlaced
                              ? 'bg-yellow-50 border-yellow-300 text-yellow-800'
                              : 'bg-gray-50 border-gray-200 text-gray-600'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{item}</span>
                            {isUserSelected && (
                              isCorrect ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-600" />
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Correct Answers section */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-3">Correct Answers</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {question.categories?.map((category, catIndex) => (
                  <div key={category} className="space-y-2">
                    <h5 className="font-medium text-green-700 text-sm">{category}</h5>
                    <div className="flex flex-wrap gap-2">
                      {question.items?.map((item, itemIndex) => {
                        const shouldBeInThisCategory = question.itemAssignments?.[itemIndex] === catIndex;
                        if (!shouldBeInThisCategory) return null;
                        return (
                          <span
                            key={`${category}-${item}`}
                            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md border border-green-300"
                          >
                            {item}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {question.type === 'cloze' && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-gray-700 leading-relaxed">
                {question.sentence?.split('[blank]').map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span className={`inline-flex items-center px-3 py-1 mx-2 rounded border-2 text-sm font-medium ${
                        (userAnswer?.answers?.[i] || '').toString().trim() === (question.blanks?.[i]?.answer || '').toString().trim()
                          ? 'bg-green-100 text-green-800 border-green-400'
                          : 'bg-red-100 text-red-800 border-red-400'
                      }`}>
                        {userAnswer?.answers?.[i] || '_____'}
                        {userAnswer?.answers?.[i] && (
                          (userAnswer.answers[i] || '').toString().trim() === (question.blanks?.[i]?.answer || '').toString().trim()
                            ? <CheckCircle className="w-4 h-4 ml-1" />
                            : <XCircle className="w-4 h-4 ml-1" />
                        )}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Correct Answers section */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-3">Correct Answers</h4>
              <div className="flex flex-wrap gap-2">
                {question.blanks?.map((blank, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-md border border-green-300 font-medium"
                  >
                    Blank {index + 1}: {blank.answer}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {question.type === 'comprehension' && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">{question.passage}</p>
            </div>
            
            <div className="space-y-3">
              {question.questions?.map((subQ, subIndex) => {
                const userSelected = userAnswer?.answers?.[subIndex];
                const correctAnswer = subQ.correctAnswer;
                const correctOptionIndex = correctAnswer + 1; // Convert to 1-based index
                
                return (
                  <div key={subIndex} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-3">
                      Q{subIndex + 1}. {subQ.question}
                    </h4>
                    <div className="space-y-2">
                      {subQ.options?.map((option, optIndex) => {
                        const optionNumber = optIndex + 1;
                        const isUserChoice = userSelected === optionNumber;
                        const isCorrect = optionNumber === correctOptionIndex;
                        
                        return (
                          <div
                            key={optIndex}
                            className={`p-3 rounded-lg border-2 ${
                              isCorrect
                                ? 'bg-green-50 border-green-300 text-green-800'
                                : isUserChoice
                                ? 'bg-red-50 border-red-300 text-red-800'
                                : 'bg-gray-50 border-gray-200 text-gray-600'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{option}</span>
                              {isUserChoice && (
                                isCorrect ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-red-600" />
                                )
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Correct Answers section */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-3">Correct Answers</h4>
              <div className="space-y-2">
                {question.questions?.map((subQ, subIndex) => {
                  const correctAnswer = subQ.correctAnswer;
                  const correctOptionIndex = correctAnswer + 1; // Convert to 1-based index
                  const correctOption = subQ.options?.[correctAnswer];
                  
                  return (
                    <div key={subIndex} className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-green-700">Q{subIndex + 1}:</span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-md border border-green-300">
                        {correctOption}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link 
              to={getBackLink()} 
              className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to {user?.role === 'admin' ? 'Responses' : 'Dashboard'}
            </Link>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800">{form.title}</div>
              <div className="text-gray-600">{form.description}</div>
            </div>
          </div>

          {/* Response Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{response.scorePercentage}%</div>
                <div className="text-sm text-gray-600">Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{response.score || 0}</div>
                <div className="text-sm text-gray-600">Points Earned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{response.maxScore || 0}</div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{form.questions?.length || 0}</div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  <span>{response.respondentName}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{new Date(response.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Questions */}
        <motion.div
          variants={animations.container}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {form.questions?.map((question, index) => renderQuestion(question, index))}
        </motion.div>
      </div>
    </div>
  );
};

export default ViewForm;


