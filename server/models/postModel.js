import mongoose from 'mongoose';

// Define the schema for a Post
const postSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  image: {
    type: String,  // Base64 image string
    required: true
  },
},
{
  timestamps: true
}
);

// Create the model for Post and export it
const Post = mongoose.model('Post', postSchema);

export default Post;
