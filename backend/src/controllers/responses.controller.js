import { Response } from '../models/Response.model.js';
import { Form } from '../models/Form.model.js';
import { User } from '../models/User.model.js';

export async function createResponse(req, res, next) {
  try {
    const { formId, answers, metadata } = req.body;
    
    // Verify form exists and is published
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    
    if (form.status !== 'published') {
      return res.status(403).json({ message: 'This form is not accepting responses' });
    }
    
    // Verify user is authenticated and matches the respondent
    if (!req.user) {
      return res.status(403).json({ message: 'Authentication required and user must match respondent' });
    }
    
    // Create response with proper user mapping
    // Compute score based on form definition
    const computeScore = () => {
      let score = 0;
      let maxScore = 0;

      console.log('Computing score for form:', form._id);
      console.log('User answers:', answers);
      console.log('Form questions:', form.questions);

      for (const q of form.questions || []) {
        const questionPoints = Number(q.points || 1);
        maxScore += questionPoints;
        
        console.log(`Processing question ${q.id} (${q.type}):`, q);
        console.log(`Question points: ${questionPoints}, Max score so far: ${maxScore}`);
        
        if (q.type === 'cloze') {
          const provided = answers?.[q.id]?.answers || [];
          const correct = q.blanks?.map(b => b.answer) || [];
          const len = Math.max(provided.length, correct.length);
          
          console.log(`Cloze question - Provided: ${JSON.stringify(provided)}, Correct: ${JSON.stringify(correct)}`);
          
          if (len > 0) {
            const perBlank = questionPoints / len;
            for (let i = 0; i < len; i++) {
              if (i < provided.length && i < correct.length) {
                const userAnswer = (provided[i] || '').toString().trim().toLowerCase();
                const correctAnswer = (correct[i] || '').toString().trim().toLowerCase();
                const isCorrect = userAnswer === correctAnswer;
                if (isCorrect) {
                  score += perBlank;
                }
                console.log(`Blank ${i}: User="${userAnswer}", Correct="${correctAnswer}", IsCorrect=${isCorrect}, Points=${perBlank}, Score=${score}`);
              }
            }
          }
        } else if (q.type === 'comprehension') {
          const provided = answers?.[q.id]?.answers || [];
          const correctAnswers = q.questions?.map(sq => sq.correctAnswer) || [];
          const len = Math.max(provided.length, correctAnswers.length);
          
          console.log(`Comprehension question - Provided: ${JSON.stringify(provided)}, Correct: ${JSON.stringify(correctAnswers)}`);
          
          if (len > 0) {
            const perSub = questionPoints / len;
            for (let i = 0; i < len; i++) {
              if (i < provided.length && i < correctAnswers.length) {
                const userAnswer = parseInt(provided[i]);
                const correctAnswer = correctAnswers[i];
                // Convert 0-based to 1-based if needed
                const normalizedCorrect = (typeof correctAnswer === 'number' && correctAnswer >= 0) 
                  ? correctAnswer + 1 
                  : correctAnswer;
                const isCorrect = userAnswer === normalizedCorrect;
                if (isCorrect) {
                  score += perSub;
                }
                console.log(`Sub-question ${i}: User=${userAnswer}, Correct=${normalizedCorrect}, IsCorrect=${isCorrect}, Points=${perSub}, Score=${score}`);
              }
            }
          }
        } else if (q.type === 'categorize') {
          const providedMap = answers?.[q.id]?.categories || {};
          const correctMap = q.itemAssignments || {};
          
          console.log(`Categorize question - Provided: ${JSON.stringify(providedMap)}, Correct: ${JSON.stringify(correctMap)}`);
          console.log(`Question details - Categories: ${JSON.stringify(q.categories)}, Items: ${JSON.stringify(q.items)}`);
          
          if (Object.keys(correctMap).length > 0 && q.categories && q.items) {
            const perItem = questionPoints / q.items.length;
            console.log(`Points per item: ${perItem}`);
            
            for (let i = 0; i < q.items.length; i++) {
              const item = q.items[i];
              const correctCategoryIndex = correctMap[i];
              
              console.log(`\n--- Processing Item ${i}: "${item}" ---`);
              console.log(`Correct category index: ${correctCategoryIndex}`);
              
              if (correctCategoryIndex !== undefined && correctCategoryIndex < q.categories.length) {
                const correctCategory = q.categories[correctCategoryIndex];
                console.log(`Correct category name: "${correctCategory}"`);
                
                // Find which category the user placed this item in
                let userCategory = null;
                for (const [catName, items] of Object.entries(providedMap)) {
                  if (Array.isArray(items) && items.includes(item)) {
                    userCategory = catName;
                    break;
                  }
                }
                
                console.log(`User placed item in category: "${userCategory}"`);
                console.log(`User's provided map:`, providedMap);
                
                // Normalize category names for comparison (trim whitespace, handle case)
                const normalizedCorrectCategory = correctCategory.trim().toLowerCase();
                const normalizedUserCategory = userCategory ? userCategory.trim().toLowerCase() : null;
                
                const isCorrect = normalizedUserCategory === normalizedCorrectCategory;
                console.log(`Normalized comparison: "${normalizedUserCategory}" === "${normalizedCorrectCategory}" = ${isCorrect}`);
                
                if (isCorrect) {
                  score += perItem;
                  console.log(`✅ CORRECT! Adding ${perItem} points. New score: ${score}`);
                } else {
                  console.log(`❌ INCORRECT! No points added. Current score: ${score}`);
                }
              } else {
                console.log(`⚠️ Invalid category index: ${correctCategoryIndex} (max: ${q.categories.length - 1})`);
              }
            }
          } else {
            console.log(`⚠️ Missing data for scoring: correctMap=${Object.keys(correctMap).length}, categories=${q.categories?.length}, items=${q.items?.length}`);
          }
        }
      }
      
      const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      console.log(`Final score: ${score}/${maxScore} = ${percentage}%`);
      return { score: parseFloat(score.toFixed(2)), maxScore, scorePercentage: percentage };
    };

    const { score, maxScore, scorePercentage } = computeScore();

    const responseData = {
      formId,
      respondentId: req.user.id,
      respondentName: req.user.name,
      respondentEmail: req.user.email,
      answers,
      metadata: metadata || {},
      score,
      maxScore,
      scorePercentage,
    };

    console.log('Saving response to database:', responseData);

    const response = new Response(responseData);
    const savedResponse = await response.save();
    
    console.log('Response saved successfully:', savedResponse._id);
    
    // Populate user information for response
    const populatedResponse = await Response.findById(savedResponse._id)
      .populate('respondentId', 'name email role')
      .populate('formId', 'title');
    
    res.status(201).json(populatedResponse);
  } catch (err) {
    console.error('Error creating response:', err);
    next(err);
  }
}

