import mongoose from 'mongoose';

// Define the schema for a Comment
const commentSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
}, {
  timestamps: true
}
);

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
    type: String,
    required: true
  },
  comments: [commentSchema],
},
{
  timestamps: true
}
);

// Create the model for Post and export it
const Post = mongoose.model('Post', postSchema);

export default Post;
