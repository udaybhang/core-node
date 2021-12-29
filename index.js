const express = require('express')
const bodyParser = require('body-parser')
const app = express();

const dbConfig = require('./config/connection');
const mongoose = require('mongoose');
app.use(bodyParser.json())
mongoose.connect(dbConfig.url, {
    useNewUrlParser: true
}).then(() => {
    console.log("Successfully connected to the database");    
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});

require('./routes/user_routes')(app);
app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});