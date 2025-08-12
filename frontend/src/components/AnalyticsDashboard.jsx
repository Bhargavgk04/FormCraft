import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, TrendingUp, Clock, Target, PieChart, Download } from 'lucide-react';
import { animations } from '../utils/animations';
import { AnimatedCard, AnimatedContainer } from './AnimatedComponents';
import { api } from '../services/api';

const AnalyticsDashboard = ({ formId }) => {
  const [analytics, setAnalytics] = useState({
    totalResponses: 0,
    completionRate: 0,
    averageTime: 0,
    questionStats: [],
    responseTrends: [],
    topRespondents: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    if (formId) {
      loadAnalytics();
    }
  }, [formId, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      // Mock analytics data - replace with actual API call
      const mockData = {
        totalResponses: 156,
        completionRate: 87.5,
        averageTime: 4.2,
        questionStats: [
          { question: 'Question 1', correctRate: 92, totalAnswers: 156 },
          { question: 'Question 2', correctRate: 78, totalAnswers: 156 },
          { question: 'Question 3', correctRate: 85, totalAnswers: 156 }
        ],
        responseTrends: [
          { date: '2024-01-01', responses: 12 },
          { date: '2024-01-02', responses: 18 },
          { date: '2024-01-03', responses: 15 },
          { date: '2024-01-04', responses: 22 },
          { date: '2024-01-05', responses: 19 },
          { date: '2024-01-06', responses: 25 },
          { date: '2024-01-07', responses: 20 }
        ],
        topRespondents: [
          { name: 'John Doe', responses: 5, avgTime: 3.2 },
          { name: 'Jane Smith', responses: 4, avgTime: 4.1 },
          { name: 'Bob Johnson', responses: 3, avgTime: 5.8 }
        ]
      };
      setAnalytics(mockData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = () => {
    const dataStr = JSON.stringify(analytics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `form-analytics-${formId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <motion.div
        className="flex items-center justify-center h-64"
        variants={animations.pageTransition}
        initial="initial"
        animate="animate"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </motion.div>
    );
  }

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
          <h2 className="text-2xl font-bold text-gray-900">Form Analytics</h2>
          <p className="text-gray-600">Insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={exportAnalytics}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <AnimatedContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatedCard className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Total Responses</p>
              <p className="text-2xl font-bold text-blue-900">{analytics.totalResponses}</p>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-2 bg-green-500 rounded-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Completion Rate</p>
              <p className="text-2xl font-bold text-green-900">{analytics.completionRate}%</p>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600">Avg. Time</p>
              <p className="text-2xl font-bold text-purple-900">{analytics.averageTime}m</p>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-500">
          <div className="flex items-center">
            <div className="p-2 bg-orange-500 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-600">Growth</p>
              <p className="text-2xl font-bold text-orange-900">+12%</p>
            </div>
          </div>
        </AnimatedCard>
      </AnimatedContainer>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Question Performance */}
        <AnimatedCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Performance</h3>
          <div className="space-y-4">
            {analytics.questionStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 truncate">{stat.question}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${stat.correctRate}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{stat.correctRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </AnimatedCard>

        {/* Response Trends */}
        <AnimatedCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Trends</h3>
          <div className="h-48 flex items-end justify-between space-x-1">
            {analytics.responseTrends.map((trend, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-blue-500 rounded-t"
                  style={{
                    height: `${(trend.responses / Math.max(...analytics.responseTrends.map(t => t.responses))) * 100}%`
                  }}
                ></div>
                <span className="text-xs text-gray-500 mt-1">
                  {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </AnimatedCard>
      </div>

      {/* Top Respondents */}
      <AnimatedCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Respondents</h3>
        <div className="space-y-3">
          {analytics.topRespondents.map((respondent, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {respondent.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{respondent.name}</p>
                  <p className="text-sm text-gray-500">{respondent.responses} responses</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{respondent.avgTime}m avg</p>
                <p className="text-xs text-gray-500">Response time</p>
              </div>
            </div>
          ))}
        </div>
      </AnimatedCard>
    </motion.div>
  );
};

export default AnalyticsDashboard;
