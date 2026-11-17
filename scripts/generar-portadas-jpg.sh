#!/usr/bin/env bash
# Genera una versión .jpg de cada portada .webp de los posts, en
# assets/img/og/<mismo-nombre>.jpg (máximo 1200 px de ancho, calidad 85).
# El feed (/feed.xml) la usa en <media:thumbnail>, porque la API de imágenes
# de LinkedIn solo acepta JPG, PNG o GIF. El og:image sigue usando el .webp.
#
# Uso: scripts/generar-portadas-jpg.sh [--forzar]
# Sin --forzar solo genera los .jpg que faltan o que son más viejos que su .webp.
# Requiere ImageMagick (magick).
set -euo pipefail

cd "$(dirname "$0")/.."

forzar=0
[[ "${1:-}" == "--forzar" ]] && forzar=1

command -v magick >/dev/null || { echo "Falta ImageMagick (magick)." >&2; exit 1; }

mkdir -p assets/img/og

# Rutas de portada .webp del front matter: `image: /ruta.webp` o `image:\n  path: /ruta.webp`.
mapfile -t portadas < <(
  awk '
    FNR == 1 { fm = 0; en_image = 0 }
    /^---[[:space:]]*$/ { fm++; next }
    fm != 1 { next }
    /^image:/ {
      en_image = 1
      sub(/^image:[[:space:]]*/, "")
      if ($0 != "") { print; en_image = 0 }
      next
    }
    en_image && /^[[:space:]]+path:/ { sub(/^[[:space:]]+path:[[:space:]]*/, ""); print; en_image = 0; next }
    /^[^[:space:]]/ { en_image = 0 }
  ' _posts/*.md | tr -d "\"'" | grep -iE '\.webp$' | sort -u
)

generadas=0
for ruta in "${portadas[@]}"; do
  origen="${ruta#/}"
  if [[ ! -f "$origen" ]]; then
    echo "AVISO: no existe $origen" >&2
    continue
  fi
  nombre="$(basename "$origen" .webp)"
  destino="assets/img/og/${nombre}.jpg"
  if [[ $forzar -eq 0 && -f "$destino" && "$destino" -nt "$origen" ]]; then
    continue
  fi
  magick "$origen" -background white -alpha remove -alpha off \
    -resize '1200x>' -strip -interlace JPEG -quality 85 "$destino"
  echo "generada: $destino"
  generadas=$((generadas + 1))
done

echo "${#portadas[@]} portadas .webp, ${generadas} .jpg generadas."
