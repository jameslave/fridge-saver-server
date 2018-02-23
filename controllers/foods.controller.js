const db = require('../db');

function getFoods(req, res) {
  const query = `
    SELECT
      uf.user_food_id, uf.user_id, uf.location, uf.purchased, uf.exp_min, uf.exp_max,
      f.food_id, f.name, f.icon
    FROM user_food uf INNER JOIN food f
    ON uf.food_id = f.food_id
    WHERE uf.user_id = ?;
  `;

  db()
    .then(connection => connection.execute(query, [req.user.user_id]))
    .then(([foods]) => res.send(foods))
    .catch((err) => {
      console.error(err);
      res.status(500).send('Could not retrieve your foods.');
    });
}

function searchAllFoods(req, res) {
  const searchTerm = req.query.q;
  const pattern = `%${searchTerm.trim().replace(' ', '%')}%`;

  const query = `
    SELECT * FROM food f
    WHERE (CONCAT(f.name, IFNULL(f.description, '')) LIKE '${pattern}')
    LIMIT 10;
  `;

  db()
    .then(connection => connection.execute(query))
    .then(([matches]) => res.send(matches))
    .catch((err) => {
      console.error(err);
      res.status(500).send('Could not search for foods.');
    });
}

module.exports = {
  getFoods,
  searchAllFoods,
};
