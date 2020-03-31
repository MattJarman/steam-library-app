const path = require('path');

const dev = require('./env/development');
// staging
// prod

module.exports = {
    dev: dev
}[process.env.NODE_ENV || 'dev'];