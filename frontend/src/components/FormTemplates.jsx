import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Users, Target, BookOpen, Plus, Eye, Copy, Download } from 'lucide-react';
import { animations } from '../utils/animations';
import { AnimatedCard, AnimatedButton, AnimatedModal } from './AnimatedComponents';

const FormTemplates = ({ onSelectTemplate, onClose }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const templates = [
    {
      id: 'customer-feedback',
      name: 'Customer Feedback Survey',
      description: 'Collect customer satisfaction and feedback data',
      category: 'Business',
      icon: Users,
      questions: [
        {
          type: 'categorize',
          title: 'Rate your experience',
          categories: ['Excellent', 'Good', 'Average', 'Poor'],
          items: ['Service Quality', 'Response Time', 'Product Quality', 'Overall Satisfaction']
        },
        {
          type: 'cloze',
          title: 'What would you like us to improve?',
          sentence: 'We would like to improve our [blank] and [blank] to better serve you.',
          blanks: [
            { id: '1', inputType: 'text', answer: '' },
            { id: '2', inputType: 'text', answer: '' }
          ]
        },
        {
          type: 'comprehension',
          title: 'Additional Comments',
          passage: 'Please share any additional thoughts or suggestions you have for us.',
          questions: [
            {
              question: 'Would you recommend our service to others?',
              options: ['Definitely', 'Probably', 'Not sure', 'Probably not', 'Definitely not'],
              correctAnswer: 0
            }
          ]
        }
      ],
      estimatedTime: '5-10 minutes',
      responseCount: 0
    },
    {
      id: 'employee-satisfaction',
      name: 'Employee Satisfaction Survey',
      description: 'Measure employee engagement and workplace satisfaction',
      category: 'HR',
      icon: Target,
      questions: [
        {
          type: 'categorize',
          title: 'Work Environment Rating',
          categories: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'],
          items: ['Work-Life Balance', 'Career Growth', 'Team Collaboration', 'Management Support', 'Compensation']
        },
        {
          type: 'cloze',
          title: 'Workplace Improvements',
          sentence: 'I would like to see improvements in [blank] and better [blank] opportunities.',
          blanks: [
            { id: '1', inputType: 'text', answer: '' },
            { id: '2', inputType: 'text', answer: '' }
          ]
        }
      ],
      estimatedTime: '8-12 minutes',
      responseCount: 0
    },
    {
      id: 'academic-assessment',
      name: 'Academic Assessment',
      description: 'Educational evaluation and learning assessment',
      category: 'Education',
      icon: BookOpen,
      questions: [
        {
          type: 'comprehension',
          title: 'Reading Comprehension',
          passage: 'Read the following passage and answer the questions below. The passage discusses the impact of climate change on global ecosystems...',
          questions: [
            {
              question: 'What is the main cause of climate change mentioned in the passage?',
              options: ['Natural cycles', 'Human activities', 'Solar radiation', 'Volcanic eruptions'],
              correctAnswer: 1
            },
            {
              question: 'Which ecosystem is most vulnerable to climate change?',
              options: ['Deserts', 'Oceans', 'Forests', 'All of the above'],
              correctAnswer: 3
            }
          ]
        },
        {
          type: 'categorize',
          title: 'Scientific Classification',
          categories: ['Mammals', 'Birds', 'Reptiles', 'Amphibians'],
          items: ['Dolphin', 'Eagle', 'Snake', 'Frog', 'Lion', 'Penguin']
        }
      ],
      estimatedTime: '15-20 minutes',
      responseCount: 0
    },
    {
      id: 'product-research',
      name: 'Product Research Survey',
      description: 'Gather insights for product development and market research',
      category: 'Research',
      icon: FileText,
      questions: [
        {
          type: 'categorize',
          title: 'Feature Importance',
          categories: ['Essential', 'Important', 'Nice to have', 'Not needed'],
          items: ['Mobile App', 'Cloud Sync', 'Offline Mode', 'Social Sharing', 'Analytics Dashboard']
        },
        {
          type: 'cloze',
          title: 'Product Experience',
          sentence: 'The most important feature for me is [blank], and I would pay extra for [blank].',
          blanks: [
            { id: '1', inputType: 'text', answer: '' },
            { id: '2', inputType: 'text', answer: '' }
          ]
        }
      ],
      estimatedTime: '6-10 minutes',
      responseCount: 0
    }
  ];

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate && onSelectTemplate) {
      onSelectTemplate(selectedTemplate);
      onClose();
    }
  };

  const copyTemplate = (template) => {
    const templateData = JSON.stringify(template, null, 2);
    navigator.clipboard.writeText(templateData);
    // You could add a toast notification here
  };

  const downloadTemplate = (template) => {
    const templateData = JSON.stringify(template, null, 2);
    const blob = new Blob([templateData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, '-').toLowerCase()}-template.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      className="space-y-6"
      variants={animations.pageTransition}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Form Templates</h2>
          <p className="text-gray-600">Choose from pre-built form structures or create your own</p>
        </div>
        <AnimatedButton
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Close
        </AnimatedButton>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <AnimatedCard
            key={template.id}
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => handleTemplateSelect(template)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <template.icon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyTemplate(template);
                  }}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                  title="Copy template"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadTemplate(template);
                  }}
                  className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-md"
                  title="Download template"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{template.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-500">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                {template.questions.length} questions
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                {template.estimatedTime}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                {template.category}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                {template.responseCount} responses
              </span>
              <AnimatedButton
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTemplateSelect(template);
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Use Template
              </AnimatedButton>
            </div>
          </AnimatedCard>
        ))}
      </div>

      {/* Template Preview Modal */}
      <AnimatePresence>
        {showPreview && selectedTemplate && (
          <AnimatedModal
            isOpen={showPreview}
            onClose={() => setShowPreview(false)}
            title={`Preview: ${selectedTemplate.name}`}
          >
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Template Overview</h4>
                <p className="text-gray-600 text-sm">{selectedTemplate.description}</p>
                <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                  <span>Questions: {selectedTemplate.questions.length}</span>
                  <span>Time: {selectedTemplate.estimatedTime}</span>
                  <span>Category: {selectedTemplate.category}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Questions Preview</h4>
                {selectedTemplate.questions.map((question, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Q{index + 1}: {question.title}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {question.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {question.type === 'categorize' && `${question.categories?.length || 0} categories, ${question.items?.length || 0} items`}
                      {question.type === 'cloze' && `Cloze sentence with ${question.blanks?.length || 0} blanks`}
                      {question.type === 'comprehension' && `Passage with ${question.questions?.length || 0} questions`}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <AnimatedButton
                  onClick={handleUseTemplate}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Use This Template
                </AnimatedButton>
                <AnimatedButton
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </AnimatedButton>
              </div>
            </div>
          </AnimatedModal>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FormTemplates;
