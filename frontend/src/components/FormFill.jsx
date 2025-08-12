import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, LogIn } from 'lucide-react';
import QuestionPreview from './QuestionPreview';
import { api } from '../services/api';
import { useToast } from './Toast';
import { useAuth } from '../context/AuthContext';
import { AnimatedSpinner } from './AnimatedComponents';

const FormFill = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { success, error } = useToast();
  const [form, setForm] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const loadForm = useCallback(async () => {
    setLoading(true);
    try {
      let data;
      try {
        data = await api.getPublishedForm(formId);
      } catch (err) {
        if (user) {
          data = await api.getForm(formId);
        } else {
          throw err;
        }
      }
      const normalized = {
        id: data._id,
        title: data.title,
        description: data.description,
        headerImage: data.headerImage,
        questions: (data.questions || []).map(q => ({
          id: q.id,
          type: q.type,
          title: q.title,
          categories: q.categories,
          items: q.items,
          itemAssignments: q.itemAssignments,
          sentence: q.sentence,
          blanks: q.blanks,
          passage: q.passage,
          questions: q.questions,
        })),
      };
      
      console.log('FormFill: Loaded form data:', normalized);
      console.log('FormFill: Categorize questions:', normalized.questions.filter(q => q.type === 'categorize'));
      
      setForm(normalized);
    } catch (e) {
      console.error('Failed to load form', e);
      error('Form not accessible', 'This form is either not published or you do not have permission to access it.');
    } finally {
      setLoading(false);
    }
  }, [formId, user, error]);

  useEffect(() => {
    loadForm();
  }, [loadForm]);

  // Handle answer changes from QuestionPreview
  const handleAnswerChange = React.useCallback((questionId, answer) => {
    console.log('FormFill: handleAnswerChange called with:', { questionId, answer });
    setResponses(prev => {
      const prevAnswer = prev[questionId];
      const isSame = JSON.stringify(prevAnswer) === JSON.stringify(answer);
      console.log('FormFill: Previous answer:', prevAnswer);
      console.log('FormFill: New answer:', answer);
      console.log('FormFill: Is same?', isSame);
      if (isSame) return prev;
      const newResponses = { ...prev, [questionId]: answer };
      console.log('FormFill: Updated responses:', newResponses);
      return newResponses;
    });
  }, []);

  const handleNext = () => {
    if (currentQuestionIndex < form.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      error('Authentication required', 'Please log in to submit this form.');
      return;
    }

    // Validate that all questions have answers
    const unansweredQuestions = form.questions.filter(q => {
      const answer = responses[q.id];
      if (!answer) return true;
      
      if (q.type === 'categorize') {
        return !answer.categories || Object.keys(answer.categories).length === 0;
      } else if (q.type === 'cloze') {
        return !answer.answers || answer.answers.length === 0 || answer.answers.some(a => !a || a.trim() === '');
      } else if (q.type === 'comprehension') {
        return !answer.answers || answer.answers.length === 0 || answer.answers.some(a => a === null || a === undefined);
      }
      return false;
    });

    if (unansweredQuestions.length > 0) {
      error('Incomplete Form', `Please answer all questions before submitting. You have ${unansweredQuestions.length} unanswered question(s).`);
      return;
    }

    setSubmitting(true);
    
    // Format answers properly for different question types
    const formattedAnswers = {};
    
    Object.keys(responses).forEach(questionId => {
      const question = form.questions.find(q => q.id === questionId);
      if (!question) return;
      
      const answer = responses[questionId];
      
      switch (question.type) {
        case 'categorize':
          console.log('FormFill: Formatting categorize answer:', answer);
          formattedAnswers[questionId] = {
            categories: answer.categories || {}
          };
          console.log('FormFill: Formatted categorize answer:', formattedAnswers[questionId]);
          break;
        case 'cloze':
          formattedAnswers[questionId] = {
            answers: Array.isArray(answer.answers) ? answer.answers : [answer.answers]
          };
          break;
        case 'comprehension':
          formattedAnswers[questionId] = {
            answers: Array.isArray(answer.answers) ? answer.answers : [answer.answers]
          };
          break;
        default:
          formattedAnswers[questionId] = answer;
      }
    });
    
    const responseData = {
      formId: formId,
      answers: formattedAnswers,
      metadata: {
        userAgent: navigator.userAgent,
        submittedAt: new Date().toISOString()
      }
    };
    
    try {
      console.log('Submitting form with answers:', formattedAnswers);
      console.log('Raw responses before formatting:', responses);
      console.log('Form questions:', form.questions);
      
      // Debug: Log category question details
      form.questions.forEach((q, index) => {
        if (q.type === 'categorize') {
          console.log(`Category Question ${index + 1}:`, {
            questionId: q.id,
            categories: q.categories,
            items: q.items,
            itemAssignments: q.itemAssignments,
            userAnswer: responses[q.id]
          });
        }
      });
      
      const result = await api.createResponse(responseData);
      console.log('Response submitted successfully:', result);
      success('Response submitted', `Thank you! Your response has been successfully submitted. Score: ${result.scorePercentage}%`);
      setSubmitted(true);
      setShowSuccess(true);
      setTimeout(() => {
        navigate(`/view/${formId}/${result._id}`);
      }, 2000);
      
    } catch (e) {
      console.error('Failed to submit response', e);
      error('Submission failed', 'Failed to submit your response. Please try again.');
    }
    
    setSubmitting(false);
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </motion.div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <LogIn className="w-8 h-8 text-indigo-600" />
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-gray-800 mb-2">Login Required</motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-gray-600 mb-6">You need to be logged in to fill out this form. Please sign in to continue.</motion.p>
            <div className="space-y-3">
              <button onClick={() => navigate('/login')} className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200">Sign In</button>
              <button onClick={() => navigate('/register')} className="w-full px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors duration-200">Create Account</button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">Your responses have been submitted successfully.</p>
          <button onClick={() => navigate(user?.role === 'admin' ? '/dashboard' : '/user-dashboard')} className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200">Return to Dashboard</button>
        </motion.div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Form not found</h2>
      </div>
    );
  }

  const currentQuestion = form.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {form.title || 'Loading...'}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {form.description || 'Please wait while we load the form...'}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(user?.role === 'admin' ? '/dashboard' : '/user-dashboard')}
                className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Return to Dashboard</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <AnimatedSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Progress Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm sm:text-base font-medium text-gray-700">
                  Question {currentQuestionIndex + 1} of {form.questions.length}
                </span>
                <span className="text-sm sm:text-base text-gray-500">
                  {Math.round(((currentQuestionIndex + 1) / form.questions.length) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                <motion.div
                  className="bg-indigo-600 h-2 sm:h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentQuestionIndex + 1) / form.questions.length) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </motion.div>

            {/* Question Navigation Dots */}
            {form.questions.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center mb-6 sm:mb-8"
              >
                <div className="flex space-x-2">
                  {form.questions.map((_, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                        index === currentQuestionIndex
                          ? 'bg-indigo-600'
                          : index < currentQuestionIndex
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Current Question */}
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8"
            >
              <div className="mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                  {currentQuestion.title || `Question ${currentQuestionIndex + 1}`}
                </h2>
                
                {console.log('FormFill: Rendering question:', currentQuestion)}
                {console.log('FormFill: Current responses:', responses)}
                {console.log('FormFill: Current question response:', responses[currentQuestion.id])}
                
                <QuestionPreview
                  question={currentQuestion}
                  onAnswerChange={handleAnswerChange}
                  userAnswer={responses[currentQuestion.id]}
                />
              </div>
            </motion.div>

            {/* Navigation Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row justify-between gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  currentQuestionIndex === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Previous</span>
              </motion.button>

              <div className="flex flex-col sm:flex-row gap-3">
                {currentQuestionIndex < form.questions.length - 1 ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200"
                  >
                    <span>Next</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <AnimatedSpinner size="sm" color="white" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Submit Form</span>
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default FormFill;