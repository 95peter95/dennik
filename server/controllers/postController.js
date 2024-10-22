import Post from '../models/postModel.js';
import asyncHandler from "../middleware/asyncHandler.js";

// Create a new post
export const createPost = asyncHandler(async (req, res) => {
  const { name, subject, image } = req.body;

    // Create a new post instance
    const newPost = new Post({ name, subject, image });
    // Save the post to MongoDB
    await newPost.save();

    res.status(200).json({ message: "Post saved successfully!" });
  });

// Get all posts
export const getAllPosts = asyncHandler(async (req, res) => {
    const posts = await Post.find({});
    res.json(posts);
  });

export const getPostById = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if(post) {
      return res.json(post);
    } else {
        res.status(404);
        throw new Error();
    }
});
