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
  password: '', //change based on personal DB
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

// API Endpoint for creating a new household
app.post('/api/households', (req, res) => {
  const { parentUsername, children } = req.body;

  // Validate required fields
  if (!parentUsername) {
    return res.status(400).json({ error: 'Parent username is required.' });
  }

  if (!Array.isArray(children) || children.length === 0) {
    return res.status(400).json({ error: 'At least one child username is required.' });
  }

  // First make sure you've imported UUID at the top of your file
  // const { v4: uuidv4 } = require('uuid');
  
  // Generate a unique household ID
  const householdId = uuidv4();
  
  // Start a database transaction to ensure all related data is created together
  db.beginTransaction(err => {
    if (err) {
      console.error('Transaction error:', err);
      return res.status(500).json({ error: 'Failed to create household' });
    }
    
    // Insert the household
    db.query('INSERT INTO household (householdid) VALUES (?)', [householdId], (err, results) => {
      if (err) {
        return db.rollback(() => {
          console.error('Error creating household:', err);
          res.status(500).json({ error: 'Failed to create household' });
        });
      }
      
      // Insert the parent
      db.query('INSERT INTO parent (username, householdid) VALUES (?, ?)', 
        [parentUsername, householdId], 
        (err, results) => {
          if (err) {
            return db.rollback(() => {
              console.error('Error creating parent:', err);
              res.status(500).json({ error: 'Failed to create parent' });
            });
          }
          
          // Insert all children
          const childQueries = children.map(childUsername => {
            return new Promise((resolve, reject) => {
              // Generate a unique ID for each child
              const childId = uuidv4();
              
              db.query('INSERT INTO child (userid, username, householdid) VALUES (?, ?, ?)', 
                [childId, childUsername, householdId], 
                (err, results) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve({ childId, username: childUsername });
                  }
                }
              );
            });
          });
          
          Promise.all(childQueries)
            .then(childResults => {
              // Commit the transaction
              db.commit(err => {
                if (err) {
                  return db.rollback(() => {
                    console.error('Error committing transaction:', err);
                    res.status(500).json({ error: 'Failed to create household' });
                  });
                }
                
                // Success! Return the created data
                res.status(201).json({
                  householdId,
                  parent: { username: parentUsername },
                  children: childResults
                });
              });
            })
            .catch(err => {
              return db.rollback(() => {
                console.error('Error creating children:', err);
                res.status(500).json({ error: 'Failed to create children' });
              });
            });
        }
      );
    });
  });
});

// Child Information
app.get('/api/child/:userId', (req, res) => {
  const userId = req.params.userId;
  db.query('SELECT userid, username, age, totalpoints FROM child WHERE userid = ?', [userId], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Child not found' });
    } else {
      res.json(results[0]);
    }
  });
});

//Child's chores for the day
app.get('/api/child/:userId/todayschores', (req, res) => {
  const userId = req.params.userId;
  
  // Get current day of the week (0 = Sunday, 1 = Monday, etc.)
  const today = new Date().getDay();
  let dayColumn, completedColumn;
  
  // Map JavaScript day to your database columns
  switch(today) {
    case 0: // Sunday
      dayColumn = 'sundayassignee';
      completedColumn = 'sundaycompleted';
      break;
    case 1: // Monday
      dayColumn = 'mondayassignee';
      completedColumn = 'mondaycompleted';
      break;
    case 2: // Tuesday
      dayColumn = 'tuesdayassignee';
      completedColumn = 'tuesdaycompleted';
      break;
    case 3: // Wednesday
      dayColumn = 'wednesdayassignee';
      completedColumn = 'wednesdaycompleted';
      break;
    case 4: // Thursday
      dayColumn = 'thursdayassignee';
      completedColumn = 'thursdaycompleted';
      break;
    case 5: // Friday
      dayColumn = 'fridayassignee';
      completedColumn = 'fridaycompleted';
      break;
    case 6: // Saturday
      dayColumn = 'saturdayassignee';
      completedColumn = 'saturdaycompleted';
      break;
  }
  
  // This query finds all calendar entries where this child is assigned today
  const query = `
    SELECT c.calendarid, c.text, c.${completedColumn} as completed, ch.choreid, ch.choretype, ch.amount 
    FROM calendar c
    JOIN chore ch ON c.calendarid = ch.schedule
    WHERE c.${dayColumn} = ?
  `;
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(results);
    }
  });
});

