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
>>>>>>> e070ce5c590af9a0f92e914482427d3d37ec3b91
    });

    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      location TEXT
    )`, (err) => {
      if (err) {
        console.error('Error creating users table', err.message);
      } else {
        console.log('Users table ready.');
      }
    });

    db.run(`CREATE TABLE IF NOT EXISTS hubs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      factory_id INTEGER,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      location TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      capacity_per_slot INTEGER NOT NULL,
      queue_size INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (factory_id) REFERENCES users(id)
    )`, (err) => {
      if (err) {
        console.error('Error creating hubs table', err.message);
      } else {
        console.log('Hubs table ready.');
      }
    });
  }
});

module.exports = db;
