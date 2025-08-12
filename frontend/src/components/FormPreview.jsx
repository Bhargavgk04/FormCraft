import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import QuestionPreview from './QuestionPreview';
import { animations, easing } from '../utils/animations';
import { AnimatedSpinner } from './AnimatedComponents';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const FormPreview = () => {
  const { formId } = useParams();
  const { user } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForm();
  }, [formId]);

  const loadForm = async () => {
    setLoading(true);
    
    try {
      const data = await api.getForm(formId);
      // Normalize for preview shape
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
    } catch (error) {
      console.error('Failed to load form for preview:', error);
      // Fallback to mock data if API fails
      const mockForm = {
        id: formId,
        title: 'Sample Educational Assessment',
        description: 'This form demonstrates all three question types with interactive previews',
        headerImage: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1200',
        questions: [
          {
            id: '1',
            type: 'categorize',
            title: 'Classify these programming languages by their primary use',
            categories: ['Web Development', 'Data Science', 'Mobile Development'],
            items: ['JavaScript', 'Python', 'Swift', 'React', 'TensorFlow', 'Kotlin'],
            image: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=800'
          },
          {
            id: '2',
            type: 'cloze',
            title: 'Complete the sentence about web development',
            sentence: 'React is a _____ library for building _____ interfaces, developed by _____.',
            blanks: [
              { id: 1, answer: 'JavaScript', options: ['JavaScript', 'Python', 'Java'] },
              { id: 2, answer: 'user', options: ['user', 'server', 'database'] },
              { id: 3, answer: 'Facebook', options: ['Facebook', 'Google', 'Microsoft'] }
            ],
            image: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800'
          },
          {
            id: '3',
            type: 'comprehension',
            title: 'Read the passage and answer the questions',
            passage: 'Artificial Intelligence (AI) has revolutionized many industries, from healthcare to finance. Machine learning, a subset of AI, enables computers to learn and improve from experience without being explicitly programmed. Deep learning, which uses neural networks with multiple layers, has been particularly successful in tasks like image recognition and natural language processing. As AI continues to advance, it promises to transform how we work, communicate, and solve complex problems.',
            questions: [
              {
                id: 1,
                question: 'What is machine learning?',
                options: ['A type of computer hardware', 'A subset of AI that learns from experience', 'A programming language', 'A database system'],
                correctAnswer: 1
              },
              {
                id: 2,
                question: 'Which tasks has deep learning been successful in?',
                options: ['Only image recognition', 'Only natural language processing', 'Both image recognition and natural language processing', 'Neither of these tasks'],
                correctAnswer: 2
              }
            ],
            image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800'
          }
        ]
      };
      setForm(mockForm);
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

  if (!form) {
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
          Form not found
        </motion.h2>
        <Link
          to={user?.role === 'admin' ? '/dashboard' : '/user-dashboard'}
          className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
        >
          ← Back to Dashboard
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easing.easeOut }}
        className="mb-6 flex items-center justify-between"
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Link
          to={user?.role === 'admin' ? '/dashboard' : '/user-dashboard'}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <motion.div
              whileHover={{ x: -3 }}
              transition={{ duration: 0.2 }}
        >
          <ArrowLeft className="w-5 h-5" />
            </motion.div>
          <span>Back to Dashboard</span>
        </Link>
        </motion.div>

        <motion.div 
          className="flex items-center space-x-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <span className="text-sm text-gray-500">Preview Mode</span>
          <Link
            to={`/fill/${form.id}`}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
          >
            <ExternalLink className="w-4 h-4" />
            </motion.div>
            <span>Live Form</span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Form Preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header Image */}
        {form.headerImage && (
          <div className="h-64 relative overflow-hidden">
            <img
              src={form.headerImage}
              alt="Form header"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-4xl font-bold mb-2"
              >
                {form.title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-xl text-gray-100"
              >
                {form.description}
              </motion.p>
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="p-8">
          {!form.headerImage && (
            <div className="mb-8">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold text-gray-800 mb-4"
              >
                {form.title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-gray-600"
              >
                {form.description}
              </motion.p>
            </div>
          )}

          {/* Questions */}
          <motion.div 
            className="space-y-12"
            variants={animations.container}
            initial="hidden"
            animate="visible"
          >
            {form.questions.map((question, index) => (
              <motion.div
                key={question.id}
                variants={animations.card}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <QuestionPreview
                  question={question}
                  questionNumber={index + 1}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Form Footer */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-12 pt-8 border-t border-gray-200 text-center"
          >
            <motion.p 
              className="text-gray-500 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.4 }}
            >
              This is a preview of your form. Ready to share it?
            </motion.p>
            <Link
              to={`/fill/${form.id}`}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
            >
              <ExternalLink className="w-5 h-5" />
              </motion.div>
              <span>Open Live Form</span>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default FormPreview;