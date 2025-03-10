-- Display the created data
SELECT 'Children:' AS '';
SELECT * FROM child;

SELECT 'Parent:' AS '';
SELECT * FROM parent;

SELECT 'Calendar:' AS '';
SELECT * FROM calendar;

SELECT 'Chore:' AS '';
SELECT * FROM chore;

-- View a more readable version of the assignments
SELECT 
  c.choretype AS 'Chore',
  c.amount AS 'Points',
  c1.username AS 'Monday',
  c2.username AS 'Wednesday',
  c3.username AS 'Friday',
  p.username AS 'Assigned By'
FROM chore c
JOIN calendar cal ON c.schedule = cal.calendarid
JOIN child c1 ON cal.mondayassignee = c1.userid
JOIN child c2 ON cal.wednesdayassignee = c2.userid
JOIN child c3 ON cal.fridayassignee = c3.userid
JOIN parent p ON c.assignedby = p.userid;


-- Display all children and their points
SELECT 'Children and Points:' AS '';
SELECT 
  child.userid,
  child.username AS 'Name',
  child.age AS 'Age',
  child.totalpoints AS 'Total Points'
FROM child
ORDER BY totalpoints DESC;

-- Display all chores and their point values
SELECT 'Chores and Point Values:' AS '';
SELECT 
  choretype AS 'Chore',
  amount AS 'Points per Completion'
FROM chore;

-- Display all Monday chores and assignments
SELECT 'Monday Chores:' AS '';
SELECT 
  c.choretype AS 'Chore',
  c.amount AS 'Points',
  ch.username AS 'Assigned To',
  CASE WHEN cal.mondaycompleted THEN 'Yes' ELSE 'No' END AS 'Completed'
FROM chore c
JOIN calendar cal ON c.schedule = cal.calendarid
JOIN child ch ON cal.mondayassignee = ch.userid
WHERE cal.mondayassignee IS NOT NULL;

-- Display all Wednesday chores and assignments
SELECT 'Wednesday Chores:' AS '';
SELECT 
  c.choretype AS 'Chore',
  c.amount AS 'Points',
  ch.username AS 'Assigned To',
  CASE WHEN cal.wednesdaycompleted THEN 'Yes' ELSE 'No' END AS 'Completed'
FROM chore c
JOIN calendar cal ON c.schedule = cal.calendarid
JOIN child ch ON cal.wednesdayassignee = ch.userid
WHERE cal.wednesdayassignee IS NOT NULL;

-- Show each child's assigned chores for the week
SELECT 'Weekly Chore Summary by Child:' AS '';
SELECT 
  ch.username AS 'Child',
  COUNT(DISTINCT CASE WHEN cal.mondayassignee = ch.userid THEN c.choreid END) AS 'Monday',
  COUNT(DISTINCT CASE WHEN cal.tuesdayassignee = ch.userid THEN c.choreid END) AS 'Tuesday',
  COUNT(DISTINCT CASE WHEN cal.wednesdayassignee = ch.userid THEN c.choreid END) AS 'Wednesday',
  COUNT(DISTINCT CASE WHEN cal.thursdayassignee = ch.userid THEN c.choreid END) AS 'Thursday',
  COUNT(DISTINCT CASE WHEN cal.fridayassignee = ch.userid THEN c.choreid END) AS 'Friday',
  COUNT(DISTINCT CASE WHEN cal.saturdayassignee = ch.userid THEN c.choreid END) AS 'Saturday',
  COUNT(DISTINCT CASE WHEN cal.sundayassignee = ch.userid THEN c.choreid END) AS 'Sunday',
  COUNT(DISTINCT CASE 
    WHEN cal.mondayassignee = ch.userid OR
         cal.tuesdayassignee = ch.userid OR
         cal.wednesdayassignee = ch.userid OR
         cal.thursdayassignee = ch.userid OR
         cal.fridayassignee = ch.userid OR
         cal.saturdayassignee = ch.userid OR
         cal.sundayassignee = ch.userid
    THEN c.choreid END) AS 'Total Chores'
FROM child ch
LEFT JOIN calendar cal ON 
  cal.mondayassignee = ch.userid OR
  cal.tuesdayassignee = ch.userid OR
  cal.wednesdayassignee = ch.userid OR
  cal.thursdayassignee = ch.userid OR
  cal.fridayassignee = ch.userid OR
  cal.saturdayassignee = ch.userid OR
  cal.sundayassignee = ch.userid
LEFT JOIN chore c ON cal.calendarid = c.schedule
GROUP BY ch.username;

-- Show completed vs. pending chores by child
SELECT 'Completion Status by Child:' AS '';
SELECT 
  ch.username AS 'Child',
  SUM(CASE WHEN 
      (cal.mondayassignee = ch.userid AND cal.mondaycompleted) OR
      (cal.tuesdayassignee = ch.userid AND cal.tuesdaycompleted) OR
      (cal.wednesdayassignee = ch.userid AND cal.wednesdaycompleted) OR
      (cal.thursdayassignee = ch.userid AND cal.thursdaycompleted) OR
      (cal.fridayassignee = ch.userid AND cal.fridaycompleted) OR
      (cal.saturdayassignee = ch.userid AND cal.saturdaycompleted) OR
      (cal.sundayassignee = ch.userid AND cal.sundaycompleted)
    THEN 1 ELSE 0 END) AS 'Completed',
  SUM(CASE WHEN 
      (cal.mondayassignee = ch.userid AND NOT cal.mondaycompleted) OR
      (cal.tuesdayassignee = ch.userid AND NOT cal.tuesdaycompleted) OR
      (cal.wednesdayassignee = ch.userid AND NOT cal.wednesdaycompleted) OR
      (cal.thursdayassignee = ch.userid AND NOT cal.thursdaycompleted) OR
      (cal.fridayassignee = ch.userid AND NOT cal.fridaycompleted) OR
      (cal.saturdayassignee = ch.userid AND NOT cal.saturdaycompleted) OR
      (cal.sundayassignee = ch.userid AND NOT cal.sundaycompleted)
    THEN 1 ELSE 0 END) AS 'Pending'
FROM child ch
LEFT JOIN calendar cal ON 
  cal.mondayassignee = ch.userid OR
  cal.tuesdayassignee = ch.userid OR
  cal.wednesdayassignee = ch.userid OR
  cal.thursdayassignee = ch.userid OR
  cal.fridayassignee = ch.userid OR
  cal.saturdayassignee = ch.userid OR
  cal.sundayassignee = ch.userid
GROUP BY ch.username;