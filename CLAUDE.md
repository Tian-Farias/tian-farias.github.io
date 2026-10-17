# Sitio personal de Cristian "Tian" Farias

Blog/portafolio en Jekyll con el tema [Chirpy](https://github.com/cotes2020/jekyll-theme-chirpy) (gema `jekyll-theme-chirpy ~> 7.0`), publicado en GitHub Pages con GitHub Actions en **https://tian-farias.github.io**.

- Repo en GitHub: `Tian-Farias/tian-farias.github.io` (antes `fariax.github.io`; GitHub redirige el nombre viejo).
- Pages está configurado con **Source: GitHub Actions**. Si vuelve a "Deploy from a branch", el builder clásico falla con "The jekyll-theme-chirpy theme could not be found" y el paso "Setup Pages" del workflow también falla.
- Idioma del contenido: español neutro. Responder y escribir en español.
- No existe nada de "iO-Labs": ese nombre se eliminó del sitio y no debe volver.

## Estructura

- `_config.yml`: configuración (título, tagline, descripción, redes, analytics, avatar).
- `_tabs/`: páginas fijas (`about.md` = Sobre Mí, `experiencia.md`, `archives`, `categories`, `tags`).
- `_posts/`: entradas `AAAA-MM-DD-titulo.md`. Permalink `/posts/:title/`. Front matter con `title`, `author`, `categories`, `tags`.
- `_data/`: `authors.yml`, `contact.yml`, `share.yml`.
- `assets/img/`: imágenes. Avatar: `cristian.jpg`. Favicons en `assets/img/favicons/`.
- `_plugins/`: hook de `lastmod` del tema.
- Archivos del tema sobrescritos (copiados desde la gema Chirpy 7.x; revisarlos al actualizar el tema):
  - `_data/locales/es-ES.yml`: licencia CC BY-SA 4.0 y texto del pie ("Copyleft, casi todos los derechos reservados.").
  - `_includes/footer.html`: agrega "y Claudito" después del nombre en el ©.
  - `_includes/trending-tags.html`: igual al del tema, más un `include projects.html` al final para mostrar la sección "Proyectos" en el panel derecho.
- Proyectos del panel derecho: se listan en `_data/projects.yml` (`name`, `url`, `repo`, `description`) y se dibujan con `_includes/projects.html`. El panel derecho solo se ve en pantallas anchas (Chirpy lo oculta en móvil).
- `.github/workflows/pages-deploy.yml`: build (Ruby 3.3) + `htmlproofer` + deploy en cada push a `main`. También se puede lanzar a mano (workflow_dispatch).

## Ejecutar en local

```bash
bundle install
bundle exec jekyll serve      # http://127.0.0.1:4000/
```

Verificación equivalente al CI:

```bash
JEKYLL_ENV=production bundle exec jekyll b
bundle exec htmlproofer _site --disable-external
```

Jekyll no recarga `_config.yml`: reiniciar el servidor al cambiarlo.

## Cosas a tener en cuenta

- **`url` y `baseurl`:** `url` es `https://tian-farias.github.io`; `baseurl` debe quedar **vacío** (`""`). Al editar con reemplazos de texto, no tocar `baseurl` (ya ocurrió una vez y rompió todos los enlaces).
- **Ruby 3.4+ (ej. Arch):** el `Gemfile` agrega `erb`, `csv`, `base64`, `bigdecimal` y `logger` porque Ruby ya no las incluye y Jekyll las necesita. No quitarlas.
- `Gemfile.lock` está en `.gitignore`.
- No usar `.nojekyll`: el sitio se compila con Actions.
- Enlaces internos de posts: usar rutas relativas (`/posts/titulo/`), no el dominio.
- Favicons: se generan desde `assets/img/cristian.jpg` (recorte cuadrado de la cara) con los nombres que espera Chirpy 7.6: `favicon.ico`, `favicon.svg`, `favicon-96x96.png`, `apple-touch-icon.png`, `web-app-manifest-192x192.png` y `web-app-manifest-512x512.png`. Si falta alguno, el sitio muestra el ícono de Chirpy que trae la gema.
- Google Analytics: `analytics.google.id` en `_config.yml` está vacío a propósito mientras Cristian lo configura. No rellenarlo.
- Posts de 2021: llevan un aviso `{: .prompt-info }` de publicación original y revisión. Los posts traídos de LinkedIn llevan un aviso con el enlace y la fecha original.
- Pendiente: la imagen de `_posts/2021-08-25-que-es-un-dato.md` se carga desde Wikimedia (`ProcesamientoDatos.svg`); hay que traerla a `assets/img/` con su atribución de licencia.
- RSS: Chirpy genera `/feed.xml` (Atom) y el ícono de RSS de la barra lateral viene de `_data/contact.yml`.

## Contenido y privacidad

- Licencias: posts bajo CC BY-SA 4.0; código del sitio bajo MIT (`LICENSE`).

- Fuente del perfil: el LinkedIn de Cristian (https://www.linkedin.com/in/cristianfarias). No inventar logros, cifras ni fechas; si falta información, preguntar.
- **No publicar el teléfono.** El correo público es el que está en `_config.yml`.
- Cargo actual: Líder de IA e Innovación en SmartJob (desde febrero de 2025). Proyectos internos nombrados en el sitio: SmartForge y Antonia.
- Tono: primera persona, directo. El humor negro es parte de su firma ("Adeptus Mechanicus" en el tagline y en Sobre Mí); mantenerlo.
- Cuenta de GitHub: `tian-farias` (la anterior `fariax` ya no se usa).
- En Desafío Latam (2018–2020) fue alumno, ayudante y profesor de la carrera Data Science.

## Flujo de trabajo con git

- Rama principal: `main` (cada push publica el sitio). Desarrollar en la rama indicada para la sesión, salvo que Cristian pida trabajar o mergear directo en `main`. Hacer `git pull` antes de empujar: Cristian también hace commits desde su PC.
- Borrar las ramas de trabajo cuando ya estén mergeadas en `main`.
- No abrir pull requests salvo que se pidan explícitamente.
- Commits en español, descriptivos.
