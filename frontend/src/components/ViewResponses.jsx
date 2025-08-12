import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Download, 
  BarChart3, 
  Users, 
  Calendar, 
  TrendingUp, 
  FileText,
  Eye,
  Filter,
  Search,
  X,
  CheckCircle,
  Clock
} from 'lucide-react';
import { animations, easing } from '../utils/animations';
import { AnimatedButton, AnimatedSpinner, AnimatedModal } from './AnimatedComponents';
import { api } from '../services/api';

const ViewResponses = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    loadFormAndResponses();
  }, [formId]);

  const loadFormAndResponses = async () => {
    try {
      setLoading(true);
      
      // Fetch form and responses data
      const [formData, responsesData] = await Promise.all([
        api.getForm(formId),
        api.listResponsesForForm(formId)
      ]);

      setForm(formData);
      setResponses(responsesData);
    } catch (error) {
      console.error('Failed to load form and responses:', error);
      // Set empty data on error
      setForm(null);
      setResponses([]);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Response ID',
      'User Name',
      'Email',
      'Submitted At',
      'Time Spent (seconds)',
      'Score (%)'
    ];

    const csvData = responses.map(response => {
      const row = [
        response.respondentId || response.id,
        response.respondentName || 'Anonymous',
        response.respondentEmail || 'No email',
        new Date(response.submittedAt).toLocaleString(),
        response.timeSpent || 0,
        response.score || 0
      ];

      return row;
    });

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${form.title || 'form'}_responses.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const viewResponse = (response) => {
    navigate(`/response/${formId}/${response.id}`);
  };

  const getAnalytics = () => {
    if (responses.length === 0) return null;

    const totalResponses = responses.length;
    const avgScore = responses.reduce((sum, r) => sum + (r.score || 0), 0) / totalResponses;
    const avgTimeSpent = responses.reduce((sum, r) => sum + (r.timeSpent || 0), 0) / totalResponses;
    const completionRate = responses.length > 0 ? 100 : 0; // All responses are completed

    return {
      totalResponses,
      avgScore: Math.round(avgScore * 10) / 10, // One decimal place
      avgTimeSpent: Math.round(avgTimeSpent / 60), // Convert to minutes
      completionRate
    };
  };

  const filteredResponses = responses.filter(response => {
    const matchesSearch = (response.respondentName && response.respondentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (response.respondentEmail && response.respondentEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (response.respondentId && response.respondentId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'recent' && new Date(response.submittedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)) ||
                         (filterType === 'high-score' && (response.score || 0) >= 90);
    return matchesSearch && matchesFilter;
  });

  const sortedResponses = [...filteredResponses].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.submittedAt) - new Date(b.submittedAt);
        break;
      case 'score':
        comparison = (a.score || 0) - (b.score || 0);
        break;
      case 'time':
        comparison = (a.timeSpent || 0) - (b.timeSpent || 0);
        break;
      default:
        comparison = 0;
    }
    return sortOrder === 'desc' ? -comparison : comparison;
  });

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
          to="/"
          className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
        >
          ← Back to Dashboard
        </Link>
      </motion.div>
    );
  }

  const analytics = getAnalytics();

  return (
    <div className="max-w-7xl mx-auto">
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
            to="/"
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
          <AnimatedButton
            onClick={exportToCSV}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <Download className="w-4 h-4" />
            </motion.div>
            <span>Export CSV</span>
          </AnimatedButton>
        </motion.div>
      </motion.div>

      {/* Form Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mb-8"
      >
        <motion.h1 
          className="text-3xl font-bold text-gray-800 mb-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {form.title || 'Form Responses'}
        </motion.h1>
        <motion.p 
          className="text-gray-800 text-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {form.description || 'Form responses'}
        </motion.p>
      </motion.div>

      {/* Analytics Cards */}
      {analytics && (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5, ease: easing.easeOut }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <motion.div
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <Users className="w-8 h-8 mb-2 text-blue-600" />
            </motion.div>
            <motion.h3 
              className="text-2xl font-bold text-gray-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.3 }}
            >
              {analytics.totalResponses}
            </motion.h3>
            <p className="text-gray-600">Total Responses</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5, ease: easing.easeOut }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <motion.div
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 1.0, duration: 0.5 }}
            >
              <BarChart3 className="w-8 h-8 mb-2 text-green-600" />
            </motion.div>
            <motion.h3 
              className="text-2xl font-bold text-green-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.3 }}
            >
              {analytics.avgScore}%
            </motion.h3>
            <p className="text-gray-600">Average Score</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5, ease: easing.easeOut }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <motion.div
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
            >
              <TrendingUp className="w-8 h-8 mb-2 text-purple-600" />
            </motion.div>
            <motion.h3 
              className="text-2xl font-bold text-gray-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.3 }}
            >
              {analytics.completionRate}%
            </motion.h3>
            <p className="text-gray-600">Completion Rate</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.5, ease: easing.easeOut }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <motion.div
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <Clock className="w-8 h-8 mb-2 text-orange-600" />
            </motion.div>
            <motion.h3 
              className="text-2xl font-bold text-gray-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.3 }}
            >
              {analytics.avgTimeSpent}m
            </motion.h3>
            <p className="text-gray-600">Avg. Time</p>
          </motion.div>
        </motion.div>
      )}

      {/* Recent Responses Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="mb-6"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Responses</h3>
      </motion.div>

      {/* Responses Table */}
      <motion.div
        variants={animations.container}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  USER
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  EMAIL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SUBMITTED
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SCORE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <AnimatePresence mode="popLayout">
                {sortedResponses.map((response, index) => (
                  <motion.tr
                    key={response.id}
                    variants={animations.card}
                    whileHover={{ backgroundColor: '#f8fafc', transition: { duration: 0.2 } }}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {response.respondentName || 'Anonymous'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {response.respondentEmail || 'No email'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(response.submittedAt).toLocaleDateString()} at {new Date(response.submittedAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(response.score || 0) > 0 ? (
                        <div className="text-sm text-gray-900">{response.score}%</div>
                      ) : (
                        <div className="text-red-500">—</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => viewResponse(response)}
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                        >
                          View
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => exportToCSV()}
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                        >
                          Export
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {sortedResponses.length === 0 && (
          <div className="text-center py-12">
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            </motion.div>
            <motion.h3 
              className="text-xl font-semibold text-gray-600 mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
            >
              {responses.length === 0 ? 'No responses yet' : 'No responses match your search'}
            </motion.h3>
            <motion.p 
              className="text-gray-500 mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.4 }}
            >
              {responses.length === 0 
                ? 'Share your form to start collecting responses' 
                : 'Try adjusting your search or filter criteria'
              }
            </motion.p>
            {responses.length === 0 ? (
              <Link to="/">
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.0, duration: 0.4 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-lg"
                >
                  Back to Dashboard
                </motion.button>
              </Link>
            ) : (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0, duration: 0.4 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                }}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-lg"
              >
                Clear Search
              </motion.button>
            )}
          </div>
        )}
      </motion.div>


    </div>
  );
};

export default ViewResponses; 