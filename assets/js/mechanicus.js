/*
 * Avatar Mechanicus: cada 10 segundos el avatar de la barra lateral se
 * "corrompe" y muestra la versión aumentada durante unos segundos, mientras
 * el subtítulo se reemplaza por una oración al espíritu de la máquina.
 * Configuración en _includes/metadata-hook.html (data-* del <script>).
 */
(function () {
  'use strict';

  var script = document.currentScript;
  var cfg = {
    img: script && script.dataset.img,
    every: Number((script && script.dataset.every) || 5000),
    show: Number((script && script.dataset.show) || 4000)
  };

  var ORACIONES = [
    'La carne es un periférico mal documentado. Lo estoy reemplazando por partes.',
    'Bendito el log que dice qué falló. Maldito el que solo dice "error".',
    'Que el espíritu de la máquina acepte este commit y no despierte a producción.',
    'Ungimos el servidor con pasta térmica y rezamos: que el kernel no entre en pánico.',
    'Lo que no tiene respaldo no existe. Lo que no tiene prueba ya está roto.',
    'Omnissiah, dame contexto suficiente y un modelo que no alucine.',
    'Mi ojo izquierdo corre en Linux desde 1995. El derecho sigue en beta.',
    'No temo a la máquina. Temo al humano que la configuró un viernes.',
    'Cada token es una ofrenda. Cada prompt, una letanía.',
    'Suelto la debilidad de la carne. Conservo el café.'
  ];

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init() {
    var avatar = document.getElementById('avatar');
    var img = avatar && avatar.querySelector('img');
    var subtitle = document.querySelector('#sidebar .site-subtitle');
    if (!img || !subtitle || !cfg.img) return;

    var normalSrc = img.getAttribute('src');
    var normalAlt = img.getAttribute('alt');
    var tagline = subtitle.textContent;
    var ultima = -1;
    var timer = null;

    // Precarga para que el cambio sea instantáneo.
    var pre = new Image();
    pre.src = cfg.img;

    function oracion() {
      var i;
      do {
        i = Math.floor(Math.random() * ORACIONES.length);
      } while (i === ultima && ORACIONES.length > 1);
      ultima = i;
      return ORACIONES[i];
    }

    function glitch(cb) {
      if (reduceMotion) return cb();
      avatar.classList.add('mech-glitch');
      subtitle.classList.add('mech-glitch-text');
      setTimeout(function () {
        cb();
        setTimeout(function () {
          avatar.classList.remove('mech-glitch');
          subtitle.classList.remove('mech-glitch-text');
        }, 260);
      }, 220);
    }

    function aumentar() {
      glitch(function () {
        img.src = cfg.img;
        img.alt = 'Cristian, versión Adeptus Mechanicus';
        avatar.classList.add('mech-on');
        subtitle.textContent = oracion();
        subtitle.classList.add('mech-oracion');
      });
      setTimeout(restaurar, cfg.show);
    }

    function restaurar() {
      glitch(function () {
        img.src = normalSrc;
        img.alt = normalAlt;
        avatar.classList.remove('mech-on');
        subtitle.textContent = tagline;
        subtitle.classList.remove('mech-oracion');
      });
    }

    function iniciar() {
      if (!timer) timer = setInterval(aumentar, cfg.every);
    }

    function detener() {
      clearInterval(timer);
      timer = null;
    }

    // No gastar ciclos (ni asustar a nadie) con la pestaña en segundo plano.
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) detener();
      else iniciar();
    });

    iniciar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
