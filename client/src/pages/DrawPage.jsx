import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Input, Text, Heading, VStack, SimpleGrid, Image, Radio, RadioGroup, Stack, IconButton, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Grid, GridItem} from '@chakra-ui/react';
import CanvasDraw from 'react-canvas-draw';
import axios from 'axios';
import { FaUndo } from 'react-icons/fa';
import Header from '../components/Header.jsx';

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
  const [canvasHistory, setCanvasHistory] = useState([]);
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
          setCanvasHistory([]);
        })
        .catch(error => console.error("Error saving post:", error));
    }
  };

  // Function to clear the canvas
  const clearCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
      setCanvasHistory([]);
    }
  };

  const handleSaveState = () => {
    if (canvasRef.current) {
      const currentCanvasState = canvasRef.current.getSaveData();
      setCanvasHistory((prev) => [...prev, currentCanvasState]);
    }
  };

  const handleUndo = () => {
    if (canvasHistory.length > 1 && canvasRef.current) {
      setCanvasHistory((prev) => {
        const newHistory = prev.slice(0, -1); // Remove last entry
        canvasRef.current.loadSaveData(newHistory[newHistory.length - 1], true); // Load previous state
        return newHistory;
      });
    }
    else {
      clearCanvas();
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

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');

    return `${day}.${month}.${year} ${hour}:${minute}`;
};


  return (
    <Box background='linear-gradient(90deg, rgba(154,66,115,1) 0%, rgba(200,144,94,1) 100%)'p={4} color='black'>
      <Header />
      <Box display="flex" justifyContent="center" alignItems="center" w="100%" mt={1}>
      <Heading as="h2" size="lg" style={{color: 'black', marginBottom: '10px' }}>DENNICEK🐹</Heading>
      </Box>
      {!showForm && (
        <Box display="flex" justifyContent="center" alignItems="center" w="100%" mt={1} marginBottom='-25px'>
        <Button colorScheme="green" onClick={() => setShowForm(true)}>Pridaj novy odkaz</Button>
        </Box>
      )}

      {/* Render the form to create a new post */}
        {showForm && (
          <SimpleGrid w={{ base: '100%', md: '100%', lg: '100%' }}  columns={[0, 0, 1]} spacing="40px" width="full">
              <VStack spacing={4} mt={1}>
                {nameError && (
                  <Heading as="p" size="md" color="red.500">VYPLN MENO A ODKAZ!!!😼</Heading>
                )}
                <Input
                  w={{ base: '80%', sm: '80%', md: '60%', lg: '20%' }}
                  placeholder="Tvoje meno"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  borderColor={nameError ? 'yellow.500' : 'gray.200'}
                  _focus={{ borderColor: nameError ? 'yellow.500' : 'gray.200' }}
                />
                <Input
                  w={{ base: '80%', sm: '80%', md: '60%', lg: '20%' }}
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
                  w={{ base: '100%', md: '80%', lg: '35%' }}
                  style={{paddingBottom: '-100px'}}
                >
                  <CanvasDraw 
                    ref={canvasRef}
                    onChange={handleSaveState}
                    brushColor={brushColor} 
                    lazyRadius={0} 
                    enablePanAndZoom={true} 
                    brushRadius={brushRadius.toFixed(1)} 
                    canvasWidth={300} 
                    canvasHeight={250} 
                    hideGrid={true} 
                    backgroundColor="#eee6e4" 
                    style={{ borderRadius: '8px', width: '100%', paddingBottom: '-20px' }} 
                  />
                </Box>
                {/* Brush Radius Selection */}
                <Box display="grid" justifyContent="center" alignItems="center" w="100%" mt={0} style = {{marginTop: '-10px'}}>
                  <Grid templateColumns="repeat(5, 1fr)" gap="1">
                    <GridItem marginLeft='30px'>
                      <p>🧹</p>
                    </GridItem>
                    <GridItem colSpan={3}>
                      <Slider
                        defaultValue={1}
                        min={1}
                        max={20}
                        step={1}
                        value={brushRadius}
                        onChange={(value) => setBrushRadius(value)}
                        w={{ base: '100%', md: '100%', lg: '100%' }}>
                        <SliderTrack bg="gray.200" borderRadius='5px' height='20px'>
                          <SliderFilledTrack bg="green.500">
                            <Text fontSize='0.8em' marginLeft='80px'>
                              {brushRadius}
                            </Text>
                            </SliderFilledTrack>
                        </SliderTrack>
                        <SliderThumb boxSize={3} background='black' />
                      </Slider>
                    </GridItem>
                    <GridItem>
                      <IconButton style={{width:'1.2em', height:'1.2em', marginTop: '-6px', marginLeft: '15px'}} aria-label="Undo" icon={<FaUndo />} onClick={handleUndo} />
                    </GridItem>
                    </Grid>
                </Box>

                {/* Brush Color Selection */}
                <Box mt={-1}>
                  <RadioGroup value={brushColor} onChange={(value) => setBrushColor(value)}>
                    <Stack direction="row" spacing={4}>
                      <p>🖌️</p>
                      <Radio style={{width:'1.0em', height:'1.0em', color:'white', background: 'black', borderColor: 'black'}} value="black"></Radio>
                      <Radio style={{width:'1.0em', height:'1.0em', color:'white', background: 'red', borderColor: 'red'}} value="red"></Radio>
                      <Radio style={{width:'1.0em', height:'1.0em', color:'black', background: 'yellow', borderColor: 'yellow'}} value="yellow"></Radio>
                      <Radio style={{width:'1.0em', height:'1.0em', color:'white', background: 'green', borderColor: 'green'}} value="green"></Radio>
                      <Radio style={{width:'1.0em', height:'1.0em', color:'white', background: 'blue', borderColor: 'blue'}} value="blue"></Radio>
                      <Radio style={{width:'1.0em', height:'1.0em', color:'black', background: 'orange', borderColor: 'orange'}} value="orange"></Radio>
                      <Radio style={{width:'1.0em', height:'1.0em', color:'white', background: 'brown', borderColor: 'brown'}} value="brown"></Radio>
                      <Radio style={{width:'1.0em', height:'1.0em', color:'black', background: '#eee6e4', borderColor: '#eee6e4'}} value="#eee6e4"></Radio>
                    </Stack>
                  </RadioGroup>
                </Box>
                

                <Box display="flex" justifyContent="center" w="100%" flexWrap="wrap">
                  <Button colorScheme="green" borderRadius="8px" mr={2} mb={2} onClick={savePost}>Ulozit</Button>
                  <Button colorScheme="yellow" borderRadius="8px" mr={2} mb={2} onClick={clearCanvas}>Reset</Button>
                  <Button colorScheme="red" borderRadius="8px" mb={2}  onClick={() => {
                    setShowForm(false);
                    clearCanvas();
                    }}>Spat</Button>
                </Box>
              </VStack>
          </SimpleGrid>
        )}

      {/* Render all posts */}
      <VStack spacing={4} mt={12}>
        <SimpleGrid w={{ base: '100%', md: '80%', lg: '50%' }}  columns={[1, 2, 2]} spacing="40px" width="full">
          {posts.map(post => (
            <Box key={post._id} borderWidth="1px" borderRadius="lg" overflow="hidden" p={4} height= 'fit-content' background='linear-gradient(90deg, rgba(157,102,130,1) 0%, rgba(200,184,174,1) 50%, rgba(193,149,111,1) 100%)'>
              <Box display="flex" justifyContent="space-between" alignItems="center" w="80%">
                <p style={{ fontSize: '0.6em', marginTop: '-15px', marginLeft: '-10px'}}>{formatDateToSlovak(post.createdAt)}</p>
                <Heading as="h4" size="md" textAlign="center" flexGrow={1} style={{marginTop:'-10px'}}>{post.name}</Heading>
              </Box>
              <Box display="flex" justifyContent="center" alignItems="center" w="100%">
              <Text>{post.subject}</Text>
              </Box>
              <Image src={post.image} alt="Painting" width="100%" height="auto" borderRadius="md" />

              {/* Render all comments if they exist*/}
              {post.comments && post.comments.length > 0 && post.comments.map((comment, index) => (
                <Box display="flex" justifyContent="left" alignItems="center" w="100%" borderWidth="0.01em" borderColor = '#1d1b18' borderRadius='5px' marginBottom='4px' marginTop='4px' background='radial-gradient(circle, rgba(252,70,107,1) 0%, rgba(246,219,228,1) 100%)'>
                <Text key={index} as="p" style={{ fontSize: "0.8em", marginLeft: '5px' }}>
                  {formatDateToSlovak(comment.createdAt)} <strong>{comment.author}</strong>: {comment.comment}
                </Text>
                </Box>
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
                  <Box display="flex" justifyContent="center" alignItems="center" w="100%" mt={1}>
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
                </Box>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" w="100%" mt={1}>
                <Button
                  colorScheme="green"
                  style={{ width: '90px', height: '20px', fontSize: '0.7em', marginTop: '5px' }}
                  onClick={() => setSelectedPostId(post._id)}
                >
                  Pridaj komentar
                </Button>
                </Box>
              )}
            </Box>
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default DrawPage;
