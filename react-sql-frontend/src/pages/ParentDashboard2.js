import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';

const ParentDashboard2 = () => {
  const [activeChores, setActiveChores] = useState([]);
  const [inactiveChores, setInactiveChores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch active chores (assigned chores for the day)
  const fetchActiveChores = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/chores/active');
      if (!response.ok) {
        throw new Error('Error fetching active chores');
      }
      const data = await response.json();
      setActiveChores(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch inactive chores (unassigned chores for the day)
  const fetchInactiveChores = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/chores/inactive');
      if (!response.ok) {
        throw new Error('Error fetching inactive chores');
      }
      const data = await response.json();
      setInactiveChores(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch data when the component mounts
  useEffect(() => {
    Promise.all([fetchActiveChores(), fetchInactiveChores()])
      .then(() => setLoading(false));
  }, []);

  // Handler for the "Add Chore" button (to be extended later)
  const handleAddChore = () => {
    console.log('Add Chore button clicked');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        Parent Dashboard
      </Typography>

      {/* Active (Assigned) Chores Section */}
      <Box my={3}>
        <Typography variant="h5" gutterBottom>
          Today's Chores
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Child Name</TableCell>
                <TableCell>Chore Type</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeChores.length > 0 ? (
                activeChores.map((chore, index) => (
                  <TableRow key={index}>
                    <TableCell>{chore.childName}</TableCell>
                    <TableCell>{chore.choreType}</TableCell>
                    <TableCell>
                      <Checkbox checked={!!chore.completed} disabled />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No active chores for today.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Inactive (Unassigned) Chores Section */}
      <Box my={3}>
        <Typography variant="h5" gutterBottom>
          Unassigned Chores
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Chore Type</TableCell>
                <TableCell>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inactiveChores.length > 0 ? (
                inactiveChores.map((chore, index) => (
                  <TableRow key={index}>
                    <TableCell>{chore.choretype}</TableCell>
                    <TableCell>{chore.amount}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No unassigned chores for today.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Add Chore Button */}
      <Button variant="contained" color="primary" onClick={handleAddChore}>
        Add Chore
      </Button>
    </Box>
  );
};

export default ParentDashboard2;

