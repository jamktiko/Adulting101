const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { signUpUser, confirmUser, loginUser } = require('./utils/cognito');

// --- TARKISTUKSET ---
console.log(
  'TARKISTUS: MONGODB_URI on:',
  process.env.MONGODB_URI ? 'Löytyi!' : 'TYHJÄ (undefined)',
);

// --- MALLIEN TUONTI ---
const User = require('./models/User');
const Budget = require('./models/Budget');
const Entertainment = require('./models/Entertainment');
const MoveItem = require('./models/MoveItem'); // Uusi Master-lista malli

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
  res.send('Paljon onnea kaikille syntymäpäiväsankareille! 🎉');
});

// --- 1. KÄYTTÄJÄT JA CHECKLISTIT ---

// Hae kaikki käyttäjät (hallintaa varten)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Hae yksittäisen käyttäjän tiedot (sisältäen siivouslistan)
app.get('/api/users/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.userId });
    if (!user) return res.status(404).json({ error: 'Käyttäjää ei löydy' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Siivouslistan päivitys (käyttäjäkohtainen lista)
app.patch('/api/users/:userId/cleaning-checklist', async (req, res) => {
  try {
    const { userId } = req.params;
    const { itemIndex, statusValue } = req.body;

    const updatePath = `cleaning_checklist.${itemIndex}.done`;

    await User.findOneAndUpdate(
      { _id: userId },
      { $set: { [updatePath]: statusValue } }
    );

    res.json({ message: 'Siivouslista päivitetty' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- MUUTTOLISTA (MASTER-LISTA LOGIIKKA) ---

// Hae yhdistetty muuttolista (kaikki tavarat + käyttäjän hankinnat)
app.get('/api/users/:userId/move-checklist', async (req, res) => {
  try {
    const { userId } = req.params;
    const allItems = await MoveItem.find(); // Haetaan kaikki tavarat master-kannasta
    const user = await User.findOne({ _id: userId });
    
    if (!user) return res.status(404).json({ error: 'Käyttäjää ei löytynyt' });

    const response = allItems.map(item => {
      return {
        _id: item._id,
        name: item.name,
        category: item.category,
        // Tarkistetaan löytyykö tavaran ID käyttäjän listalta
        purchased: user.purchased_items ? user.purchased_items.includes(item._id) : false
      };
    });

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Muuttolistan tavaran tilan vaihtaminen (Checkbox klikkaus)
app.patch('/api/users/:userId/toggle-move-item', async (req, res) => {
  try {
    const { userId } = req.params;
    const { itemId, isPurchased } = req.body;

    // Jos isPurchased on true, lisätään ID listaan. Jos false, poistetaan.
    const update = isPurchased 
      ? { $addToSet: { purchased_items: itemId } } 
      : { $pull: { purchased_items: itemId } };

    await User.updateOne({ _id: userId }, update);
    res.json({ message: 'Tavaran tila päivitetty' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 2. BUDJETTI (TALOUS) ---

app.post('/api/budgets', async (req, res) => {
  try {
    const newEntry = new Budget(req.body);
    const savedEntry = await newEntry.save();
    res.status(201).json(savedEntry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/budgets/:userId', async (req, res) => {
  try {
    const userBudgets = await Budget.find({ user_id: req.params.userId });
    res.json(userBudgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/budgets/:id', async (req, res) => {
  try {
    await Budget.findByIdAndDelete(req.params.id);
    res.json({ message: 'Merkintä poistettu' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 3. VIIHDE (ENTERTAINMENT) ---

app.post('/api/entertainment', async (req, res) => {
  try {
    const newItem = new Entertainment(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
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

// --- 4. AUTENTIKOINTI (COGNITO) ---

app.post('/api/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const cognitoResult = await signUpUser(username, email, password);

    const newUser = new User({
      _id: cognitoResult.UserSub,
      username: username,
      email: email,
      password: 'COGNITO_HANDLES_THIS',
      cleaning_checklist: [
          { task: "Imurointi", done: false },
          { task: "Tiskien pesu", done: false },
          { task: "Pölyjen pyyhintä", done: false }
      ],
      purchased_items: [] // Alustetaan tyhjä lista hankinnoille
    });
    await newUser.save();

    res.status(200).json({ message: 'Rekisteröityminen onnistui.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/confirm', async (req, res) => {
  try {
    const { username, code } = req.body;
    await confirmUser(username, code);
    res.status(200).json({ message: 'Tili vahvistettu!' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const tokens = await loginUser(username, password);
    res.status(200).json(tokens);
  } catch (error) {
    res.status(401).json({ error: 'Kirjautumisvirhe' });
  }
});

// --- SERVERIN KÄYNNISTYS ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveri pyörii portissa ${PORT}`);
});