// Calendar Week View
app.get('/api/child/:userId/calendar', (req, res) => {
  const userId = req.params.userId;
  
  // Get all calendar entries where this child is assigned on any day
  const query = `
    SELECT 
      calendarid, 
      text,
      CASE WHEN mondayassignee = ? THEN 1 ELSE 0 END as mondayAssigned,
      mondaycompleted as mondayCompleted,
      CASE WHEN tuesdayassignee = ? THEN 1 ELSE 0 END as tuesdayAssigned,
      tuesdaycompleted as tuesdayCompleted,
      CASE WHEN wednesdayassignee = ? THEN 1 ELSE 0 END as wednesdayAssigned,
      wednesdaycompleted as wednesdayCompleted,
      CASE WHEN thursdayassignee = ? THEN 1 ELSE 0 END as thursdayAssigned, 
      thursdaycompleted as thursdayCompleted,
      CASE WHEN fridayassignee = ? THEN 1 ELSE 0 END as fridayAssigned,
      fridaycompleted as fridayCompleted,
      CASE WHEN saturdayassignee = ? THEN 1 ELSE 0 END as saturdayAssigned,
      saturdaycompleted as saturdayCompleted,
      CASE WHEN sundayassignee = ? THEN 1 ELSE 0 END as sundayAssigned,
      sundaycompleted as sundayCompleted
    FROM calendar
    WHERE 
      mondayassignee = ? OR
      tuesdayassignee = ? OR
      wednesdayassignee = ? OR
      thursdayassignee = ? OR
      fridayassignee = ? OR
      saturdayassignee = ? OR
      sundayassignee = ?
  `;
  
  db.query(query, [userId, userId, userId, userId, userId, userId, userId, userId, userId, userId, userId, userId, userId, userId], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      // Join with chore table to get chore details
      const calendarIds = results.map(r => r.calendarid);
      
      if (calendarIds.length === 0) {
        return res.json([]);
      }
      
      db.query('SELECT * FROM chore WHERE schedule IN (?)', [calendarIds], (choreErr, choreResults) => {
        if (choreErr) {
          res.status(500).json({ error: choreErr.message });
        } else {
          // Map chores to their calendars
          const calendar = results.map(cal => {
            const associatedChores = choreResults.filter(chore => chore.schedule === cal.calendarid);
            return {
              ...cal,
              chores: associatedChores
            };
          });
          
          res.json(calendar);
        }
      });
    }
  });
});

// Mark a chore as complete
app.put('/api/calendar/:calendarId/complete', (req, res) => {
  const calendarId = req.params.calendarId;
  const { userId, day } = req.body;
  
  if (!day) {
    return res.status(400).json({ error: 'Day parameter is required' });
  }
  
  // Map day name to column names
  let assigneeColumn, completedColumn;
  switch(day.toLowerCase()) {
    case 'monday':
      assigneeColumn = 'mondayassignee';
      completedColumn = 'mondaycompleted';
      break;
    case 'tuesday':
      assigneeColumn = 'tuesdayassignee';
      completedColumn = 'tuesdaycompleted';
      break;
    case 'wednesday':
      assigneeColumn = 'wednesdayassignee';
      completedColumn = 'wednesdaycompleted';
      break;
    case 'thursday':
      assigneeColumn = 'thursdayassignee';
      completedColumn = 'thursdaycompleted';
      break;
    case 'friday':
      assigneeColumn = 'fridayassignee';
      completedColumn = 'fridaycompleted';
      break;
    case 'saturday':
      assigneeColumn = 'saturdayassignee';
      completedColumn = 'saturdaycompleted';
      break;
    case 'sunday':
      assigneeColumn = 'sundayassignee';
      completedColumn = 'sundaycompleted';
      break;
    default:
      return res.status(400).json({ error: 'Invalid day parameter' });
  }
  
  // Verify this child is assigned to this chore on this day
  db.query(`SELECT ${assigneeColumn} FROM calendar WHERE calendarid = ?`, [calendarId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Calendar entry not found' });
    }
    
    const assignee = results[0][assigneeColumn];
    if (assignee != userId) {
      return res.status(403).json({ error: 'This child is not assigned to this chore on this day' });
    }
    
    // Get chore information to know points
    db.query('SELECT amount FROM chore WHERE schedule = ?', [calendarId], (choreErr, choreResults) => {
      if (choreErr) {
        return res.status(500).json({ error: choreErr.message });
      }
      
      if (choreResults.length === 0) {
        return res.status(404).json({ error: 'No chore found for this calendar entry' });
      }
      
      const points = choreResults[0].amount;
      
      // Start transaction
      db.beginTransaction(transErr => {
        if (transErr) {
          return res.status(500).json({ error: transErr.message });
        }
        
        // Mark as completed
        db.query(`UPDATE calendar SET ${completedColumn} = 1 WHERE calendarid = ?`, [calendarId], (updateErr) => {
          if (updateErr) {
            return db.rollback(() => {
              res.status(500).json({ error: updateErr.message });
            });
          }
          
          // Update points
          db.query('UPDATE child SET totalpoints = totalpoints + ? WHERE userid = ?', [points, userId], (pointsErr) => {
            if (pointsErr) {
              return db.rollback(() => {
                res.status(500).json({ error: pointsErr.message });
              });
            }
            
            // Commit transaction
            db.commit(commitErr => {
              if (commitErr) {
                return db.rollback(() => {
                  res.status(500).json({ error: commitErr.message });
                });
              }
              
              res.json({ 
                message: 'Chore marked as complete',
                pointsAwarded: points
              });
            });
          });
        });
      });
    });
  });
});

