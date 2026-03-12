const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'kisansaarthi.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');

    // Original bookings table (live queue)
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      farmer_name TEXT NOT NULL,
      vehicle_no TEXT NOT NULL,
      hub_name TEXT NOT NULL,
      arrival_slot TEXT NOT NULL,
      status TEXT DEFAULT 'Waiting'
    )`, (err) => {
      if (err) console.error('Error creating bookings table', err.message);
      else console.log('Bookings table ready.');
    });

    // New requests table (farmer request submissions)
    db.run(`CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      farmer_name TEXT NOT NULL,
      vehicle_no TEXT NOT NULL,
      hub_name TEXT NOT NULL,
      crop_type TEXT NOT NULL,
      preferred_date TEXT NOT NULL,
      preferred_time TEXT NOT NULL,
      assigned_slot TEXT,
      status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) console.error('Error creating requests table', err.message);
      else console.log('Requests table ready.');
    });
  }
});

module.exports = db;
