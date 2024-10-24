import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Input, Text, Heading, VStack, SimpleGrid, Image, Radio, RadioGroup, Stack } from '@chakra-ui/react';
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
  const [brushRadius, setBrushRadius] = useState(1); // State for brush radius
  const [brushColor, setBrushColor] = useState('black'); // State for brush color
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

    setPosts(sortedPosts);
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
      month: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  return (
    <Box bg='tomato' w='100%' p={4} color='black'>
      {!showForm && (
        <Button colorScheme="green" onClick={() => setShowForm(true)}>Pridaj novy odkaz</Button>
      )}

      {/* Render the form to create a new post */}
        {showForm && (
          <SimpleGrid columns={[1, null, 1]} spacing="40px" width="auto">
            <Box w={{ base: '100%', md: '80%', lg: '100%' }} p={4} color='black' mt={0}>
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
                  w={{ base: '100%', sm: '80%', md: '60%', lg: '50%' }}
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
                  mb={0}
                  w={{ base: '100%', md: '80%', lg: '70%' }}
                  style={{paddingBottom: '-100px'}}
                >
                  <CanvasDraw 
                    ref={canvasRef} 
                    brushColor={brushColor} 
                    lazyRadius={0} 
                    enablePanAndZoom={true} 
                    brushRadius={brushRadius} 
                    canvasWidth={300} 
                    canvasHeight={250} 
                    hideGrid={true} 
                    backgroundColor="#eee6e4" 
                    style={{ borderRadius: '8px', width: '100%', paddingBottom: '-20px' }} 
                  />
                </Box>
                {/* Brush Radius Selection */}
                <Box mt={0} style = {{marginTop: '-10px'}}>
                  <RadioGroup value={String(brushRadius)} onChange={(value) => setBrushRadius(Number(value))}>
                    <Stack direction="row" spacing={4}>
                      <p>🧹</p>
                      <Radio style={{width:'0.7em', height:'0.7em'}} value="1"></Radio>
                      <Radio style={{width:'0.8em', height:'0.8em'}} value="2"></Radio>
                      <Radio style={{width:'0.9em', height:'0.9em'}} value="3"></Radio>
                      <Radio style={{width:'1.0em', height:'1.0em'}} value="4"></Radio>
                    </Stack>
                  </RadioGroup>
                </Box>

                {/* Brush Color Selection */}
                <Box mt={-1}>
                  <RadioGroup value={brushColor} onChange={(value) => setBrushColor(value)}>
                    <Stack direction="row" spacing={4}>
                      <p>🖌️</p>
                      <Radio style={{width:'1.0em', height:'1.0em', color:'white', background: 'black', borderColor: 'black'}} value="black"></Radio>
                      <Radio style={{width:'1.0em', height:'1.0em', color:'white', background: 'red', borderColor: 'red'}} value="red"></Radio>
                      <Radio style={{width:'1.0em', height:'1.0em', color:'white', background: 'yellow', borderColor: 'yellow'}} value="yellow"></Radio>
                      <Radio style={{width:'1.0em', height:'1.0em', color:'white', background: 'green', borderColor: 'green'}} value="green"></Radio>
                    </Stack>
                  </RadioGroup>
                </Box>

                <Box display="flex" justifyContent="center" w="100%" flexWrap="wrap">
                  <Button colorScheme="green" borderRadius="8px" mr={2} mb={2} onClick={savePost}>Ulozit</Button>
                  <Button colorScheme="yellow" borderRadius="8px" mr={2} mb={2} onClick={clearCanvas}>Reset</Button>
                  <Button colorScheme="red" borderRadius="8px" mb={2} onClick={() => setShowForm(false)}>Spat</Button>
                </Box>
              </VStack>
            </Box>
          </SimpleGrid>
        )}

      {/* Render all posts */}
      <VStack spacing={4} mt={12}>
        <Heading as="h2" size="lg" style={{ marginTop: '-20px', color: 'black' }}>DENNICEK 🐹</Heading>
        <SimpleGrid columns={[1, null, 1]} spacing="40px" width="full">
          {posts.map(post => (
            <Box key={post._id} borderWidth="1px" borderRadius="lg" overflow="hidden" p={4}>
              <Box display="flex" justifyContent="space-between" alignItems="center" w="80%">
                <p style={{ fontSize: '0.6em', margin: 0 }}>{formatDateToSlovak(post.createdAt)}</p>
                <Heading as="h4" size="md" textAlign="center" flexGrow={1} style={{marginTop:'-10px'}}>{post.name}</Heading>
              </Box>
              <Box display="flex" justifyContent="center" alignItems="center" w="100%">
              <Text>{post.subject}</Text>
              </Box>
              <Image src={post.image} alt="Painting" width="100%" height="auto" borderRadius="md" />

              {/* Render all comments if they exist */}
              {post.comments && post.comments.length > 0 && post.comments.map((comment, index) => (
                <Text key={index} as="p" style={{ fontSize: "0.6em" }}>
                  {formatDateToSlovak(comment.createdAt)} <strong>{comment.author}</strong>: {comment.comment}
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
