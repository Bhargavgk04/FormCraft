import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const AllResponses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [forms, setForms] = useState([]);
  const [allResponses, setAllResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedForm, setSelectedForm] = useState('all');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      console.log('Loading all responses data...');
      
      const [formsData, responsesData] = await Promise.all([
        api.listForms(),
        api.listAllResponses(),
      ]);

      console.log('Forms data:', formsData);
      console.log('Responses data:', responsesData);

      const normalizedForms = formsData.map(f => ({ id: f._id, title: f.title, description: f.description }));
      const normalizedResponses = responsesData.map(r => ({
        id: r._id,
        formId: typeof r.formId === 'object' ? r.formId._id : r.formId,
        formTitle: r.formTitle || (typeof r.formId === 'object' ? r.formId.title : ''),
        respondentId: r.respondentId,
        respondentName: r.respondentName,
        respondentEmail: r.respondentEmail,
        submittedAt: r.submittedAt,
        timeSpent: r.timeSpent,
        score: r.score || 0,
        maxScore: r.maxScore || 0,
        scorePercentage: r.scorePercentage,
        answers: r.answers || {},
      }));

      console.log('Normalized responses:', normalizedResponses);

      setForms(normalizedForms);
      setAllResponses(normalizedResponses);
    } catch (e) {
      console.error('Failed to load data', e);
      setForms([]);
      setAllResponses([]);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    // High-level export for All Responses page including Score and Answers JSON
    const headers = ['Form Title','Response ID','User Name','User Email','Submitted At','Score (%)','Answers'];
    const csvData = filteredResponses.map(r => [
      r.formTitle || 'Unknown Form',
      r.id,
      r.respondentName || 'Anonymous',
      r.respondentEmail || 'No email',
      r.submittedAt,
      (typeof r.scorePercentage === 'number' ? r.scorePercentage : (r.maxScore ? Math.round((r.score / r.maxScore) * 100) : 0)),
      JSON.stringify(r.answers || {})
    ]);
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'all_responses.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const viewResponse = (response) => {
    navigate(`/view/${response.formId}/${response.id}`);
  };

  const getAnalytics = () => {
    if (allResponses.length === 0) return null;

    const totalResponses = allResponses.length;
    const avgScore = allResponses.reduce((sum, r) => sum + (r.score || 0), 0) / totalResponses;
    const avgTimeSpent = allResponses.reduce((sum, r) => sum + (r.timeSpent || 0), 0) / totalResponses;
    const completionRate = allResponses.length > 0 ? 100 : 0; // All responses are completed

    return {
      totalResponses,
      avgScore: Math.round(avgScore * 10) / 10,
      avgTimeSpent: Math.round(avgTimeSpent / 60),
      completionRate
    };
  };

  const filteredResponses = allResponses.filter(response => {
    const matchesSearch = (response.respondentName && response.respondentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (response.respondentEmail && response.respondentEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (response.formTitle && response.formTitle.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'recent' && new Date(response.submittedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)) ||
                         (filterType === 'high-score' && (response.score || 0) >= 90);
    const matchesForm = selectedForm === 'all' || response.formId === selectedForm;
    return matchesSearch && matchesFilter && matchesForm;
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
          All Responses
        </motion.h1>
        <motion.p 
          className="text-gray-800 text-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          View responses from all forms
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

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="mb-8"
      >
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col xl:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-1 w-full xl:w-auto">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.4 }}
                className="relative"
              >
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by user name, email, or form title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-0 rounded-xl text-gray-700 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:shadow-lg transition-all duration-300 ease-out focus:outline-none"
                />
                {searchTerm && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
              </motion.div>
            </div>

            {/* Form Filter */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.4 }}
            >
              <CustomDropdown
                options={[
                  { value: 'all', label: 'All Forms' },
                  ...forms.map(form => ({ value: form.id, label: form.title }))
                ]}
                value={selectedForm}
                onChange={setSelectedForm}
                placeholder="Select form"
                minWidth="140px"
              />
            </motion.div>

            {/* Response Filter */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.4 }}
            >
              <CustomDropdown
                options={[
                  { value: 'all', label: 'All Responses' },
                  { value: 'recent', label: 'Recent (24h)' },
                  { value: 'high-score', label: 'High Score (>90%)' }
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
              transition={{ delay: 1.6, duration: 0.4 }}
            >
              <CustomDropdown
                options={[
                  { value: 'date-desc', label: 'Newest First' },
                  { value: 'date-asc', label: 'Oldest First' },
                  { value: 'score-desc', label: 'Highest Score' },
                  { value: 'score-asc', label: 'Lowest Score' },
                  { value: 'time-desc', label: 'Longest Time' },
                  { value: 'time-asc', label: 'Shortest Time' }
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
              transition={{ delay: 1.7, duration: 0.4 }}
              className="text-sm text-gray-500 font-medium"
            >
              {sortedResponses.length} response{sortedResponses.length !== 1 ? 's' : ''} found
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Recent Responses Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="mb-6"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4">All Responses</h3>
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
                  FORM
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
                      <div className="text-sm font-medium text-gray-900">
                        {response.formTitle || 'Unknown Form'}
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
                      {response.scorePercentage ? (
                        <div className="text-sm text-gray-900">{response.scorePercentage}%</div>
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
              {allResponses.length === 0 ? 'No responses yet' : 'No responses match your search'}
            </motion.h3>
            <motion.p 
              className="text-gray-500 mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.4 }}
            >
              {allResponses.length === 0 
                ? 'Share your forms to start collecting responses' 
                : 'Try adjusting your search or filter criteria'
              }
            </motion.p>
            {allResponses.length === 0 ? (
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
                  setSelectedForm('all');
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

export default AllResponses; 