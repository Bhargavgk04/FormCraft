import { Form } from '../models/Form.model.js';

export async function listForms(req, res, next) {
  try {
    const forms = await Form.find({ userId: req.user.id })
      .populate('responsesCount')
      .lean();
    
    const formsWithResponseCount = forms.map(form => ({
      ...form,
      responsesCount: form.responsesCount || 0
    }));
    
    res.json(formsWithResponseCount);
  } catch (err) {
    next(err);
  }
}

export async function createForm(req, res, next) {
  try {
    const { title, description, headerImage, questions } = req.body;
    
    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Form title is required' });
    }
    
    // Validate and clean questions data
    const cleanedQuestions = Array.isArray(questions) ? questions.map(q => {
      const cleanedQuestion = {
        id: q.id || Date.now().toString(),
        type: q.type,
        title: q.title || '',
        points: typeof q.points === 'number' ? q.points : 1,
      };
      
      // Add type-specific data with validation
      if (q.type === 'categorize') {
        cleanedQuestion.categories = Array.isArray(q.categories) ? q.categories.filter(cat => cat && cat.trim()) : [];
        cleanedQuestion.items = Array.isArray(q.items) ? q.items.filter(item => item && item.trim()) : [];
        // Convert Map to plain object for proper storage
        cleanedQuestion.itemAssignments = q.itemAssignments ? 
          (q.itemAssignments instanceof Map ? 
            Object.fromEntries(q.itemAssignments) : 
            q.itemAssignments) : 
          {};
        
        console.log('Cleaned categorize question:', {
          categories: cleanedQuestion.categories,
          items: cleanedQuestion.items,
          itemAssignments: cleanedQuestion.itemAssignments
        });
      } else if (q.type === 'cloze') {
        cleanedQuestion.sentence = q.sentence || '';
        cleanedQuestion.blanks = Array.isArray(q.blanks) ? q.blanks.map(blank => ({
          id: blank.id || Date.now().toString(),
          inputType: blank.inputType || 'text',
          answer: blank.answer || '',
          options: Array.isArray(blank.options) ? blank.options.filter(opt => opt && opt.trim()) : []
        })) : [];
      } else if (q.type === 'comprehension') {
        cleanedQuestion.passage = q.passage || '';
        cleanedQuestion.questions = Array.isArray(q.questions) ? q.questions.map(subQ => ({
          id: subQ.id || Date.now().toString(),
          question: subQ.question || '',
          options: Array.isArray(subQ.options) ? subQ.options.filter(opt => opt && opt.trim()) : [],
          correctAnswer: typeof subQ.correctAnswer === 'number' ? subQ.correctAnswer : 0
        })) : [];
      }
      
      return cleanedQuestion;
    }) : [];
    
    const formData = {
      title: title.trim(),
      description: description || '',
      headerImage: headerImage || '',
      questions: cleanedQuestions,
      userId: req.user.id
    };
    
    console.log('Creating form with data:', JSON.stringify(formData, null, 2));
    
    // Debug: Check itemAssignments specifically
    formData.questions.forEach((q, index) => {
      if (q.type === 'categorize') {
        console.log(`Question ${index + 1} itemAssignments:`, {
          raw: q.itemAssignments,
          type: typeof q.itemAssignments,
          keys: Object.keys(q.itemAssignments || {}),
          stringified: JSON.stringify(q.itemAssignments)
        });
      }
    });
    
    const form = new Form(formData);
    const savedForm = await form.save();
    
    console.log('Form created successfully:', savedForm._id);
    
    // Debug: Check what was actually saved
    const savedFormData = await Form.findById(savedForm._id);
    console.log('Saved form data verification:', {
      questionsCount: savedFormData.questions?.length,
      categoryQuestions: savedFormData.questions?.filter(q => q.type === 'categorize').map(q => ({
        id: q.id,
        categories: q.categories,
        items: q.items,
        itemAssignments: q.itemAssignments,
        itemAssignmentsType: typeof q.itemAssignments
      }))
    });
    
    res.status(201).json(savedForm);
  } catch (err) {
    console.error('Error creating form:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(err.errors).map(e => e.message) 
      });
    }
    next(err);
  }
}

