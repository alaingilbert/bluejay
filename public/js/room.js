var cacheSong = null;

function addThumb(data) {
   var coverart = data.room.metadata.current_song.metadata.coverart
     , div      = new Element('div').setClass('song').setStyle({ 'display': 'none', 'height': '105px' })
     , img      = new Element('img').set({ 'src': coverart, 'height': '100' }).insertTo(div);
   $('songs').insert(div, 'top');
   div.show('slide');
}


function switchSong(data) {
   var currentSong = data.room.metadata.current_song;
   var song        = new Element('div').setClass('song').setStyle({ 'display': 'none' });

   var divImg      = new Element('div').setClass('img').insertTo(song);
   new Element('img').set({ src: currentSong.metadata.coverart }).insertTo(divImg);

   var infos       = new Element('div').setClass('infos').insertTo(song);
   new Element('label').text('Song name:').insertTo(infos);
   new Element('span').text(currentSong.metadata.song).insertTo(infos);
   new Element('br').insertTo(infos);
   new Element('label').text('Album:').insertTo(infos);
   new Element('span').text(currentSong.metadata.album).insertTo(infos);
   new Element('br').insertTo(infos);
   new Element('label').text('Artist:').insertTo(infos);
   new Element('span').text(currentSong.metadata.artist).insertTo(infos);
   new Element('br').insertTo(infos);
   new Element('label').text('Current DJ:').insertTo(infos);
   new Element('span').text(currentSong.metadata.artist).insertTo(infos);
   new Element('br').insertTo(infos);
   new Element('label').text('Appreciation:').insertTo(infos);
   new Element('div').set({ id: 'votesup' }).text(''+data.room.metadata.upvotes).insertTo(infos);
   new Element('div').set({ id: 'votesdown' }).text(''+data.room.metadata.downvotes).insertTo(infos);
   new Element('br').insertTo(infos);

   $('song').insert(song, 'top');
   song.show('slide', { duration: 'normal', onFinish: function () { song.next().remove(); } });
}


function updateVotes(data) {
   var spanup = new Element('div').setStyle({ display: 'none' }).text(data.room.metadata.upvotes);
   var spandown = new Element('div').setStyle({ display: 'none' }).text(data.room.metadata.downvotes);
   $('votesup').insert(spanup, 'top');
   $('votesdown').insert(spandown, 'top');

   spanup.show('slide', { duration: 'normal', onFinish: function () { spanup.next().remove(); } });
   spandown.show('slide', { duration: 'normal', onFinish: function () { spandown.next().remove(); } });
}


function callback(evt) {
   var json = JSON.parse(evt.data)
     , api  = json.api
     , data = json.data;

   switch (api) {
   case 'nosong':
      if (cacheSong) {
         addThumb(cacheSong);
      }
      cacheSong = null;
      break;
   case 'newsong':
      if (cacheSong) {
         addThumb(cacheSong);
      }
      switchSong(data);
      cacheSong = data;
      break;
   case 'update_votes':
      updateVotes(data);
      break;
   }
}


function initSse(roomId) {
   var evtSrc = new EventSource('/room/' + roomId + '/sse');
   evtSrc.addEventListener('message', callback, false);
}


setTimeout(function () {
   updateVotes({room:{metadata:{upvotes:3, downvotes:9}}});
}, 1000);


$(document).onReady(function () {
   var scroll = $$('#songs .scrollbar')[0];
   $('songs').on({ 'mousewheel': function (evt) {
         this._.scrollTop -= evt._.wheelDeltaY;
         var h = (this._.clientHeight / this._.scrollHeight) * this._.clientHeight;
         var t = ((this._.scrollTop) / this._.scrollHeight) * this._.clientHeight + this._.scrollTop;
         if (t+h > this._.scrollHeight-1) { t = this._.scrollHeight-h-1; }
         scroll.setStyle('height', h+'px');
         scroll.setStyle({ 'top': t+'px' });
      }
    , 'mouseenter': function (evt) {
         if (this._.scrollHeight > this._.clientHeight) {
            var h = (this._.clientHeight / this._.scrollHeight) * this._.clientHeight;
            scroll.setStyle('height', h+'px');
            scroll.setStyle('display', 'block');
         }
      }
    , 'mouseleave': function (evt) {
         scroll.setStyle('display', 'none');
      }
   });
});
