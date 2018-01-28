const config = require('../config');
const jsonwebtoken = require('jsonwebtoken');

function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.match(/Bearer (\S+)/)[1] : null;
  return token;
}

function init(opts) {
  return (req, res, next) => {
    const requestToken = getTokenFromRequest(req);
    let decodedToken = null;
    if (requestToken) {
      decodedToken = jsonwebtoken.decode(requestToken);
    }
    req.user = decodedToken;

    const localOpts = { ...opts };
    const { secret } = localOpts;
    delete localOpts.secret;

    res.jwt = (payload) => {
      const responseToken = jsonwebtoken.sign(
        payload,
        secret,
        localOpts,
      );
      res.set('Authorization', `Bearer ${responseToken}`);
    };

    next();
  };
}

function checkAuth(req, res, next) {
  try {
    console.log(req);
    const token = getTokenFromRequest(req);
    jsonwebtoken.verify(token, config.JWT_SECRET);
    return next();
  } catch (error) {
    return res.sendStatus(401);
  }
}

module.exports = {
  init,
  checkAuth,
};
