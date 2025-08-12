import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Dashboard from './components/Dashboard';
import FormBuilder from './components/FormBuilder';
import FormFill from './components/FormFill';
import FormPreview from './components/FormPreview';
import AllResponses from './components/AllResponses';
import ViewResponses from './components/ViewResponses';
import ViewForm from './components/ViewForm';
import FormResponses from './components/FormResponses';
import EditResponse from './components/EditResponse';
import YourForms from './components/YourForms';
import UserDashboard from './components/UserDashboard';
import UserBrowseForms from './components/UserBrowseForms';
import Login from './components/Login';
import Register from './components/Register';
import ToastDemo from './components/ToastDemo';
import LandingPage from './components/LandingPage';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import ToastProvider from './components/Toast';
import { animations } from './utils/animations';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/toast-demo" element={<ToastDemo />} />
          <Route path="/fill/:formId" element={
            <ProtectedRoute requireAuth={true}>
              <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <motion.div
                  className="container mx-auto px-4 py-8"
                  initial="initial"
                  animate="animate"
                  variants={animations.pageTransition}
                >
                  <FormFill />
                </motion.div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/" element={
            <ProtectedRoute requireAuth={false}>
              <LandingPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute requireAuth={true} requireRole="admin">
              <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <Navbar />
                <motion.div
                  className="container mx-auto px-4 py-8"
                  initial="initial"
                  animate="animate"
                  variants={animations.pageTransition}
                >
                  <Dashboard />
                </motion.div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/builder" element={
            <ProtectedRoute requireAuth={true} requireRole="admin">
              <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <Navbar />
                <motion.div
                  className="container mx-auto px-4 py-8"
                  initial="initial"
                  animate="animate"
                  variants={animations.pageTransition}
                >
                  <FormBuilder />
                </motion.div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/builder/:formId" element={
            <ProtectedRoute requireAuth={true} requireRole="admin">
              <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <Navbar />
                <motion.div
                  className="container mx-auto px-4 py-8"
                  initial="initial"
                  animate="animate"
                  variants={animations.pageTransition}
                >
                  <FormBuilder />
                </motion.div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/preview/:formId" element={
            <ProtectedRoute requireAuth={true} requireRole="admin">
              <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <Navbar />
                <motion.div
                  className="container mx-auto px-4 py-8"
                  initial="initial"
                  animate="animate"
                  variants={animations.pageTransition}
                >
                  <FormPreview />
                </motion.div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/your-forms" element={
            <ProtectedRoute requireAuth={true}>
              <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <Navbar />
                <motion.div
                  className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50"
                  initial="initial"
                  animate="animate"
                  variants={animations.pageTransition}
                >
                  <YourForms />
                </motion.div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/user-dashboard" element={
            <ProtectedRoute requireAuth={true}>
              <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <Navbar />
                <motion.div
                  className="container mx-auto px-4 py-8"
                  initial="initial"
                  animate="animate"
                  variants={animations.pageTransition}
                >
                  <UserDashboard />
                </motion.div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/browse-forms" element={
            <ProtectedRoute requireAuth={true}>
              <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <Navbar />
                <motion.div
                  className="container mx-auto px-4 py-8"
                  initial="initial"
                  animate="animate"
                  variants={animations.pageTransition}
                >
                  <UserBrowseForms />
                </motion.div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/all-responses" element={
            <ProtectedRoute requireAuth={true}>
              <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <Navbar />
                <motion.div
                  className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50"
                  initial="initial"
                  animate="animate"
                  variants={animations.pageTransition}
                >
                  <AllResponses />
                </motion.div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/responses/:formId" element={
            <ProtectedRoute requireAuth={true}>
              <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <Navbar />
                <motion.div
                  className="container mx-auto px-4 py-8"
                  initial="initial"
                  animate="animate"
                  variants={animations.pageTransition}
                >
                  <FormResponses />
                </motion.div>
              </div>
            </ProtectedRoute>
          } />

          <Route path="/edit-response/:formId/:responseId" element={
            <ProtectedRoute requireAuth={true}>
              <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <Navbar />
                <motion.div
                  className="container mx-auto px-4 py-8"
                  initial="initial"
                  animate="animate"
                  variants={animations.pageTransition}
                >
                  <EditResponse />
                </motion.div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/view/:formId/:responseId" element={
            <ProtectedRoute requireAuth={true}>
              <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <Navbar />
                <motion.div
                  className="container mx-auto px-4 py-8"
                  initial="initial"
                  animate="animate"
                  variants={animations.pageTransition}
                >
                  <ViewForm />
                </motion.div>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;