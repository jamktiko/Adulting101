const authCheck = (req, res, next) => {
  const userId = req.params.userId;
  const tokenUserId = req.user?.sub; // Cogniton user ID

  if (userId !== tokenUserId) {
    return res.status(403).json({
      error: 'Luvaton pääsy',
      message: 'Et voi muokata toisen käyttäjän tietoja',
    });
  }
  next();
};

module.exports = { authCheck };
