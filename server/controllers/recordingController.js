import asyncHandler from "../middleware/asyncHandler.js";
import Recording from '../models/recordingModel.js';

// Create a new recording
export const createRecording = asyncHandler(async (req, res) => {
  try {
    const { author, subject } = req.body;
    const mp3Data = req.file.buffer;

    const newRecording = new Recording({
      author,
      subject,
      mp3: mp3Data,
    });

    await newRecording.save();
    res.status(201).json({ message: 'Recording saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving recording', error });
  }
});

// Get all recordings with base64-encoded mp3 data
export const getAllRecordings = asyncHandler(async (req, res) => {
  try {
    const recordings = await Recording.find({});

    const recordingsWithBase64 = recordings.map(recording => ({
      _id: recording._id,
      author: recording.author,
      subject: recording.subject,
      mp3: recording.mp3.toString('base64'),  // Convert mp3 buffer to base64 string
      createdAt: recording.createdAt,
      updatedAt: recording.updatedAt,
    }));

    res.json(recordingsWithBase64);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recordings', error });
  }
});

