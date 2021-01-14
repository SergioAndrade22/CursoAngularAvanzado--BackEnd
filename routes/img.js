var express = require('express');
var path = require('path');
var fs = require('fs');

var app = express();

app.get('/:collection/:img', (req, res, next) => {
    var collection = req.params.collection;
    var img = req.params.img;

    var imgPath = path.resolve(__dirname, `../uploads/${collection}/${img}`);

    console.log(imgPath)

    if(fs.existsSync(imgPath)){
        res.sendFile(imgPath);
    } else {
        var noImgPath = path.resolve(__dirname, '../assets/no-img.jpg');
        res.sendFile( noImgPath);
    }
});

module.exports = app;