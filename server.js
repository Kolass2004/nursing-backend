const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Use body-parser to parse JSON request bodies
app.use(bodyParser.json());

// Define the paths to the JSON files
const nameFilePath = path.join(__dirname, 'name.json');
const configFilePath = path.join(__dirname, 'config.json');

// Route to serve the name.json data
app.get('/data', (req, res) => {
    fs.readFile(nameFilePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading name.json file');
            return;
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    });
});

// Route to handle POST requests to update the config.json
app.post('/config', (req, res) => {
    const newConfig = req.body;

    // Read the existing config file
    fs.readFile(configFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading config.json file');
        }

        let config;
        try {
            config = JSON.parse(data);
        } catch (parseErr) {
            return res.status(500).send('Error parsing config.json file');
        }

        // Update the config with new data
        config = { ...config, ...newConfig };

        // Write the updated config back to the file
        fs.writeFile(configFilePath, JSON.stringify(config, null, 2), 'utf8', (writeErr) => {
            if (writeErr) {
                return res.status(500).send('Error writing config.json file');
            }
            res.send('Config updated successfully');
        });
    });
});

// Route to serve the config.json data
app.get('/configdata', (req, res) => {
    fs.readFile(configFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading config.json file');
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
