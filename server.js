const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Config, initializeDatabase, sequelize } = require('./database');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Use body-parser to parse JSON request bodies
app.use(bodyParser.json());

// Initialize the database
initializeDatabase();

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
app.post('/config', async (req, res) => {
    const newConfig = req.body;

    try {
        let config = await Config.findOne({ where: { month: newConfig.month } });
        if (config) {
            // Update existing config
            config.postings = newConfig.postings;
            config.allposting = newConfig.allposting;
            await config.save();
        } else {
            // Create new config
            await Config.create(newConfig);
        }
        res.send('Config updated successfully');
    } catch (error) {
        res.status(500).send('Error updating config data');
    }
});

// Route to serve the config data
app.get('/configdata', async (req, res) => {
    try {
        const configData = await Config.findAll();
        res.setHeader('Content-Type', 'application/json');
        res.send(configData);
    } catch (error) {
        res.status(500).send('Error reading config data');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
