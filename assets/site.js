(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var hdr = document.getElementById('hdr'), last = -1;
  function onScroll(){
    var s = window.scrollY > 40;
    if (s !== last){ hdr.classList.toggle('is-stuck', s); last = s; }
  }
  onScroll();
  window.addEventListener('scroll', onScroll, {passive:true});

  var burger = document.getElementById('burger'), nav = document.getElementById('nav');
  burger.addEventListener('click', function(){
    var open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  nav.addEventListener('click', function(e){
    if (e.target.tagName === 'A'){ nav.classList.remove('open'); burger.setAttribute('aria-expanded','false'); }
  });

  var items = document.querySelectorAll('[data-rv]');
  if (reduce || !('IntersectionObserver' in window)){
    items.forEach(function(el){ el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      var n = 0;
      entries.forEach(function(en){
        if (!en.isIntersecting) return;
        en.target.style.transitionDelay = (n++ * 70) + 'ms';
        en.target.classList.add('in');
        io.unobserve(en.target);
      });
    }, {rootMargin:'0px 0px -8% 0px', threshold:0.12});
    items.forEach(function(el){ io.observe(el); });
  }

  var nums = document.querySelectorAll('[data-count]');
  if (reduce || !('IntersectionObserver' in window)){
    nums.forEach(function(el){ el.textContent = el.getAttribute('data-count'); });
  } else {
    var nio = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (!en.isIntersecting) return;
        var el = en.target, target = parseInt(el.getAttribute('data-count'), 10);
        var t0 = null, dur = 1100;
        function step(ts){
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1);
          var e = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * e);
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        nio.unobserve(el);
      });
    }, {threshold:0.5});
    nums.forEach(function(el){ nio.observe(el); });
  }


  /* Filtrering av medarbetare. Rent DOM-arbete — inga sidladdningar. */
  var chips = document.querySelectorAll('.chip[data-team]');
  if (chips.length){
    var cards = document.querySelectorAll('.pcard[data-team]');
    var empty = document.getElementById('rosterEmpty');
    chips.forEach(function(btn){
      btn.addEventListener('click', function(){
        var team = btn.getAttribute('data-team');
        chips.forEach(function(b){ b.setAttribute('aria-pressed', String(b === btn)); });
        var shown = 0;
        cards.forEach(function(c){
          var hit = (team === 'alla') || (c.getAttribute('data-team') === team);
          c.hidden = !hit;
          if (hit) shown++;
        });
        if (empty) empty.hidden = shown > 0;
      });
    });
  }


  /* Kontaktformulär via Web3Forms. Utan JS postar formuläret som vanligt,
     så detta är en förbättring — inte en förutsättning. */
  var form = document.getElementById('contactForm');
  if (form){
    var note = document.getElementById('cfNote');
    var submit = document.getElementById('cfSubmit');
    var label = submit ? submit.innerHTML : '';
    form.addEventListener('submit', function(ev){
      if (!form.checkValidity()){ form.reportValidity(); ev.preventDefault(); return; }
      ev.preventDefault();
      note.className = 'formnote';
      note.textContent = 'Skickar…';
      submit.disabled = true;
      fetch(form.action, {
        method: 'POST',
        headers: {'Accept': 'application/json'},
        body: new FormData(form)
      }).then(function(r){ return r.json(); }).then(function(data){
        if (data && data.success){
          form.reset();
          note.className = 'formnote ok';
          note.textContent = 'Tack! Ditt meddelande är skickat. Vi hör av oss inom en arbetsdag.';
        } else {
          note.className = 'formnote err';
          note.textContent = 'Meddelandet kunde inte skickas. Mejla oss gärna på mail@carlrev.se i stället.';
        }
      }).catch(function(){
        note.className = 'formnote err';
        note.textContent = 'Meddelandet kunde inte skickas. Mejla oss gärna på mail@carlrev.se i stället.';
      }).then(function(){
        submit.disabled = false;
        submit.innerHTML = label;
      });
    });
  }

  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
