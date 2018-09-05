'use strict';


const exphbs = require('express3-handlebars');
const path = require('path');

module.exports = viewHelper;
function viewHelper(app) {
  app.engine('hbs', (exphbs({
    extname: 'hbs',
    partialsDir: path.join(__dirname, 'views/partials'),
    defaultLayout: 'main',
    helpers: {}
  })));
  app.set('view engine', 'hbs');
  return app;
}
