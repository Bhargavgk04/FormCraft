import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, X } from 'lucide-react';
import { animations, easing } from '../utils/animations';
import { AnimatedButton, AnimatedSpinner } from './AnimatedComponents';
import { api } from '../services/api';

const EditResponse = () => {
  const { formId, responseId } = useParams();
  const navigate = useNavigate();
  const [response, setResponse] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadResponseAndForm();
  }, [formId, responseId]);

  const loadResponseAndForm = async () => {
    try {
      setLoading(true);
      // For now, we'll create a mock response since we don't have a getResponse endpoint
      // In a real app, you'd fetch the response from the backend
      const formData = await api.getForm(formId);
      setForm(formData);
      
      // Mock response data - in real app, fetch from api.getResponse(responseId)
      const mockResponse = {
        id: responseId,
        respondentName: 'Sample User',
        respondentEmail: 'user@example.com',
        submittedAt: new Date().toISOString(),
        timeSpent: 120,
        score: 85,
        submittedBy: 'user',
        answers: {}
      };
      
      setResponse(mockResponse);
      setFormData({
        respondentName: mockResponse.respondentName,
        respondentEmail: mockResponse.respondentEmail,
        score: mockResponse.score,
        timeSpent: mockResponse.timeSpent
      });
    } catch (error) {
      console.error('Failed to load response and form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // In a real app, you'd call api.updateResponse(responseId, formData)
      console.log('Updating response with:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate back to form responses
      navigate(`/responses/${formId}`);
    } catch (error) {
      console.error('Failed to update response:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <AnimatedSpinner size="lg" />
      </div>
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
            to={`/responses/${formId}`}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <motion.div
              whileHover={{ x: -3 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.div>
            <span>Back to Form Responses</span>
          </Link>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-2xl font-bold text-gray-900"
        >
          Edit Response
        </motion.h1>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Info */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {form?.title || 'Form'}
            </h3>
            <p className="text-sm text-gray-600">
              Response ID: {responseId}
            </p>
          </div>

          {/* Respondent Name */}
          <div>
            <label htmlFor="respondentName" className="block text-sm font-medium text-gray-700 mb-2">
              Respondent Name
            </label>
            <input
              type="text"
              id="respondentName"
              value={formData.respondentName || ''}
              onChange={(e) => handleInputChange('respondentName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Respondent Email */}
          <div>
            <label htmlFor="respondentEmail" className="block text-sm font-medium text-gray-700 mb-2">
              Respondent Email
            </label>
            <input
              type="email"
              id="respondentEmail"
              value={formData.respondentEmail || ''}
              onChange={(e) => handleInputChange('respondentEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Score */}
          <div>
            <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-2">
              Score (%)
            </label>
            <input
              type="number"
              id="score"
              min="0"
              max="100"
              value={formData.score || ''}
              onChange={(e) => handleInputChange('score', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Time Spent */}
          <div>
            <label htmlFor="timeSpent" className="block text-sm font-medium text-gray-700 mb-2">
              Time Spent (seconds)
            </label>
            <input
              type="number"
              id="timeSpent"
              min="0"
              value={formData.timeSpent || ''}
              onChange={(e) => handleInputChange('timeSpent', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Submitted By (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Submitted By
            </label>
            <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                response?.submittedBy === 'admin' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {response?.submittedBy === 'admin' ? 'Admin' : 'User'}
              </span>
            </div>
          </div>

          {/* Submitted At (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Submitted At
            </label>
            <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-900">
              {response?.submittedAt ? new Date(response.submittedAt).toLocaleString() : 'N/A'}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link
              to={`/responses/${formId}`}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </Link>
            
            <AnimatedButton
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 rounded-lg flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {saving ? (
                <AnimatedSpinner size="sm" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </AnimatedButton>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditResponse;
