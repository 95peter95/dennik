import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Input, Text, Heading, VStack, SimpleGrid, Image } from '@chakra-ui/react';
import CanvasDraw from 'react-canvas-draw';
import axios from 'axios';

const DrawPage = () => {
  const [posts, setPosts] = useState([]); // To hold the list of posts
  const [showForm, setShowForm] = useState(false); // Toggle for new post form
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [nameError, setNameError] = useState(false); // Error state for name input
  const [subjectError, setSubjectError] = useState(false); // Error state for subject input
  const [selectedPostId, setSelectedPostId] = useState(null); // Track which post is being commented on
  const [commentContent, setCommentContent] = useState("");  // For new comment content
  const [commentAuthor, setCommentAuthor] = useState("");  // For new comment author
  const canvasRef = useRef(null);

  // Fetch all posts when the page loads
  useEffect(() => {
    fetchPosts();
  }, []);

  // Fetch all posts from the backend
const fetchPosts = async () => {
  try {
    const response = await axios.get('/api/posts');
    // Sort posts by createdAt in descending order
    const sortedPosts = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Sort comments for each post by createdAt in descending order
    const sortedPostsWithSortedComments = sortedPosts.map(post => ({
      ...post,
      comments: post.comments ? post.comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : []
    }));

    setPosts(sortedPostsWithSortedComments);
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
};

  const savePost = () => {
    setNameError(false);
    setSubjectError(false);

    // Check for empty fields
    if (!name) setNameError(true);
    if (!subject) setSubjectError(true);

    if (name && subject && canvasRef.current) {
      const canvasImage = canvasRef.current.getDataURL(); // Safer method to get canvas image
      axios.post('/api/posts', { name, subject, image: canvasImage })
        .then(() => {
          setShowForm(false); // Hide the form after saving
          fetchPosts(); // Refresh the list of posts
          setName(""); // Reset name input
          setSubject(""); // Reset subject input
          canvasRef.current.clear(); // Clear the canvas
        })
        .catch(error => console.error("Error saving post:", error));
    }
  };

  // Function to clear the canvas
  const clearCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
  };

  // Submit comment to the backend
  const addComment = async (postId) => {
    if (commentAuthor && commentContent) {
      try {
        await axios.post(`/api/posts/${postId}/comments`, { author: commentAuthor, comment: commentContent });
        setSelectedPostId(null); // Close the comment input
        setCommentContent(""); // Clear input field
        setCommentAuthor(""); // Clear author field
        fetchPosts(); // Refresh the posts after adding the comment
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    }
  };

  const formatDateToSlovak = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sk-SK', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <Box bg='tomato' w='100%' p={4} color='black'>
      {!showForm && (
        <Button colorScheme="green" onClick={() => setShowForm(true)}>Pridaj novy odkaz</Button>
      )}

      {/* Render the form to create a new post */}
      {showForm && (
        <Box w={{ base: '100%', md: '80%', lg: '60%' }} p={4} color='black' mt={0}>
          <Heading as="h2" size="lg" mb={4}>Pridaj odkaz</Heading>
          <VStack spacing={4} mt={6}>
            {nameError && (
              <Heading as="p" size="md" color="red.500">VYPLN MENO A ODKAZ!!!😼</Heading>
            )}
            <Input
              w={{ base: '100%', sm: '80%', md: '60%', lg: '50%' }}
              placeholder="Tvoje meno"
              value={name}
              onChange={e => setName(e.target.value)}
              borderColor={nameError ? 'yellow.500' : 'gray.200'}
              _focus={{ borderColor: nameError ? 'yellow.500' : 'gray.200' }}
            />
            <Input
              w={{ base: '100%', sm: '80%', md: '70%', lg: '60%' }}
              placeholder="Napis nieco"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              borderColor={subjectError ? 'red.500' : 'gray.200'}
              _focus={{ borderColor: subjectError ? 'red.500' : 'blue.500' }}
            />
            <Box
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              boxShadow="md"
              p={2}
              mb={4}
              w={{ base: '100%', md: '80%', lg: '70%' }}
            >
              <CanvasDraw ref={canvasRef} brushColor="black" brushRadius={2} canvasWidth={300} canvasHeight={250} style={{ borderRadius: '8px', width: '100%' }} />
            </Box>

            <Box display="flex" justifyContent="space-between" w="full" flexWrap="wrap">
              <Button colorScheme="green" borderRadius="8px" mr={2} mb={2} onClick={savePost}>Ulozit</Button>
              <Button colorScheme="yellow" borderRadius="8px" mr={2} mb={2} onClick={clearCanvas}>Reset</Button>
              <Button colorScheme="red" borderRadius="8px" mb={2} onClick={() => setShowForm(false)}>Spat</Button>
            </Box>
          </VStack>
        </Box>
      )}

      {/* Render all posts */}
      <VStack spacing={4} mt={12}>
        <Heading as="h2" size="lg" style={{ marginTop: '-20px', color: 'black' }}>DENNICEK 🐹</Heading>
        <SimpleGrid columns={[1, null, 2]} spacing="40px" width="full">
          {posts.map(post => (
            <Box key={post._id} borderWidth="1px" borderRadius="lg" overflow="hidden" p={4}>
              <Heading as="h4" size="md">{post.name}</Heading>
              <Text>{post.subject}</Text>
              <Image src={post.image} alt="Painting" width="100%" height="auto" borderRadius="md" />
              <Text as="p" style={{ fontSize: "0.6em" }}>Pridane dna {formatDateToSlovak(post.createdAt)}</Text>

              {/* Render all comments if they exist */}
              {post.comments && post.comments.length > 0 && post.comments.map((comment, index) => (
                <Text key={index} as="p" style={{ fontSize: "0.6em" }}>
                  {comment.author} komentoval dňa {formatDateToSlovak(comment.createdAt)}: {comment.comment}
                </Text>
              ))}

              {/* Show comment form if selected */}
              {selectedPostId === post._id ? (
                <Box mt={4}>
                  <Input
                    placeholder="Tvoje meno"
                    value={commentAuthor}
                    onChange={(e) => setCommentAuthor(e.target.value)}
                    mb={2}
                  />
                  <Input
                    placeholder="Tvoj komentar"
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    mb={2}
                  />
                  <Button
                    colorScheme="green"
                    style={{ width: '80px', height: '20px', fontSize: '0.6em' }}
                    onClick={() => addComment(post._id)}
                  >
                    Odoslat
                  </Button>
                  <Button
                    colorScheme="red"
                    style={{ width: '80px', height: '20px', fontSize: '0.6em', marginLeft: '10px' }}
                    onClick={() => setSelectedPostId(null)}
                  >
                    Zrusit
                  </Button>
                </Box>
              ) : (
                <Button
                  colorScheme="green"
                  style={{ width: '80px', height: '20px', fontSize: '0.6em' }}
                  onClick={() => setSelectedPostId(post._id)}
                >
                  Pridaj komentar
                </Button>
              )}
            </Box>
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default DrawPage;
