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

// Helper function to handle database queries with promises
const dbQuery = (query, params = []) => new Promise((resolve, reject) => {
    try {
        const stmt = db.prepare(query);
        const result = stmt.run(...params);
        resolve(result);
    } catch (error) {
        reject(error);
    }
});

// Helper function to handle database transactions with promises
const dbTransaction = (actions) => new Promise((resolve, reject) => {
    const transaction = db.transaction(actions);
    try {
        resolve(transaction());
    } catch (error) {
        reject(error);
    }
});

// Route to serve the name.json data
app.get('/data', (req, res) => {
    const nameFilePath = path.join(__dirname, 'name.json');
    fs.readFile(nameFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading name.json file' });
        }
        res.json(JSON.parse(data));
    });
});

// Route to handle POST requests to update the config data
app.post('/config', async (req, res) => {
    const newConfig = req.body;
    try {
        const result = await dbQuery('UPDATE Config SET month = ?, postings = ?, allposting = ? WHERE id = 1', 
            [newConfig.month, JSON.stringify(newConfig.postings), JSON.stringify(newConfig.allposting)]
        );
        if (result.changes === 0) {
            await dbQuery('INSERT INTO Config (id, month, postings, allposting) VALUES (1, ?, ?, ?)', 
                [newConfig.month, JSON.stringify(newConfig.postings), JSON.stringify(newConfig.allposting)]
            );
        }
        res.send('Config updated successfully');
    } catch (error) {
        console.error('Error updating config:', error);
        res.status(500).send('Error updating config');
    }
});

// Route to serve the config data
app.get('/configdata', (req, res) => {
    const row = db.prepare('SELECT * FROM Config WHERE id = 1').get();
    if (row) {
        row.postings = JSON.parse(row.postings);
        row.allposting = JSON.parse(row.allposting);
        res.json(row);
    } else {
        res.status(404).send('Config data not found');
    }
});

// Route to handle POST requests to submit student data
app.post('/submit', async (req, res) => {
    const students = req.body.students;

    try {
        await dbTransaction(() => {
            for (const student of students) {
                const existingStudent = db.prepare('SELECT * FROM Students WHERE name = ?').get(student.name);
                if (existingStudent) {
                    db.prepare('UPDATE Students SET post1 = ?, post2 = ?, post3 = ?, post4 = ?, post5 = ?, post6 = ? WHERE name = ?')
                        .run(student.post1, student.post2, student.post3, student.post4, student.post5, student.post6, student.name);
                } else {
                    db.prepare('INSERT INTO Students (name, post1, post2, post3, post4, post5, post6) VALUES (?, ?, ?, ?, ?, ?, ?)')
                        .run(student.name, student.post1, student.post2, student.post3, student.post4, student.post5, student.post6);
                }
            }
        });
        res.send('Students data submitted successfully');
    } catch (error) {
        console.error('Error submitting students data:', error);
        res.status(500).send('Error submitting students data');
    }
});

// Route to handle GET requests to fetch submitted student data
app.get('/submitData', (req, res) => {
    const rows = db.prepare('SELECT * FROM Students').all();
    res.json({ students: rows });
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
