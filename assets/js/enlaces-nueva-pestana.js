// Enlaces dentro del texto de un post: se abren en una pestaña nueva.
// Se excluyen las anclas internas (#...) y los enlaces que Chirpy agrega a las imágenes para el visor.
(function () {
  'use strict';

  function iniciar() {
    document.querySelectorAll('article .content a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;
      if (a.classList.contains('popup') || a.classList.contains('img-link') || a.querySelector('img')) return;
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
