const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

console.log(
  'TARKISTUS: MONGODB_URI on:',
  process.env.MONGODB_URI ? 'Löytyi!' : 'TYHJÄ (undefined)',
);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Hyvä lisätä tässä vaiheessa Angularia varten
require('dotenv').config();

// Tuodaan malli (varmista, että olet luonut models/User.js tiedoston)
const User = require('./models/User');
const Budget = require('./models/Budget');
const Entertainment = require('./models/Entertainment');

const app = express();

// --- MIDDLEWARE ---
app.use(cors()); // Sallii Angular-sovelluksen ottaa yhteyden tähän backendiin
app.use(express.json()); // Sallii JSON-datan lukemisen pyynnöistä

// --- TIETOKANTAYHTEYS ---
const uri = process.env.MONGODB_URI;
mongoose
  .connect(uri)
  .then(() => console.log('✅ Yhteys MongoDB-pilveen ok!'))
  .catch((error) => console.error('❌ Yhteysvirhe:', error.message));

// --- REITIT (ROUTES) ---

// Perusreitti testaamiseen selaimella (localhost:3000)
app.get('/', (req, res) => {
  res.send(
    'Paljon onnea kaikille syntymäpäiväsankareille ja hyvää vappua jutille! 🎉🎂🍾',
  );
});

// REITTI 1: Hae kaikki käyttäjät (localhost:3000/api/users)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1. Varmista ensin, että olet tuonut mallin tiedoston yläosassa:
// const Entertainment = require('./models/Entertainment');

// 2. Lisää itse reitti:
app.get('/api/entertainment', async (req, res) => {
  try {
      const items = await Entertainment.find();
      res.json(items);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

app.get('/api/entertainment/:userId', async (req, res) => {
  try {
      const items = await Entertainment.find({ user_id: req.params.userId });
      res.json(items);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

// HAE TIETYN KÄYTTÄJÄN BUDJETTI (Tätä Angular-sovelluksesi tulee käyttämään)
// Esim: localhost:3000/api/budgets/testi-user-123
// 1. TALLENNUS (POST) - Laita tämä ensin!
app.post('/api/budgets', async (req, res) => {
  try {
    const newEntry = new Budget(req.body);
    const savedEntry = await newEntry.save();
    console.log("Onnistui! Tallennettu:", savedEntry);
    res.status(201).json(savedEntry); // Tämän PITÄÄ palauttaa 201
  } catch (err) {
    console.error("Tallennus epäonnistui:", err.message);
    res.status(400).json({ error: err.message });
  }
});

// 2. HAKU (GET) - Kaikki budjetit
app.get('/api/budgets', async (req, res) => {
  try {
    const budgets = await Budget.find();
    res.json(budgets); // Tämä palauttaa 200 OK
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// REITTI 2: Lisää uusi käyttäjä (tätä testataan Postmanilla)
app.post('/api/users', async (req, res) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- SERVERIN KÄYNNISTYS ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveri pyörii portissa ${PORT}`);
});
