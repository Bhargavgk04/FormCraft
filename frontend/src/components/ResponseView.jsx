import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  CheckCircle,
  Clock,
  Users,
  Calendar,
  X
} from 'lucide-react';
import { animations, easing } from '../utils/animations';
import { AnimatedSpinner } from './AnimatedComponents';
import { api } from '../services/api';

const ResponseView = () => {
  const { formId, responseId } = useParams();
  const [form, setForm] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFormAndResponse();
  }, [formId, responseId]);

  const loadFormAndResponse = async () => {
    setLoading(true);
    try {
      const resp = await api.getResponseById(formId, responseId);
      // Normalize data for view
      const normalizedForm = {
        id: resp.formId?._id || formId,
        title: resp.formId?.title || 'Form',
        description: resp.formId?.description || '',
        headerImage: resp.formId?.headerImage || '',
        questions: resp.formId?.questions || []
      };
      const normalizedResponse = {
        id: resp._id || responseId,
        respondentName: resp.respondentId?.name || 'Anonymous',
        respondentEmail: resp.respondentId?.email || 'No email',
        submittedAt: resp.submittedAt,
        timeSpent: resp.timeSpent || 0,
        scorePercentage: resp.scorePercentage,
        answers: resp.answers || {},
        metadata: resp.metadata || {}
      };
      setForm(normalizedForm);
      setResponse(normalizedResponse);
    } catch (e) {
      setForm(null);
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatedSpinner size="lg" />
        </motion.div>
      </div>
    );
  }

  if (!form || !response) {
    return (
      <motion.div 
        className="text-center py-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2 
          className="text-2xl font-bold text-gray-800 mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Response not found
        </motion.h2>
        <Link
          to="/"
          className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
        >
          ← Back to Dashboard
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easing.easeOut }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Link
              to={`/responses/${formId}`}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <motion.div
                whileHover={{ x: -3 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.div>
              <span>Back to Responses</span>
            </Link>
          </motion.div>

          <motion.div 
            className="flex items-center space-x-4 text-sm text-gray-500"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{response.respondentName}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{response.respondentEmail}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{response.timeSpent}s</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Score: {typeof response.scorePercentage === 'number' ? `${response.scorePercentage}%` : '—'}
              </span>
            </div>
          </motion.div>
        </div>

        <motion.h1 
          className="text-3xl font-bold text-gray-800 mb-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {form.title}
        </motion.h1>
        <motion.p 
          className="text-gray-600 text-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {form.description}
        </motion.p>
      </motion.div>

      {/* Header Image */}
      {form.headerImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mb-8"
        >
          <img
            src={form.headerImage}
            alt="Form Header"
            className="w-full h-64 object-cover rounded-xl shadow-lg"
          />
        </motion.div>
      )}

      {/* Questions */}
      <motion.div
        variants={animations.container}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <AnimatePresence mode="popLayout">
          {form.questions.map((question, index) => {
            const answer = response.answers[question.id];
            return (
              <motion.div
                key={question.id}
                variants={animations.card}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="mb-6">
                  <motion.h2 
                    className="text-xl font-semibold text-gray-800 mb-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                  >
                    Question {index + 1}
                  </motion.h2>
                  <motion.p 
                    className="text-gray-700 text-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.1, duration: 0.4 }}
                  >
                    {question.title}
                  </motion.p>
                </div>

                {/* Categorize Question */}
                {question.type === 'categorize' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.4 }}
                    className="space-y-4"
                  >
                    {/* Debug info - remove this in production */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
                        <strong>Debug:</strong> Answer data: {JSON.stringify(answer?.categories)}
                        <br />
                        <strong>Correct answers (itemAssignments):</strong> {JSON.stringify(question.itemAssignments)}
                        <br />
                        <strong>Items:</strong> {JSON.stringify(question.items)}
                        <br />
                        <strong>Categories:</strong> {JSON.stringify(question.categories)}
                        <br />
                        <strong>Question ID:</strong> {question.id}
                        <br />
                        <strong>Question Type:</strong> {question.type}
                      </div>
                    )}
                    
                    {/* Show correct answers first */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-800 mb-3 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Correct Answers
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {question.categories.map((category, categoryIndex) => (
                          <div key={category} className="space-y-2">
                            <h5 className="font-medium text-green-700 text-sm">{category}</h5>
                            <div className="flex flex-wrap gap-2">
                              {question.items.map((item, itemIndex) => {
                                // Check if this item should be in this category based on itemAssignments
                                const shouldBeInCategory = question.itemAssignments?.[itemIndex] === categoryIndex;
                                
                                if (shouldBeInCategory) {
                            return (
                                    <span
                                key={item}
                                      className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md border border-green-300"
                                    >
                                      {item}
                                    </span>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                                </div>
                    
                    {/* Show user's answers */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Your Answers
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {question.categories.map((category, categoryIndex) => (
                          <div key={category} className="space-y-2">
                            <h5 className="font-medium text-blue-700 text-sm">{category}</h5>
                            <div className="flex flex-wrap gap-2">
                              {question.items.map((item, itemIndex) => {
                                // Check if this item is categorized under this category by user
                                const categoryItems = answer?.categories?.[category] || [];
                                const isSelected = Array.isArray(categoryItems) ? categoryItems.includes(item) : false;
                                
                                // Check if this is the correct category for this item
                                const isCorrectCategory = question.itemAssignments?.[itemIndex] === categoryIndex;
                                
                                let itemClass = "px-2 py-1 text-xs rounded-md border";
                                let icon = null;
                                
                                if (isSelected && isCorrectCategory) {
                                  // Correctly placed
                                  itemClass += " bg-green-100 text-green-800 border-green-300";
                                  icon = <CheckCircle className="w-3 h-3 ml-1" />;
                                } else if (isSelected && !isCorrectCategory) {
                                  // Incorrectly placed
                                  itemClass += " bg-red-100 text-red-800 border-red-300";
                                  icon = <X className="w-3 h-3 ml-1" />;
                                } else if (!isSelected && isCorrectCategory) {
                                  // Should be here but wasn't placed
                                  itemClass += " bg-yellow-100 text-yellow-800 border-yellow-300";
                                  icon = <Clock className="w-3 h-3 ml-1" />;
                                } else {
                                  // Not placed and not supposed to be here
                                  itemClass += " bg-gray-100 text-gray-600 border-gray-300";
                                }
                                
                                return (
                                  <span key={item} className={itemClass}>
                                    {item}
                                    {icon}
                                  </span>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                      </div>
                    </div>
                    
                    {/* Legend */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <h5 className="font-medium text-gray-700 text-sm mb-2">Legend:</h5>
                      <div className="flex flex-wrap gap-4 text-xs">
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-2"></span>
                          <span className="text-green-700">Correctly placed</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-red-100 border border-red-300 rounded mr-2"></span>
                          <span className="text-red-700">Incorrectly placed</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded mr-2"></span>
                          <span className="text-yellow-700">Should be here</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-gray-100 border border-gray-300 rounded mr-2"></span>
                          <span className="text-gray-600">Not placed</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Cloze Question */}
                {question.type === 'cloze' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.4 }}
                    className="space-y-4"
                  >
                    <div className="text-gray-700 leading-relaxed text-lg">
                      {question.sentence.split('[blank]').map((part, partIndex) => (
                        <span key={partIndex}>
                          {part}
                          {partIndex < question.blanks.length && (
                            <span className="inline-block mx-2">
                              <motion.span 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.3 }}
                                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-lg border-2 border-blue-300 font-medium"
                              >
                                {answer?.answers?.[partIndex] || '_____'}
                                {answer?.answers?.[partIndex] && (
                                  <CheckCircle className="w-3 h-3 ml-1" />
                                )}
                              </motion.span>
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 font-medium mb-2">Available Options:</p>
                      <div className="flex flex-wrap gap-2">
                        {question.blanks.map((blank, blankIndex) => (
                          <div key={blankIndex} className="space-y-1">
                            <p className="text-xs text-gray-500">Blank {blankIndex + 1}:</p>
                            <div className="flex flex-wrap gap-1">
                              {blank.options.map((option) => (
                                <span
                                  key={option}
                                  className={`text-xs px-2 py-1 rounded ${
                                    answer?.answers?.[blankIndex] === option
                                      ? 'bg-green-100 text-green-800 font-medium'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {option}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Comprehension Question */}
                {question.type === 'comprehension' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.4 }}
                    className="space-y-4"
                  >
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-800 mb-2">Passage:</h3>
                      <p className="text-gray-700 text-sm leading-relaxed">{question.passage}</p>
                    </div>
                    <div className="space-y-3">
                      {question.questions.map((subQuestion, subIndex) => (
                        <div key={subIndex} className="border border-gray-200 rounded-lg p-4">
                          <h3 className="font-medium text-gray-800 mb-3">
                            {subQuestion.question}
                          </h3>
                          <div className="space-y-2">
                            {subQuestion.options.map((option, optionIndex) => {
                              const isSelected = answer?.answers?.[subIndex] === optionIndex + 1;
                              return (
                                <motion.div
                                  key={optionIndex}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.1 + optionIndex * 0.05, duration: 0.2 }}
                                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                                    isSelected
                                      ? 'border-purple-500 bg-purple-50 text-purple-800 shadow-md'
                                      : 'border-gray-200 bg-gray-50 text-gray-600'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm">{option}</span>
                                    {isSelected && (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2, duration: 0.2 }}
                                      >
                                        <CheckCircle className="w-4 h-4 text-purple-600" />
                                      </motion.div>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Response Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.4 }}
        className="mt-8 bg-gray-50 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Response Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Name</div>
            <div className="font-semibold text-gray-800">{response.respondentName}</div>
          </div>
          <div>
            <div className="text-gray-500">Email</div>
            <div className="font-semibold text-gray-800">{response.respondentName}</div>
          </div>
          <div>
            <div className="text-gray-500">Score</div>
            <div className="font-semibold text-gray-800">{typeof response.scorePercentage === 'number' ? `${response.scorePercentage}%` : '—'}</div>
          </div>
          <div>
            <div className="text-gray-500">Time Spent</div>
            <div className="font-semibold text-gray-800">{response.timeSpent}s</div>
          </div>
          <div>
            <div className="text-gray-500">Location</div>
            <div className="font-semibold text-gray-800">{response.metadata.location}</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResponseView; 
