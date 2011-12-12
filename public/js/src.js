document.addEventListener("DOMContentLoaded", function() {

var canvas = $('canvas')
  , ctx    = canvas._.getContext('2d')
  , data   = []
  , max    = 100;

for (var i=0; i<max; i++) {
   data[i] = Math.floor(Math.random() * 100);
}

var evtSrc = new EventSource('/events');
evtSrc.addEventListener('message', callback, false);

function callback(evt) {
   data.push(+evt.data.replace('/ ', ''));
   if (data.length > max) { data.splice(0, 1); }
   paint();
}

function paint() {
   var c = ctx;
   c.clearRect(0, 0, canvas._.width, canvas._.height);
   c.save();
   c.translate(0, canvas._.height);
   c.scale(1, -1);
   c.beginPath();
   var x1 = 0
     , y1 = 0
     , x2 = 0
     , y2 = 0;
   c.moveTo(x1, y1);
   for (var i=0; i<data.length; i++) {
      x2 = (i+1) * (canvas._.width / max);
      y2 = data[i] * canvas._.height / 100;
      c.bezierCurveTo(x1+(x2-x1)/2, y1, x1+(x2-x1)/2, y2, x2, y2);
      x1 = x2;
      y1 = y2;
   }
   c.lineTo(canvas._.width, 0);
   c.closePath();
   c.fillStyle = 'rgba(0, 0, 255, 0.5)';
   c.strokeStyle = 'rgba(0, 0, 255, 1)';
   c.fill();
   c.stroke();
   c.restore();
   c.strokeRect(0, 0, canvas._.width, canvas._.height);
}


});
