// controllers/auth.controller.js
//
// Vastaa Cognito-käyttäjätoiminnoista (signup / login / confirm).
// Tärkeää:
// - Cognito hoitaa salasanat, backend ei tallenna oikeaa salasanaa.
// - Älä muokkaa salasanaa ("sanitize") ennen Cognitoa.

const User = require('../models/User');
const { signUpUser, confirmUser, loginUser } = require('../utils/cognito');
const { sanitize } = require('../utils/sanitizer');

async function signup(req, res) {
  try {
    const { username, email, password } = req.body;

    // Siistitään username/email (XSS/whitespace), mutta EI salasanaa.
    const cleanUsername = sanitize(username);
    const cleanEmail = sanitize(email);

    const cognitoResult = await signUpUser(cleanUsername, cleanEmail, password);

    // Luodaan oma käyttäjä-dokumentti käyttäen Cogniton UserSub-ID:tä.
    const newUser = new User({
      _id: cognitoResult.UserSub,
      username: cleanUsername,
      email: cleanEmail,
      password: 'COGNITO_HANDLES_THIS',
      purchased_items: [],
      completed_cleaning_tasks: [],
      last_reset: new Date(),
    });

    await newUser.save();

    res.status(200).json({ message: 'Rekisteröityminen onnistui.' });
  } catch (error) {
    res.status(400).json({
      error: 'Rekisteröitymisvirhe',
      message: error.message,
    });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;

    const cleanUsername = sanitize(username);

    // Salasana välitetään Cognitolle sellaisenaan.
    const tokens = await loginUser(cleanUsername, password);
    res.status(200).json(tokens);
  } catch (error) {
    res.status(401).json({
      error: 'Kirjautumisvirhe',
      message: error.message,
    });
  }
}

async function confirm(req, res) {
  try {
    const { username, code } = req.body;

    const cleanUsername = sanitize(username);
    const cleanCode = sanitize(code);

    await confirmUser(cleanUsername, cleanCode);
    res.status(200).json({ message: 'Tili vahvistettu!' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  signup,
  login,
  confirm,
};
