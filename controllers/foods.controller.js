const db = require('../db');

function getFoods(req, res) {
  const query = `
    SELECT
      uf.user_food_id, uf.user_id, uf.start_date, uf.expiration_date,
      f.food_id, f.name, f.icon
    FROM user_food uf INNER JOIN food f
    ON uf.food_id = f.food_id
    WHERE uf.user_id = ?;`;

  db()
    .then(connection => connection.execute(query, [req.user.user_id]))
    .then(([foods]) => res.send(foods))
    .catch(() => res.status(500).send('Could not get foods'));
}

module.exports = {
  getFoods,
};