export async function getResponseById(req, res, next) {
  try {
    const { formId, responseId } = req.params;

    // Verify form exists and user has access
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    const response = await Response.findOne({ _id: responseId, formId })
      .populate('respondentId', 'name email role')
      .populate('formId', 'title description headerImage questions');

    if (!response) {
      return res.status(404).json({ message: 'Response not found' });
    }

    // Access control: allow form owner (admin) OR the respondent who submitted this response
    const isOwner = form.userId.toString() === req.user.id;
    const isRespondent = response.respondentId && response.respondentId._id
      ? response.respondentId._id.toString() === req.user.id
      : response.respondentId?.toString() === req.user.id;
    if (!isOwner && !isRespondent) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Debug: Log the form data to see what's being populated
    console.log('Form data being returned:', {
      formId: form._id,
      title: form.title,
      questionsCount: form.questions?.length,
      categoryQuestions: form.questions?.filter(q => q.type === 'categorize').map(q => ({
        id: q.id,
        categories: q.categories,
        items: q.items,
        itemAssignments: q.itemAssignments,
        itemAssignmentsType: typeof q.itemAssignments
      }))
    });

    // Ensure the response has all necessary fields
    const enrichedResponse = {
      ...response.toObject(),
      score: response.score || 0,
      maxScore: response.maxScore || 0,
      scorePercentage: response.scorePercentage || 0,
      answers: response.answers || {},
      createdAt: response.createdAt || response.submittedAt || new Date()
    };

    res.json(enrichedResponse);
  } catch (err) {
    console.error('Error in getResponseById:', err);
    next(err);
  }
}

