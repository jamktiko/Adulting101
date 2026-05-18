const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// --- ROUTERS ---
// Reitit on erotettu omiin tiedostoihin (separation of concerns).
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const budgetsRoutes = require('./routes/budgets.routes');
const topicsRoutes = require('./routes/topics.routes');

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(helmet());

// Rajataan pyyntöjen määrää tietoturvan vuoksi
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuuttia
  max: 100,
  message: 'Liian monta pyyntöä, yritä myöhemmin uudelleen',
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

// --- REITIT (ROUTES) ---
// Tämä tiedosto vastaa vain sovelluksen bootstrapista:
// - middlewaret
// - tietokantayhteys
// - routereiden mounttaus

app.get('/', (req, res) => {
  res.send('Paljon onnea kaikille syntymäpäiväsankareille! 🎉');
});

// --- API ROUTERS ---
// Kaikki /api/* reitit on jaettu omiin routereihin.
app.use('/api', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/budgets', budgetsRoutes);
app.use('/api/topics', topicsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Serveri pyörii portissa ${PORT}`));
