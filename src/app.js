const express = require('express');
const path = require('node:path');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(morgan('dev')); // Logging requests
app.use(express.static(path.join(__dirname, '../public'))); // Serve frontend

// --- User API Routes ---
app.use('/api/users', userRoutes);

// Application State
let homeState = {
    temperature: 72,
    lightsOn: true,
    securityArmed: false,
    energyUsage: 340, // Watts
    media: {
        isPlaying: false,
        track: "Lofi Study Beats",
        volume: 60
    }
};

let smartDevices = [
    { id: uuidv4(), name: 'Front Door Camera', status: 'online' },
    { id: uuidv4(), name: 'Living Room Thermostat', status: 'online' }
];

// --- Endpoints for Smart Home Dashboard ---

// 1. Get current home status summary
app.get('/api/status', (req, res) => {
    res.status(200).json(homeState);
});

// 5. Media Controls
app.post('/api/media/toggle', (req, res) => {
    homeState.media.isPlaying = !homeState.media.isPlaying;
    res.status(200).json(homeState.media);
});

// 2. Adjust Temperature
app.post('/api/temperature', (req, res) => {
    const { action } = req.body;
    if (action === 'increase') {
        homeState.temperature++;
    } else if (action === 'decrease') {
        homeState.temperature--;
    }
    res.status(200).json({ temperature: homeState.temperature });
});

// 3. Toggle Lights
app.post('/api/lights/toggle', (req, res) => {
    homeState.lightsOn = !homeState.lightsOn;
    // Energy usage changes based on lights
    homeState.energyUsage = homeState.lightsOn ? homeState.energyUsage + 60 : homeState.energyUsage - 60;

    res.status(200).json({
        lightsOn: homeState.lightsOn,
        energyUsage: homeState.energyUsage
    });
});

// 4. Toggle Security System
app.post('/api/security/toggle', (req, res) => {
    homeState.securityArmed = !homeState.securityArmed;
    res.status(200).json({ securityArmed: homeState.securityArmed });
});

// --- CRUD ENDPOINTS: SMART DEVICE MANAGER ---

// READ: Get all devices
app.get('/api/devices', (req, res) => {
    res.status(200).json(smartDevices);
});

// CREATE: Add a new device
app.post('/api/devices', (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Device name is required" });

    const newDevice = {
        id: uuidv4(),
        name: name,
        status: 'online'
    };
    smartDevices.push(newDevice);
    res.status(201).json(newDevice);
});

// UPDATE: Change a device's status
app.put('/api/devices/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const deviceIndex = smartDevices.findIndex(d => d.id === id);
    if (deviceIndex === -1) return res.status(404).json({ error: "Device not found" });

    smartDevices[deviceIndex].status = status;
    res.status(200).json(smartDevices[deviceIndex]);
});

// DELETE: Remove a device
app.delete('/api/devices/:id', (req, res) => {
    const { id } = req.params;
    const deviceIndex = smartDevices.findIndex(d => d.id === id);

    if (deviceIndex === -1) return res.status(404).json({ error: "Device not found" });

    smartDevices.splice(deviceIndex, 1);
    res.status(200).json({ message: "Device deleted successfully" });
});

module.exports = app;