-- Enable foreign key checks (MySQL version of PRAGMA foreign_keys = ON)
SET FOREIGN_KEY_CHECKS = 1;

CREATE DATABASE eecs497_db;
USE eecs497_db;

-- 1. Create the household table
CREATE TABLE household (
    householdid INTEGER PRIMARY KEY AUTO_INCREMENT,
    created DATETIME DEFAULT CURRENT_TIMESTAMP
    -- Optionally, add other columns like household_name, address, etc.
);

-- 2. Create the child table and add a householdid column
CREATE TABLE child (
   userid INTEGER PRIMARY KEY AUTO_INCREMENT,
   username VARCHAR(100) NOT NULL,
   age INTEGER NOT NULL,
   totalpoints INTEGER,
   householdid INTEGER NOT NULL,
   FOREIGN KEY (householdid) REFERENCES household(householdid) ON DELETE CASCADE
);

-- 3. Create the parent table and add a householdid column
CREATE TABLE parent (
   userid INTEGER PRIMARY KEY AUTO_INCREMENT,
   username VARCHAR(100) NOT NULL,
   email VARCHAR(100) NOT NULL,
   password VARCHAR(256) NOT NULL,
   householdid INTEGER NOT NULL,
   FOREIGN KEY (householdid) REFERENCES household(householdid) ON DELETE CASCADE
);

-- 4. Create the calendar table (now also associated with a household)
CREATE TABLE calendar (
   calendarid INTEGER PRIMARY KEY AUTO_INCREMENT,
   householdid INTEGER NOT NULL,
   text VARCHAR(1024) NOT NULL,
   created DATETIME DEFAULT CURRENT_TIMESTAMP,
   mondayassignee INTEGER,
   mondaycompleted BOOLEAN DEFAULT FALSE,
   tuesdayassignee INTEGER,
   tuesdaycompleted BOOLEAN DEFAULT FALSE,
   wednesdayassignee INTEGER,
   wednesdaycompleted BOOLEAN DEFAULT FALSE,
   thursdayassignee INTEGER,
   thursdaycompleted BOOLEAN DEFAULT FALSE,
   fridayassignee INTEGER,
   fridaycompleted BOOLEAN DEFAULT FALSE,
   saturdayassignee INTEGER,
   saturdaycompleted BOOLEAN DEFAULT FALSE,
   sundayassignee INTEGER,
   sundaycompleted BOOLEAN DEFAULT FALSE,
   FOREIGN KEY (householdid) REFERENCES household(householdid) ON DELETE CASCADE,
   FOREIGN KEY(mondayassignee) REFERENCES child(userid),
   FOREIGN KEY(tuesdayassignee) REFERENCES child(userid),
   FOREIGN KEY(wednesdayassignee) REFERENCES child(userid),
   FOREIGN KEY(thursdayassignee) REFERENCES child(userid),
   FOREIGN KEY(fridayassignee) REFERENCES child(userid),
   FOREIGN KEY(saturdayassignee) REFERENCES child(userid),
   FOREIGN KEY(sundayassignee) REFERENCES child(userid)
);

-- 5. Create the chore table (referencing calendar and parent)
CREATE TABLE chore (
   choreid INTEGER PRIMARY KEY AUTO_INCREMENT,
   choretype VARCHAR(40) NOT NULL,
   amount INTEGER NOT NULL,
   schedule INTEGER,
   assignedby INTEGER,
   FOREIGN KEY(schedule) REFERENCES calendar(calendarid) ON DELETE CASCADE,
   FOREIGN KEY(assignedby) REFERENCES parent(userid)
);
