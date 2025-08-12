import { Form } from '../models/Form.model.js';
import { Response } from '../models/Response.model.js';

export async function getFormAnalytics(req, res, next) {
  try {
    const { formId } = req.params;
    const { timeRange = '7d' } = req.query;

    // Get form details
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get responses for the time range
    const responses = await Response.find({
      formId,
      submittedAt: { $gte: startDate }
    }).sort({ submittedAt: 1 });

    // Calculate analytics
    const totalResponses = responses.length;
    const completionRate = calculateCompletionRate(responses, form.questions);
    const averageTime = calculateAverageTime(responses);
    const questionStats = calculateQuestionStats(responses, form.questions);
    const responseTrends = calculateResponseTrends(responses, startDate, now);
    const topRespondents = calculateTopRespondents(responses);

    res.json({
      formId,
      timeRange,
      totalResponses,
      completionRate,
      averageTime,
      questionStats,
      responseTrends,
      topRespondents,
      lastUpdated: new Date()
    });
  } catch (err) {
    next(err);
  }
}

export async function getDashboardAnalytics(req, res, next) {
  try {
    const userId = req.user.id;
    const { timeRange = '7d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get user's forms
    const forms = await Form.find({ userId });
    const formIds = forms.map(f => f._id);

    // Get responses for user's forms
    const responses = await Response.find({
      formId: { $in: formIds },
      submittedAt: { $gte: startDate }
    });

    // Calculate dashboard analytics
    const totalForms = forms.length;
    const totalResponses = responses.length;
    const averageResponsesPerForm = totalForms > 0 ? totalResponses / totalForms : 0;
    const formPerformance = await calculateFormPerformance(forms, responses, startDate);
    const recentActivity = await getRecentActivity(forms, responses, 10);

    res.json({
      timeRange,
      totalForms,
      totalResponses,
      averageResponsesPerForm,
      formPerformance,
      recentActivity,
      lastUpdated: new Date()
    });
  } catch (err) {
    next(err);
  }
}

// Helper functions
function calculateCompletionRate(responses, questions) {
  if (responses.length === 0) return 0;
  
  const totalPossibleAnswers = responses.length * questions.length;
  let completedAnswers = 0;
  
  responses.forEach(response => {
    if (response.answers) {
      Object.keys(response.answers).forEach(questionId => {
        const answer = response.answers[questionId];
        if (answer && (answer.text || answer.selected || answer.categories)) {
          completedAnswers++;
        }
      });
    }
  });
  
  return Math.round((completedAnswers / totalPossibleAnswers) * 100);
}

function calculateAverageTime(responses) {
  if (responses.length === 0) return 0;
  
  const totalTime = responses.reduce((sum, response) => {
    return sum + (response.timeSpent || 0);
  }, 0);
  
  return Math.round(totalTime / responses.length);
}

function calculateQuestionStats(responses, questions) {
  return questions.map(question => {
    const questionResponses = responses.filter(response => 
      response.answers && response.answers[question.id]
    );
    
    let correctRate = 0;
    if (question.type === 'comprehension' && question.questions) {
      const totalAnswers = questionResponses.length * question.questions.length;
      let correctAnswers = 0;
      
      questionResponses.forEach(response => {
        const answer = response.answers[question.id];
        if (answer && answer.questions) {
          question.questions.forEach((q, index) => {
            if (answer.questions[index] === q.correctAnswer) {
              correctAnswers++;
            }
          });
        }
      });
      
      correctRate = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
    }
    
    return {
      questionId: question.id,
      question: question.title || `Question ${question.id}`,
      type: question.type,
      correctRate,
      totalAnswers: questionResponses.length
    };
  });
}

function calculateResponseTrends(responses, startDate, endDate) {
  const trends = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayResponses = responses.filter(response => {
      const responseDate = response.submittedAt.toISOString().split('T')[0];
      return responseDate === dateStr;
    });
    
    trends.push({
      date: dateStr,
      responses: dayResponses.length
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return trends;
}

function calculateTopRespondents(responses) {
  const respondentMap = new Map();
  
  responses.forEach(response => {
    const key = response.respondentEmail || response.respondentId || 'Anonymous';
    if (!respondentMap.has(key)) {
      respondentMap.set(key, {
        name: response.respondentName || key,
        responses: 0,
        totalTime: 0
      });
    }
    
    const respondent = respondentMap.get(key);
    respondent.responses++;
    respondent.totalTime += response.timeSpent || 0;
  });
  
  return Array.from(respondentMap.values())
    .map(respondent => ({
      ...respondent,
      avgTime: Math.round(respondent.totalTime / respondent.responses)
    }))
    .sort((a, b) => b.responses - a.responses)
    .slice(0, 10);
}

async function calculateFormPerformance(forms, responses, startDate) {
  return forms.map(form => {
    const formResponses = responses.filter(response => 
      response.formId.toString() === form._id.toString()
    );
    
    const recentResponses = formResponses.filter(response => 
      response.submittedAt >= startDate
    );
    
    return {
      formId: form._id,
      title: form.title,
      totalResponses: formResponses.length,
      recentResponses: recentResponses.length,
      completionRate: calculateCompletionRate(formResponses, form.questions),
      lastResponse: formResponses.length > 0 ? 
        Math.max(...formResponses.map(r => r.submittedAt)) : null
    };
  }).sort((a, b) => b.recentResponses - a.recentResponses);
}

async function getRecentActivity(forms, responses, limit) {
  const allActivities = [];
  
  // Add form creation activities
  forms.forEach(form => {
    allActivities.push({
      type: 'form_created',
      title: form.title,
      timestamp: form.createdAt,
      formId: form._id
    });
  });
  
  // Add response activities
  responses.forEach(response => {
    const form = forms.find(f => f._id.toString() === response.formId.toString());
    if (form) {
      allActivities.push({
        type: 'response_submitted',
        title: `Response to ${form.title}`,
        timestamp: response.submittedAt,
        formId: response.formId,
        respondentName: response.respondentName || 'Anonymous'
      });
    }
  });
  
  return allActivities
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}
