const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

function getAuthHeaders() {
  const auth = sessionStorage.getItem('auth') || localStorage.getItem('auth');
  if (auth) {
    const { token } = JSON.parse(auth);
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

async function http(method, path, body, requireAuth = false) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        ...(requireAuth ? getAuthHeaders() : {})
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!res.ok) {
      let errorMessage;
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.error || `HTTP ${res.status}`;
      } catch {
        errorMessage = await res.text() || `HTTP ${res.status}`;
      }
      throw new Error(errorMessage);
    }
    
    return res.json();
  } catch (error) {
    console.error(`API Error (${method} ${path}):`, error);
    throw error;
  }
}

export const api = {
  // Forms - require authentication
  listForms: () => http('GET', '/forms', null, true),
  getForm: (id) => http('GET', `/forms/${id}`, null, true),
  getPublishedForm: (id) => http('GET', `/forms/published/${id}`, null, false),
  createForm: (data) => http('POST', '/forms', data, true),
  updateForm: (id, data) => http('PUT', `/forms/${id}`, data, true),
  deleteForm: (id) => http('DELETE', `/forms/${id}`, null, true),
  publishForm: (id) => http('PATCH', `/forms/${id}/publish`, null, true),
  unpublishForm: (id) => http('PATCH', `/forms/${id}/unpublish`, null, true),
  getPublishedForms: () => http('GET', '/forms/published', null, false), // Public access
  // Responses - require authentication
  createResponse: (data) => http('POST', '/responses', data, true),
  listResponsesForForm: (formId) => http('GET', `/responses/${formId}`, null, true),
  getResponseById: (formId, responseId) => http('GET', `/responses/${formId}/${responseId}`, null, true),
  listAllResponses: () => http('GET', '/responses', null, true),
  getUserResponses: () => http('GET', '/responses/user', null, true),
  // Analytics - require authentication
  getFormAnalytics: (formId, timeRange = '7d') => http('GET', `/analytics/forms/${formId}?timeRange=${timeRange}`, null, true),
  getDashboardAnalytics: (timeRange = '7d') => http('GET', `/analytics/dashboard?timeRange=${timeRange}`, null, true),
  // Auth
  register: (data) => http('POST', '/auth/register', data),
  login: (data) => http('POST', '/auth/login', data),
};

export default api;


