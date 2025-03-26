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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const ParentTask = () => {
  const [activeChores, setActiveChores] = useState([]);
  const [inactiveChores, setInactiveChores] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // For the Add/Edit dialog
  const [open, setOpen] = useState(false);
  const [editingChore, setEditingChore] = useState(null); // null means adding a new chore
  
  // Form state for the chore details
  const [choreName, setChoreName] = useState('');
  const [pointValue, setPointValue] = useState('');
  // Instead of one selectedChild, we now have a mapping of day to child id (or empty string for unassigned)
  const [selectedDays, setSelectedDays] = useState({
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
    sunday: ''
  });
  
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

  // Fetch children for the dropdown
  const fetchChildren = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/parentoverview');
      if (!response.ok) {
        throw new Error('Error fetching children');
      }
      const data = await response.json();
      setChildren(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Optionally, you might have an endpoint to fetch full chore details for editing.
  // For this example, we assume the active/inactive chores include the needed day assignments.
  // If not, you can add a function like fetchChoreDetails(choreId).

  // Fetch all data when the component mounts
  useEffect(() => {
    Promise.all([fetchActiveChores(), fetchInactiveChores(), fetchChildren()])
      .then(() => setLoading(false));
  }, []);

  // Handle change for each day's assignment
  const handleDayChange = (day, value) => {
    setSelectedDays(prev => ({ ...prev, [day]: value }));
  };

  // Handle form submission for add/edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Build payload – householdId and parentId are hardcoded for now; in production, retrieve from session.
    const payload = {
      choreType: choreName,
      amount: Number(pointValue),
      days: {
        monday: selectedDays.monday || null,
        tuesday: selectedDays.tuesday || null,
        wednesday: selectedDays.wednesday || null,
        thursday: selectedDays.thursday || null,
        friday: selectedDays.friday || null,
        saturday: selectedDays.saturday || null,
        sunday: selectedDays.sunday || null,
      },
      householdId: "1", // Replace with actual household id
      parentId: "1"     // Replace with actual parent id
    };
    
    try {
      let res;
      if (editingChore) {
        // Edit mode: update existing chore
        res = await fetch(`http://localhost:3001/api/chores/${editingChore.choreid}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // Add mode: create new chore
        res = await fetch('http://localhost:3001/api/chores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save chore');
      }
      
      console.log(editingChore ? "Chore updated successfully." : "Chore added successfully.");
      
      // Re-fetch chores data to reflect changes
      await Promise.all([fetchActiveChores(), fetchInactiveChores()]);
      
      // Close dialog and reset form
      setOpen(false);
      setEditingChore(null);
      setChoreName('');
      setPointValue('');
      setSelectedDays({
        monday: '',
        tuesday: '',
        wednesday: '',
        thursday: '',
        friday: '',
        saturday: '',
        sunday: ''
      });
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete chore function: calls DELETE API and refreshes data
  const handleDeleteChore = async (choreId) => {
    try {
      const res = await fetch(`http://localhost:3001/api/chores/${choreId}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete chore');
      }
      console.log("Chore deleted successfully.");
      // Refresh chores data
      await Promise.all([fetchActiveChores(), fetchInactiveChores()]);
    } catch (err) {
      setError(err.message);
    }
  };

  // Open the dialog in "Add" mode
  const handleAddChore = () => {
    setEditingChore(null);
    setChoreName('');
    setPointValue('');
    setSelectedDays({
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: ''
    });
    setOpen(true);
  };

  // Open the dialog in "Edit" mode, pre-populating form with the chore's details.
  // Here we assume the chore object has keys:
  //   choreid, choreType, amount, monday, tuesday, ..., sunday (each day holds the assigned child id)
  const handleEditChore = (chore) => {
    setEditingChore(chore);
    setChoreName(chore.choreType);
    setPointValue(chore.amount);
    // For each day, use the corresponding property from the chore object.
    // If your GET endpoint doesn't return this info, you'll need to fetch the full details.
    setSelectedDays({
      monday: chore.monday || '',
      tuesday: chore.tuesday || '',
      wednesday: chore.wednesday || '',
      thursday: chore.thursday || '',
      friday: chore.friday || '',
      saturday: chore.saturday || '',
      sunday: chore.sunday || ''
    });
    setOpen(true);
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
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeChores.length > 0 ? (
                activeChores.map((chore) => (
                  <TableRow key={chore.choreid}>
                    <TableCell>{chore.childName || "Unassigned"}</TableCell>
                    <TableCell>{chore.choreType}</TableCell>
                    <TableCell>
                      <Checkbox checked={!!chore.completed} disabled />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        onClick={() => handleEditChore(chore)}
                        sx={{ mr: 1 }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteChore(chore.choreid)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
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
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inactiveChores.length > 0 ? (
                inactiveChores.map((chore) => (
                  <TableRow key={chore.choreid}>
                    <TableCell>{chore.choretype}</TableCell>
                    <TableCell>{chore.amount}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        onClick={() => handleEditChore(chore)}
                        sx={{ mr: 1 }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteChore(chore.choreid)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No unassigned chores for today.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Button variant="contained" color="primary" onClick={handleAddChore}>
        Add Chore
      </Button>

      {/* Add/Edit Chore Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingChore ? "Edit Chore" : "Add New Chore"}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              label="Chore Name"
              fullWidth
              margin="normal"
              value={choreName}
              onChange={(e) => setChoreName(e.target.value)}
            />
            <TextField
              label="Point Value"
              fullWidth
              margin="normal"
              type="number"
              value={pointValue}
              onChange={(e) => setPointValue(e.target.value)}
            />
            {daysOfWeek.map((day) => (
              <FormControl key={day} fullWidth margin="normal">
                <InputLabel id={`${day}-label`}>{day.charAt(0).toUpperCase() + day.slice(1)}</InputLabel>
                <Select
                  labelId={`${day}-label`}
                  value={selectedDays[day]}
                  label={day.charAt(0).toUpperCase() + day.slice(1)}
                  onChange={(e) => handleDayChange(day, e.target.value)}
                >
                  <MenuItem value=""><em>Unassigned</em></MenuItem>
                  {children.map((child) => (
                    <MenuItem key={child.userid} value={child.userid}>
                      {child.username}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            {editingChore ? "Update" : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ParentTask;





