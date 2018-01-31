const db = require('../db');

function getFoods(req, res) {
  const query = `
    SELECT
      uf.user_food_id, uf.user_id, uf.start_date, uf.expiration_date,
      f.food_id, f.name, f.icon
    FROM user_food uf INNER JOIN food f
    ON uf.food_id = f.food_id
    WHERE uf.user_id = ?;
  `;

  db()
    .then(connection => connection.execute(query, [req.user.user_id]))
    .then(([foods]) => res.send(foods))
    .catch(() => res.status(500).send('Could not retrieve your foods.'));
}

function searchAllFoods(req, res) {
  const searchTerm = req.query.q;
  const re = searchTerm.split(' ').map(word => `(?=.*${word})`).join('');

  const query = `
    SELECT * FROM food f
    WHERE (CONCAT(f.name, IFNULL(f.subtitle, '')) REGEXP '${re}');
  `;

  db()
    .then(connection => connection.execute(query))
    .then(([matches]) => res.send(matches))
    .catch(() => res.status(500).send('Could not search for foods.'));
}

module.exports = {
  getFoods,
  searchAllFoods,
};
