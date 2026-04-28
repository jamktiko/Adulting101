const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// --- TARKISTUKSET ---
console.log('TARKISTUS: MONGODB_URI on:', process.env.MONGODB_URI ? 'Löytyi!' : 'TYHJÄ (undefined)');

// --- MALLIEN TUONTI ---
const User = require('./models/User');
const Budget = require('./models/Budget');
const Entertainment = require('./models/Entertainment');

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- TIETOKANTAYHTEYS ---
const uri = process.env.MONGODB_URI;
mongoose
  .connect(uri)
  .then(() => console.log('✅ Yhteys MongoDB-pilveen ok!'))
  .catch((error) => console.error('❌ Yhteysvirhe:', error.message));

// --- REITIT (ROUTES) ---

app.get('/', (req, res) => {
  res.send('Paljon onnea kaikille syntymäpäiväsankareille ja hyvää vappua jutille! 🎉');
});

// --- 1. KÄYTTÄJÄT JA CHECKLISTIT ---

// Hae kaikki käyttäjät
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/users/:userId/checklist', async (req, res) => {
  try {
    const { userId } = req.params;
    const { listName, itemIndex, statusValue } = req.body; 

    // KORJAUS: Käytetään findOne, koska _id on String
    const user = await User.findOne({ _id: userId });
    if (!user) return res.status(404).json({ error: 'Käyttäjää ei löydy' });

    const statusKey = listName === 'cleaning_checklist' ? 'done' : 'purchased';
    const updatePath = `${listName}.${itemIndex}.${statusKey}`;

    // KORJAUS: Käytetään findOneAndUpdate, jotta vältetään ObjectId-muunnos
    await User.findOneAndUpdate(
      { _id: userId },
      { $set: { [updatePath]: statusValue } }
    );

    res.json({ message: 'Checklist päivitetty' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 2. BUDJETTI (TALOUS) ---

// Lisää uusi budjettimerkintä
app.post('/api/budgets', async (req, res) => {
  try {
    const newEntry = new Budget(req.body);
    const savedEntry = await newEntry.save();
    res.status(201).json(savedEntry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Hae tietyn käyttäjän budjetti
app.get('/api/budgets/:userId', async (req, res) => {
  try {
    const userBudgets = await Budget.find({ user_id: req.params.userId });
    res.json(userBudgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LISÄÄ TÄMÄ: Hae kaikki budjettimerkinnät (localhost:3000/api/budgets)
app.get('/api/budgets', async (req, res) => {
  try {
    const budgets = await Budget.find();
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Poista budjettimerkintä
app.delete('/api/budgets/:id', async (req, res) => {
  try {
    await Budget.findByIdAndDelete(req.params.id);
    res.json({ message: 'Merkintä poistettu' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 3. VIIHDE (ENTERTAINMENT) ---

// Lisää uusi viihdekohde
app.post('/api/entertainment', async (req, res) => {
  try {
    const newItem = new Entertainment(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Hae tietyn käyttäjän viihdelista
app.get('/api/entertainment/:userId', async (req, res) => {
  try {
    const items = await Entertainment.find({ user_id: req.params.userId });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LISÄÄ TÄMÄ: Hae kaikki viihdekohteet (localhost:3000/api/entertainment)
app.get('/api/entertainment', async (req, res) => {
  try {
    const items = await Entertainment.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SERVERIN KÄYNNISTYS ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveri pyörii portissa ${PORT}`);
});