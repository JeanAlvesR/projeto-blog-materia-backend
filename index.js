const Server = require('./src/server/Server');
const serverConfig = require('./src/config/server');
const dbConfig = require('./src/config/database');

const app = new Server(serverConfig, dbConfig);
app.start();