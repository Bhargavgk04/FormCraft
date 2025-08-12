import mongoose from 'mongoose';

const AnswerSchema = new mongoose.Schema(
  {},
  { strict: false, _id: false }
);

const ResponseSchema = new mongoose.Schema(
  {
    formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
    respondentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    respondentName: { type: String, required: true },
    respondentEmail: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now },
    answers: { type: AnswerSchema, required: true },
    metadata: {
      userAgent: String,
      ipAddress: String,
      location: String,
    },
    // Scoring fields
    score: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
    scorePercentage: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Response = mongoose.model('Response', ResponseSchema);


