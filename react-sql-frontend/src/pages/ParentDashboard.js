import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  AppBar, 
  Toolbar, 
  IconButton,
  CircularProgress,
  Chip,
  Button
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import LogoutIcon from '@mui/icons-material/Logout';
import TaskIcon from '@mui/icons-material/Task';
import AddIcon from '@mui/icons-material/Add'; // Add this import
import Fab from '@mui/material/Fab'; // Add this import
import { useNavigate } from 'react-router-dom';

const ParentDashboard = () => {
  const [children, setChildren] = useState([]);
  const [today, setToday] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch today's name
        const todayResponse = await axios.get('http://localhost:3001/api/today');
        setToday(todayResponse.data.day);

        // Fetch all children and their points
        const childrenResponse = await axios.get('http://localhost:3001/api/children');
        const childDetailsPromises = childrenResponse.data.map(async (child) => {
          // Fetch weekly calendar for each child
          const calendarResponse = await axios.get(`http://localhost:3001/api/child/${child.userid}/calendar`);
          return {
            ...child,
            weeklyChores: calendarResponse.data
          };
        });

        const childrenWithChores = await Promise.all(childDetailsPromises);
        setChildren(childrenWithChores);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('parentInfo');
    navigate('/');
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
            Parent Dashboard
          </Typography>
          <Button 
            color="inherit" 
            startIcon={<TaskIcon />}
            onClick={() => navigate('/parent-task')}
            sx={{ mr: 2 }}
          >
            Manage Tasks
          </Button>
          <IconButton color="inherit" onClick={handleLogout} edge="end" aria-label="logout">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ py: 2 }}>
        {/* Header with Today's Date */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Household Overview
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Today is {today}
          </Typography>
        </Paper>

        {/* Children Points Section */}
        <Typography variant="h5" gutterBottom>
          Children's Points
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {children.map((child) => (
            <Grid item xs={12} sm={6} md={4} key={child.userid}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{child.username}</Typography>
                  <Typography variant="h4" color="primary">
                    {child.totalpoints} Points
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Weekly Chores Overview */}
        <Typography variant="h5" gutterBottom>
          Weekly Chore Calendars
        </Typography>
        <Grid container spacing={3}>
          {children.map((child) => (
            <Grid item xs={12} key={child.userid}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {child.username}'s Chores
                </Typography>
                <Grid container spacing={2}>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                    const dayLower = day.toLowerCase();
                    const dayChores = child.weeklyChores.filter(
                      cal => cal[`${dayLower}Assigned`] === 1
                    );

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
                              dayChores.map(chore => (
                                <Box key={chore.calendarid} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  {chore[`${dayLower}Completed`] ? 
                                    <CheckCircleIcon fontSize="small" color="success" sx={{ mr: 1 }} /> : 
                                    <PendingIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                                  }
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      textDecoration: chore[`${dayLower}Completed`] ? 'line-through' : 'none' 
                                    }}
                                  >
                                    {chore.text}
                                  </Typography>
                                </Box>
                              ))
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
      <Fab 
        color="primary" 
        aria-label="add chore"
        onClick={() => navigate('/parent-task?action=add')}
        style={{ 
          position: 'fixed', 
          bottom: 20, 
          right: 20 
        }}
      >
        <AddIcon />
      </Fab>
    </>
  );
};

export default ParentDashboard;