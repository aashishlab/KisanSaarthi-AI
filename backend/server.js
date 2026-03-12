const express = require('express');
const cors = require('cors');
const db = require('./database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_jwt_secret_key'; // In a real app, use an environment variable

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Factory & Hub Routes ---

// API Route: Register a new factory with a hub
app.post('/api/factory/register', async (req, res) => {
  const { factory_name, phone, password, hub_name, category, location, latitude, longitude, capacity_per_slot } = req.body;

  if (!factory_name || !phone || !password || !hub_name || !category || !location || latitude == null || longitude == null || !capacity_per_slot) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 1: Insert factory user
    const userSql = `INSERT INTO users (name, role, phone, password, location) VALUES (?, 'factory', ?, ?, ?)`;
    db.run(userSql, [factory_name, phone, hashedPassword, location], function (err) {
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
  } catch (error) {
    res.status(500).json({ error: 'Error hashing password' });
  }
});

// API Route: Register a new farmer
app.post('/api/farmer/register', async (req, res) => {
  const { name, phone, password, village, vehicle_no, crop_type, preferred_hub } = req.body;

  if (!name || !phone || !password || !village || !vehicle_no || !crop_type || !preferred_hub) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO farmers (name, phone, password, village, vehicle_no, crop_type, preferred_hub, role)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'farmer')`;
    
    db.run(sql, [name, phone, hashedPassword, village, vehicle_no, crop_type, preferred_hub], function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          if (err.message.includes('phone')) {
            return res.status(400).json({ error: 'A farmer with this phone number already exists.' });
          }
          if (err.message.includes('vehicle_no')) {
            return res.status(400).json({ error: 'This vehicle number is already registered.' });
          }
        }
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        message: 'Farmer registered successfully',
        data: { id: this.lastID, name, role: 'farmer' }
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error hashing password' });
  }
});

// API Route: Unified Login
app.post('/api/login', (req, res) => {
  const { phone, password, role } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ error: 'Phone and password are required.' });
  }

  // Helper to check password (bcrypt or plain text)
  const checkPassword = async (inputPassword, storedPassword) => {
    if (storedPassword.startsWith('$2b$')) {
      return await bcrypt.compare(inputPassword, storedPassword);
    }
    return inputPassword === storedPassword;
  };

  const checkFarmer = () => {
    return new Promise((resolve) => {
      db.get(`SELECT * FROM farmers WHERE phone = ?`, [phone], async (err, farmer) => {
        if (err || !farmer) return resolve(null);
        const match = await checkPassword(password, farmer.password);
        if (match) {
          const token = jwt.sign({ id: farmer.id, role: 'farmer', name: farmer.name }, JWT_SECRET, { expiresIn: '24h' });
          resolve({ message: 'Login successful', token, role: 'farmer', name: farmer.name });
        } else {
          resolve(null);
        }
      });
    });
  };

  const checkUser = () => {
    return new Promise((resolve) => {
      db.get(`SELECT * FROM users WHERE phone = ?`, [phone], async (err, user) => {
        if (err || !user) return resolve(null);
        const match = await checkPassword(password, user.password);
        if (match) {
          const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
          resolve({ message: 'Login successful', token, role: user.role, name: user.name });
        } else {
          resolve(null);
        }
      });
    });
  };

  const runLogin = async () => {
    if (role === 'farmer') {
      const farmerRes = await checkFarmer();
      if (farmerRes) return res.json(farmerRes);
    } else if (role === 'factory') {
      const userRes = await checkUser();
      if (userRes) return res.json(userRes);
    } else {
      // Unified login without role hint
      const farmerRes = await checkFarmer();
      if (farmerRes) return res.json(farmerRes);
      const userRes = await checkUser();
      if (userRes) return res.json(userRes);
    }
    return res.status(401).json({ error: 'Invalid credentials' });
  };

  runLogin();
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
  '08:00 AM - 09:00 AM', '09:00 AM - 10:00 AM', '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM', '12:00 PM - 01:00 PM', '01:00 PM - 02:00 PM',
  '02:00 PM - 03:00 PM', '03:00 PM - 04:00 PM', '04:00 PM - 05:00 PM',
];

// ─────────────────────────────────────────────────────────
// FARMER REQUEST ROUTES (requests table)
// ─────────────────────────────────────────────────────────

// POST /api/send-request  – farmer submits a new request
app.post('/api/send-request', (req, res) => {
  const { farmer_name, vehicle_no, hub_name, crop_type, preferred_date, preferred_time } = req.body;
  if (!farmer_name || !vehicle_no || !hub_name || !crop_type || !preferred_date || !preferred_time) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  const sql = `INSERT INTO requests (farmer_name, vehicle_no, hub_name, crop_type, preferred_date, preferred_time, status)
               VALUES (?, ?, ?, ?, ?, ?, 'Pending')`;
  db.run(sql, [farmer_name, vehicle_no, hub_name, crop_type, preferred_date, preferred_time], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({
      message: 'Request submitted successfully',
      data: { id: this.lastID, farmer_name, vehicle_no, hub_name, crop_type, preferred_date, preferred_time, status: 'Pending' }
    });
  });
});

// GET /api/requests  – get all pending requests with AI slot recommendation
app.get('/api/requests', (req, res) => {
  const MAX_PER_SLOT = 3;

  db.all(`SELECT arrival_slot, COUNT(*) as count FROM bookings WHERE status IN ('Waiting','In Progress','Approved') GROUP BY arrival_slot`, [], (err, slotCounts) => {
    if (err) return res.status(500).json({ error: err.message });

    const slotUsage = {};
    ALL_SLOTS.forEach(s => slotUsage[s] = 0);
    slotCounts.forEach(r => { if (slotUsage[r.arrival_slot] !== undefined) slotUsage[r.arrival_slot] = r.count; });
    const availableSlots = ALL_SLOTS.filter(s => slotUsage[s] < MAX_PER_SLOT);

    db.all(`SELECT * FROM requests WHERE status = 'Pending' ORDER BY id ASC`, [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      const tentativeSlotUsage = { ...slotUsage };

      const requestsWithRecommendation = rows.map(req => {
        // Match preferred_time to nearest slot
        const preferredIdx = ALL_SLOTS.findIndex(s => s.startsWith(req.preferred_time.split(' ')[0]));
        const matchIdx = preferredIdx >= 0 ? preferredIdx : 0;

        const preferredSlotAvail = ALL_SLOTS[matchIdx] && tentativeSlotUsage[ALL_SLOTS[matchIdx]] < MAX_PER_SLOT;
        let recommendedSlot = null;

        if (preferredSlotAvail) {
          recommendedSlot = ALL_SLOTS[matchIdx];
        } else {
          let bestSlot = null, minDist = Infinity;
          ALL_SLOTS.forEach((slot, idx) => {
            if (tentativeSlotUsage[slot] < MAX_PER_SLOT) {
              const dist = Math.abs(idx - matchIdx);
              if (dist < minDist) { minDist = dist; bestSlot = slot; }
            }
          });
          recommendedSlot = bestSlot;
        }

        if (recommendedSlot) tentativeSlotUsage[recommendedSlot]++;
        const slotLoad = slotUsage[recommendedSlot] || 0;
        const slotLoadLabel = slotLoad === 0 ? 'Empty' : slotLoad < 2 ? 'Low Load' : 'Moderate';

        return { ...req, recommended_slot: recommendedSlot, slot_load: slotLoad, slot_load_label: slotLoadLabel };
      });

      res.json({ requests: requestsWithRecommendation, total: requestsWithRecommendation.length, available_slots: availableSlots });
    });
  });
});

// PUT /api/accept-request/:id  – auto-assign next available slot
app.put('/api/accept-request/:id', (req, res) => {
  const id = req.params.id;
  db.all(`SELECT arrival_slot FROM bookings WHERE status IN ('Waiting','In Progress','Approved')`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const usedSlots = rows.map(r => r.arrival_slot);
    const nextSlot = ALL_SLOTS.find(s => !usedSlots.includes(s)) || ALL_SLOTS[0];
    db.run(`UPDATE requests SET status = 'Approved', assigned_slot = ? WHERE id = ? AND status = 'Pending'`, [nextSlot, id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Request not found or already processed.' });
      res.json({ message: 'Request accepted and slot assigned', data: { id, status: 'Approved', arrival_slot: nextSlot } });
    });
  });
});

// PUT /api/reject-request/:id  – reject a pending request
app.put('/api/reject-request/:id', (req, res) => {
  const id = req.params.id;
  db.run(`UPDATE requests SET status = 'Rejected' WHERE id = ? AND status = 'Pending'`, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Request not found or already processed.' });
    res.json({ message: 'Request rejected', data: { id, status: 'Rejected' } });
  });
});

// PUT /api/assign-slot/:id  – manually assign a specific slot
app.put('/api/assign-slot/:id', (req, res) => {
  const id = req.params.id;
  const { arrival_slot } = req.body;
  if (!arrival_slot) return res.status(400).json({ error: 'Arrival slot is required.' });
  db.run(`UPDATE requests SET status = 'Approved', assigned_slot = ? WHERE id = ?`, [arrival_slot, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Request not found.' });
    res.json({ message: 'Slot assigned successfully', data: { id, status: 'Approved', arrival_slot } });
  });
});

// GET /api/pending-count  – live badge count
app.get('/api/pending-count', (req, res) => {
  db.get(`SELECT COUNT(*) as count FROM requests WHERE status = 'Pending'`, [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ count: row.count });
  });
});

// ─────────────────────────────────────────────────────────
// LIVE QUEUE ROUTES (bookings table)
// ─────────────────────────────────────────────────────────

// POST /api/book-slot  – legacy direct booking (kept for backward compat)
app.post('/api/book-slot', (req, res) => {
  const { farmer_name, vehicle_no, hub_name, arrival_slot } = req.body;
  if (!farmer_name || !vehicle_no || !hub_name || !arrival_slot) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  db.run(`INSERT INTO bookings (farmer_name, vehicle_no, hub_name, arrival_slot, status) VALUES (?, ?, ?, ?, 'Waiting')`,
    [farmer_name, vehicle_no, hub_name, arrival_slot], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Booking created', data: { id: this.lastID, farmer_name, vehicle_no, hub_name, arrival_slot, status: 'Waiting' } });
    });
});

// GET /api/queue  – live queue data for factory dashboard
app.get('/api/queue', (req, res) => {
  db.all(`SELECT * FROM bookings WHERE status NOT IN ('Rejected') ORDER BY id DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const waiting = rows.filter(r => r.status === 'Approved' || r.status === 'Waiting').length;
    const active = rows.filter(r => r.status === 'In Progress').length;
    const completed = rows.filter(r => r.status === 'Mark Unloaded').length;
    res.json({ metrics: { waiting, active, completed }, queue: rows });
  });
});

// PUT /api/update-status/:id  – update booking status in queue
app.put('/api/update-status/:id', (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required.' });
  db.run(`UPDATE bookings SET status = ? WHERE id = ?`, [status, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Booking not found.' });
    res.json({ message: 'Status updated', data: { id: req.params.id, status } });
  });
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
