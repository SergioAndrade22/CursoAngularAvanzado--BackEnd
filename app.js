            ////////////////////////////////////////////////////////////
            ///////////// ENTRY POINT FOR THIS APPLICATION /////////////
            ///////////////////////////////////////////////////////////

// Required
var express = require('express'); // loads express 
var mongoose = require('mongoose'); // loads mongoose

// Initialization
var app = express();


// DB Connection
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) {
        throw err;
    }
    console.log('Database status: \x1b[32m%s\x1b[0m', 'online')
}); // if no db with given name exists, mongo creates it


// Routs
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        msg: 'Request completed correctly'
    });
});


// Listen for requests
app.listen(3000, () => {
    console.log('Server status: \x1b[32m%s\x1b[0m', 'online')
}); // specifies port to listen in and function to display a message when loaded