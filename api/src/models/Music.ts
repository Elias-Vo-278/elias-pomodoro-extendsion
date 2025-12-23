import mongoose, { Schema, Document } from 'mongoose';

export interface IMusic extends Document {
  id: number;
  title: string;
  url: string;
}

const MusicSchema: Schema = new Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});

export const Music = mongoose.model<IMusic>('Music', MusicSchema);
