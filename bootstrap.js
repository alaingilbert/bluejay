var express    = require('express')
  , app        = express.createServer()
  , stylus     = require('stylus')
  , Bot        = require('./bot')
  , zmq        = require('zmq')
  , ZMQ_STRING = 'ipc://127.0.0.1:60000'
  , PORT       = 8080
  , HOST       = '127.0.0.1'
  , settings   = require('./settings')
  , infos      = {};


var pub = zmq.socket('pub');
pub.connect(ZMQ_STRING);


//--- Bots ---------------------------------------------------------------------

var bot = new Bot(settings.AUTH, settings.USERID, settings.ROOMID);
bot.pub = pub;
bot.api.on('update_votes', function (data) {
   pub.send('/' + this.roomId + '/update_votes/' + JSON.stringify(data));
});
infos[bot.api.roomId] = { bot: bot };


//--- Website ------------------------------------------------------------------

app.configure(function(){
   app.set('views', __dirname + '/views');
   app.set('view engine', 'jade');
   app.set('view options', { layout: false, pretty: true });
   app.use(stylus.middleware({ src: __dirname + "/public", compress: true }));
   app.use(express.static(__dirname + '/public'));
   app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
   app.use(app.router);
});


app.get('/room/:id/sse', function (req, res) {
   var roomid = req.params.id;
   var room = infos[roomid];
   if (!room) { throw new NotFound; }

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
   sub.subscribe('/room/' + roomid + '/');
   sub.bind(ZMQ_STRING);
   sub.on('message', callback);

   res.socket.on('close', function () {
      sub.close();
      res.end();
   });
});


app.get('/room/:id', function (req, res) {
   var roomid = req.params.id;
   var room = infos[roomid];
   if (!room) { throw new NotFound; }
   room = room.bot.room;
   res.render('room', { room: room });
});


app.get('/', function (req, res) {
   res.render('index');
});


function NotFound(msg){
   this.name = 'NotFound';
   Error.call(this, msg);
   Error.captureStackTrace(this, arguments.callee);
}

NotFound.prototype.__proto__ = Error.prototype;

app.get('/404', function (req, res) {
   throw new NotFound;
});

app.get('/500', function (req, res) {
   throw new Error('keyboard cat!');
});

app.get('/*', function (req, res) {
   console.log('CALISSSSSSISISISI');
   throw new NotFound;
});

app.error(function (err, req, res, next) {
   console.log(err instanceof NotFound, 'CALISS', err);
   if (err instanceof NotFound) {
      res.render('404.jade');
   } else {
      next(err);
   }
});

app.listen(PORT, HOST);

console.log('Webserver listening on ' + HOST + ':' + PORT);
console.log(new Date().toTimeString());
console.log('----------------------------------');


//--- Terminate ----------------------------------------------------------------

process.on('SIGINT', function () {
   pub.close();
   console.log('Exit');
   process.exit();
});
