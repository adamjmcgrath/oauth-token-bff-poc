require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { auth, requiredScopes } = require('express-oauth2-bearer');

const api = express();

api.use(
  cors({
    origin: process.env.BASE_URL,
    allowedHeaders: ['Authorization'],
  })
);

api.use(auth());

api.get('/api', requiredScopes(process.env.SCOPE), (req, res) => {
  res.json({ msg: 'Hello World!' });
});

module.exports = api;
