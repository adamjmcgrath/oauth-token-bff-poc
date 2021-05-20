const app = require('./app');
const api = require('./api');

app.listen(3000, () => console.log('App listening on http://localhost:3000'));
api.listen(3001, () => console.log('API listening on http://localhost:3001'));
