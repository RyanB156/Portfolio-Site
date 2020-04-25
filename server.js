//Install express server
const express = require('express');
const path = require('path');
const morse = require('./src/assets/js/morse');

const app = express();

// Serve only the static files form the dist directory
app.use(express.static(__dirname + '/dist/ryan-bressette'));

app.get('/api/morse/v1/getmorse/:msg', function(req,res) {
  res.send(morse.toMorse(req.params['msg']));
});

app.get('/api/morse/v1/getenglish/:msg', function(req,res) {
  res.send(morse.toEnglish(req.params['msg']));
})

app.get('/*', function(req,res) {  
  res.sendFile(path.join(__dirname+'/dist/ryan-bressette/index.html'));
});

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);