export async function listResponsesForForm(req, res, next) {
  try {
    const { formId } = req.params;
    
    console.log(`Requesting responses for form: ${formId}`);
    
    // Verify form exists and user has access
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    
    if (form.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get responses for this form with populated user information
    const responses = await Response.find({ formId })
      .populate('respondentId', 'name email role')
      .populate('formId', 'title');
    
    // Enrich responses with additional data
    const enrichedResponses = responses.map(response => ({
      ...response.toObject(),
      score: response.score || 0,
      maxScore: response.maxScore || 0,
      scorePercentage: response.scorePercentage || 0,
      answers: response.answers || {},
      submittedAt: response.createdAt || response.submittedAt || new Date(),
      submittedBy: response.respondentId?.role || 'user'
    }));
    
    console.log(`Returning ${enrichedResponses.length} responses`);
    res.json(enrichedResponses);
  } catch (err) {
    console.error('Error in listResponsesForForm:', err);
    next(err);
  }
}

export async function listAllResponses(req, res, next) {
  try {
    console.log('Listing all responses');
    
    // Get all forms owned by the user
    const userForms = await Form.find({ userId: req.user.id });
    const formIds = userForms.map(form => form._id);
    
    // Get responses for user's forms with populated information
    const responses = await Response.find({ formId: { $in: formIds } })
      .populate('respondentId', 'name email role')
      .populate('formId', 'title');
    
    console.log(`Returning ${responses.length} responses`);
    
    // Map responses with form titles and ensure all required fields
    const mapped = responses.map(r => ({
      ...r.toObject(),
      formTitle: r.formId ? r.formId.title : 'Unknown Form',
      score: r.score || 0,
      maxScore: r.maxScore || 0,
      scorePercentage: r.scorePercentage || 0,
      answers: r.answers || {},
      submittedAt: r.createdAt || r.submittedAt || new Date(),
      respondentName: r.respondentName || r.respondentId?.name || 'Anonymous',
      respondentEmail: r.respondentEmail || r.respondentId?.email || 'No email',
    }));
    
    res.json(mapped);
  } catch (err) {
    console.error('Error in listAllResponses:', err);
    next(err);
  }
}

export async function getUserResponses(req, res, next) {
  try {
    console.log('Getting user responses for:', req.user.id);
    
    // Get responses submitted by the current user
    const responses = await Response.find({ respondentId: req.user.id })
      .populate('formId', 'title description')
      .sort({ createdAt: -1 }); // Most recent first
    
    console.log(`Found ${responses.length} responses for user ${req.user.id}`);
    
    // Map responses with form information and ensure all fields are present
    const mapped = responses.map(r => ({
      ...r.toObject(),
      formTitle: r.formId ? r.formId.title : 'Unknown Form',
      formDescription: r.formId ? r.formId.description : '',
      score: r.score || 0,
      maxScore: r.maxScore || 0,
      scorePercentage: r.scorePercentage || 0,
      answers: r.answers || {},
      submittedAt: r.createdAt || r.submittedAt || new Date(),
      formId: r.formId?._id || r.formId
    }));
    
    res.json(mapped);
  } catch (err) {
    console.error('Error in getUserResponses:', err);
    next(err);
  }
}


