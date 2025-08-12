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
import CustomDropdown from './CustomDropdown';
import { useAuth } from '../context/AuthContext';

const FormResponses = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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
      // Normalize responses to match table UI
      const normalized = responsesData.map(r => ({
        id: r._id || r.id,
        respondentName: r.respondentId?.name || r.respondentName || 'Anonymous',
        respondentEmail: r.respondentId?.email || r.respondentEmail || 'No email',
        submittedBy: r.respondentId?.role === 'admin' ? 'admin' : 'user',
        submittedAt: r.submittedAt,
        timeSpent: r.timeSpent,
        score: r.score,
        maxScore: r.maxScore,
        scorePercentage: r.scorePercentage,
        answers: r.answers || {},
      }));
      setResponses(normalized);
    } catch (error) {
      console.error('Failed to load form and responses:', error);
      setForm(null);
      setResponses([]);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const { headers, data } = buildCsvForResponses(responses);
    const csvContent = [headers, ...data]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${form?.title || 'form'}_responses.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const viewResponse = (response) => {
    // Navigate to the ViewForm page to show the response in detail
    navigate(`/view/${formId}/${response.id}`);
  };

  const getMaxScore = () => {
    if (!form) return 0;
    return (form.questions || []).reduce((sum, q) => {
      if (q.type === 'cloze') return sum + (q.blanks?.length || 0);
      if (q.type === 'comprehension') return sum + (q.questions?.length || 0);
      return sum;
    }, 0);
  };

  const formatAnswer = (question, answer) => {
    if (!answer) return '';
    if (question.type === 'categorize') {
      const categories = answer.categories || answer;
      try { return JSON.stringify(categories); } catch { return String(categories); }
    }
    if (question.type === 'cloze') {
      const parts = answer.answers || answer;
      return Array.isArray(parts) ? parts.join('; ') : String(parts);
    }
    if (question.type === 'comprehension') {
      const selected = answer.answers || answer;
      if (Array.isArray(selected)) {
        return selected.map((idx, i) => {
          const optText = question.questions?.[i]?.options?.[idx - 1];
          return optText ? `Q${i + 1}: ${optText}` : `Q${i + 1}: Option ${idx}`;
        }).join('; ');
      }
      return String(selected);
    }
    return '';
  };

  const buildCsvForResponses = (rows) => {
    if (!form) return { headers: [], data: [] };
    const questionHeaders = (form.questions || []).map((q, i) => `Q${i + 1}: ${q.title || q.type}`);
    const headers = [
      'Response ID',
      'User Name',
      'User Email',
      'Submitted At',
      'Score',
      'Max Score',
      'Score Percentage',
      'Answers',
      ...questionHeaders,
    ];

    const maxScore = getMaxScore();
    const data = rows.map((r) => {
      const score = typeof r.score === 'number' ? r.score : 0;
      const percentage = typeof r.scorePercentage === 'number'
        ? `${r.scorePercentage}%`
        : (maxScore > 0 ? `${Math.round((score / maxScore) * 100)}%` : '0%');
      const answersPerQuestion = (form.questions || []).map((q) => formatAnswer(q, r.answers?.[q.id]));
      return [
        r.id,
        r.respondentName || 'Anonymous',
        r.respondentEmail || 'No email',
        r.submittedAt,
        Math.round(score * 100) / 100,
        Math.round(maxScore * 100) / 100,
        percentage,
        JSON.stringify(r.answers || {}),
        ...answersPerQuestion,
      ];
    });
    return { headers, data };
  };

  const exportSingleResponse = (response) => {
    const { headers, data } = buildCsvForResponses([response]);
    const csvContent = [headers, ...data]
      .map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${form?.title || 'form'}_${response.id}_response.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const editResponse = (response) => {
    // Navigate to edit response page or open edit modal
    navigate(`/edit-response/${formId}/${response.id}`);
  };

  const getAnalytics = () => {
    if (responses.length === 0) return null;

    const totalResponses = responses.length;
    const avgScore = responses.reduce((sum, r) => sum + (r.score || 0), 0) / totalResponses;
    const avgTimeSpent = responses.reduce((sum, r) => sum + (r.timeSpent || 0), 0) / totalResponses;
    const completionRate = responses.length > 0 ? 100 : 0;
    const adminResponses = responses.filter(r => r.submittedBy === 'admin').length;
    const userResponses = responses.filter(r => r.submittedBy === 'user').length;

    return {
      totalResponses,
      avgScore: Math.round(avgScore * 10) / 10,
      avgTimeSpent: Math.round(avgTimeSpent / 60),
      completionRate,
      adminResponses,
      userResponses
    };
  };

  const filteredResponses = responses.filter(response => {
    const matchesSearch = (response.respondentName && response.respondentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (response.respondentEmail && response.respondentEmail.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'recent' && new Date(response.submittedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)) ||
                         (filterType === 'high-score' && (response.score || 0) >= 90) ||
                         (filterType === 'admin' && response.submittedBy === 'admin') ||
                         (filterType === 'user' && response.submittedBy === 'user');
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
      case 'submittedBy':
        comparison = (a.submittedBy || 'user').localeCompare(b.submittedBy || 'user');
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
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center space-x-4"
        >
          <AnimatedButton
            onClick={exportToCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </AnimatedButton>
        </motion.div>
      </motion.div>

      {/* Form Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {form?.title || 'Form Responses'}
        </h1>
        <p className="text-gray-600">
          {form?.description || 'View and manage responses for this form'}
        </p>
      </motion.div>

      {/* Analytics Cards */}
      {analytics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Responses</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalResponses}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.avgScore}%</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500"
          >
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Time</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.avgTimeSpent}m</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500"
          >
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Admin Responses</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.adminResponses}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500"
          >
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">User Responses</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.userResponses}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.4 }}
            className="relative flex-1 max-w-md"
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search responses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:shadow-lg transition-all duration-200"
            />
          </motion.div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Response Filter */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.4 }}
            >
              <CustomDropdown
                options={[
                  { value: 'all', label: 'All Responses' },
                  { value: 'recent', label: 'Recent (24h)' },
                  { value: 'high-score', label: 'High Score (>90%)' },
                  { value: 'admin', label: 'Admin Responses' },
                  { value: 'user', label: 'User Responses' }
                ]}
                value={filterType}
                onChange={setFilterType}
                placeholder="Filter responses"
                minWidth="160px"
              />
            </motion.div>

            {/* Sort Dropdown */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.4 }}
            >
              <CustomDropdown
                options={[
                  { value: 'date-desc', label: 'Newest First' },
                  { value: 'date-asc', label: 'Oldest First' },
                  { value: 'score-desc', label: 'Highest Score' },
                  { value: 'score-asc', label: 'Lowest Score' },
                  { value: 'time-desc', label: 'Longest Time' },
                  { value: 'time-asc', label: 'Shortest Time' },
                  { value: 'submittedBy-asc', label: 'Admin First' },
                  { value: 'submittedBy-desc', label: 'User First' }
                ]}
                value={`${sortBy}-${sortOrder}`}
                onChange={(value) => {
                  const [sort, order] = value.split('-');
                  setSortBy(sort);
                  setSortOrder(order);
                }}
                placeholder="Sort by"
                minWidth="140px"
              />
            </motion.div>

            {/* Results Count */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.4 }}
              className="text-sm text-gray-500 font-medium flex items-center"
            >
              {sortedResponses.length} response{sortedResponses.length !== 1 ? 's' : ''} found
            </motion.div>
          </div>
        </div>
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
                  RESPONSE ID
                </th>
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
                      <div className="text-sm text-gray-900">
                        {response.id}
                      </div>
                    </td>
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
                        <div className="text-sm text-gray-900">{typeof response.scorePercentage === 'number' ? `${response.scorePercentage}%` : `${response.score || 0}%`}</div>
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
                          onClick={() => exportSingleResponse(response)}
                          className="text-green-600 hover:text-green-900 transition-colors duration-200 flex items-center space-x-1"
                          title="Export CSV"
                        >
                          <Download className="w-4 h-4" />
                          <span>Export</span>
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
              <Link to={user?.role === 'admin' ? '/dashboard' : '/user-dashboard'}>
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

export default FormResponses;
