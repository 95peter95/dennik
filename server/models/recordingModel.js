import mongoose from 'mongoose';

const recordingSchema = new mongoose.Schema({
  author: { type: String, required: true },
  subject: { type: String, required: true },
  mp3: { type: Buffer, required: true },
},
{
  timestamps: true
}
);

// Create the model for Post and export it
const Recording = mongoose.model('Recording', recordingSchema);

export default Recording;

