import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  Button, 
  Divider, 
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import LogoutIcon from '@mui/icons-material/Logout';

const ChildDashboard = () => {
  // States for child data
  const [childInfo, setChildInfo] = useState(null);
  const [todaysChores, setTodaysChores] = useState([]);
  const [weeklyChores, setWeeklyChores] = useState([]);
  const [today, setToday] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Get stored child info from localStorage
        const storedChildInfo = localStorage.getItem('childInfo');
        
        if (!storedChildInfo) {
          // If no stored info, redirect to login
          navigate('/');
          return;
        }
        
        // Parse the stored information
        const { childId, username } = JSON.parse(storedChildInfo);
        
        // Get today's name (Monday, Tuesday, etc.)
        const todayResponse = await axios.get('http://localhost:3001/api/today');
        setToday(todayResponse.data.day);
        
        // Get child information
        const childResponse = await axios.get(`http://localhost:3001/api/child/${childId}`);
        setChildInfo(childResponse.data);
        
        // Get today's chores
        const choresResponse = await axios.get(`http://localhost:3001/api/child/${childId}/todayschores`);
        setTodaysChores(choresResponse.data);
        
        // Get weekly calendar
        const calendarResponse = await axios.get(`http://localhost:3001/api/child/${childId}/calendar`);
        setWeeklyChores(calendarResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load your dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);
  
  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('childInfo');
    navigate('/');
  };
  
  // Function to mark a chore as complete
  const markChoreComplete = async (calendarId) => {
    try {
      // Get the child ID from localStorage
      const storedChildInfo = localStorage.getItem('childInfo');
      const { childId } = JSON.parse(storedChildInfo);
      
      // Get the current day of the week
      const dayName = today.toLowerCase();
      
      const response = await axios.put(`http://localhost:3001/api/calendar/${calendarId}/complete`, {
        userId: childId,
        day: dayName
      });
      
      // Show toast or notification with points
      alert(`Chore completed! You earned ${response.data.pointsAwarded} points!`);
      
      // Refresh the chores list and child info to get updated points
      const choresResponse = await axios.get(`http://localhost:3001/api/child/${childId}/todayschores`);
      setTodaysChores(choresResponse.data);
      
      const childResponse = await axios.get(`http://localhost:3001/api/child/${childId}`);
      setChildInfo(childResponse.data);
      
    } catch (err) {
      console.error('Error marking chore as complete:', err);
      alert('Failed to mark chore as complete. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <>
      <AppBar position="static" color="primary" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Child Dashboard
          </Typography>
          <IconButton color="inherit" onClick={handleLogout} edge="end" aria-label="logout">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="md" sx={{ py: 2 }}>
        {/* Header section with child info */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" gutterBottom>
                Hi, {childInfo?.username || 'Child'}!
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Today is {today}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ backgroundColor: '#f5f5f5' }}>
                <CardContent>
                  <Typography variant="subtitle1" color="text.secondary">
                    Your Total Points
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                    {childInfo?.totalpoints || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>

        {/* Today's chores section */}
        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          Today's Chores
        </Typography>
        {todaysChores.length === 0 ? (
          <Paper elevation={2} sx={{ p: 3, mb: 4, textAlign: 'center' }}>
            <Typography variant="body1">
              You don't have any chores assigned for today. Enjoy your free time!
            </Typography>
          </Paper>
        ) : (
          <List sx={{ mb: 4 }}>
            {todaysChores.map((chore) => (
              <Paper key={chore.calendarid} elevation={2} sx={{ mb: 2 }}>
                <ListItem
                  secondaryAction={
                    chore.completed ? (
                      <Chip 
                        icon={<CheckCircleIcon />} 
                        label="Completed" 
                        color="success" 
                        variant="outlined" 
                      />
                    ) : (
                      <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={() => markChoreComplete(chore.calendarid)}
                      >
                        Mark Complete
                      </Button>
                    )
                  }
                >
                  <ListItemText
                    primary={
                      <Typography variant="h6">
                        {chore.text || chore.choretype}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Type: {chore.choretype}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Points: {chore.amount}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              </Paper>
            ))}
          </List>
        )}

        {/* Weekly calendar preview */}
        <Typography variant="h5" gutterBottom>
          Your Week at a Glance
        </Typography>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Grid container spacing={2}>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => {
              const dayLower = day.toLowerCase();
              const dayChores = weeklyChores.filter(cal => cal[`${dayLower}Assigned`] === 1);
              
              return (
                <Grid item xs={6} sm={4} md={3} key={day}>
                  <Card sx={{ 
                    height: '100%', 
                    backgroundColor: today === day ? '#e3f2fd' : '#fff',
                    border: today === day ? '1px solid #2196f3' : 'none'
                  }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        {day}
                      </Typography>
                      {dayChores.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          No chores
                        </Typography>
                      ) : (
                        <List dense>
                          {dayChores.map(chore => (
                            <ListItem key={`${chore.calendarid}-${day}`} dense disablePadding>
                              <ListItemText
                                primary={
                                  <Typography variant="body2" sx={{ 
                                    textDecoration: chore[`${dayLower}Completed`] ? 'line-through' : 'none',
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}>
                                    {chore[`${dayLower}Completed`] ? 
                                      <CheckCircleIcon fontSize="small" color="success" sx={{ mr: 0.5 }} /> : 
                                      <PendingIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                                    }
                                    {chore.text}
                                  </Typography>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      </Container>
    </>
  );
};

export default ChildDashboard;