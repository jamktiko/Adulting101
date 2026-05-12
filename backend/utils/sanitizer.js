// Poistaa HTML-tagit XSS-hyökkäysten estämiseksi

const sanitize = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[<>\"']/g, '') // Poista HTML-merkit
    .trim()
    .substring(0, 500); // Rajaa pituus
};

module.exports = { sanitize };