export async function getForm(req, res, next) {
  try {
    const { id } = req.params;
    const form = await Form.findById(id);
    
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    
    // Check if user owns this form
    if (form.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Debug: Log category question data
    if (form.questions) {
      form.questions.forEach((q, index) => {
        if (q.type === 'categorize') {
          console.log(`Form ${id} - Category Question ${index + 1}:`, {
            questionId: q.id,
            categories: q.categories,
            items: q.items,
            itemAssignments: q.itemAssignments,
            itemAssignmentsType: typeof q.itemAssignments,
            isMap: q.itemAssignments instanceof Map
          });
        }
      });
    }
    
    res.json(form);
  } catch (err) {
    next(err);
  }
}

export async function updateForm(req, res, next) {
  try {
    const { id } = req.params;
    const form = await Form.findById(id);
    
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    
    // Check if user owns this form
    if (form.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Clean and validate the update data
    const updateData = { ...req.body };
    
    // If questions are being updated, clean them
    if (updateData.questions && Array.isArray(updateData.questions)) {
      updateData.questions = updateData.questions.map(q => {
        const cleanedQuestion = {
          id: q.id || Date.now().toString(),
          type: q.type,
          title: q.title || '',
          points: typeof q.points === 'number' ? q.points : 1,
        };
        
        // Add type-specific data with validation
        if (q.type === 'categorize') {
          cleanedQuestion.categories = Array.isArray(q.categories) ? q.categories.filter(cat => cat && cat.trim()) : [];
          cleanedQuestion.items = Array.isArray(q.items) ? q.items.filter(item => item && item.trim()) : [];
          // Convert Map to plain object for proper storage
          cleanedQuestion.itemAssignments = q.itemAssignments ? 
            (q.itemAssignments instanceof Map ? 
              Object.fromEntries(q.itemAssignments) : 
              q.itemAssignments) : 
            {};
        } else if (q.type === 'cloze') {
          cleanedQuestion.sentence = q.sentence || '';
          cleanedQuestion.blanks = Array.isArray(q.blanks) ? q.blanks.map(blank => ({
            id: blank.id || Date.now().toString(),
            inputType: blank.inputType || 'text',
            answer: blank.answer || '',
            options: Array.isArray(blank.options) ? blank.options.filter(opt => opt && opt.trim()) : []
          })) : [];
        } else if (q.type === 'comprehension') {
          cleanedQuestion.passage = q.passage || '';
          cleanedQuestion.questions = Array.isArray(q.questions) ? q.questions.map(subQ => ({
            id: subQ.id || Date.now().toString(),
            question: subQ.question || '',
            options: Array.isArray(subQ.options) ? subQ.options.filter(opt => opt && opt.trim()) : [],
            correctAnswer: typeof subQ.correctAnswer === 'number' ? subQ.correctAnswer : 0
          })) : [];
        }
        
        return cleanedQuestion;
      });
    }
    
    console.log('Updating form with data:', JSON.stringify(updateData, null, 2));
    
    // Debug: Check itemAssignments specifically in update
    if (updateData.questions) {
      updateData.questions.forEach((q, index) => {
        if (q.type === 'categorize') {
          console.log(`Update - Question ${index + 1} itemAssignments:`, {
            raw: q.itemAssignments,
            type: typeof q.itemAssignments,
            keys: Object.keys(q.itemAssignments || {}),
            stringified: JSON.stringify(q.itemAssignments)
          });
        }
      });
    }
    
    const updatedForm = await Form.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    console.log('Form updated successfully:', updatedForm._id);
    
    // Debug: Verify what was actually saved
    const savedFormData = await Form.findById(updatedForm._id);
    console.log('Updated form data verification:', {
      questionsCount: savedFormData.questions?.length,
      categoryQuestions: savedFormData.questions?.filter(q => q.type === 'categorize').map(q => ({
        id: q.id,
        categories: q.categories,
        items: q.items,
        itemAssignments: q.itemAssignments,
        itemAssignmentsType: typeof q.itemAssignments
      }))
    });
    
    res.json(updatedForm);
  } catch (err) {
    console.error('Error updating form:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(err.errors).map(e => e.message) 
      });
    }
    next(err);
  }
}

export async function deleteForm(req, res, next) {
  try {
    const { id } = req.params;
    const form = await Form.findById(id);
    
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    
    // Check if user owns this form
    if (form.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await Form.findByIdAndDelete(id);
    
    res.json({ message: 'Form deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function publishForm(req, res, next) {
  try {
    const { id } = req.params;
    const form = await Form.findById(id);
    
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    
    // Check if user owns this form
    if (form.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const updatedForm = await Form.findByIdAndUpdate(
      id, 
      { status: 'published' }, 
      { new: true }
    );
    
    res.json(updatedForm);
  } catch (err) {
    next(err);
  }
}

export async function unpublishForm(req, res, next) {
  try {
    const { id } = req.params;
    const form = await Form.findById(id);
    
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    
    // Check if user owns this form
    if (form.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const updatedForm = await Form.findByIdAndUpdate(
      id, 
      { status: 'unpublished' }, 
      { new: true }
    );
    
    res.json(updatedForm);
  } catch (err) {
    next(err);
  }
}

export async function getPublishedForms(req, res, next) {
  try {
    // Get all published forms that users can browse and fill
    const forms = await Form.find({ status: 'published' })
      .select('title description headerImage questions createdAt responsesCount')
      .lean();
    
    // Add response count if not present
    const formsWithResponseCount = forms.map(form => ({
      ...form,
      responsesCount: form.responsesCount || 0
    }));
    
    console.log(`Found ${formsWithResponseCount.length} published forms`);
    res.json(formsWithResponseCount);
  } catch (err) {
    console.error('Error getting published forms:', err);
    next(err);
  }
}

export async function getPublishedFormById(req, res, next) {
  try {
    const { id } = req.params;
    const form = await Form.findOne({ _id: id, status: 'published' }).lean();
    if (!form) {
      return res.status(404).json({ message: 'Form not found or not published' });
    }
    res.json(form);
  } catch (err) {
    next(err);
  }
}


