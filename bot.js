var Ttapi = require('ttapi');


var TTBot = function () {
   var self    = this;
   this.AUTH   = arguments[0];
   this.USERID = arguments[1];
   this.ROOMID = arguments[2];
   this.api    = new Ttapi(this.AUTH, this.USERID, this.ROOMID);
   this.room   = null;
   this.users  = {};
   this.pub    = null;


   this.broadcast = function (data) {
      self.pub.send('/room/' + self.api.roomId + '/' + JSON.stringify(data));
   };


   // Get the hugs points
   this.api.on('speak', function (data) {
      if (data.text.match(/^hugs/i)) {
         var userid = data.userid;
      }
      self.broadcast(data);
   });


   //
   this.api.on('newsong', function (data) {
      self.broadcast({ api: 'newsong', data: data });
   });
   this.api.on('nosong', function (data) {
      self.broadcast({ api: 'nosong', data: data });
   });


   //
   this.api.on('update_votes', function (data) {
      self.broadcast({ api: 'update_votes', data: data });
   });


   // Keep the hearts points.
   this.api.on('snagged', function (data) {
      var userid = data.userid;
   });


   // Keep the users list up-to-date
   this.api.on('roomChanged', function (data) {
      self.users = {};
      var users = data.users;
      for (var i=0; i<users.length; i++) {
         var user = users[i];
         self.users[user.userid] = user;
      }
   });
   this.api.on('registered', function (data) {
      var user = data.user[0];
      self.users[user.userid] = user;
   });
   this.api.on('deregistered', function (data) {
      var user = data.user[0];
      delete self.users[user.userid];
   });


   // Get the room infos
   this.api.on('roomChanged', function (data) {
      self.room             = {};
      self.room.id          = data.room.roomid                || null;
      self.room.name        = data.room.name                  || null;
      self.room.created     = data.room.created               || null;
      self.room.shortcut    = data.room.shortcut              || null;
      self.room.name_lower  = data.room.name_lower            || null;
      self.room.creator     = data.room.metadata.creator      || null;
      self.room.moderator   = data.room.metadata.moderator_id || null;
      self.room.description = data.room.description           || null;
   });
}


module.exports = TTBot;
