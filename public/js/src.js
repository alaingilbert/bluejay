$(document).onReady(function () {


var evtSrc = new EventSource('/events');
evtSrc.addEventListener('message', callback, false);

function callback(evt) {
   var data = JSON.parse(evt.data);
   console.log('CALISS', data);
}


});
