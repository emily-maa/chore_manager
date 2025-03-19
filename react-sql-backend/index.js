const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'eecs497!',
  database: 'eecs497_db'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to MySQL database.');
});

// API Endpoint Example: Fetch Users
app.get('/child', (req, res) => {
  db.query('SELECT * FROM child', (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
});

// POST /api/households endpoint to create a new household
app.post('/api/households', (req, res) => {
  const { parentUsername, children } = req.body;

  // Validate required fields
  if (!parentUsername) {
    return res.status(400).json({ error: 'Parent username is required.' });
  }

  if (!Array.isArray(children) || children.length === 0) {
    return res.status(400).json({ error: 'At least one child username is required.' });
  }

  // Generate a unique household ID
  const householdId = uuidv4();

  // Create household data with parent and children (each child gets a unique ID)
  households[householdId] = {
    parent: { username: parentUsername },
    children: children.map(childUsername => ({
      username: childUsername,
      childId: uuidv4()
    }))
  };

  // Optional: Log the created household for debugging
  console.log(`Household created: ${householdId}`, households[householdId]);

  // Respond with the household details
  return res.status(201).json({
    householdId,
    parent: households[householdId].parent,
    children: households[householdId].children
  });
});
// API Endpoint Example: Add a New User
// app.post('/users', (req, res) => {
//   const { name, email } = req.body;
//   db.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], (err, results) => {
//     if (err) {
//       res.status(500).send(err);
//     } else {
//       res.json({ id: results.insertId, name, email });
//     }
//   });
// });

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});