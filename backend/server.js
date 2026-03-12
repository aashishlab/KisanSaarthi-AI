const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Factory & Hub Routes ---

// API Route: Register a new factory with a hub
app.post('/api/factory/register', (req, res) => {
  const { factory_name, phone, password, hub_name, category, location, latitude, longitude, capacity_per_slot } = req.body;

  if (!factory_name || !phone || !password || !hub_name || !category || !location || latitude == null || longitude == null || !capacity_per_slot) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Step 1: Insert factory user
  const userSql = `INSERT INTO users (name, role, phone, password, location) VALUES (?, 'factory', ?, ?, ?)`;
  db.run(userSql, [factory_name, phone, password, location], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'A factory with this phone number already exists.' });
      }
      return res.status(500).json({ error: err.message });
    }

    const factoryId = this.lastID;

    // Step 2: Insert hub linked to factory
    const hubSql = `INSERT INTO hubs (factory_id, name, category, location, latitude, longitude, capacity_per_slot) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(hubSql, [factoryId, hub_name, category, location, parseFloat(latitude), parseFloat(longitude), parseInt(capacity_per_slot)], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        message: 'Factory registered and hub created successfully',
        data: {
          factory_id: factoryId,
          hub_id: this.lastID
        }
      });
    });
  });
});

// API Route: Create a new hub (from factory dashboard)
app.post('/api/hubs', (req, res) => {
  const { factory_id, name, category, location, latitude, longitude, capacity_per_slot } = req.body;
  if (!name || !category || !location || latitude == null || longitude == null || !capacity_per_slot) {
    return res.status(400).json({ error: 'All hub fields are required.' });
  }

  const sql = `INSERT INTO hubs (factory_id, name, category, location, latitude, longitude, capacity_per_slot) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.run(sql, [factory_id || null, name, category, location, parseFloat(latitude), parseFloat(longitude), parseInt(capacity_per_slot)], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Hub created successfully', data: { id: this.lastID } });
  });
});

// API Route: Get all hubs (with optional category filter)
app.get('/api/hubs', (req, res) => {
  const { category } = req.query;
  let sql = `SELECT * FROM hubs`;
  const params = [];

  if (category) {
    sql += ` WHERE category = ?`;
    params.push(category);
  }

  sql += ` ORDER BY created_at DESC`;

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// --- Slot & Booking Routes ---

const ALL_SLOTS = [
  '08:00 AM - 09:00 AM',
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '01:00 PM - 02:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
];

// API Route: Create a new slot booking (Pending by default)
app.post('/api/book-slot', (req, res) => {
  const { farmer_name, vehicle_no, hub_name, arrival_slot } = req.body;
  if (!farmer_name || !vehicle_no || !hub_name || !arrival_slot) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  const sql = `INSERT INTO bookings (farmer_name, vehicle_no, hub_name, arrival_slot, status) VALUES (?, ?, ?, ?, 'Pending')`;
  db.run(sql, [farmer_name, vehicle_no, hub_name, arrival_slot], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({
      message: 'Request submitted successfully',
      data: { id: this.lastID, farmer_name, vehicle_no, hub_name, arrival_slot, status: 'Pending' }
    });
  });
});

// API Route: Get all pending requests
app.get('/api/requests', (req, res) => {
  const sql = `SELECT * FROM bookings WHERE status = 'Pending' ORDER BY id DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ requests: rows, total: rows.length });
  });
});

// API Route: Accept request and auto-assign next available slot
app.put('/api/accept-request/:id', (req, res) => {
  const bookingId = req.params.id;
  db.all(`SELECT arrival_slot FROM bookings WHERE status IN ('Waiting', 'In Progress', 'Approved')`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const usedSlots = rows.map(r => r.arrival_slot);
    const nextSlot = ALL_SLOTS.find(s => !usedSlots.includes(s)) || ALL_SLOTS[0];
    const sql = `UPDATE bookings SET status = 'Approved', arrival_slot = ? WHERE id = ? AND status = 'Pending'`;
    db.run(sql, [nextSlot, bookingId], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Request not found or already processed.' });
      res.json({ message: 'Request accepted and slot assigned', data: { id: bookingId, status: 'Approved', arrival_slot: nextSlot } });
    });
  });
});

// API Route: Reject a pending request
app.put('/api/reject-request/:id', (req, res) => {
  const bookingId = req.params.id;
  const sql = `UPDATE bookings SET status = 'Rejected' WHERE id = ? AND status = 'Pending'`;
  db.run(sql, [bookingId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Request not found or already processed.' });
    res.json({ message: 'Request rejected', data: { id: bookingId, status: 'Rejected' } });
  });
});

// API Route: Assign a specific slot to a request
app.put('/api/assign-slot/:id', (req, res) => {
  const bookingId = req.params.id;
  const { arrival_slot } = req.body;
  if (!arrival_slot) return res.status(400).json({ error: 'Arrival slot is required.' });
  const sql = `UPDATE bookings SET status = 'Approved', arrival_slot = ? WHERE id = ?`;
  db.run(sql, [arrival_slot, bookingId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Booking not found.' });
    res.json({ message: 'Slot assigned successfully', data: { id: bookingId, status: 'Approved', arrival_slot } });
  });
});

// API Route: Get queue data and metrics (non-pending only)
app.get('/api/queue', (req, res) => {
  const sql = `SELECT * FROM bookings WHERE status NOT IN ('Pending', 'Rejected') ORDER BY id DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const waiting = rows.filter(row => row.status === 'Approved' || row.status === 'Waiting').length;
    const active = rows.filter(row => row.status === 'In Progress').length;
    const completed = rows.filter(row => row.status === 'Mark Unloaded').length;
    res.json({ metrics: { waiting, active, completed }, queue: rows });
  });
});

// API Route: Get pending count for notification badge
app.get('/api/pending-count', (req, res) => {
  db.get(`SELECT COUNT(*) as count FROM bookings WHERE status = 'Pending'`, [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ count: row.count });
  });
});

// API Route: Update booking status
app.put('/api/update-status/:id', (req, res) => {
  const bookingId = req.params.id;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required.' });
  const sql = `UPDATE bookings SET status = ? WHERE id = ?`;
  db.run(sql, [status, bookingId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Booking not found.' });
    res.json({ message: 'Status updated successfully', data: { id: bookingId, status } });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
