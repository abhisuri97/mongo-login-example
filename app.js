var express = require('express');

var app = express();

var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
var User = require('./User.js');

app.engine('html', require('ejs').__express);
app.set('view engine', 'html');

app.use(express.static(__dirname + '/public'));

app.use(cookieSession({
  secret: 'SHHisASecret'
}));

app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function (req, res) {
  if (req.session.username && req.session.username !== '') {
    res.redirect('/protected');
  } else {
    res.redirect('/login');
  }
});

app.get('/login', function (req, res) {
  res.render('login');
});

app.post('/login', function(req, res) {
  username = req.body.username;
  password = req.body.password;

  if (User.findOne({ username: username }, function (err, user) {
    user.checkPassword(password, function(err, isRight) {
      if (err) throw err;
      if (isRight) {
        req.session.username = username;
        res.redirect('/protected');
      } else {
        res.send('password ' + password + ' is wrong');
      }
    });
  }));
});

app.get('/register', function (req, res) {
  res.render('register');
});

app.post('/register', function(req, res) {
  var newUser = new User({ 
    username: req.body.username,
    password: req.body.password
  });

  newUser.save(function(err) {
    if (err) res.send('error' + err);
    else res.send(
      'user ' + newUser.username + 
      ' registered with password hashed to ' + 
      newUser.password
    );
  });
});

app.get('/logout', function(req, res) {
  req.session.username = '';
  res.render('logout');
});

app.get('/protected', function(req, res) {
  console.log(req.session.username);
  if (!req.session.username || req.session.username === '') {
    res.send('You tried to access a protected page');
  } else {
    res.render('protected', { username: req.session.username });
  }
});

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function() { 
  console.log('listening');
});
