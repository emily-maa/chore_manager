import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
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

// const ParentDashboard = () => {
//   return (
//     <div>
//       ParentDashboard
//     </div>
//   );
// };
// export default ParentDashboard;

const ParentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [error, setError] = useState('');

  // Fetch children data on component mount
  useEffect(() => {
    const fetchChildrenData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/child');
        setChildren(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load children data');
        setLoading(false);
      }
    };

    fetchChildrenData();
  }, []);

  if (loading) {
    return (
      <Container>
        <CircularProgress />
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Parent Dashboard
          </Typography>
          <IconButton color="inherit">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container>
        <Box sx={{ marginTop: 3 }}>
          <Typography variant="h4" gutterBottom>
            Children Overview
          </Typography>
          <Grid container spacing={3}>
            {children.map((child) => (
              <Grid item xs={12} sm={6} md={4} key={child.userid}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{child.username}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Age: {child.age}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Points: {child.totalpoints}
                    </Typography>

                    <Box sx={{ marginTop: 2 }}>
                      {child.totalpoints >= 100 ? (
                        <Chip label="Completed" color="success" icon={<CheckCircleIcon />} />
                      ) : (
                        <Chip label="Pending" color="warning" icon={<PendingIcon />} />
                      )}
                    </Box>

                    <Button 
                      component={Link} 
                      to={`/child/${child.userid}/details`} 
                      fullWidth 
                      variant="outlined" 
                      sx={{ marginTop: 2 }}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </div>
  );
};

export default ParentDashboard;