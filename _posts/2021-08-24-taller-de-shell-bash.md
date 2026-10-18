---
title: "Shell bash - Guía de iniciación"
author: Cristian Farias
description: Una introducción clara y concreta a los comandos básicos de la línea de comandos con bash.
categories: [Talleres]
tags: [Shell, Bash]
toc: true
comments: true
image:
  path: /assets/img/taller-shell-bash-image.png
  alt: Esta guía tiene por objetivo dar una introducción muy clara y concreta a los comandos básicos de la línea de comandos con bash.
---

> Publicado originalmente en agosto de 2021. Revisado en octubre de 2026 para corregir errores y ejemplos; el contenido conserva su enfoque original.
{: .prompt-info }

Esta guía la hice para un taller del shell [bash](https://es.wikipedia.org/wiki/Bash) en la [Academia Desafío Latam](https://desafiolatam.com/) para la carrera de [data science](https://desafiolatam.com/data-science/) impartida por esta institución y en la que entre el 2018 y el 2020 tuve la oportunidad de ser alumno, ayudante y profesor, siendo una de las grandes experiencias que he tenido, conociendo excelentes personas que me ayudaron a impulsar mi carrera (y mi vida) desde un punto muerto hacia lo que hoy soy. Muchas gracias.

Esta guía tiene por objetivo dar una introducción muy clara y concreta a los comandos básicos de la línea de comandos con [bash](https://es.wikipedia.org/wiki/Bash). No ha sido creada para trabajar directamente con Linux, sino de una manera más genérica, dado que en estos tiempos el shell [bash](https://es.wikipedia.org/wiki/Bash) no solo se encuentra en este sistema operativo, sino que es posible encontrarlo en varias implementaciones, como veremos más adelante.

Si quieres colaborar en este documento, no dudes en [ponerte en contacto conmigo](https://www.linkedin.com/in/cristianfarias) para que vayamos mejorando el contenido. Se agradece si envían correcciones, puestas al día o incluso párrafos enteros. Esto es muy amable de su parte y es la forma correcta de hacer evolucionar esta guía y el código abierto en general.

# Plataformas de trabajo

[Bash](https://es.wikipedia.org/wiki/Bash) inicialmente fue desarrollado para Unix/Linux, sin embargo, se ha ido portando a muchas plataformas. Es por eso que quise independizarme del sistema operativo y centrarme en el shell en sí.

Esta guía te sirve si:

- Tienes Linux instalado en tu PC, ya sea nativo, dual boot, inicio con pendrive, una máquina virtual o un contenedor Docker.
- Tienes Windows 10 u 11, activaste WSL e instalaste cualquier distribución de la tienda.
- Tienes un ambiente [Cygwin](https://www.cygwin.com/) o Git Bash instalado y funcionando.
- Tienes Unix instalado.
- Tienes un Apple con macOS. Desde macOS Catalina (2019) el shell por defecto es zsh, pero bash sigue disponible ejecutando `bash`, y casi todo lo de esta guía funciona igual en zsh.
- Tienes acceso a un servidor Unix/Linux remoto vía SSH.

# Algunos datos útiles sobre la línea de comandos (CLI)

- En la CLI estás interactuando con tu servidor a través de comandos que vas introduciendo.
- No existen interfaces gráficas o cursores gráficos... en teoría...
- Los comandos se crean para hacer una y solo una cosa muy simple... y lo hacen muy bien.
- El nombre de los comandos casi siempre es la forma abreviada de lo que hacen, por ejemplo: `pwd` significa "**P**rint **W**orking **D**irectory".
- Su función original se puede modificar con parámetros y opciones (lo veremos más adelante).
- Mezclando comandos obtenemos un lenguaje de programación muy potente.
- El directorio donde estás parado se llama "directorio de trabajo".

## El símbolo de sistema

Cuando trabajamos en la línea de comandos, al principio de cada línea vemos el siguiente símbolo:

```bash
tu_usuario@nombre-de-host:~$
```

En esta simple línea podemos identificar seis elementos:

1. Tu nombre de usuario: **tu_usuario**.
2. **@** (arroba)
3. El nombre de host o servidor.
4. **:** (dos puntos)
5. El nombre del directorio actual: **~**
6. **$** (signo de peso o signo de dólar)

Los comandos que lancemos irán siempre después del signo `$`.

## El directorio home

Todos los usuarios de sistema cuentan con un directorio home, este es su ambiente de trabajo y donde residen las configuraciones de cada aplicación que usemos, ya sea de consola o gráfica.

Generalmente, en un sistema Linux, el directorio home de los usuarios se encuentra en `/home/nombre_de_usuario` y dentro de este el usuario es amo y señor. Fuera de este no existe ningún directorio en donde un usuario normal pueda hacer modificaciones, al menos por defecto.

Por defecto, el directorio home también se puede llamar por `~` y este es un nombre válido dentro del sistema.

Además, existe el usuario **root**, que es el superusuario del sistema, él es quien tiene todos los permisos. Su directorio de usuario es `/root` y se encarga de administrar el sistema completo, instalar aplicaciones, dar permisos, etc. **Él incluso puede eliminar el sistema completo sin preguntas**.

**ATENCIÓN**: El usuario root se debe usar solo para configuraciones y no como el usuario de acceso permanente al sistema.  
Quedan advertidos... ;)

## El entorno de usuario

Dentro del entorno de usuario se pueden crear directorios y archivos y darles el orden que este estime conveniente; es el usuario el que tiene el control y puede modificarlo a voluntad.

El entorno no solo lo componen directorios y archivos, también existen variables de sistema, que son variables que se definen por defecto al inicio de sesión y que contienen configuraciones específicas del entorno.

Por ejemplo:

`echo $HOME`  
Muestra la ruta completa del directorio home de usuario.

`echo $PATH`  
Muestra los directorios donde el shell irá a buscar los comandos al ejecutarlos.

`echo $RANDOM`  
Muestra un número entero al azar entre 0 y 32767.

*Por ahora tienes que creer con fe ciega que esto es así, más adelante veremos lo que es una variable.*

Si quieres conocer todas las variables de sistema puedes usar el comando `env` o `set` para verlas por pantalla.

Archivos como `.bashrc` o `.profile` permiten personalizar el entorno, agregar variables y ejecutar algunas configuraciones de forma automática al inicio de sesión.

## Páginas de manual

Si quieres tener más información de los comandos, archivos o ambiente de sistema, UNIX pone a disposición un manual completo de la plataforma a través del comando `man`.

La mayoría de las aplicaciones aportan documentación de manual accesible desde el mismo comando:

`man [comando]`

Por ejemplo, para saber todo lo relacionado con la aplicación `man` basta con poner en la CLI:

`man man`

Y se mostrará la información necesaria sobre este.

En ocasiones el mismo programa posee diversas secciones de manual; cuando esto ocurre suele mostrar un mensaje indicando la sección, como man(1) y man(7), o exit(1) y exit(3). Para acceder a estas secciones basta con indicarlo de la siguiente forma:

`man 3 printf`

El manual normalmente está dividido en ocho secciones numeradas, organizadas como sigue:

| Sección | Descripción |
|:---:|:--- |
| 1 | Comandos generales |
| 2 | Llamadas al sistema |
| 3 | Biblioteca de lenguaje de programación C |
| 4 | Ficheros especiales (normalmente dispositivos, que se pueden encontrar en /dev) y drivers |
| 5 | Formatos de fichero y convenciones |
| 6 | Juegos y salvapantallas |
| 7 | Miscelánea |
| 8 | Comandos de administración del sistema y demonios |

En algunos sistemas están disponibles también las siguientes secciones:

| Sección | Descripción |
|:---:|:--- |
| 0 | Archivos de cabecera de la biblioteca estándar del lenguaje de programación C |
| 9 | Rutinas del kernel |
| n | Tcl/Tk |
| x | X Window System (entorno gráfico) |

# Comandos básicos para trabajar con directorios

`pwd`  
Imprime el directorio donde estás trabajando, o sea, donde estás "parado".

`ls`  
Lista todo el contenido de un directorio.

`cd`  
Es el comando que usamos para cambiar de directorio; si lo lanzas sin parámetros sirve para ir a tu directorio "home" desde tu directorio de trabajo.

`mkdir un_dir`  
Con esto creamos un directorio.

`cd un_dir`  
Lo usas para cambiarte de directorio, en este caso a uno llamado "un_dir".

`cd ..`  
Esto es para devolverse un nivel hacia atrás.

`cd -`  
Esto permite devolverte al directorio de trabajo anterior.

`rmdir un_dir`  
Si el directorio está vacío, lo elimina. Si no está vacío se debe usar `rm -r un_dir`, que elimina el directorio con todo su contenido.  
**ATENCIÓN: No existe papelera de reciclaje, el directorio se elimina inmediatamente.**

# Comandos básicos para trabajo con archivos

`touch prueba.txt`  
Crea un archivo vacío llamado `prueba.txt`; si el archivo existe, solo se actualiza la información de hora del mismo.

`cp prueba.txt copia_prueba.txt`  
Copia el archivo `prueba.txt` a un nuevo archivo llamado `copia_prueba.txt`.

`cp prueba.txt un_dir/prueba.txt`  
Copia el archivo `prueba.txt` a un directorio llamado `un_dir/` manteniendo el nombre original.  
Esto funciona si y solo si el directorio `un_dir/` existe en tu directorio de trabajo.

`mv prueba.txt un_dir/prueba.txt`  
Mueve el archivo `prueba.txt` desde el directorio de trabajo al directorio `un_dir/`.  
Esto funciona si y solo si el directorio `un_dir/` existe en tu directorio de trabajo.

`mv prueba.txt nueva_prueba.txt`  
Renombra el archivo `prueba.txt` a `nueva_prueba.txt`.

`rm prueba.txt`  
Borra el archivo `prueba.txt`.  
**ATENCIÓN: No existe papelera de reciclaje, el archivo se elimina inmediatamente.**

# Algunos trucos

1. `clear`: Limpia la terminal.
2. Puedes usar las flechas arriba (↑) y abajo (↓) para encontrar los comandos utilizados anteriormente.
3. Puedes usar el comando `history` para obtener una lista de los comandos usados anteriormente.
4. Se pueden autocompletar comandos, archivos, directorios, etc. con la tecla Tab (⇥).
5. Con la combinación `Ctrl-R` puedes tipear un comando y se buscará en el historial el último ejecutado que coincida con lo tipeado.

# Imprimiendo en pantalla

`echo "Hello, World"`  
Imprime Hello, World en tu pantalla.

`cat datos.csv`  
Imprime el contenido del archivo `datos.csv` en la pantalla.

`head datos.csv`  
Imprime las primeras 10 líneas del archivo `datos.csv` en la pantalla.

`head -n 50 datos.csv`  
Imprime las primeras 50 líneas del archivo `datos.csv` en la pantalla.

`tail datos.csv`  
Imprime las últimas 10 líneas del archivo `datos.csv` en la pantalla.

`tail -n 50 datos.csv`  
Imprime las últimas 50 líneas del archivo `datos.csv` en la pantalla.

# Contando cosas

`wc datos.csv`  
Cuenta el número de líneas, palabras y bytes en el archivo `datos.csv` y los imprime en pantalla.

`wc -l datos.csv`  
Cuenta el número de líneas en el archivo `datos.csv` y lo informa en pantalla. (Nota: `-l` se refiere a "lines".)

`wc -w datos.csv`  
Cuenta el número de palabras en el archivo `datos.csv` y lo informa en pantalla. (Nota: `-w` se refiere a "words".)

`wc -c datos.csv`  
Cuenta el número de bytes en el archivo `datos.csv` y lo informa en pantalla. (Nota: `-c` se refiere a "chars", pero en realidad cuenta bytes.)

`wc -m datos.csv`  
Cuenta el número de caracteres en el archivo `datos.csv`. Se diferencia de `-c` cuando el archivo tiene tildes, eñes u otros caracteres que ocupan más de un byte.

# Parámetros y opciones

Los parámetros de los comandos pueden modificar el comportamiento original de estos.
Casi todos los comandos tienen múltiples opciones.
Estas se pueden aplicar de la siguiente forma:

  1. Escribe el comando sin parámetros (ej: `wc`)
  2. Agrega un espacio y un guion (ej: ` -`)
  3. Agrega la opción (ej: `w`)

Resultado: `wc -w`

En general el paso de parámetros en los comandos puede variar: algunos como `ps` o `tar` aceptan las opciones sin guiones, a otros como `wc` se les pasan las opciones con un solo guion y otros aceptan opciones con uno y dos guiones.

En general, la sintaxis de los parámetros de los comandos es la siguiente:

1. `comando -opción`
2. `comando --opción`

Si se quiere saber cuáles son los parámetros y opciones de los comandos, existen dos formas:

1. **La forma rápida**: `comando --help` o en algunos casos `comando -help`
2. **La página de manual**: `man comando` (para más información, siempre puedes hacer un `man man`)

Algunos ejemplos:

`wc -w datos.csv`  
Como ya sabemos, `wc` cuenta el número de líneas, palabras y bytes en el archivo `datos.csv` y los imprime en pantalla.
En este caso modificamos el comportamiento con el parámetro `-w` para que solo cuente las palabras.

`ls -l`  
En este caso sabemos que `ls` lista todo el contenido de un directorio.
Pero el parámetro `-l` cambia el formato de salida y muestra mayor información sobre los archivos y directorios.

# Imprimiendo cosas a un archivo

En algunos casos, y principalmente en proyectos más complejos, no necesitamos imprimir datos en pantalla, sino que necesitamos guardar los resultados en archivos para poder trabajarlos después.

Es aquí donde aparecen los caracteres de **redirección**, que nos permiten enviar la salida de un comando hacia un archivo.

Los caracteres de redirección pueden ser de dos tipos:

1. `>`: Toma la salida del comando y la direcciona a un archivo; si el archivo existe, este se reescribe desde cero.
2. `>>`: Toma la salida del comando y la direcciona al final de un archivo; si el archivo existe, el contenido se agrega después de la última línea.

Por ejemplo:

`head datos.csv > datos_diez_primeros.csv`  
Toma las primeras 10 líneas del archivo `datos.csv` y las envía a un archivo llamado `datos_diez_primeros.csv`.  
Si el archivo no existe, lo crea.  
Si el archivo existe, lo sobrescribe.  

`head datos.csv >> datos_variados.csv`  
Toma las primeras 10 líneas del archivo `datos.csv` y las envía a un archivo llamado `datos_variados.csv`.  
Si el archivo no existe, lo crea.  
Si el archivo existe, agrega el contenido al final del archivo manteniendo el contenido original.  

# Filtrando datos

Si tenemos un archivo `datos.csv` que es un conjunto de datos separados por `;` y queremos mostrar solo la primera columna del archivo, podemos ejecutar lo siguiente:

`cut -d';' -f1 datos.csv`  
El comando `cut` corta la entrada que se le entrega de acuerdo a los parámetros que se le pasan.  
En este caso se le dice que use como delimitador (`-d`) el símbolo `;` y que además solo muestre la primera columna (`-f1`) del archivo `datos.csv`.

`cut -d'-' -f1,5,12,13 datos.csv`  
Este es un ejemplo parecido al anterior, pero se le dice que use como delimitador el carácter `-` y que imprima las columnas 1, 5, 12 y 13 del archivo `datos.csv`.

`grep "algo" datos.csv`  
Este comando retornará todas las líneas que contienen el string "algo" dentro del archivo `datos.csv`.  
Por defecto, este comando diferencia entre mayúsculas y minúsculas.

`grep -v "algo" datos.csv`  
Al contrario del comando anterior, este comando retorna todas las líneas que **NO** contienen el string "algo" dentro del archivo `datos.csv`.  

`grep -i "ALGO" datos.csv`  
Este comando retornará todas las líneas que contienen el string dentro del archivo `datos.csv`.  
En este caso, con el parámetro `-i`, **NO** diferencia entre mayúsculas y minúsculas.  

# Valores únicos y ordenados

`sort datos.csv`  
Muestra en su salida el archivo ordenado alfabéticamente.

`sort -n datos.csv`  
Muestra en su salida el archivo ordenado numéricamente.

`sort -r datos.csv`  
Muestra en su salida el archivo ordenado alfabéticamente, pero de forma inversa.

`sort -r -n datos.csv`  
Muestra en su salida el archivo ordenado numéricamente, pero de forma inversa.

`sort -u datos.csv`  
Muestra en su salida el archivo ordenado alfabéticamente y remueve los duplicados. (Nota: `-u` se refiere a "unique".)

`sort -n -t',' -k2 datos.csv`  
Muestra en su salida el archivo ordenado numéricamente (`-n`) por la segunda columna (`-k2`), utilizando como separador de columnas (`-t`) el carácter `,`.

`uniq datos.csv`  
Muestra en su salida el contenido del archivo eliminando las líneas repetidas **consecutivas**. Para eliminar todos los duplicados, el archivo debe estar ordenado antes (con `sort`, como veremos en la sección de pipes).

`uniq -c datos.csv`  
Igual que el anterior, pero además cuenta el número de ocurrencias de cada línea.

# Pipes o tuberías

En proyectos más complejos, existen ocasiones en que es necesario pasar la salida de un comando a la entrada de otros. Para esto se pueden utilizar archivos, pero con grandes volúmenes de datos esto puede ser muy poco conveniente.

Es en estos casos cuando podemos usar los **pipes** o tuberías; estos permiten conectar salidas y entradas de comandos haciendo que se comporten como si fueran uno.

Estos pipes se utilizan con el carácter `|`.

Por ejemplo:  
`head -n 50 datos.csv | tail -n 10`  
Este comando muestra las líneas 41 a la 50 del archivo `datos.csv` de la siguiente manera:

1. Toma el archivo `datos.csv` y a través de `head` solicita las primeras 50 líneas.
2. Luego, la salida de `head` es pasada a través de una tubería hacia el comando `tail`.
3. Finalmente, el comando `tail` muestra las últimas 10 líneas de la salida del comando `head`.

`sort datos.csv | uniq -c`  
En este caso, se solicita la salida del archivo `datos.csv` de forma ordenada y después, a través de una tubería, se ingresa la salida al comando `uniq`, el cual contará las ocurrencias de cada fila única.

`cut -d';' -f1 datos.csv | grep "algo" | wc -l`  
Este comando ejecuta lo siguiente:

1. Muestra la primera columna del archivo `datos.csv` usando como delimitador el símbolo `;`.
2. Busca dentro de la salida del comando `cut` el string "algo".
3. Cuenta la cantidad de líneas donde el string "algo" aparece.

# Automatizar tareas

Se pueden automatizar tareas, scripts y comandos para que se ejecuten automáticamente cada día, hora o incluso cada minuto.

Para esto todo sistema Unix tiene una utilidad llamada `cron` y es posible configurarla con el comando `crontab -e`. Esto abrirá un editor en donde se podrá agregar la configuración de la tarea.

La configuración se realiza agregando una línea por cada tarea que se quiera programar; cada línea tiene la siguiente sintaxis:

`* * * * * /tu/comando.sh`

Que significa lo siguiente:

1. El minuto de la hora en que debe ser ejecutado.
2. La hora del día en que debe ser ejecutado.
3. El día del mes en que debe ser ejecutado.
4. El mes en que debe ser ejecutado.
5. El día de la semana en que debe ser ejecutado.
6. El comando que debe ser ejecutado.

Los primeros cinco parámetros definen cuándo debe ser ejecutado y el sexto define qué debe ser ejecutado.

El símbolo `*` es un comodín que significa *todos*.

La siguiente imagen corresponde al archivo de sistema `/etc/crontab`, que además incluye una columna con el usuario que ejecuta la tarea (`user-name`). Esa columna **solo** existe en `/etc/crontab`; en el crontab de cada usuario (el que se edita con `crontab -e`) no se escribe.

![Crontab File](/assets/img/taller-de-shell-bash-crontab.png)

Por ejemplo:  

`15 00 * * * /home/usuario/script.sh`  
Ejecutará el `script.sh` a las 00:15 horas, todos los días del mes, todos los meses, todos los días de la semana.

Una ayuda muy buena para programar tareas con cron es la página <https://crontab.guru/>.
En ella pueden obtener muchas opciones de ejecución para luego copiar y pegar en su archivo crontab.

# Scripting con bash

Un script no es más que un conjunto de comandos útiles ejecutándose juntos y en orden para crear otro comando útil.

Para crear un script necesitas saber usar un editor como `vim`, `emacs` o `nano`.

Si no sabes nada de editores te recomiendo `nano` o uno poco conocido llamado `mcedit`, el cual te entrega una interfaz sencilla dentro de la consola de comandos y que se maneja con las teclas de función.

Para instalar mcedit debes instalar el paquete "**Midnight Commander**" (llamado comúnmente mc) en tu distribución, o visitar su sitio web: <https://midnight-commander.org/>

**Midnight Commander** es una herramienta de exploración de archivos tipo *Norton Commander* que entrega muchas utilidades para la consola, incluyendo conexión de red, FTP, etc.

![mcedit](/assets/img/taller-de-shell-bash-mcedit.png)

Para crear un script paso a paso:

1. Abre tu editor favorito.
2. Escribe las siguientes líneas:
   ```bash
   echo "Numero de lineas en el archivo:"
   wc -l datos.csv
   echo "Numero de caracteres en el archivo:"
   wc -c datos.csv
   ```
3. En la primera línea del archivo escribe `#!/usr/bin/env bash`.
   Esta línea se llama shebang y le indica al sistema que debe ejecutar el script con [bash](https://es.wikipedia.org/wiki/Bash).
   También es válido escribir `#!/bin/bash`.
4. Guarda tu archivo en el mismo directorio donde está `datos.csv` y nómbralo como te plazca, por ejemplo: `mi_script.sh`.
5. Debes darle permisos de ejecución al archivo para que pueda hacer algo: `chmod +x mi_script.sh`.
6. Ejecuta el archivo: `./mi_script.sh`.
7. ¡LISTO!

Debería quedar algo como esto:

![mcedit](/assets/img/taller-de-shell-bash-script.png)

La salida debe ser algo como esto:

```console
Numero de lineas en el archivo:
672 datos.csv
Numero de caracteres en el archivo:
11424 datos.csv
```

Recuerda que `wc -c` cuenta bytes: si el archivo tiene tildes o eñes, usa `wc -m` para contar caracteres.

Ya tenemos nuestro primer script.

## Variables

En [bash](https://es.wikipedia.org/wiki/Bash) podemos asignar valores a variables de forma simple ejecutando lo siguiente (sin espacios alrededor del `=`):

`VARIABLE=VALOR`

En esta guía se usan nombres en mayúsculas para diferenciarlos. Ten en cuenta que las variables de entorno del sistema (`HOME`, `PATH`, etc.) también van en mayúsculas, así que evita reutilizar esos nombres; muchos prefieren minúsculas para sus propias variables.

Por ejemplo:  

```bash
A=100
B='hello, world'
VERDAD=true
VALOR=0.75
```

Para llamar a la variable debe hacerse con el signo `$` delante. Es buena práctica ponerla entre comillas dobles (`"$B"`) para que los espacios del valor no la separen en varias palabras:

`echo "$A"`  
100

`echo "$B"`  
hello, world

`echo "$VERDAD"`  
true

`echo "$VALOR"`  
0.75

## Condicionales con IF

Como se dijo anteriormente, todos los comandos y propiedades de [bash](https://es.wikipedia.org/wiki/Bash) forman un lenguaje de programación rico y lleno de opciones. En este caso también cuenta con condicionales, las cuales cumplen el siguiente criterio:

```bash
A=10
B=20
if [[ $A == $B ]]; then
    echo 'yes'
else
    echo 'no'
fi
```

`[[ ... ]]` es una palabra clave de bash que evalúa la condición. Si la evaluación es verdadera se ejecuta el comando `echo 'yes'`; si es falsa (sino, o `else`) se ejecuta `echo 'no'`.

Existe también la forma clásica `[ ... ]`, donde `[` es un alias del comando `test` y funciona en cualquier shell compatible con POSIX. `[[ ... ]]` es exclusivo de bash (y zsh), pero es más flexible y menos propenso a errores.

Mucha información se puede encontrar en la página de manual de `test` a través del comando `man test`.

## Loops

[Bash](https://es.wikipedia.org/wiki/Bash) también cuenta con loops al igual que cualquier lenguaje, y estos pueden ser con `while`, si se requiere la evaluación de una condición, o con `for`, si se requiere iterar rápidamente.

**Ejemplo `while`:**

```bash
I=0
while [ $I -lt 10 ]; do
    echo $I
    I=$((I + 1))
done
```

En este caso se define una variable `$I` y se le indica a `while` que se repita mientras `$I` sea menor que 10 (`[ $I -lt 10 ]`); luego se imprime `$I` y se aumenta `$I` en uno (`$((I + 1))`).

El ciclo se repite hasta que se deja de cumplir la condición.

**Ejemplo `for`:**

```bash
# for sobre iterables
for VARIABLE in 1 2 3 4 5; do
	comando_1
	comando_2
	comando_n
done

# for sobre archivos
for ARCHIVO in archivo_1.csv archivo_2.csv archivo_3.csv; do
	wc -l "$ARCHIVO"
done

# for sobre la salida de un comando
for LINEA in $(cut -d';' -f1 datos.csv); do
	echo "$LINEA"
done
```

En estos casos se utiliza `for` sobre diferentes iterables, como pueden ser números, archivos o salidas de comandos. Las opciones son muchas.

`for` también ofrece la posibilidad de evaluar expresiones como `while`; en este caso sigue una sintaxis parecida al lenguaje C:

```bash
for (( c=1; c<=5; c++ )); do
   echo "Hola $c veces"
done
```

Y en el caso de necesitar un loop infinito:

```bash
for (( ; ; )); do
   echo "Loop infinito [presione CTRL+C para detener]"
done
```

# Otros comandos útiles

`echo 'hola mundo!'`  
hola mundo!  
`echo` repite todo lo que se le pasa como parámetro. Usa comillas simples cuando el texto tenga `!`: dentro de comillas dobles, bash interpreta el `!` como una referencia al historial.

`sed`  
`sed` fue creado para analizar y transformar texto en la línea de comandos.

`sed 's/,/;/g' datos.csv`  
Reemplaza todos los caracteres `,` por `;` en el archivo `datos.csv` e imprime los resultados en pantalla.

`date`  
Imprime la fecha actual.  
(Ejemplo: Sat Aug 10 23:21:55 UTC 2019)

`date +%D`  
Imprime la fecha en el formato mm/dd/yy (08/12/19).

`date +%Y-%m-%d`  
Imprime la fecha en el formato yyyy-mm-dd (2019-10-10).

`awk`  
`awk` es otra gran herramienta para procesamiento de texto y limpieza de datos.  
Con `awk` se podría dedicar un curso completo, ya que representa un lenguaje de programación en sí.

`awk -F',' '{print $3,$2,$5}' datos.csv`  
Imprime la 3.ª, 2.ª y 5.ª columna (en ese orden) del archivo `datos.csv`, que está delimitado por `,`.

`awk '{sss+=$1} END {print sss}' solo_numeros.csv`  
Suma todos los números de la primera columna del archivo `solo_numeros.csv`.
