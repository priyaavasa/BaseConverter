const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// GET route for root URL
app.get('/', (req, res) => {
  res.send('🚀 Number Converter API is running!');
});
const fs = require("fs");
const path = require("path");

app.post("/convert", (req, res) => {
  const { number, fromBase, toBase } = req.body;
  const decimal = parseInt(number, fromBase);

  if (isNaN(decimal)) {
    return res.status(400).json({ error: "Invalid number input" });
  }

  const converted = decimal.toString(toBase).toUpperCase();

  const logEntry = {
    number,
    fromBase,
    toBase,
    result: converted,
    timestamp: new Date().toISOString()
  };

  const logFile = path.join(__dirname, "history.json");

  let history = [];
  if (fs.existsSync(logFile)) {
    const rawData = fs.readFileSync(logFile);
    history = JSON.parse(rawData || "[]");
  }

  history.push(logEntry);
  fs.writeFileSync(logFile, JSON.stringify(history, null, 2));

  res.json({ result: converted });
});

// app.post('/convert', (req, res) => {
//   const { number, fromBase, toBase } = req.body;

//   try {
//     const result = parseInt(number, fromBase).toString(toBase).toUpperCase();

//     console.log('📥 Payload received:', req.body);
//     console.log('✅ Converted Result:', result); 

//     const steps = [
//       `Received number: ${number}`,
//       `From base: ${fromBase}`,
//       `To base: ${toBase}`,
//       `Converted result: ${result}`
//     ];

//     res.json({ steps });
//   } catch (error) {
//     console.error('❌ Conversion error:', error);
//     res.status(400).json({ error: 'Invalid input for conversion.' });
//   }
// });

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
});

app.get("/history", (req, res) => {
  const logFile = path.join(__dirname, "history.json");

  if (!fs.existsSync(logFile)) {
    return res.json([]);
  }

  const data = fs.readFileSync(logFile);
  const history = JSON.parse(data || "[]");

  res.json(history);
});
