const express = require('express')
const bodyParser = require('body-parser')
const app = express();
const swaggerJDDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
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
const swaggerDocument = require('./swagger.json');
const swaggerOptions = {
    definition:{
        openapi:'3.0.0',
        info:{
            title:'Managment System',
            version:'1.0.0',
            description:'api for documentation',
            contact:{
                name:'udaybhan',
                url:'https://app.com',
                email:'app@gmail.com'
            },
            servers:['http://localhost:3000']
        }
    },
    apis:['index.js']
}
const swaggerDocs = swaggerJDDoc(swaggerOptions);

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))
app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});