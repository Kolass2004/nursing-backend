const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database'); // Import the database module

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Route to serve the name.json data
app.get('/data', (req, res) => {
    const nameFilePath = path.join(__dirname, 'name.json');
    fs.readFile(nameFilePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading name.json file');
            return;
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    });
});

// Route to handle POST requests to update the config data
app.post('/config', (req, res) => {
    const newConfig = req.body;
    const stmt = db.prepare('UPDATE Config SET month = ?, postings = ?, allposting = ? WHERE id = 1');
    const info = stmt.run(newConfig.month, JSON.stringify(newConfig.postings), JSON.stringify(newConfig.allposting));

    if (info.changes === 0) {
        // If no rows were updated, insert a new row (initial case)
        const insertStmt = db.prepare('INSERT INTO Config (id, month, postings, allposting) VALUES (1, ?, ?, ?)');
        insertStmt.run(newConfig.month, JSON.stringify(newConfig.postings), JSON.stringify(newConfig.allposting));
    }

    res.send('Config updated successfully');
});

// Route to serve the config data
app.get('/configdata', (req, res) => {
    const row = db.prepare('SELECT * FROM Config WHERE id = 1').get();
    
    // Parse JSON strings back into objects
    if (row) {
        row.postings = JSON.parse(row.postings);
        row.allposting = JSON.parse(row.allposting);
    }
    
    res.setHeader('Content-Type', 'application/json');
    res.send(row);
});

// Route to handle POST requests to submit student data
app.post('/submit', (req, res) => {
    const students = req.body.students;

    // Use a transaction to handle multiple updates/insertions
    const transaction = db.transaction(students => {
        students.forEach(student => {
            // Check if student already exists
            const existingStudent = db.prepare('SELECT * FROM Students WHERE name = ?').get(student.name);
            
            if (existingStudent) {
                // Update existing student
                const stmt = db.prepare('UPDATE Students SET post1 = ?, post2 = ?, post3 = ?, post4 = ?, post5 = ?, post6 = ? WHERE name = ?');
                stmt.run(student.post1, student.post2, student.post3, student.post4, student.post5, student.post6, student.name);
            } else {
                // Insert new student
                const stmt = db.prepare('INSERT INTO Students (name, post1, post2, post3, post4, post5, post6) VALUES (?, ?, ?, ?, ?, ?, ?)');
                stmt.run(student.name, student.post1, student.post2, student.post3, student.post4, student.post5, student.post6);
            }
        });
    });

    try {
        transaction(students);
        res.send('Students data submitted successfully');
    } catch (error) {
        console.error('Error submitting students data:', error);
        res.status(500).send('Error submitting students data');
    }
});

// Route to handle GET requests to fetch submitted student data
app.get('/submitData', (req, res) => {
    const rows = db.prepare('SELECT * FROM Students').all();
    
    res.setHeader('Content-Type', 'application/json');
    res.send({ students: rows });
});

// Route to clear all data from the Students and Config tables
app.get('/clearData', (req, res) => {
    try {
        db.exec('DELETE FROM Students');
        db.exec('DELETE FROM Config');
        res.send('All data cleared successfully');
    } catch (error) {
        console.error('Error clearing data:', error);
        res.status(500).send('Error clearing data');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;  // Export the app for vercel
