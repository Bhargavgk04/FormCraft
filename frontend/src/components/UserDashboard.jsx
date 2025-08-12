import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, User, Calendar, Clock, CheckCircle, Search, Filter, Eye, Mail, RefreshCw, X } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from './Toast';
import { animations } from '../utils/animations';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AnimatedSpinner } from './AnimatedComponents';

const UserDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { error, info } = useToast();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    totalResponses: 0,
    thisMonth: 0,
    thisWeek: 0,
    today: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      loadUserResponses();
    }
  }, [authLoading, user]);

  const loadUserResponses = async () => {
    try {
      setLoading(true);
      const data = await api.getUserResponses();
      console.log('User responses loaded:', data);
      console.log('Sample response structure:', data[0]);
      
      // Ensure each response has a unique ID
      const responsesWithIds = data.map((response, index) => ({
        ...response,
        id: response.id || response._id || `temp-id-${index}`,
        _id: response._id || response.id || `temp-id-${index}`
      }));
      
      console.log('Responses with IDs:', responsesWithIds);
      setResponses(responsesWithIds);
      
      // Calculate statistics
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const stats = {
        totalResponses: responsesWithIds.length,
        thisMonth: responsesWithIds.filter(r => new Date(r.submittedAt) >= thisMonth).length,
        thisWeek: responsesWithIds.filter(r => new Date(r.submittedAt) >= thisWeek).length,
        today: responsesWithIds.filter(r => new Date(r.submittedAt) >= today).length
      };
      
      setStats(stats);
    } catch (err) {
      console.error('Failed to load responses:', err);
      error('Failed to load responses', 'Unable to load your form responses.');
    } finally {
      setLoading(false);
    }
  };

  const filteredResponses = responses.filter(response => {
    const matchesSearch = response.formTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         response.respondentName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'recent') {
      const responseDate = new Date(response.submittedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return matchesSearch && responseDate >= weekAgo;
    }
    if (filterStatus === 'thisMonth') {
      const responseDate = new Date(response.submittedAt);
      const monthStart = new Date();
      monthStart.setDate(1);
      return matchesSearch && responseDate >= monthStart;
    }
    
    return matchesSearch;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInDays > 0) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    if (diffInHours > 0) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInMinutes > 0) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your responses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">User Dashboard</h1>
        <p className="text-gray-600 text-sm sm:text-base">Track all the forms you've submitted responses to</p>
        <div className="mt-4 inline-flex items-center px-3 sm:px-4 py-2 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm font-medium">
          <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          Form Respondent
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Responses</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalResponses}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">This Month</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.thisMonth}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">This Week</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.thisWeek}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Today</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.today}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search responses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:shadow-lg transition-all duration-200"
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
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-48 px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:shadow-lg transition-all duration-200"
            >
              <option value="all">All Responses</option>
              <option value="recent">Recent (7 days)</option>
              <option value="thisMonth">This Month</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Results Count */}
            <div className="text-sm text-gray-500 font-medium flex items-center">
              {filteredResponses.length} response{filteredResponses.length !== 1 ? 's' : ''} found
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadUserResponses}
              className="flex items-center space-x-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Responses List */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <AnimatedSpinner size="lg" />
          </div>
        ) : filteredResponses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {responses.length === 0 ? 'No responses yet' : 'No responses match your search'}
            </h3>
            <p className="text-gray-600 mb-4">
              {responses.length === 0 
                ? 'You haven\'t submitted any form responses yet' 
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {responses.length === 0 ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/browse-forms')}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium mx-auto"
              >
                <FileText className="w-4 h-4" />
                <span>Browse Forms</span>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm font-medium mx-auto"
              >
                <span>Clear Search</span>
              </motion.button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Form
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Submitted
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResponses.map((response, index) => (
                  <motion.tr
                    key={response.id || response._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10">
                          <div className="w-full h-full bg-indigo-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                          </div>
                        </div>
                        <div className="ml-3 sm:ml-4">
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">
                            {response.formTitle || 'Untitled Form'}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                            {response.formDescription || 'No description'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                      {new Date(response.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="text-sm font-medium text-gray-900">
                            {response.scorePercentage}%
                          </div>
                          <div className="text-xs text-gray-500">
                            {response.score}/{response.maxScore} points
                          </div>
                        </div>
                        <div className="ml-2 sm:ml-3 flex-shrink-0">
                          <div className="w-12 sm:w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                response.scorePercentage >= 80 ? 'bg-green-500' :
                                response.scorePercentage >= 60 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${response.scorePercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        response.scorePercentage >= 80 ? 'bg-green-100 text-green-800' :
                        response.scorePercentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {response.scorePercentage >= 80 ? 'Excellent' :
                         response.scorePercentage >= 60 ? 'Good' : 'Needs Improvement'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            console.log('View button clicked for response:', response);
                            console.log('Navigating to:', `/view/${response.formId}/${response.id}`);
                            navigate(`/view/${response.formId}/${response.id}`);
                          }}
                          className="flex items-center space-x-1 px-2 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors duration-200 text-xs sm:text-sm"
                          title="View Response"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">View</span>
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
