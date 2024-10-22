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
    // Reset errors
    setNameError(false);
    setSubjectError(false);
    
    // Check for empty fields
    if (!name) {
      setNameError(true);
    }
    if (!subject) {
      setSubjectError(true);
    }

    if (name && subject && canvasRef.current) {
      const canvasImage = canvasRef.current.getDataURL(); // Safer method to get canvas image
      axios.post('/api/posts', { name, subject, image: canvasImage })
        .then(response => {
          console.log("Post saved successfully!");
          setShowForm(false); // Hide the form after saving
          fetchPosts(); // Refresh the list of posts
          setName(""); // Reset name input
          setSubject(""); // Reset subject input
          canvasRef.current.clear(); // Clear the canvas
        })
        .catch(error => {
          console.error("Error saving post:", error);
        });
    }
  };

  // Function to clear the canvas
  const clearCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.clear(); // Clear the canvas
    }
  };

  const handleBackClick = () => {
    setShowForm(false);
    setNameError(false);
    setSubjectError(false);
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
              <Heading as="p" size="md" color="red.500">
                VYPLN MENO A ODKAZ!!!😼
              </Heading>
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

            {/* CanvasDraw wrapped in a responsive Box */}
            <Box
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              boxShadow="md"
              p={2}
              mb={4}
              w={{ base: '100%', md: '80%', lg: '70%' }}
            >
              <CanvasDraw
                ref={canvasRef}
                brushColor="black"
                brushRadius={2}
                canvasWidth={300}
                canvasHeight={250}
                style={{ borderRadius: '8px', width: '100%' }}
              />
            </Box>

            <Box display="flex" justifyContent="space-between" w="full" flexWrap="wrap">
              <Button colorScheme="green" borderRadius="8px" mr={2} mb={2} onClick={savePost}>
                Ulozit
              </Button>
              <Button colorScheme="yellow" borderRadius="8px" mr={2} mb={2} onClick={clearCanvas}>
                Reset
              </Button>
              <Button colorScheme="red" borderRadius="8px" mb={2} onClick={handleBackClick}>
                Spat
              </Button>
            </Box>
          </VStack>
        </Box>
      )}

      {/* Render all posts */}
      <VStack spacing={4} mt={12}>
        <Heading as="h2" size="lg" style={{marginTop: '-20px', color:'black'}}>DENNICEK 🐹</Heading>
        <SimpleGrid columns={[1, null, 2]} spacing="40px" width="full">
          {posts.map(post => (
            <Box key={post._id} borderWidth="1px" borderRadius="lg" overflow="hidden" p={4}>
              <Heading as="h4" size="md">{post.name}</Heading>
              <Text>Odkaz: {post.subject}</Text>
              <Image src={post.image} alt="Painting" width="100%" height="auto" borderRadius="md" />
            </Box>
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default DrawPage;
