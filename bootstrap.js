var express    = require('express')
  , app        = express.createServer()
  , stylus     = require('stylus')
  , Bot        = require('ttapi')
  , zmq        = require('zmq')
  , ZMQ_STRING = 'ipc://127.0.0.1:60000'
  , PORT       = 8080
  , HOST       = '127.0.0.1';


var pub = zmq.socket('pub');
pub.connect(ZMQ_STRING);


//--- Bots ---

var AUTH   = 'auth+live+be5c492052d1729ebed867ca43d5978d76ebf865'
  , USERID = '4e685aac14169c225510e99d'
  , ROOMID = '4df8319e9021683a2f000a55';

var bot = new Bot(AUTH, USERID, ROOMID);

bot.on('update_votes', function (data) {
   pub.send('/'+ROOMID+data);
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
      res.write('data: ' + data.toString() + '\n\n');
   };

   var sub = zmq.socket('sub');
   sub.subscribe('/');
   sub.bind(ZMQ_STRING);
   sub.on('message', callback);

   res.socket.on('close', function () {
      sub.close();
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
