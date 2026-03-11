const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Route: Create a new slot booking
app.post('/api/book-slot', (req, res) => {
  const { farmer_name, vehicle_no, hub_name, arrival_slot } = req.body;
  if (!farmer_name || !vehicle_no || !hub_name || !arrival_slot) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const sql = `INSERT INTO bookings (farmer_name, vehicle_no, hub_name, arrival_slot) VALUES (?, ?, ?, ?)`;
  const params = [farmer_name, vehicle_no, hub_name, arrival_slot];
  
  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      message: 'Booking created successfully',
      data: {
        id: this.lastID,
        farmer_name,
        vehicle_no,
        hub_name,
        arrival_slot,
        status: 'Waiting'
      }
    });
  });
});

// API Route: Get the current queue data and metrics
app.get('/api/queue', (req, res) => {
  const sql = `SELECT * FROM bookings ORDER BY id DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Calculate simple metrics based on the data
    const waiting = rows.filter(row => row.status === 'Waiting').length;
    const active = rows.filter(row => row.status === 'In Progress').length;
    const completed = rows.filter(row => row.status === 'Mark Unloaded').length;
    
    res.json({
      metrics: {
        waiting,
        active,
        completed
      },
      queue: rows
    });
  });
});

// API Route: Update booking status
app.put('/api/update-status/:id', (req, res) => {
  const bookingId = req.params.id;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: 'Status is required.' });
  }

  const sql = `UPDATE bookings SET status = ? WHERE id = ?`;
  db.run(sql, [status, bookingId], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Booking not found.' });
    }
    res.json({ message: 'Status updated successfully', data: { id: bookingId, status } });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
