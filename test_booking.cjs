const http = require('http');

const data = JSON.stringify({
  farmer_id: 1,
  hub_id: 1,
  vehicle_number: "TEST-1234",
  total_load: 61,
  slots: [
    { slot_id: 1, slot_time: "01:00 PM - 02:00 PM", allocated_load: 40 },
    { slot_id: 2, slot_time: "02:00 PM - 03:00 PM", allocated_load: 21 }
  ]
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/book-slot',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
