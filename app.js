            ////////////////////////////////////////////////////////////
            ///////////// ENTRY POINT FOR THIS APPLICATION /////////////
            ///////////////////////////////////////////////////////////

// Required
var express = require('express'); // loads express 
var mongoose = require('mongoose'); // loads mongoose


// Initialization
var app = express();


// Import routes
var appRoutes = require('./routes/app'); // imports the routes located in another file
var userRoutes = require('./routes/user'); // imports the routes used for user

// Routes
app.use('/user', userRoutes);
app.use('/', appRoutes); // declares the midleware used for routing

// DB Connection
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
    ,(err, res) => {
    if (err) {
        throw err;
    }
    console.log('Database status: \x1b[32m%s\x1b[0m', 'online')
}); // if no db with given name exists, mongo creates it, second param is used to solve compilation warnings


// Listen for requests
app.listen(3000, () => {
    console.log('Server status: \x1b[32m%s\x1b[0m', 'online')
}); // specifies port to listen in and function to display a message when loaded