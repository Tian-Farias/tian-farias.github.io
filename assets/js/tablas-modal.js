// Tablas que no caben en el ancho del post: al hacer clic se abren en un modal más ancho.
// Chirpy envuelve cada tabla del contenido en .table-wrapper (con scroll horizontal).
(function () {
  'use strict';

  var dialog = null;

  function crearDialogo() {
    dialog = document.createElement('dialog');
    dialog.className = 'tabla-modal';
    dialog.setAttribute('aria-label', 'Tabla ampliada');
    dialog.innerHTML =
      '<button type="button" class="tabla-modal-cerrar" aria-label="Cerrar">&times;</button>' +
      '<div class="tabla-modal-cuerpo"></div>';
    document.body.appendChild(dialog);

    dialog.querySelector('.tabla-modal-cerrar').addEventListener('click', function () {
      dialog.close();
    });
    // Clic en el fondo (fuera del contenido) cierra el modal.
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', function () {
      document.documentElement.classList.remove('tabla-modal-abierto');
    });
  }

  function abrir(tabla) {
    if (!dialog) crearDialogo();
    var cuerpo = dialog.querySelector('.tabla-modal-cuerpo');
    cuerpo.innerHTML = '';
    cuerpo.appendChild(tabla.cloneNode(true));
    document.documentElement.classList.add('tabla-modal-abierto');
    dialog.showModal();
    cuerpo.scrollLeft = 0;
    cuerpo.scrollTop = 0;
  }

  function marcar(wrapper) {
    var tabla = wrapper.querySelector('table');
    if (!tabla) return;
    var desborda = wrapper.scrollWidth > wrapper.clientWidth + 1;
    wrapper.classList.toggle('tabla-ampliable', desborda);
    if (desborda) {
      wrapper.setAttribute('title', 'Clic para ver la tabla completa');
    } else {
      wrapper.removeAttribute('title');
    }
    if (wrapper._botonAmpliar) wrapper._botonAmpliar.hidden = !desborda;
  }

  function agregarBoton(wrapper) {
    var boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'tabla-ampliar';
    boton.textContent = '⤢ Ver tabla completa';
    boton.hidden = true;
    boton.addEventListener('click', function () {
      abrir(wrapper.querySelector('table'));
    });
    wrapper.insertAdjacentElement('afterend', boton);
    wrapper._botonAmpliar = boton;
  }

  function iniciar() {
    if (typeof HTMLDialogElement === 'undefined') return;
    var wrappers = document.querySelectorAll('.content .table-wrapper');
    if (!wrappers.length) return;

    wrappers.forEach(function (wrapper) {
      agregarBoton(wrapper);
      marcar(wrapper);
      wrapper.addEventListener('click', function (e) {
        if (!wrapper.classList.contains('tabla-ampliable')) return;
        if (e.target.closest('a')) return; // los enlaces siguen funcionando
        var sel = window.getSelection && window.getSelection();
        if (sel && String(sel).length > 0) return; // no interrumpir si el usuario está seleccionando texto
        abrir(wrapper.querySelector('table'));
      });
    });

    var t = null;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        wrappers.forEach(marcar);
      }, 150);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
