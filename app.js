require('dotenv').config();
const express = require('express');
const { auth } = require('express-openid-connect');

const app = express();
const audience = process.env.ALLOWED_AUDIENCES;
const scopes = `openid profile email ${process.env.SCOPE} offline_access`;

app.set('views', __dirname);
app.set('view engine', 'ejs');

const requiresAuth = (req, res, next) => {
  if (req.oidc?.isAuthenticated()) {
    next();
  } else {
    next(new ATError('invalid_session', 'The user is not logged in'));
  }
};

app.use(
  auth({
    authRequired: false,
    authorizationParams: {
      response_type: 'code',
      audience,
      scope: scopes,
    },
  })
);

app.get('/', (req, res, next) => {
  res.render('frontend.ejs', {
    loggedIn: req.oidc.isAuthenticated(),
  });
  next();
});

/**
 * OAuth TMI BFF bit...
 */

class ATError extends Error {
  status = 400;
  statusCode = 400;

  constructor(error, description) {
    super(description || error);
    this.error = error;
    this.error_description = description;
  }
}

app.get('/.well-known/bff-sessioninfo', requiresAuth, (req, res, next) => {
  const user = req.oidc.user;
  res.json(user);
  next();
});

app.get('/.well-known/bff-token', requiresAuth, async (req, res, next) => {
  try {
    const { resource, scope: expected } = req.query;
    let {
      access_token,
      expires_in,
      isExpired,
      refresh,
      // FIXME: express-openid-connect does not expose the 'scope'
      scope = scopes,
    } = req.oidc.accessToken;

    if (!access_token) {
      throw new ATError('backend_not_ready', 'Missing Access Token');
    }
    if (resource !== undefined && resource !== audience) {
      throw new ATError('backend_not_ready', 'Resource mismatch');
    }
    if (scope !== undefined && expected !== undefined) {
      const actual = new Set(scope.split());
      if (!expected.every(Set.prototype.has.bind(actual))) {
        throw new ATError('backend_not_ready', 'Scope mismatch');
      }
    }
    if (isExpired()) {
      if (!req.oidc.refreshToken) {
        throw new ATError('backend_not_ready', 'Access Token expired');
      }
      ({ access_token, expires_in } = await refresh());
    }

    res.json({ access_token, expires_in, scope });
    next();
  } catch (e) {
    next(e);
  }
});

/**
 * End OAuth TMI BFF bit
 */

app.use((err, req, res, next) => {
  res
    .status(err.status || 500)
    .json({ error: err.error, error_description: err.error_description });
});

module.exports = app;
