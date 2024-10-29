// Header.js
import React from 'react';
import { Box, Button, Heading } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <Box as="header" p={4} background='linear-gradient(90deg, rgba(154,66,115,1) 0%, rgba(200,144,94,1) 100%)' shadow="md" mb={4}>
      <Box display="flex" justifyContent="center" mt={2}>
        <Link to="/">
          <Button colorScheme="teal" mx={2}>Dennicek</Button>
        </Link>
        <Link to="/hudbicka">
          <Button colorScheme="teal" mx={2}>Hudbicka</Button>
        </Link>
      </Box>
    </Box>
  );
};

export default Header;
