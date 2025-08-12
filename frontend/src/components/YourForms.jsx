import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  FileText, 
  Eye, 
  Share2, 
  Users, 
  Trash2,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { animations, easing } from '../utils/animations';
import { AnimatedButton, AnimatedCard, AnimatedContainer, AnimatedSpinner } from './AnimatedComponents';
import { api } from '../services/api';
import { useToast } from './Toast';
import { useAuth } from '../context/AuthContext';

const YourForms = () => {
  const navigate = useNavigate();
  const { success, error, info } = useToast();
  const { user } = useAuth();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ show: false, form: null });

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      setLoading(true);
      const data = await api.listForms();
      console.log('YourForms: Received forms data:', data);
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
      console.log('YourForms: Normalized forms:', normalized);
      setForms(normalized);
    } catch (e) {
      console.error('Failed to load forms', e);
      error('Failed to load forms', 'Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshForms = () => {
    loadForms();
    info('Refreshing forms', 'Loading latest form data...');
  };

  const deleteForm = async (form) => {
    try {
      await api.deleteForm(form.id);
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

  const publishForm = async (form) => {
    try {
      await api.publishForm(form.id);
      setForms(forms.map(f => 
        f.id === form.id ? { ...f, status: 'published' } : f
      ));
      success('Form published', `${form.title} is now live and accepting responses.`);
    } catch (err) {
      console.error('Failed to publish form:', err);
      error('Publish failed', 'Failed to publish form. Please try again.');
    }
  };

  const unpublishForm = async (form) => {
    try {
      await api.unpublishForm(form.id);
      setForms(forms.map(f => 
        f.id === form.id ? { ...f, status: 'unpublished' } : f
      ));
      success('Form unpublished', `${form.title} is no longer accepting responses.`);
    } catch (err) {
      console.error('Failed to unpublish form:', err);
      error('Unpublish failed', 'Failed to unpublish form. Please try again.');
    }
  };

  const shareForm = (form) => {
    // Only allow sharing published forms
    if (form.status !== 'published') {
      warning('Form not published', 'Please publish this form before sharing it with users.');
      return;
    }
    
    const shareUrl = `${window.location.origin}/fill/${form.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      success('Link copied', 'Form link has been copied to your clipboard. Users will need to log in to fill this form.');
    }).catch(() => {
      error('Copy failed', 'Failed to copy link to clipboard.');
    });
  };

  const viewResponses = (form) => {
    navigate(`/responses/${form.id}`);
  };

  const editForm = (form) => {
    navigate(`/builder/${form.id}`);
  };

  const previewForm = (form) => {
    navigate(`/preview/${form.id}`);
  };

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || form.status === filterType;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'numeric', 
      day: 'numeric', 
      year: 'numeric' 
    });
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center space-x-4"
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
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <AnimatedButton
                onClick={refreshForms}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </AnimatedButton>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easing.easeOut }}
          className="mb-8"
        >
          <motion.h1 
            className="text-3xl font-bold text-gray-900 mb-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Your Forms
          </motion.h1>
          <motion.p 
            className="text-gray-600 text-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Share the form links with users to allow them to respond.
          </motion.p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search forms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:shadow-lg transition-all duration-200"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:shadow-lg transition-all duration-200"
              >
                <option value="all">All Forms</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Forms List */}
        <motion.div
          variants={animations.container}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredForms.map((form, index) => (
              <motion.div
                key={form.id}
                variants={animations.card}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  {/* Form Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {form.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        form.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : form.status === 'unpublished'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {form.status === 'published' ? 'Published' : 
                         form.status === 'unpublished' ? 'Unpublished' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-1">
                      {form.description || 'No description'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Created {formatDate(form.createdAt)}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    {/* Document Icon - Edit Form */}
                    <motion.button
                      onClick={() => editForm(form)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Edit Form"
                    >
                      <FileText className="w-4 h-4" />
                    </motion.button>

                    {/* Eye Icon - Preview Form */}
                    <motion.button
                      onClick={() => previewForm(form)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Preview Form"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>

                                         {/* Share Icon */}
                     <motion.button
                       onClick={() => shareForm(form)}
                       className={`p-2 rounded-lg transition-colors duration-200 ${
                         form.status === 'published' 
                           ? 'text-gray-600 hover:text-purple-600 hover:bg-purple-50' 
                           : 'text-gray-400 cursor-not-allowed'
                       }`}
                       whileHover={form.status === 'published' ? { scale: 1.1 } : {}}
                       whileTap={form.status === 'published' ? { scale: 0.9 } : {}}
                       title={form.status === 'published' ? 'Share Form' : 'Form must be published to share'}
                       disabled={form.status !== 'published'}
                     >
                       <Share2 className="w-4 h-4" />
                     </motion.button>

                    {/* Users Icon - View Responses */}
                    <motion.button
                      onClick={() => viewResponses(form)}
                      className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="View Responses"
                    >
                      <Users className="w-4 h-4" />
                    </motion.button>

                    {/* Publish/Unpublish Button */}
                    {form.status === 'published' ? (
                      <motion.button
                        onClick={() => unpublishForm(form)}
                        className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded hover:bg-yellow-200 transition-colors duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Unpublish Form"
                      >
                        Unpublish
                      </motion.button>
                    ) : (
                      <motion.button
                        onClick={() => publishForm(form)}
                        className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded hover:bg-green-200 transition-colors duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Publish Form"
                      >
                        Publish
                      </motion.button>
                    )}

                    {/* Trash Icon - Delete Form */}
                    <motion.button
                      onClick={() => openDeleteModal(form)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Delete Form"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty State */}
          {filteredForms.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="text-gray-400 mb-4">
                <FileText className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No forms found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Create your first form to get started.'
                }
              </p>
              {!searchTerm && filterType === 'all' && (
                <Link
                  to="/builder/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Create New Form
                </Link>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Delete Form
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{deleteModal.form?.title}"? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteForm(deleteModal.form)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default YourForms;
