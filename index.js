const bodyParser = require('body-parser');
const config = require('./config');
const cors = require('cors');
const express = require('express');
const jwt = require('./helpers/jwt');

// Begin database connection
require('./db');

const app = express();

app.use((req, res, next) => {
  res.set('Access-Control-Expose-Headers', 'Authorization');
  next();
});
app.use(cors());
app.use(jwt.init({ secret: config.JWT_SECRET, expiresIn: '365d' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/auth', require('./routes/auth.route'));
app.use('/foods', require('./routes/foods.route'));
app.use('/users', require('./routes/users.route'));

app.listen(config.PORT || 3000, () => {
  console.log(`Server listening on port ${config.PORT || 3000}`);
});

module.exports = app;
