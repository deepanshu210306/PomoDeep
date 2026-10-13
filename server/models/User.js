import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    /** Persisted app preferences + tasks loaded on login */
    data: {
      theme: { type: mongoose.Schema.Types.Mixed, default: null },
      settings: { type: mongoose.Schema.Types.Mixed, default: null },
      tasks: { type: [mongoose.Schema.Types.Mixed], default: [] },
      focusTaskId: { type: String, default: null },
      streak: { type: mongoose.Schema.Types.Mixed, default: null },
      pomodoro: { type: mongoose.Schema.Types.Mixed, default: null },
      stopwatch: { type: mongoose.Schema.Types.Mixed, default: null },
      study: { type: mongoose.Schema.Types.Mixed, default: null },
      /** Per-day study stopwatch totals: { "YYYY-MM-DD": ms } */
      studyHistory: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
  },
  { timestamps: true },
);

export const User = mongoose.model('User', userSchema);
