const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { signUpUser, confirmUser, loginUser } = require('./utils/cognito');

// --- MALLIEN TUONTI ---
const User = require('./models/User');
const Budget = require('./models/Budget');
const Entertainment = require('./models/Entertainment');
const MoveItem = require('./models/MoveItem');
const CleanItem = require('./models/CleanItem');

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

// --- APUFUNKTIOT ---
function shouldResetWeekly(lastResetDate) {
  if (!lastResetDate) return true;
  const now = new Date();
  const lastReset = new Date(lastResetDate);
  
  const getWeek = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  return getWeek(now) !== getWeek(lastReset) || now.getFullYear() !== lastReset.getFullYear();
}

// --- REITIT (ROUTES) ---

app.get('/', (req, res) => {
  res.send('Paljon onnea kaikille syntymäpäiväsankareille! 🎉');
});

// --- 1. KÄYTTÄJÄT JA LISTAT ---

// Hae kaikki käyttäjät
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- MUUTTOLISTA ---
app.get('/api/users/:userId/move-checklist', async (req, res) => {
  try {
    const { userId } = req.params;
    const allItems = await MoveItem.find();
    const user = await User.findOne({ _id: userId });
    
    if (!user) return res.status(404).json({ error: 'Käyttäjää ei löytynyt' });

    const response = allItems.map(item => ({
      _id: item._id,
      name: item.name,
      category: item.category,
      purchased: user.purchased_items ? user.purchased_items.includes(item._id) : false
    }));

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/users/:userId/toggle-move-item', async (req, res) => {
  try {
    const { userId } = req.params;
    const { itemId, isPurchased } = req.body;

    const update = isPurchased 
      ? { $addToSet: { purchased_items: itemId } } 
      : { $pull: { purchased_items: itemId } };

    await User.updateOne({ _id: userId }, update);
    res.json({ message: 'Muuttolista päivitetty' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- VIIKKOSIIVOUS ---
app.get('/api/users/:userId/cleaning-checklist', async (req, res) => {
  try {
    const { userId } = req.params;
    const allTasks = await CleanItem.find();
    let user = await User.findOne({ _id: userId });

    if (!user) return res.status(404).json({ error: 'Käyttäjää ei löydy' });

    if (shouldResetWeekly(user.last_reset)) {
      user.completed_cleaning_tasks = [];
      user.last_reset = new Date();
      await user.save();
    }

    const response = allTasks.map(task => ({
      _id: task._id,
      name: task.name,
      done: user.completed_cleaning_tasks ? user.completed_cleaning_tasks.includes(task._id) : false
    }));

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/users/:userId/toggle-cleaning-task', async (req, res) => {
  try {
    const { userId } = req.params;
    const { taskId, isDone } = req.body;

    const update = isDone 
      ? { $addToSet: { completed_cleaning_tasks: taskId } } 
      : { $pull: { completed_cleaning_tasks: taskId } };

    await User.updateOne({ _id: userId }, update);
    res.json({ message: 'Siivoustehtävä päivitetty' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 2. BUDJETTI ---

app.get('/api/budgets', async (req, res) => {
  try {
    const budgets = await Budget.find();
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
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

app.post('/api/budgets', async (req, res) => {
  try {
    const newEntry = new Budget(req.body);
    const savedEntry = await newEntry.save();
    res.status(201).json(savedEntry);
  } catch (err) {
    res.status(400).json({ error: err.message });
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

// --- 3. VIIHDE ---

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

app.post('/api/entertainment', async (req, res) => {
  try {
    const newItem = new Entertainment(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- 4. AUTENTIKOINTI ---

app.post('/api/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const cognitoResult = await signUpUser(username, email, password);

    const newUser = new User({
      _id: cognitoResult.UserSub,
      username,
      email,
      password: 'COGNITO_HANDLES_THIS',
      purchased_items: [],
      completed_cleaning_tasks: [],
      last_reset: new Date()
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

/*app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const tokens = await loginUser(username, password);
    res.status(200).json(tokens);
  } catch (error) {
    res.status(401).json({ error: 'Kirjautumisvirhe' });
  }
});*/

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Yritetään kirjautua käyttäjällä:", username);
    const tokens = await loginUser(username, password);
    res.status(200).json(tokens);
  } catch (error) {
    console.error("--- COGNITO VIRHE ---");
    console.error("Nimi:", error.name); // Esim. NotAuthorizedException
    console.error("Viesti:", error.message); // Esim. Incorrect username or password.
    res.status(401).json({ error: error.name, message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Serveri pyörii portissa ${PORT}`));