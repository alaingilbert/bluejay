var express    = require('express')
  , app        = express.createServer()
  , stylus     = require('stylus')
  , Bot        = require('ttapi')
  , zmq        = require('zmq')
  , ZMQ_STRING = 'ipc://127.0.0.1:60000'
  , PORT       = 8080
  , HOST       = '127.0.0.1'
  , settings   = require('./settings');


var pub = zmq.socket('pub');
pub.connect(ZMQ_STRING);


//--- Bots ---

var bot = new Bot(settings.AUTH, settings.USERID, settings.ROOMID);

bot.on('update_votes', function (data) {
   pub.send('/' + ROOMID + '/update_votes/' + JSON.stringify(data));
});


//--- Website ---

app.configure(function(){
   app.set('views', __dirname + '/views');
   app.set('view engine', 'jade');
   app.set('view options', { layout: false, pretty: true });
   app.use(stylus.middleware({ src: __dirname + "/public", compress: true }));
   app.use(express.static(__dirname + '/public'));
   app.use(app.router);
});


app.get('/events', function (req, res) {
   res.writeHead(200, { 'Content-Type'  : 'text/event-stream'
                      , 'Cache-Control' : 'no-cache'
                      , 'Connection'    : 'keep-alive'
                      });

   var callback = function (data) {
      var str = data.toString();
      var d = str.substr(str.indexOf('{')).replace('\n', '');
      console.log('> ' + d);
      res.write('data: ' + d + '\n\n');
   };

   var sub = zmq.socket('sub');
   sub.subscribe('/');
   sub.bind(ZMQ_STRING);
   sub.on('message', callback);

   res.socket.on('close', function () {
      sub.close();
      res.end();
   });
});


app.get('/', function (req, res) {
   res.render('index');
});

app.listen(PORT, HOST);

console.log('Webserver listening on ' + HOST + ':' + PORT);
console.log(new Date().toTimeString());
console.log('----------------------------------');


//--- Terminate ---

process.on('SIGINT', function () {
   pub.close();
   console.log('Exit');
   process.exit();
});
