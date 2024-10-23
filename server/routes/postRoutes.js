import express from 'express';
import { createPost, getAllPosts, getPostById, postComment } from '../controllers/postController.js';

const router = express.Router();

// Route to create a new post
router.post('/', createPost);

// Route to get all posts
router.get('/', getAllPosts);

// Route to get post by id
router.get('/:id', getPostById);

// Backend route to add a comment to a post
router.post('/:id/comments', postComment);

export default router;
