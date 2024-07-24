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

    //res.send('Config updated successfully');
    res.status(200).json({ message: 'Data processed successfully' });

    
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

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;  // Export the app for vercel
