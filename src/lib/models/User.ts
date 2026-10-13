import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const userSchema = new Schema(
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
    data: {
      theme: { type: Schema.Types.Mixed, default: null },
      settings: { type: Schema.Types.Mixed, default: null },
      tasks: { type: [Schema.Types.Mixed], default: [] },
      focusTaskId: { type: String, default: null },
      streak: { type: Schema.Types.Mixed, default: null },
      pomodoro: { type: Schema.Types.Mixed, default: null },
      stopwatch: { type: Schema.Types.Mixed, default: null },
      study: { type: Schema.Types.Mixed, default: null },
      studyHistory: { type: Schema.Types.Mixed, default: {} },
    },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const User: Model<UserDoc> =
  (mongoose.models.User as Model<UserDoc>) ||
  mongoose.model<UserDoc>('User', userSchema);

export function publicUser(user: UserDoc) {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
  };
}