// Get the name of today
app.get('/api/today', (req, res) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date().getDay();
  res.json({ 
    day: days[today],
    dayIndex: today
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// Parent Api's

// All Children and Their Points: Parent Landing
app.get('/api/parentoverview', (req, res) => {
  db.query('SELECT userid, username, totalpoints FROM child', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(results);
    }
  });
});


// Get all children and their assigned chores for the current day
app.get('/api/chores/active', (req, res) => {
  const today = new Date().getDay(); // Get current day (0 for Sunday, 1 for Monday, etc.)
  
  let dayColumn = '';
  let completedColumn = '';
  
  // Map the current day to the corresponding columns
  switch (today) {
    case 0: // Sunday
      dayColumn = 'sundayassignee';
      completedColumn = 'sundaycompleted';
      break;
    case 1: // Monday
      dayColumn = 'mondayassignee';
      completedColumn = 'mondaycompleted';
      break;
    case 2: // Tuesday
      dayColumn = 'tuesdayassignee';
      completedColumn = 'tuesdaycompleted';
      break;
    case 3: // Wednesday
      dayColumn = 'wednesdayassignee';
      completedColumn = 'wednesdaycompleted';
      break;
    case 4: // Thursday
      dayColumn = 'thursdayassignee';
      completedColumn = 'thursdaycompleted';
      break;
    case 5: // Friday
      dayColumn = 'fridayassignee';
      completedColumn = 'fridaycompleted';
      break;
    case 6: // Saturday
      dayColumn = 'saturdayassignee';
      completedColumn = 'saturdaycompleted';
      break;
    default:
      return res.status(400).json({ error: 'Invalid day of the week' });
  }
  
    // SQL query to get children and their assigned chores for the current day
    const query = `
    SELECT c.choreid, c.choretype, c.amount, cal.calendarid, cal.${dayColumn} AS assignee, cal.${completedColumn} AS completed, ch.username AS child_name
    FROM chore c
    JOIN calendar cal ON c.schedule = cal.calendarid
    JOIN child ch ON ch.userid = cal.${dayColumn}
    WHERE (
      (DAYOFWEEK(CURRENT_DATE) = 2 AND cal.mondayassignee IS NOT NULL) OR
      (DAYOFWEEK(CURRENT_DATE) = 3 AND cal.tuesdayassignee IS NOT NULL) OR
      (DAYOFWEEK(CURRENT_DATE) = 4 AND cal.wednesdayassignee IS NOT NULL) OR
      (DAYOFWEEK(CURRENT_DATE) = 5 AND cal.thursdayassignee IS NOT NULL) OR
      (DAYOFWEEK(CURRENT_DATE) = 6 AND cal.fridayassignee IS NOT NULL) OR
      (DAYOFWEEK(CURRENT_DATE) = 7 AND cal.saturdayassignee IS NOT NULL) OR
      (DAYOFWEEK(CURRENT_DATE) = 1 AND cal.sundayassignee IS NOT NULL)
    );
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Process the results to include the completion status
    const childrenChores = results.map(row => ({
      choreid: row.choreid,
      childName: row.child_name,
      choreType: row.choretype,
      completed: row[completedColumn] === 1 // 1 means completed, 0 means not completed
    }));
    console.log(childrenChores);

    // should look like this:
    // {
    //   "childName": "David",
    //   "choreType": "Pet Care Duties",
    //   "completed": 1
    // }
        
    res.json(childrenChores);
  });
});



// Get all chores that are not assigned and not completed for the current day
app.get('/api/chores/inactive', (req, res) => {
  const query = `
    SELECT c.choreid, c.choretype, c.amount, cal.calendarid
    FROM chore c
    JOIN calendar cal ON c.schedule = cal.calendarid
    WHERE (
      (DAYOFWEEK(CURRENT_DATE) = 2 AND cal.mondayassignee IS NULL AND cal.mondaycompleted = FALSE) OR
      (DAYOFWEEK(CURRENT_DATE) = 3 AND cal.tuesdayassignee IS NULL AND cal.tuesdaycompleted = FALSE) OR
      (DAYOFWEEK(CURRENT_DATE) = 4 AND cal.wednesdayassignee IS NULL AND cal.wednesdaycompleted = FALSE) OR
      (DAYOFWEEK(CURRENT_DATE) = 5 AND cal.thursdayassignee IS NULL AND cal.thursdaycompleted = FALSE) OR
      (DAYOFWEEK(CURRENT_DATE) = 6 AND cal.fridayassignee IS NULL AND cal.fridaycompleted = FALSE) OR
      (DAYOFWEEK(CURRENT_DATE) = 7 AND cal.saturdayassignee IS NULL AND cal.saturdaycompleted = FALSE) OR
      (DAYOFWEEK(CURRENT_DATE) = 1 AND cal.sundayassignee IS NULL AND cal.sundaycompleted = FALSE)
    );
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(results);
    }
  });
});

