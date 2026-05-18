// controllers/users.controller.js
//
// Käyttäjä-API:n logiikka: listat (muutto/siivous), muistilaput, peruskäyttäjät.
// Huom: autentikointia (tokenin verifiointi) ei tehdä tässä projektissa vielä,
// joten nämä reitit ovat "toiminnallisia" ilman Cognito-authorizeria.

const User = require('../models/User');
const MoveItem = require('../models/MoveItem');
const CleanItem = require('../models/CleanItem');

function shouldResetWeekly(lastResetDate) {
  if (!lastResetDate) return true;
  const now = new Date();
  const lastReset = new Date(lastResetDate);

  const getWeek = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  return (
    getWeek(now) !== getWeek(lastReset) ||
    now.getFullYear() !== lastReset.getFullYear()
  );
}

async function getAll(req, res) {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getMoveChecklist(req, res) {
  try {
    const { userId } = req.params;
    const allItems = await MoveItem.find();
    const user = await User.findOne({ _id: userId });

    if (!user) return res.status(404).json({ error: 'Käyttäjää ei löytynyt' });

    const response = allItems.map((item) => ({
      _id: item._id,
      name: item.name,
      category: item.category,
      purchased: user.purchased_items
        ? user.purchased_items.includes(item._id)
        : false,
    }));

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function toggleMoveItem(req, res) {
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
}

async function getCleaningChecklist(req, res) {
  try {
    const { userId } = req.params;
    const allTasks = await CleanItem.find();
    const user = await User.findOne({ _id: userId });

    if (!user) return res.status(404).json({ error: 'Käyttäjää ei löydy' });

    if (shouldResetWeekly(user.last_reset)) {
      user.completed_cleaning_tasks = [];
      user.last_reset = new Date();
      await user.save();
    }

    const response = allTasks.map((task) => ({
      _id: task._id,
      name: task.name,
      done: user.completed_cleaning_tasks
        ? user.completed_cleaning_tasks.includes(task._id)
        : false,
    }));

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function toggleCleaningTask(req, res) {
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
}

async function getNotes(req, res) {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'Käyttäjää ei löytynyt' });
    res.json(user.notes || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function addNote(req, res) {
  try {
    const { title, content } = req.body;

    const user = await User.findOneAndUpdate(
      { _id: req.params.userId },
      { $push: { notes: { title, content } } },
      { returnDocument: 'after' },
    );

    res.status(201).json(user.notes[user.notes.length - 1]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteNote(req, res) {
  try {
    await User.findByIdAndUpdate(req.params.userId, {
      $pull: { notes: { _id: req.params.noteId } },
    });

    res.json({ message: 'Muistilappu poistettu' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAll,
  getMoveChecklist,
  toggleMoveItem,
  getCleaningChecklist,
  toggleCleaningTask,
  getNotes,
  addNote,
  deleteNote,
};
