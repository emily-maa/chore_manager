import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import link from 'react-router-dom';

const CreateHousehold = () => {
  // State for the parent's username
  const [parentUsername, setParentUsername] = useState('');
  // State for an array of children usernames (start with one empty field)
  const [children, setChildren] = useState(['']);
  // State for the generated household ID after successful creation
  const [householdId, setHouseholdId] = useState('');
  // State for error messages
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Handle changes in each child input field
  const handleChildChange = (index, value) => {
    const updatedChildren = [...children];
    updatedChildren[index] = value;
    setChildren(updatedChildren);
  };

  // Add a new child input field
  const addChildField = () => {
    setChildren([...children, '']);
  };

  // Optionally, remove a child field (if more than one exists)
  const removeChildField = (index) => {
    if (children.length > 1) {
      const updatedChildren = children.filter((_, i) => i !== index);
      setChildren(updatedChildren);
    }
  };

  // Handle form submission to create the household
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Adjust the endpoint and payload as needed for your backend
      const response = await axios.post('/api/households', {
        parentUsername,
        children,
      });
      // Assume the response contains the generated householdId
      setHouseholdId(response.data.householdId);
    } catch (err) {
      setError('Error creating household. Please try again.');
    }
  };

  // If householdId is set, show the success screen
  if (householdId) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Household Created!
          </Typography>
          <Typography variant="h6">
            Your Household ID is: <strong>{householdId}</strong>
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Share this ID with your children so they can log in using their username.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => navigate('/')}
          >
            Go to Login
          </Button>
        </Box>
      </Container>
    );
  }

  // Otherwise, show the form to create a household
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create a New Household
        </Typography>
        {error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Parent Username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={parentUsername}
            onChange={(e) => setParentUsername(e.target.value)}
            required
          />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Children Usernames
          </Typography>
          {children.map((child, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <TextField
                label={`Child ${index + 1} Username`}
                variant="outlined"
                fullWidth
                value={child}
                onChange={(e) => handleChildChange(index, e.target.value)}
                required
              />
              {children.length > 1 && (
                <Button color="error" onClick={() => removeChildField(index)}>
                  Remove
                </Button>
              )}
            </Box>
          ))}
          <Button variant="outlined" onClick={addChildField} sx={{ mt: 2 }}>
            Add Child
          </Button>
          <Button variant="contained" color="primary" type="submit" fullWidth sx={{ mt: 2 }}>
            Create Household
          </Button>
        </form>
        <Button variant="text" onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Back to Login
        </Button>
      </Box>
    </Container>
  );
};

export default CreateHousehold;

