import mongoose from 'mongoose';

const ClozeBlankSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    inputType: { type: String, enum: ['options', 'text'], default: 'options' },
    answer: { type: String, default: '' },
    options: { type: [String], default: [] },
  },
  { _id: false }
);

const ComprehensionQuestionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: Number, required: true },
  },
  { _id: false }
);

const QuestionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String, enum: ['categorize', 'cloze', 'comprehension'], required: true },
    title: { type: String, default: '' },
    // Scoring: total points available for this question
    points: { type: Number, default: 1 },
    // Categorize
    categories: { type: [String], default: undefined },
    items: { type: [String], default: undefined },
    itemAssignments: { type: Object, default: {} },
    // Cloze
    sentence: { type: String, default: undefined },
    blanks: { type: [ClozeBlankSchema], default: undefined },
    // Comprehension
    passage: { type: String, default: undefined },
    questions: { type: [ComprehensionQuestionSchema], default: undefined },
  },
  { _id: false }
);

const FormSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    headerImage: { type: String, default: '' },
    questions: { type: [QuestionSchema], default: [] },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['draft', 'published', 'unpublished'], default: 'draft' },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for response count
FormSchema.virtual('responsesCount', {
  ref: 'Response',
  localField: '_id',
  foreignField: 'formId',
  count: true
});

export const Form = mongoose.model('Form', FormSchema);


