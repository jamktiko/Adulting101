const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { signUpUser, confirmUser, loginUser } = require('./utils/cognito');
const authCheck = require('./middleware/authCheck');
const { 
  validateBudgetEntry, 
  validateRecurringEntry, 
  validateBudgetLimit, 
  handleValidationErrors 
} = require('./middleware/validators');
const sanitize = require('./utils/sanitizer');

// --- MALLIEN TUONTI ---
const User = require('./models/User');
const Budget = require('./models/Budget');
const RecurringEntry = require('./models/RecurringEntry');
const Entertainment = require('./models/Entertainment');
const MoveItem = require('./models/MoveItem');
const CleanItem = require('./models/CleanItem');

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(helmet());

// Rajataan pyyntöjen määrää tietoturvan vuoksi
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuuttia
  max: 100, 
  message: 'Liian monta pyyntöä, yritä myöhemmin uudelleen'
});
app.use('/api/', limiter);

// Välimuistin hallinta
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

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

// --- 2. BUDJETTI (PÄIVITETTY) ---

app.get('/api/budgets/:userId/:month', async (req, res) => {
  try {
    const budget = await Budget.findOne({
      user_id: req.params.userId,
      month: req.params.month,
    });
    res.json(budget || { entries: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/budgets/:userId/:month/limit', 
  validateBudgetLimit, 
  handleValidationErrors, 
  async (req, res) => {
  try {
    const { monthlyBudgetLimit } = req.body;
    const budget = await Budget.findOneAndUpdate(
      { user_id: req.params.userId, month: req.params.month },
      { monthlyBudgetLimit },
      { upsert: true, returnDocument: 'after' },
    );
    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/budgets/:userId/:month/entry', 
  validateBudgetEntry, 
  handleValidationErrors, 
  async (req, res) => {
  try {
    const cleanData = {
      ...req.body,
      category: sanitize(req.body.category),
      description: sanitize(req.body.description),
    };

    const budget = await Budget.findOneAndUpdate(
      { user_id: req.params.userId, month: req.params.month },
      { $push: { entries: cleanData } },
      { upsert: true, returnDocument: 'after' },
    );
    res.status(201).json(budget);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/budgets/:userId/:month/entry/:entryId', async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { user_id: req.params.userId, month: req.params.month },
      { $pull: { entries: { _id: req.params.entryId } } },
      { returnDocument: 'after' },
    );
    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 3. VIIHDE JA MUISTILAPUT ---

app.get('/api/users/:userId/notes', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'Käyttäjää ei löytynyt' });
    res.json(user.notes || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users/:userId/notes', async (req, res) => {
  try {
    const { title, content } = req.body;
    const user = await User.findOneAndUpdate(
      { _id: req.params.userId },
      { $push: { notes: { title, content } } },
      { returnDocument: 'after' }
    );
    res.status(201).json(user.notes[user.notes.length - 1]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:userId/notes/:noteId', async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.params.userId,
      { $pull: { notes: { _id: req.params.noteId } } }
    );
    res.json({ message: 'Muistilappu poistettu' });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.status(400).json({ error: 'Rekisteröitymisvirhe', message: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const tokens = await loginUser(username, password);
    res.status(200).json(tokens);
  } catch (error) {
    res.status(401).json({ error: 'Kirjautumisvirhe', message: error.message });
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Serveri pyörii portissa ${PORT}`));