// API Endpoint for parent login
app.post('/api/login/parent', (req, res) => {
  const { householdId } = req.body;
  
  // Verify the household ID exists in your database
  db.query('SELECT * FROM household WHERE householdid = ?', [householdId], (err, results) => {
    if (err) {
      console.error('Error validating household:', err);
      res.status(500).send('Login failed');
    } else if (results.length === 0) {
      res.status(404).send('Household not found');
    } else {
      // If household exists, login is successful
      res.status(200).send('Login successful');
    }
  });
});

// API Endpoint for child login
app.post('/api/login/child', (req, res) => {
  const { householdId, childUsername } = req.body;
  
  // Verify both the household ID and child username exist in your database
  db.query(
    'SELECT * FROM child WHERE householdid = ? AND username = ?',
    [householdId, childUsername],
    (err, results) => {
      if (err) {
        console.error('Error validating child:', err);
        res.status(500).json({ error: 'Login failed' });
      } else if (results.length === 0) {
        res.status(404).json({ error: 'Child not found in this household' });
      } else {
        // If child exists in this household, login is successful
        res.status(200).json({ 
          message: 'Login successful',
          childId: results[0].userid,
          username: results[0].username
        });
      }
    }
  );
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

app.post('/api/chores', (req, res) => {
  const { choreType, amount, days, householdId, parentId } = req.body;
  
  if (!choreType || !amount || !days || !householdId || !parentId) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  
  // Use the provided day assignments from the payload
  const mondayAssignee    = days.monday    || null;
  const tuesdayAssignee   = days.tuesday   || null;
  const wednesdayAssignee = days.wednesday || null;
  const thursdayAssignee  = days.thursday  || null;
  const fridayAssignee    = days.friday    || null;
  const saturdayAssignee  = days.saturday  || null;
  const sundayAssignee    = days.sunday    || null;
  
  db.beginTransaction(err => {
    if (err) {
      return res.status(500).json({ error: "Transaction error" });
    }
    
    // Insert into calendar table with proper day assignments
    const calendarQuery = `
      INSERT INTO calendar 
      (householdid, text, mondayassignee, tuesdayassignee, wednesdayassignee, thursdayassignee, fridayassignee, saturdayassignee, sundayassignee)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(calendarQuery, [
      householdId,
      choreType,
      mondayAssignee,
      tuesdayAssignee,
      wednesdayAssignee,
      thursdayAssignee,
      fridayAssignee,
      saturdayAssignee,
      sundayAssignee
    ], (err, calendarResult) => {
      if (err) {
        return db.rollback(() => res.status(500).json({ error: err.message }));
      }
      
      const calendarId = calendarResult.insertId;
      
      // Insert into chore table
      const choreQuery = `
        INSERT INTO chore (choretype, amount, schedule, assignedby)
        VALUES (?, ?, ?, ?)
      `;
      db.query(choreQuery, [choreType, amount, calendarId, parentId], (err, choreResult) => {
        if (err) {
          return db.rollback(() => res.status(500).json({ error: err.message }));
        }
        
        db.commit(err => {
          if (err) {
            return db.rollback(() => res.status(500).json({ error: err.message }));
          }
          res.status(201).json({ message: "Chore added successfully" });
        });
      });
    });
  });
});


// DELETE endpoint to remove a chore and its calendar entry
app.delete('/api/chores/:choreId', (req, res) => {
  const { choreId } = req.params;
  
  db.beginTransaction(err => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Get the calendar id (schedule) from the chore record
    db.query('SELECT schedule FROM chore WHERE choreid = ?', [choreId], (err, results) => {
      if (err) {
        return db.rollback(() => res.status(500).json({ error: err.message }));
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Chore not found' });
      }
      
      const scheduleId = results[0].schedule;
      
      // Delete the chore record
      db.query('DELETE FROM chore WHERE choreid = ?', [choreId], (err) => {
        if (err) {
          return db.rollback(() => res.status(500).json({ error: err.message }));
        }
        
        // Delete the associated calendar record
        db.query('DELETE FROM calendar WHERE calendarid = ?', [scheduleId], (err) => {
          if (err) {
            return db.rollback(() => res.status(500).json({ error: err.message }));
          }
          
          db.commit(err => {
            if (err) {
              return db.rollback(() => res.status(500).json({ error: err.message }));
            }
            res.json({ message: 'Chore deleted successfully' });
          });
        });
      });
    });
  });
});

// Update an existing chore and its calendar entry
app.put('/api/chores/:choreId', (req, res) => {
  const { choreId } = req.params;
  const { choreType, amount, days } = req.body;
  
  if (!choreType || !amount || !days) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  
  db.beginTransaction(err => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Retrieve the calendar id associated with the chore
    db.query('SELECT schedule FROM chore WHERE choreid = ?', [choreId], (err, results) => {
      if (err) {
        return db.rollback(() => res.status(500).json({ error: err.message }));
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Chore not found' });
      }
      
      const scheduleId = results[0].schedule;
      
      // Update the calendar record with the new day assignments and chore text
      const updateCalendarQuery = `
        UPDATE calendar 
        SET text = ?,
            mondayassignee = ?,
            tuesdayassignee = ?,
            wednesdayassignee = ?,
            thursdayassignee = ?,
            fridayassignee = ?,
            saturdayassignee = ?,
            sundayassignee = ?
        WHERE calendarid = ?
      `;
      
      db.query(updateCalendarQuery, [
        choreType,
        days.monday || null,
        days.tuesday || null,
        days.wednesday || null,
        days.thursday || null,
        days.friday || null,
        days.saturday || null,
        days.sunday || null,
        scheduleId
      ], (err) => {
        if (err) {
          return db.rollback(() => res.status(500).json({ error: err.message }));
        }
        
        // Update the chore record (if you want to update choretype and amount)
        const updateChoreQuery = `
          UPDATE chore 
          SET choretype = ?, amount = ?
          WHERE choreid = ?
        `;
        db.query(updateChoreQuery, [choreType, amount, choreId], (err) => {
          if (err) {
            return db.rollback(() => res.status(500).json({ error: err.message }));
          }
          
          db.commit(err => {
            if (err) {
              return db.rollback(() => res.status(500).json({ error: err.message }));
            }
            res.json({ message: 'Chore updated successfully' });
          });
        });
      });
    });
  });
});

// Get all children
app.get('/api/children', (req, res) => {
  db.query('SELECT * FROM child', (err, results) => {
    if (err) {
      console.error('Error fetching children:', err);
      return res.status(500).json({ error: err.message });
    }
    
    res.json(results);
  });
});