const hash = require('password-hash');
const db = require('../db');

function findUserByEmail(httpObject) {
  // httpObject contains req and res properties to be passed along the promise chain
  const { email } = httpObject.req.body;

  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM user WHERE email = ? LIMIT 1';

    db()
      .then(connection => connection.execute(query, [email]))
      .then(([user]) => {
        if (user.length === 1) {
          [httpObject.user] = user;
          return resolve(httpObject);
        }
        const error = new Error('Could not find user with that email.');
        error.status = 401;
        error.res = httpObject.res;
        return reject(error);
      });
  });
}

function checkUserDoesntExist(httpObject) {
  // httpObject contains req and res properties to be passed along the promise chain
  const { email } = httpObject.req.body;

  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM user WHERE email = ? LIMIT 1';

    db()
      .then(connection => connection.execute(query, [email]))
      .then(([user]) => {
        if (user.length === 0) return resolve(httpObject);
        const error = new Error('User with that email already exists.');
        error.status = 409;
        error.res = httpObject.res;
        return reject(error);
      });
  });
}

function createUser(httpObject) {
  const { email, password } = httpObject.req.body;

  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO user (email, password) VALUES (?, ?);';
    let connection;

    db()
      .then((conn) => {
        connection = conn;
        return connection.execute(query, [email, password]);
      })
      .then(() => connection.execute('SELECT * FROM user WHERE user.user_id = LAST_INSERT_ID()'))
      .then(([user]) => {
        if (user.length !== 0) {
          [httpObject.user] = user;
          return resolve(httpObject);
        }
        const error = new Error('Could create an account.');
        error.status = 500;
        error.res = httpObject.res;
        return reject(error);
      });
  });
}

function checkPassword(httpObject) {
  const { req, user } = httpObject;
  const passwordMatches = hash.verify(req.body.password, user.password);
  if (passwordMatches) return Promise.resolve(httpObject);
  return Promise.reject(new Error('Password was incorrect.'));
}

function hashPassword(httpObject) {
  const { password } = httpObject.req.body;
  const hashedPassword = hash.generate(password, { algorithm: 'sha256' });
  httpObject.req.body.password = hashedPassword;
  return Promise.resolve(httpObject);
}

function sendErrorResponse(errorObject) {
  const { res, status, message } = errorObject;
  return res.status(status).send(message);
}

function sendSuccessResponse(httpObject) {
  const { res, user } = httpObject;
  const { user_id } = user;
  res.jwt({ user_id });
  return res.status(200).send({
    name: user.name,
    email: user.email,
  });
}

function login(req, res) {
  const http = { req, res };

  findUserByEmail(http)
    .then(checkPassword)
    .then(sendSuccessResponse)
    .catch(sendErrorResponse);
}

const signup = (req, res) => {
  const http = { req, res };

  checkUserDoesntExist(http)
    .then(hashPassword)
    .then(createUser)
    .then(sendSuccessResponse)
    .catch(sendErrorResponse);
};

module.exports = {
  login,
  signup,
};
