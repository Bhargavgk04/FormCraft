import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Eye, Edit, Trash2, FileText, Users, Download, Share2, Search, Filter, BarChart3, X, RefreshCw } from 'lucide-react';
import { animations, easing } from '../utils/animations';
import { AnimatedButton, AnimatedCard, AnimatedContainer, AnimatedSpinner } from './AnimatedComponents';
import { api } from '../services/api';
import CustomDropdown from './CustomDropdown';
import { useToast } from './Toast';


const Dashboard = () => {
  const navigate = useNavigate();
  const { success, error, info } = useToast();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ show: false, form: null });
  const [updatingIds, setUpdatingIds] = useState([]);


  useEffect(() => {
    const loadForms = async () => {
      try {
        setLoading(true);
        const data = await api.listForms();
        console.log('Dashboard: Received forms data:', data);
        const normalized = data.map(f => ({
          id: f._id || f.id,
          title: f.title || 'Untitled Form',
          description: f.description || '',
          questions: f.questions?.length || 0,
          responses: f.responsesCount || 0,
          createdAt: f.createdAt,
          headerImage: f.headerImage || '',
          status: f.status || 'draft',
        }));
              console.log('Dashboard: Normalized forms:', normalized);
      setForms(normalized);
    } catch (e) {
      console.error('Failed to load forms', e);
      error('Failed to load forms', 'Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
    };

    loadForms();
  }, []);



  const exportForm = (form) => {
    const formData = JSON.stringify(form, null, 2);
    const blob = new Blob([formData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.title}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const viewResponses = (form) => {
    // Navigate to responses page
    navigate(`/responses/${form.id}`);
  };

  const navigateToAllForms = () => {
    // Navigate to YourForms page
    navigate('/your-forms');
  };

  const navigateToAllResponses = () => {
    // Navigate to all responses page
    navigate('/all-responses');
  };

  const refreshForms = () => {
    const loadForms = async () => {
      try {
        setLoading(true);
        const data = await api.listForms();
        console.log('Dashboard: Refreshed forms data:', data);
        const normalized = data.map(f => ({
          id: f._id || f.id,
          title: f.title || 'Untitled Form',
          description: f.description || '',
          questions: f.questions?.length || 0,
          responses: f.responsesCount || 0,
          createdAt: f.createdAt,
          headerImage: f.headerImage || '',
          status: f.status || 'draft',
        }));
        setForms(normalized);
      } catch (e) {
        console.error('Failed to refresh forms', e);
        error('Failed to refresh forms', 'Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadForms();
  };

  const setCardUpdating = (id, isUpdating) => {
    setUpdatingIds(prev => {
      const next = new Set(prev);
      if (isUpdating) next.add(id); else next.delete(id);
      return Array.from(next);
    });
  };

  const updateLocalFormStatus = (id, status) => {
    setForms(prev => prev.map(f => (f.id === id ? { ...f, status } : f)));
  };

  const deleteForm = async (form) => {
    try {
      await api.deleteForm(form.id);
      // Remove the form from the local state
      setForms(forms.filter(f => f.id !== form.id));
      setDeleteModal({ show: false, form: null });
      success('Form deleted', `${form.title} has been successfully deleted.`);
    } catch (err) {
      console.error('Failed to delete form:', err);
      error('Delete failed', 'Failed to delete form. Please try again.');
    }
  };

  const openDeleteModal = (form) => {
    setDeleteModal({ show: true, form });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, form: null });
  };

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'recent') {
      const formDate = new Date(form.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return matchesSearch && formDate >= weekAgo;
    }
    if (filterType === 'popular') {
      return matchesSearch && (form.responses || 0) > 10;
    }
    if (filterType === 'published') {
      return matchesSearch && form.status === 'published';
    }
    if (filterType === 'draft') {
      return matchesSearch && form.status === 'draft';
    }
    
    return matchesSearch;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
              transition: {
          duration: 0.5,
          ease: easing.easeOut
        }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.95,
              transition: {
          duration: 0.3,
          ease: easing.easeIn
        }
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

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easing.easeOut }}
        className="mb-8"
      >
        <motion.h1 
          className="text-4xl font-bold text-gray-800 mb-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Admin Dashboard
        </motion.h1>
        <motion.p 
          className="text-gray-600 text-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Create, manage, and analyze your forms
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
        >
          <Users className="w-4 h-4 mr-2" />
          Form Creator & Administrator
        </motion.div>
      </motion.div>



      {/* Statistics Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        <motion.button
          variants={cardVariants}
          whileHover={{ y: -5, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={navigateToAllForms}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 sm:p-6 text-white cursor-pointer shadow-lg text-left"
        >
          <motion.div
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 mb-2 sm:mb-4"
          >
            <FileText className="w-4 h-4 sm:w-6 sm:h-6" />
          </motion.div>
          <motion.h3 
            className="text-lg sm:text-2xl font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.3 }}
          >
            {forms.length}
          </motion.h3>
          <p className="text-blue-100 text-sm sm:text-base">Total Forms</p>
        </motion.button>

        <motion.button
          variants={cardVariants}
          whileHover={{ y: -5, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={navigateToAllResponses}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-4 sm:p-6 text-white cursor-pointer shadow-lg text-left"
        >
          <motion.div
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 mb-2 sm:mb-4"
          >
            <Users className="w-4 h-4 sm:w-6 sm:h-6" />
          </motion.div>
          <motion.h3 
            className="text-lg sm:text-2xl font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.3 }}
          >
            {forms.reduce((total, form) => total + form.responses, 0)}
          </motion.h3>
          <p className="text-emerald-100 text-sm sm:text-base">Total Responses</p>
        </motion.button>

        <Link to="/builder">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5, ease: easing.easeOut }}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl p-4 sm:p-6 text-white cursor-pointer shadow-lg"
          >
            <motion.div
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 mb-2 sm:mb-4"
            >
              <Plus className="w-4 h-4 sm:w-6 sm:h-6" />
            </motion.div>
            <h3 className="text-lg sm:text-xl font-bold">Create New Form</h3>
            <p className="text-orange-100 text-sm sm:text-base">Start building now</p>
          </motion.div>
        </Link>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8"
      >
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search forms..."
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
            
            <CustomDropdown
              options={[
                { value: 'all', label: 'All Forms' },
                { value: 'recent', label: 'Recent (7 days)' },
                { value: 'popular', label: 'Popular (>10 responses)' },
                { value: 'published', label: 'Published' },
                { value: 'draft', label: 'Drafts' }
              ]}
              value={filterType}
              onChange={setFilterType}
              className="w-full sm:w-48"
            />
          </div>

          <div className="flex items-center space-x-4">
            {/* Results Count */}
            <div className="text-sm text-gray-500 font-medium flex items-center">
              {filteredForms.length} form{filteredForms.length !== 1 ? 's' : ''} found
            </div>
            
            <motion.button
              variants={cardVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refreshForms}
              className="flex items-center space-x-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Forms Grid */}
      <motion.div
        id="forms-section"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredForms.map((form, index) => (
            <motion.div
              key={form.id}
              variants={cardVariants}
              layout
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              whileHover={{ 
                y: -8, 
                scale: 1.02,
                transition: { duration: 0.2, ease: easing.easeOut }
              }}
            >
              {form.headerImage && (
                <div className="h-32 sm:h-48 bg-gradient-to-r from-gray-200 to-gray-300 relative overflow-hidden">
                  <img
                    src={form.headerImage}
                    alt="Form header"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20" />
                </div>
              )}
              
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                  {form.title}
                </h3>
                <p className="text-gray-600 mb-3 text-sm line-clamp-2">
                  {form.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span>{form.questions} questions</span>
                  <span>{form.responses} responses</span>
                </div>

                <motion.div 
                  className="flex flex-wrap items-center gap-1 sm:gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <Link to={`/builder/${form.id}`} title="Edit">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-1 px-2 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors duration-200 text-xs sm:text-sm"
                    >
                      <FileText className="w-3 h-3" />
                      <span className="hidden sm:inline">Edit</span>
                    </motion.button>
                  </Link>

                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => viewResponses(form)}
                    className="flex items-center space-x-1 px-2 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-xs sm:text-sm"
                    title="Preview"
                  >
                    <Eye className="w-3 h-3" />
                    <span className="hidden sm:inline">Preview</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/fill/${form.id}`).then(() => info('Link copied', 'Share link copied to clipboard'))}
                    className="flex items-center space-x-1 px-2 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-xs sm:text-sm"
                    title="Share"
                  >
                    <Share2 className="w-3 h-3" />
                    <span className="hidden sm:inline">Share</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/responses/${form.id}`)}
                    className="flex items-center space-x-1 px-2 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-xs sm:text-sm"
                    title="Responses"
                  >
                    <Users className="w-3 h-3" />
                    <span className="hidden sm:inline">Responses</span>
                  </motion.button>

                  {form.status === 'published' ? (
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={updatingIds.includes(form.id)}
                      onClick={async () => {
                        setCardUpdating(form.id, true);
                        try {
                          await api.unpublishForm(form.id);
                          updateLocalFormStatus(form.id, 'draft');
                          success('Form unpublished', 'Your form is now in draft mode');
                        } catch (err) {
                          error('Failed to unpublish form', 'Please try again');
                        } finally {
                          setCardUpdating(form.id, false);
                        }
                      }}
                      className="flex items-center space-x-1 px-2 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors duration-200 text-xs sm:text-sm"
                      title="Unpublish"
                    >
                      <Download className="w-3 h-3" />
                      <span className="hidden sm:inline">Unpublish</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={updatingIds.includes(form.id)}
                      onClick={async () => {
                        setCardUpdating(form.id, true);
                        try {
                          await api.publishForm(form.id);
                          updateLocalFormStatus(form.id, 'published');
                          success('Form published', 'Your form is now live and can be shared');
                        } catch (err) {
                          error('Failed to publish form', 'Please try again');
                        } finally {
                          setCardUpdating(form.id, false);
                        }
                      }}
                      className="flex items-center space-x-1 px-2 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200 text-xs sm:text-sm"
                      title="Publish"
                    >
                      <Download className="w-3 h-3" />
                      <span className="hidden sm:inline">Publish</span>
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openDeleteModal(form)}
                    className="flex items-center space-x-1 px-2 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 text-xs sm:text-sm"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span className="hidden sm:inline">Delete</span>
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredForms.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center py-12"
        >
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
        >
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          </motion.div>
                      <motion.h3 
              className="text-xl font-semibold text-gray-600 mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
            >
              {forms.length === 0 ? 'No forms yet' : 'No forms match your search'}
            </motion.h3>
                      <motion.p 
              className="text-gray-500 mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.4 }}
            >
              {forms.length === 0 
                ? 'Get started by creating your first form' 
                : 'Try adjusting your search or filter criteria'
              }
            </motion.p>
                      {forms.length === 0 ? (
          <Link to="/builder">
            <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.0, duration: 0.4 }}
                  whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-lg"
            >
              Create Your First Form
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
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeDeleteModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Form</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <span className="font-semibold">"{deleteModal.form?.title}"</span>? 
                This will permanently remove the form and all its responses.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteForm(deleteModal.form)}
                  className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Delete Form
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Dashboard;