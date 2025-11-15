require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const { pool, query, getMedicinesBySymptoms } = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// In-memory store for temporary backend
let items = [
  { id: 1, name: 'First item', description: 'A sample item' }
];
let nextId = 2;

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Basic CRUD for /api/items
app.get('/api/items', (req, res) => {
  res.json(items);
});

app.get('/api/items/:id', (req, res) => {
  const id = Number(req.params.id);
  const item = items.find(i => i.id === id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

app.post('/api/items', (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const item = { id: nextId++, name, description: description || '' };
  items.push(item);
  res.status(201).json(item);
});

app.put('/api/items/:id', (req, res) => {
  const id = Number(req.params.id);
  const { name, description } = req.body;
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  if (name !== undefined) items[idx].name = name;
  if (description !== undefined) items[idx].description = description;
  res.json(items[idx]);
});

app.delete('/api/items/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const removed = items.splice(idx, 1)[0];
  res.json(removed);
});

app.listen(PORT, () => {
  console.log(`Temp backend listening on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server');
  process.exit(0);
});
