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
    const stmt = db.prepare('INSERT INTO Config (month, postings, allposting) VALUES (?, ?, ?)');
    stmt.run(newConfig.month, JSON.stringify(newConfig.postings), JSON.stringify(newConfig.allposting));
    res.send('Config updated successfully');
});

// Route to serve the config data
app.get('/configdata', (req, res) => {
    const rows = db.prepare('SELECT * FROM Config').all();
    res.setHeader('Content-Type', 'application/json');
    res.send(rows);
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;  // Export the app for vercel
