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

// PostComment Controller
export const postComment = asyncHandler(async (req, res) => {
  try {
    const postId = req.params.id;
    const { author, comment } = req.body;

    // Find the post by its ID and update it by pushing the new comment
    const post = await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: { author, comment } } }, // Add new comment to comments array
      { new: true } // Return the updated post
    );

    if (!post) {
      return res.status(404).json({ message: "AHAHAH not found" }); // Return 404 if the post is not found
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Error adding comment", error });
  }
});
