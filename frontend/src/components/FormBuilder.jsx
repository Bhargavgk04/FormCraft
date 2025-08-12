import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Save, Eye, GripVertical, Trash2, Type, Archive, FileText, Download, Share2, Edit } from 'lucide-react';
import QuestionEditor from './QuestionEditor';
import QuestionPreview from './QuestionPreview';
import { animations, easing } from '../utils/animations';
import { AnimatedButton, AnimatedModal, AnimatedSpinner } from './AnimatedComponents';
import { api } from '../services/api';
import { useToast } from './Toast';
import FileUpload from './FileUpload';

const FormBuilder = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { success, error, warning } = useToast();
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    headerImage: '',
    questions: []
  });
  
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showQuestionTypes, setShowQuestionTypes] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const questionTypes = [
    {
      type: 'categorize',
      icon: Archive,
      title: 'Categorize',
      description: 'Drag and drop items into categories'
    },
    {
      type: 'cloze',
      icon: Type,
      title: 'Cloze',
      description: 'Fill in the blanks in a sentence'
    },
    {
      type: 'comprehension',
      icon: FileText,
      title: 'Comprehension',
      description: 'Text passage with multiple choice questions'
    }
  ];

  useEffect(() => {
    if (formId) {
      loadForm(formId);
    }
  }, [formId]);

  const loadForm = async (id) => {
    try {
      const data = await api.getForm(id);
      console.log('FormBuilder: Received form data:', data);
      
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
      
      setForm(normalized);
    } catch (err) {
      console.error('Failed to load form:', err);
      error('Failed to load form', 'Please try again');
    }
  };

  const addQuestion = (type) => {
    const newQuestion = getDefaultQuestionData(type);
    setForm(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
    setShowQuestionTypes(false);
  };

  const getDefaultQuestionData = (type) => {
    const baseQuestion = {
      id: Date.now().toString(),
      title: '',
      type,
      points: 1
    };

    switch (type) {
      case 'categorize':
        return {
          ...baseQuestion,
          categories: ['Things', 'Names'],
          items: ['Bhargav', 'Rohit', 'Books'],
          itemAssignments: {
            0: 0, // Bhargav -> Things
            1: 0, // Rohit -> Things  
            2: 1  // Books -> Names
          }
        };
      case 'cloze':
        return {
          ...baseQuestion,
          sentence: 'The quick [blank] fox jumps over the [blank] dog.',
          blanks: [
            { 
              id: Date.now().toString(), 
              answer: 'brown', 
              inputType: 'text',
              options: []
            },
            { 
              id: (Date.now() + 1).toString(), 
              answer: 'lazy', 
              inputType: 'text',
              options: []
            }
          ]
        };
      case 'comprehension':
        return {
          ...baseQuestion,
          passage: 'Read the following passage and answer the questions below.',
          questions: [
            {
              id: 1,
              question: 'What is the main idea?',
              options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
              correctAnswer: 0
            }
          ]
        };
      default:
        return baseQuestion;
    }
  };

  const updateQuestion = (questionId, updates) => {
    console.log('FormBuilder: Updating question:', questionId, updates);
    
    setForm(prev => {
      const updatedForm = {
        ...prev,
        questions: prev.questions.map(q => 
          q.id === questionId ? { ...q, ...updates } : q
        )
      };
      
      // Debug: Log categorize question updates
      if (updates.itemAssignments) {
        console.log('FormBuilder: Categorize question updated with assignments:', updates.itemAssignments);
        
        // Auto-save categorize question assignments to backend
        if (formId) {
          autoSaveForm(updatedForm);
        }
      }
      
      return updatedForm;
    });
  };

  // Auto-save function for categorize assignments
  const autoSaveForm = async (formData) => {
    try {
      console.log('FormBuilder: Auto-saving form with categorize assignments');
      const payload = {
        title: formData.title,
        description: formData.description,
        headerImage: formData.headerImage,
        questions: formData.questions
      };
      
      await api.updateForm(formId, payload);
      console.log('FormBuilder: Auto-save successful');
    } catch (err) {
      console.error('FormBuilder: Auto-save failed:', err);
    }
  };

  const deleteQuestion = (questionId) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const saveForm = async () => {
    try {
      setSaving(true);
      
      const payload = {
        title: form.title,
        description: form.description,
        headerImage: form.headerImage,
        questions: form.questions
      };

      console.log('FormBuilder: Saving form with payload:', payload);

      if (formId) {
        await api.updateForm(formId, payload);
        success('Form updated successfully', 'Your changes have been saved');
      } else {
        const result = await api.createForm(payload);
        navigate(`/builder/${result._id}`);
        success('Form created successfully', 'Your form has been saved');
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save form:', err);
      error('Failed to save form', 'Please try again');
    } finally {
      setSaving(false);
    }
  };

  const exportForm = () => {
    const dataStr = JSON.stringify(form, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${form.title || 'form'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const shareForm = () => {
    setShowShareModal(true);
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/fill/${formId || 'new'}`;
    navigator.clipboard.writeText(link);
    success('Link copied', 'Share link copied to clipboard');
  };

  const previewForm = () => {
    if (formId) {
      window.open(`/fill/${formId}`, '_blank');
    } else {
      warning('Save first', 'Please save your form before previewing');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 sm:py-6 gap-4">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Back to Dashboard</span>
              </motion.button>
              
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {formId ? 'Edit Form' : 'Create New Form'}
                </h1>
                <p className="text-sm text-gray-600 hidden sm:block">
                  Build your form with drag-and-drop questions
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={previewForm}
                className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Preview</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowShareModal(true)}
                className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportForm}
                className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={saveForm}
                disabled={saving}
                className="flex items-center space-x-2 px-4 sm:px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium"
              >
                {saving ? (
                  <AnimatedSpinner size="sm" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{saving ? 'Saving...' : 'Save Form'}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Form Details Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 order-2 lg:order-1"
          >
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 sticky top-24">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Form Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Form Title *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Enter form title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Enter form description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Header Image
                  </label>
                  <FileUpload
                    onUpload={(imageUrl) => setForm({ ...form, headerImage: imageUrl })}
                    currentImage={form.headerImage}
                    className="w-full"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Form Statistics</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-indigo-600">{form.questions.length}</div>
                      <div className="text-gray-600">Questions</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-green-600">
                        {form.questions.filter(q => q.type === 'categorize').length}
                      </div>
                      <div className="text-gray-600">Categories</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Questions Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 order-1 lg:order-2"
          >
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Questions</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {form.questions.length} question{form.questions.length !== 1 ? 's' : ''} added
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowQuestionTypes(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Question</span>
                </motion.button>
              </div>

              {form.questions.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
                  <p className="text-gray-600 mb-4">Start building your form by adding questions</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowQuestionTypes(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add First Question</span>
                  </motion.button>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {form.questions.map((question, index) => (
                    <motion.div
                      key={question.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-indigo-600">{index + 1}</span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {question.title || `Question ${index + 1}`}
                            </h3>
                            <p className="text-sm text-gray-500 capitalize">{question.type} Question</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedQuestion(question)}
                            className="p-2 text-gray-400 hover:text-indigo-600 transition-colors duration-200"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => deleteQuestion(question.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                          
                          <div className="w-6 h-6 cursor-move text-gray-400 hover:text-gray-600 transition-colors duration-200">
                            <GripVertical className="w-full h-full" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <QuestionPreview question={question} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Question Editor Modal */}
      <AnimatedModal
        isOpen={!!selectedQuestion}
        onClose={() => setSelectedQuestion(null)}
        className="p-6 max-w-7xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        {selectedQuestion && (
          <QuestionEditor
            question={selectedQuestion}
            onUpdate={(updates) => {
              updateQuestion(selectedQuestion.id, updates);
              // Don't close modal automatically - let user save manually
            }}
            onCancel={() => setSelectedQuestion(null)}
            onSave={() => setSelectedQuestion(null)}
          />
        )}
      </AnimatedModal>

      {/* Question Type Modal */}
      <AnimatedModal
        isOpen={showQuestionTypes}
        onClose={() => setShowQuestionTypes(false)}
        className="p-6"
      >
        <motion.h3 
          className="text-xl font-bold text-gray-800 mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          Choose Question Type
        </motion.h3>
              
        <div className="space-y-3">
          {questionTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <motion.button
                key={type.type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
                whileHover={{ 
                  scale: 1.02, 
                  y: -2,
                  backgroundColor: '#f0f9ff',
                  borderColor: '#6366f1'
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => addQuestion(type.type)}
                className="w-full p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 text-left"
              >
                <div className="flex items-start space-x-3">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon className="w-6 h-6 text-indigo-600 mt-1" />
                  </motion.div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {type.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {type.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </AnimatedModal>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-4 left-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span>Form saved successfully!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatedModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        className="p-6"
      >
        <motion.h3 
          className="text-xl font-bold text-gray-800 mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          Share Your Form
        </motion.h3>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="space-y-4"
        >
          <p className="text-gray-600">
            Share this link with others to let them fill out your form:
          </p>
          
          <div className="bg-gray-100 p-3 rounded-lg">
            <code className="text-sm break-all">
              {`${window.location.origin}/fill/${formId || 'new'}`}
            </code>
          </div>
          
          <div className="flex space-x-2">
            <AnimatedButton
              onClick={copyShareLink}
              className="flex-1"
            >
              Copy Link
            </AnimatedButton>
            <AnimatedButton
              onClick={() => setShowShareModal(false)}
              variant="outline"
              className="flex-1"
            >
              Close
            </AnimatedButton>
          </div>
        </motion.div>
      </AnimatedModal>
    </div>
  );
};

export default FormBuilder;