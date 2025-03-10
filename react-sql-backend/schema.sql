-- Enable foreign key checks (MySQL version of PRAGMA foreign_keys = ON)
SET FOREIGN_KEY_CHECKS = 1;

CREATE DATABASE eecs497_db;
USE eecs497_db;

-- Create child table first since parent references it
CREATE TABLE child(
   userid INTEGER PRIMARY KEY AUTO_INCREMENT,
   username VARCHAR(100) NOT NULL,
   age INTEGER NOT NULL,
   totalpoints INTEGER
);

-- Create parent table with proper foreign key reference
CREATE TABLE parent(
   userid INTEGER PRIMARY KEY AUTO_INCREMENT,
   username VARCHAR(100) NOT NULL,
   email VARCHAR(100) NOT NULL,
   password VARCHAR(256) NOT NULL,
   child_id INTEGER,
   FOREIGN KEY(child_id) REFERENCES child(userid) ON DELETE CASCADE
);

-- Create calendar table
CREATE TABLE calendar(
   calendarid INTEGER PRIMARY KEY AUTO_INCREMENT,
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
   FOREIGN KEY(mondayassignee) REFERENCES child(userid),
   FOREIGN KEY(tuesdayassignee) REFERENCES child(userid),
   FOREIGN KEY(wednesdayassignee) REFERENCES child(userid),
   FOREIGN KEY(thursdayassignee) REFERENCES child(userid),
   FOREIGN KEY(fridayassignee) REFERENCES child(userid),
   FOREIGN KEY(saturdayassignee) REFERENCES child(userid),
   FOREIGN KEY(sundayassignee) REFERENCES child(userid)
);

-- Create chore table
CREATE TABLE chore(
   choreid INTEGER PRIMARY KEY AUTO_INCREMENT,
   choretype VARCHAR(40) NOT NULL,
   amount INTEGER NOT NULL,
   schedule INTEGER,
   assignedby INTEGER,
   FOREIGN KEY(schedule) REFERENCES calendar(calendarid) ON DELETE CASCADE,
   FOREIGN KEY(assignedby) REFERENCES parent(userid)
);