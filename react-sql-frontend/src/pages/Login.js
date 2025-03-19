import React, { useState } from 'react';
import { Box, Tabs, Tab, TextField, Button, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  // State for the tab selection
  const [tabValue, setTabValue] = useState(0);
  // Shared state for household id input
  const [householdId, setHouseholdId] = useState('');
  // State for child username input
  const [childUsername, setChildUsername] = useState('');
  // State to store the created household id for new households
  const [createdHouseholdId, setCreatedHouseholdId] = useState(null);
  // State for error messages
  const [error, setError] = useState('');
  // Hook to navigate between routes
  const navigate = useNavigate();

  // Handle tab changes
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
  };

  // API call to create a new household
  const handleCreateHousehold = async () => {
    try {
      // const response = await axios.post('/api/households');
      // setCreatedHouseholdId(response.data.householdId);
      navigate('/create-household');
    } catch (err) {
      setError('Failed to create household');
    }
  };

  // API call for parent login
  const handleParentLogin = async (e) => {
    e.preventDefault();
    try {
      // Replace this endpoint with your actual parent login endpoint
      await axios.post('/api/login/parent', { householdId });
      // On successful login, redirect to the parent dashboard
      navigate('/parent-dashboard');
    } catch (err) {
      setError('Parent login failed');
    }
  };

  // API call for child login
  const handleChildLogin = async (e) => {
    e.preventDefault();
    try {
      // Replace this endpoint with your actual child login endpoint
      await axios.post('/api/login/child', { householdId, childUsername });
      // On successful login, redirect to the child dashboard
      navigate('/child-dashboard');
    } catch (err) {
      setError('Child login failed');
    }
  };

  return (
    <Paper elevation={3} style={{ padding: '20px', maxWidth: '500px', margin: '20px auto' }}>
      <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
        <Tab label="Create Household" />
        <Tab label="Parent Login" />
        <Tab label="Child Login" />
      </Tabs>
      <Box mt={2}>
        {tabValue === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Create a New Household
            </Typography>
            <Button variant="contained" color="primary" onClick={handleCreateHousehold}>
              Create Household
            </Button>
            {createdHouseholdId && (
              <Typography variant="body1" mt={2}>
                Your Household ID is: <strong>{createdHouseholdId}</strong>
              </Typography>
            )}
          </Box>
        )}
        {tabValue === 1 && (
          <Box component="form" onSubmit={handleParentLogin}>
            <Typography variant="h6" gutterBottom>
              Parent Login
            </Typography>
            <TextField
              label="Household ID"
              variant="outlined"
              fullWidth
              margin="normal"
              value={householdId}
              onChange={(e) => setHouseholdId(e.target.value)}
              required
            />
            <Button variant="contained" color="primary" type="submit" fullWidth>
              Login as Parent
            </Button>
          </Box>
        )}
        {tabValue === 2 && (
          <Box component="form" onSubmit={handleChildLogin}>
            <Typography variant="h6" gutterBottom>
              Child Login
            </Typography>
            <TextField
              label="Household ID"
              variant="outlined"
              fullWidth
              margin="normal"
              value={householdId}
              onChange={(e) => setHouseholdId(e.target.value)}
              required
            />
            <TextField
              label="Child Username"
              variant="outlined"
              fullWidth
              margin="normal"
              value={childUsername}
              onChange={(e) => setChildUsername(e.target.value)}
              required
            />
            <Button variant="contained" color="primary" type="submit" fullWidth>
              Login as Child
            </Button>
          </Box>
        )}
        {error && (
          <Typography variant="body2" color="error" mt={2}>
            {error}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

export default Login;
