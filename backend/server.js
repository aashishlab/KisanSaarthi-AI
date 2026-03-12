const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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
