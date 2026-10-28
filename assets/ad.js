// Förslag A+D: pilknapparna för medarbetarremsan. Resten sköter site.js.
(function(){
  var strip = document.getElementById('ppstrip'),
      prev = document.getElementById('prev'), next = document.getElementById('next');
  if (!strip || !prev) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cards = strip.querySelectorAll('li');
  function by(dir){
    var w = cards[0].getBoundingClientRect().width + 20;
    strip.scrollBy({left: dir * w * 2, behavior: reduce ? 'auto' : 'smooth'});
  }
  prev.addEventListener('click', function(){ by(-1); });
  next.addEventListener('click', function(){ by(1); });
  // Släck knappen vid respektive ände, utan scroll-lyssnare.
  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        var full = en.intersectionRatio > 0.95;
        if (en.target === cards[0]) prev.disabled = full; else next.disabled = full;
      });
    }, {root: strip, threshold:[0, 0.95, 1]});
    io.observe(cards[0]); io.observe(cards[cards.length - 1]);
  }
})();
