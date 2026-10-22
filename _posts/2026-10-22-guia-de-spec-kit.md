---
title: "Guía de Spec Kit"
author: Cristian
description: "Spec-Driven Development con GitHub Spec Kit y Claude Code, en modo estricto: cómo crear un Tetris, hacerlo evolucionar y corregir un bug usando solo los comandos de Spec Kit, incluido qué hacer cuando el agente te pregunta algo."
categories: [IA]
tags: [Spec Kit, SDD, Claude Code, Agentes]
toc: true
comments: true
image:
  path: /assets/img/guia-de-spec-kit.webp
  alt: "Ilustración tipo boceto: Claude Code ejecuta comandos de Spec Kit que generan spec.md, plan.md y tasks.md, y de ahí sale un Tetris en el navegador"
---

## Por qué escribí esta guía

Cuando empecé con Spec Kit me trabé en algo que ningún tutorial explicaba. Ejecutaba `/speckit-specify` o `/speckit-plan`, el agente me hacía una pregunta y la consola de Claude Code se quedaba esperando. ¿Cómo respondía? ¿Escribiendo en el chat, ejecutando otro comando o editando el archivo a mano?

Busqué y no encontré ningún manual ni tutorial que lo indicara. Los que vi explican la especificación y listan los comandos típicos, y asumen que uno ya sabe qué hacer cuando el flujo se sale del camino feliz. Yo quería responder como lo dice la metodología, no como lo intuía.

Así que le pedí a Claude un manual estricto: el proceso explicado como si yo no supiera nada de Spec Kit y tuviera que ejecutarlo al pie de la letra, incluyendo cómo responder las preguntas, cómo corregir y qué hacer cuando algo falla. Esta guía es el resultado.

La respuesta corta a mi duda original: se responde escribiendo en el chat de Claude Code, en el formato que pide el comando, y nunca editando el archivo. La respuesta larga es el resto de la guía.

> Un Adeptus Mechanicus diría que el rito existe para que el espíritu máquina no se enoje. Aquí el rito existe para que el agente no improvise.
{: .prompt-tip }

## Qué es SDD y qué es Spec Kit

**Spec-Driven Development (SDD)** es una forma de trabajar con agentes de IA en la que la especificación manda. Primero se escribe qué debe hacer el software y por qué, después cómo se construye, después las tareas, y recién al final el agente escribe el código. Cada documento sale del anterior y el código tiene que cumplir con todos. Si algo cambia, primero se cambia el documento y el código lo sigue.

La idea responde a un problema conocido de pedirle cosas a un agente en texto libre, lo que hoy se llama *vibe coding*. Sirve para un prototipo, pero las decisiones quedan repartidas en el historial del chat, nadie sabe por qué el código hace lo que hace y cada corrección puede romper algo que ya funcionaba. Con SDD las decisiones quedan escritas en archivos versionados con git, que el agente lee en cada paso y que una persona puede revisar.

**Spec Kit** es el kit de herramientas de GitHub para aplicar SDD. GitHub lo liberó como código abierto en septiembre de 2025 y funciona con varios agentes, entre ellos Claude Code y GitHub Copilot. Tiene dos partes:

- `specify`, un programa de terminal que prepara el proyecto.
- Un conjunto de comandos (`/speckit-constitution`, `/speckit-specify`, `/speckit-plan` y otros) que se ejecutan dentro del agente. Cada comando es un archivo de instrucciones que le dice al agente qué leer, qué escribir y qué no tocar.

El flujo tiene cinco capas: constitución (las reglas del proyecto), spec (qué y por qué), plan (cómo), tareas (los pasos) y código. La Parte 1 de esta guía detalla qué hace cada comando.

## Antes de empezar

La guía recorre el ciclo completo de Spec-Driven Development usando solo comandos de Spec Kit: crear un Tetris, hacerlo evolucionar y corregir un bug, con toda la documentación alineada. Está escrita para alguien que no sabe nada del tema y no tiene a quién preguntarle.

> Verificado con Spec Kit 1.1.3 y Claude Code en octubre de 2026, leyendo las instrucciones reales de cada comando en una instalación limpia. Spec Kit cambia rápido, así que revisa tu versión con `uv tool list`. Los bloques marcados "Ejemplo de salida" tienen el formato real de Spec Kit, pero el contenido cambia en cada ejecución porque lo escribe la IA.
{: .prompt-info }

Si lees otros tutoriales, hay tres diferencias con versiones anteriores de Spec Kit que conviene conocer:

1. En Claude Code los comandos se escriben con guion: `/speckit-specify`. En otros agentes, como GitHub Copilot, se usan con punto: `/speckit.specify`.
2. Spec Kit ya no crea ramas de git. La feature activa se guarda en el archivo `.specify/feature.json`.
3. Existe el comando `/speckit-converge`, que permite corregir después de implementar sin perder el control.

## Parte 0. Conceptos

Léelos aunque te parezcan obvios: el resto de la guía los usa sin volver a explicarlos.

| Término | Qué significa |
| --- | --- |
| SDD (Spec-Driven Development) | Forma de trabajar en la que primero se escribe qué debe hacer el software y por qué, y el código se genera a partir de eso. Si algo cambia, primero se cambia el documento. |
| Agente | Programa de IA que lee y escribe archivos y ejecuta comandos en tu proyecto. En esta guía, Claude Code. |
| Spec Kit | Herramienta de GitHub que instala en tu proyecto plantillas y comandos para que el agente siga el flujo SDD. |
| `specify` | Programa de terminal de Spec Kit. Solo se usa una vez, para crear el proyecto. |
| Comando de Spec Kit | Instrucción que escribes dentro de Claude Code y que empieza con `/speckit-`. Cada una es un archivo de instrucciones detalladas que el agente sigue al pie de la letra. |
| Feature | Una unidad de trabajo, con su propia carpeta `specs/NNN-nombre/`. Por ejemplo, "Tetris base" o "Siguiente pieza y niveles". NNN es un número correlativo: 001, 002… |
| Feature activa | La feature sobre la que trabajan los comandos. Está anotada en `.specify/feature.json`. |
| Artefacto | Cada documento que produce el flujo: constitución, spec, plan y tareas. |
| Constitución | Archivo `.specify/memory/constitution.md` con las reglas que valen para todas las features. Por ejemplo, "sin frameworks". |
| Spec | Archivo `spec.md`: qué hace la feature y por qué, sin hablar de tecnología. |
| Historia de usuario | Una situación de uso contada desde el jugador, con prioridad: P1 es la más importante, después P2 y P3. |
| Requisito funcional (FR) | Frase verificable de lo que el sistema debe hacer, numerada: "FR-003: el sistema debe borrar una fila cuando está completa". |
| Criterio de éxito (SC) | Resultado medible desde el punto de vista del usuario. |
| Caso límite | Situación poco común que igual hay que definir. Por ejemplo, rotar una pieza pegada a la pared. |
| Plan | Archivo `plan.md` y los documentos de diseño que lo acompañan: cómo se construye la feature (lenguaje, archivos, decisiones técnicas). |
| Tareas | Archivo `tasks.md`: pasos pequeños numerados T001, T002… `[ ]` es una tarea pendiente y `[X]` una hecha. |
| Hallazgo | Problema que reporta `analyze` o `converge`. Tiene un ID (C1, A2…) y una severidad. |
| Severidad | CRITICAL (se resuelve antes de implementar), HIGH (importante), MEDIUM y LOW (cosmético). |
| Capa | Nivel del flujo. De arriba hacia abajo: constitución, spec, plan, tareas y código. Cada capa depende de la que tiene arriba. |
| Commit | Foto del proyecto guardada con git, a la que puedes volver cuando quieras. |
| Diff | Lista de diferencias entre la última foto y el estado actual. |

A lo largo de la guía, **[Terminal]** marca lo que escribes en una ventana de terminal y **[Claude Code]** lo que escribes dentro de Claude Code. Conviene tener dos terminales abiertas: una con Claude Code y otra para git y el servidor del juego.

## Parte 1. Qué hace realmente cada comando

| Comando | Capa | Qué escribe | Qué nunca toca | ¿Se puede repetir? |
| --- | --- | --- | --- | --- |
| `/speckit-constitution` | Constitución | Solo `constitution.md`. Sube la versión y agrega al inicio un informe de impacto | Specs, planes y código | Sí, cada ejecución es una enmienda |
| `/speckit-specify` | Spec | Una carpeta nueva `specs/NNN-nombre/` con `spec.md` y `checklists/requirements.md`, y la deja como feature activa | Specs existentes | Cada ejecución crea una feature **nueva** |
| `/speckit-clarify` | Spec | Respuestas a sus preguntas dentro de `spec.md` | Plan, tareas y código | Sí, está pensado para antes de `plan` |
| `/speckit-plan` | Plan | `plan.md`, `research.md`, `data-model.md`, `contracts/` y `quickstart.md` | Tareas y código | Sí. Si `plan.md` ya existe, lo actualiza |
| `/speckit-tasks` | Tareas | `tasks.md` completo | Código | Sí, pero **lo reescribe entero y se pierden las marcas `[X]`** |
| `/speckit-analyze` | Verificación de documentos | Nada, solo entrega un reporte | Todo | Sí, cuando quieras después de `tasks` |
| `/speckit-implement` | Código | El código y las marcas `[X]` en `tasks.md` | Spec y plan | Sí, retoma las tareas pendientes |
| `/speckit-converge` | Verificación del código | Solo agrega tareas nuevas al final de `tasks.md` | Spec, plan, código y tareas existentes | Sí, pero solo después de `implement` |

Hay dos auditores distintos:

- **`analyze`** compara los documentos entre sí: spec contra plan contra tareas, todo contra la constitución.
- **`converge`** compara el código con los documentos.

## Parte 2. Reglas del modo estricto

1. En Claude Code solo escribes dos cosas: comandos `/speckit-...` o respuestas a preguntas que un comando te hizo. Pedir una explicación ("explícame la opción B") también está permitido, porque no cambia archivos. Lo que nunca escribes es "arregla esto" en texto libre.
2. Nunca editas a mano la constitución, la spec, el plan ni las tareas.
3. Antes de cada comando haces un commit, y después revisas qué cambió.
4. Si el comando tocó algo que según la tabla de la Parte 1 no debía tocar, descartas el cambio y repites.
5. Un comando por vez.
6. No implementas con hallazgos CRITICAL o HIGH abiertos.
7. Una feature cerrada no se vuelve a tocar: cualquier cambio posterior es una feature nueva.
8. Cambiar una regla que ya estaba decidida también es una feature nueva. `clarify` sirve para resolver ambigüedades y huecos, y no existe un comando para reescribir un requisito ya decidido.

### Rutina de control

Se usa antes y después de cada comando de la guía.

**[Terminal]** Antes del comando:

```bash
git add -A && git commit -m "antes de <comando>"
```

Después del comando:

```bash
git status     # qué archivos cambiaron, incluidos los nuevos
git diff       # qué cambió dentro de los archivos que ya existían (sales con la tecla q)
```

Si el resultado te sirve:

```bash
git add -A && git commit -m "<comando>: <qué hizo>"
```

Si no te sirve, vuelves a la foto anterior:

```bash
git restore .   # deshace los cambios en archivos que ya existían
git clean -fd   # borra los archivos nuevos creados desde el último commit
```

> `git clean` borra sin pasar por la papelera. Úsalo solo justo después de un commit previo.
{: .prompt-danger }

## Parte 3. Preparar el proyecto

**[Terminal]**

```bash
specify init tetris-sdd --integration claude
cd tetris-sdd
git init
git add -A
git commit -m "Proyecto creado con Spec Kit"
claude
```

Qué hace cada línea:

- `specify init` crea la carpeta `tetris-sdd` e instala Spec Kit configurado para Claude Code.
- `git init` empieza a registrar versiones. Spec Kit ya no lo hace por ti.
- `claude` abre Claude Code dentro del proyecto.

Qué queda en la carpeta:

- `.claude/skills/`: los comandos `/speckit-...`.
- `.specify/`: plantillas, scripts y la constitución, todavía vacía.
- Todavía no existe `specs/`. Aparece cuando creas la primera feature.

Mientras trabaja, Claude Code te pide permiso para ejecutar scripts o editar archivos. Lee siempre qué te pide. Los scripts de `.specify/scripts/` son de Spec Kit y puedes aprobarlos.

## Parte 4. La constitución

Primero la rutina de control (commit previo). Luego:

**[Claude Code]**

```text
/speckit-constitution Proyecto educativo: un Tetris para el navegador. Principios: (1) Código simple y legible para principiantes. (2) Solo HTML, CSS y JavaScript, sin frameworks, sin dependencias externas y sin paso de compilación. (3) El juego se ejecuta con un servidor estático local (python3 -m http.server), porque los módulos de JavaScript no cargan si se abre el archivo con doble clic. (4) La lógica del juego va separada del dibujo en pantalla: la lógica no accede al DOM. (5) Toda regla del juego tiene una prueba automática; las pruebas se ejecutan abriendo tests.html desde el servidor local. (6) Todo código corresponde a un requisito de una spec.
```

Por qué importan dos de estos principios:

- **El 3** evita un conflicto típico: con módulos de JavaScript, el juego no funciona abriendo el archivo con doble clic. Si la constitución dijera "sin servidor", `analyze` lo marcaría como hallazgo CRITICAL.
- **El 5** es necesario porque `/speckit-tasks` solo genera tareas de prueba si alguien las pidió explícitamente. Sin ese principio, el proyecto queda sin pruebas.

Qué pasa: el agente llena `.specify/memory/constitution.md` con los 6 principios, le pone la versión 1.0.0 y agrega al inicio del archivo un comentario llamado *Sync Impact Report*, con el resumen del cambio.

Qué revisas:

- Que estén los 6 principios.
- Que no queden textos entre corchetes como `[PRINCIPLE_1_NAME]`.
- Que exista la sección *Governance*, que explica cómo se enmienda la constitución.
- Que `git status` muestre solo `constitution.md` modificado.

Si todo está bien, haces el commit.

## Parte 5. Feature 001: Tetris base

### 5.1 Escribir la spec

Rutina de control, y luego:

**[Claude Code]**

```text
/speckit-specify Quiero un Tetris para jugar en el navegador. El tablero tiene 10 columnas y 20 filas. Caen piezas de 4 bloques, una a la vez, elegidas al azar entre las 7 formas clásicas (I, O, T, S, Z, J, L). El jugador mueve la pieza a izquierda y derecha, la rota, puede hacerla bajar más rápido o dejarla caer de golpe. Cuando la pieza toca el fondo u otra pieza, queda fija y aparece la siguiente. Si una fila queda completa, se borra y las filas de arriba bajan. Cada fila borrada suma puntos. Si una pieza nueva no cabe al aparecer, la partida termina. Hay un botón para reiniciar.
```

El texto describe qué hace el juego y no menciona tecnología. La tecnología llega en el plan.

Qué pasa:

1. El agente crea la carpeta `specs/001-<nombre>/`. El nombre lo elige el agente, por ejemplo `001-tetris-navegador`.
2. Escribe `spec.md` y `checklists/requirements.md`, una lista de chequeo de calidad de la spec.
3. Anota la feature en `.specify/feature.json`.
4. Revisa la spec contra la lista de chequeo y la corrige hasta 3 veces.
5. Si hay decisiones que no puede suponer, hace hasta 3 preguntas, todas juntas.

Este es el momento en que la consola se queda esperando. Ejemplo de salida (los rótulos pueden salir en inglés):

```text
## Question 1: Controles

**Context**: "El jugador mueve la pieza a izquierda y derecha, la rota..."
**What we need to know**: ¿Qué teclas usa el jugador?

| Option | Answer                                              | Implications                 |
|--------|-----------------------------------------------------|------------------------------|
| A      | Flechas: ← → mover, ↑ rotar, ↓ bajar, espacio caer  | Estándar, fácil de recordar  |
| B      | Teclas W A S D                                      | Cómodo con la mano izquierda |
| Custom | Tu propia respuesta                                 |                              |
```
{: .sin-ajuste }

Respondes en el chat de Claude Code, todas las preguntas en una sola línea:

```text
Q1: A, Q2: B, Q3: Custom - 100 puntos por fila
```

Qué revisas en `spec.md`. Esta revisión es lo más importante de todo el método:

- ¿Las historias de usuario describen cómo se juega?
- ¿Cada FR se puede comprobar con un sí o un no?
- ¿Hay casos límite? Por ejemplo, rotar junto a la pared o terminar la partida.
- ¿Menciona tecnología? No debería.
- La sección *Assumptions* lista lo que el agente supuso por su cuenta. Si una suposición está mal, no la corriges a mano: la llevas al paso 5.2.

Que `git status` muestre solo archivos nuevos dentro de `specs/001-...` y `.specify/feature.json`. Commit.

### 5.2 Aclarar la spec

**[Claude Code]**

```text
/speckit-clarify
```

Si quieres que se enfoque en algo, lo pones como argumento: `/speckit-clarify rotación cerca de las paredes y puntaje`.

Cómo funciona: revisa la spec por categorías (comportamiento, casos límite, terminología y otras) y hace como máximo 5 preguntas, **de a una**, cada una con una recomendación.

Ejemplo de salida:

```text
**Question:** ¿Qué pasa si el jugador rota una pieza y en la nueva posición choca con la pared o con otra pieza?
Esto define si la rotación puede fallar y cómo lo comprueban las pruebas.

**Recommended:** Option A - es la regla más simple y predecible.

| Option | Description                                         |
|--------|-----------------------------------------------------|
| A      | La rotación no ocurre, la pieza queda como estaba   |
| B      | La pieza se corre una columna para poder rotar      |
| C      | La pieza rota igual y queda superpuesta             |
```
{: .sin-ajuste }

Respuestas válidas:

- La letra de una opción, por ejemplo `A`.
- `yes` o `recommended`, para aceptar la recomendación.
- Una respuesta corta propia, de 5 palabras como máximo.
- `done`, para terminar antes de llegar a las 5 preguntas.

Qué escribe: agrega en `spec.md` una sección `## Clarifications` con una línea por respuesta (`- Q: … → A: …`) y actualiza la parte de la spec afectada, por ejemplo agregando un caso límite. Puede actualizar también `checklists/requirements.md`.

Revisión: el diff solo debe tocar `spec.md` y, a lo sumo, `checklists/requirements.md`. Commit.

Supón que elegiste la opción A. Esa respuesta es la que vuelve a aparecer en la Parte 7.

### 5.3 Escribir el plan

**[Claude Code]**

```text
/speckit-plan JavaScript con módulos, sin frameworks. Archivos: index.html, style.css, src/game.js con toda la lógica (tablero, piezas, rotación, filas, puntaje) sin acceso al DOM, y src/ui.js para dibujar en un canvas y leer el teclado. Pruebas en la carpeta tests/ con un ejecutor mínimo propio, abiertas en tests.html desde el servidor local.
```

Recién aquí aparece la tecnología.

Qué crea dentro de `specs/001-.../`:

| Archivo | Contenido |
| --- | --- |
| `plan.md` | Contexto técnico, estructura de archivos y revisión de la constitución |
| `research.md` | Cada decisión técnica, por qué se tomó y qué alternativas se descartaron |
| `data-model.md` | Las entidades del juego (tablero, pieza, partida), con sus datos y reglas |
| `contracts/` | Cómo se comunican `game.js` y `ui.js`. Puede no crearse |
| `quickstart.md` | Cómo levantar el juego y comprobar que funciona |

`plan.md` incluye una sección llamada *Constitution Check*, en la que el agente revisa el plan contra cada principio. Si encuentra una violación sin justificar, se detiene con un error. En ese caso tienes dos salidas: volver a ejecutar `/speckit-plan` con la corrección como argumento o, si el principio está mal, enmendar la constitución con `/speckit-constitution`.

Qué revisas:

- ¿El plan respeta los 6 principios?
- ¿La estructura de archivos es la que pediste?
- ¿`research.md` decidió algo que no pediste, como una librería?

Si algo está mal, vuelves a ejecutar `/speckit-plan` con la corrección como argumento. No lo editas a mano. Revisión de diff y commit.

### 5.4 Generar las tareas

**[Claude Code]**

```text
/speckit-tasks
```

Cada línea de `tasks.md` tiene este formato:

```text
- [ ] T012 [P] [US1] Implementar la rotación en src/game.js
```

| Parte | Significado |
| --- | --- |
| `- [ ]` | Tarea pendiente. Cambia a `[X]` cuando se completa |
| `T012` | Número de tarea, en orden de ejecución |
| `[P]` | Se puede hacer en paralelo con otras, porque no depende de ellas |
| `[US1]` | Historia de usuario a la que pertenece |
| Resto | Qué hacer y en qué archivo |

Las tareas se agrupan en fases: preparación (*Setup*), base común (*Foundational*), una fase por historia de usuario (la de US1 es el mínimo jugable) y terminaciones (*Polish*).

Qué revisas:

- Que haya tareas de prueba. Si no aparecen, ejecuta `/speckit-tasks incluir tareas de prueba para cada regla del juego, como exige el principio 5 de la constitución`.
- Que ninguna tarea sea demasiado grande o dependa de algo que todavía no existe.

Commit.

### 5.5 Analizar y resolver hallazgos

**[Claude Code]**

```text
/speckit-analyze
```

Ejemplo de salida:

| ID | Category | Severity | Location(s) | Summary | Recommendation |
| --- | --- | --- | --- | --- | --- |
| C1 | Constitution | CRITICAL | plan.md, Technical Context | El plan ejecuta las pruebas por terminal con Node, y el principio 5 exige ejecutarlas en el navegador | Ajustar el plan |
| A1 | Ambiguity | HIGH | spec.md FR-006 | "Cada fila borrada suma puntos" no dice cuántos puntos | Definir el puntaje |
| U1 | Coverage | MEDIUM | tasks.md | FR-009 (reiniciar) no tiene ninguna tarea | Agregar tarea |
| T1 | Terminology | LOW | spec.md, plan.md | Se usan "pieza" y "tetrominó" como sinónimos | Unificar el término |

Al final, `analyze` pregunta si quieres que sugiera ediciones concretas. Puedes aceptar para **leer** las sugerencias, pero no las apliques con texto libre: cada una se aplica con el comando dueño de su capa. Para no confundirte, también puedes responder `no`.

**Cómo resolver los hallazgos.** Ordénalos por capa, de arriba hacia abajo, y dentro de cada capa por severidad. Así cada comando se ejecuta una sola vez.

1. **Constitución:** en este ejemplo no hay hallazgos que exijan cambiarla. Ojo: C1 es un conflicto *con* la constitución, pero quien está mal es el plan. La regla de `analyze` es que la constitución no se negocia: se ajusta el plan. Solo si el principio mismo está mal se usa `/speckit-constitution` con la enmienda.
2. **Spec (A1 y T1):** un `clarify` por hallazgo, con rutina de control antes y después de cada uno.

   ```text
   /speckit-clarify A1: cuántos puntos suma cada fila borrada y si borrar varias a la vez suma más
   ```

   ```text
   /speckit-clarify T1: usar siempre el término "pieza"
   ```
3. **Plan (C1):** como la spec cambió, el plan hay que regenerarlo de todos modos, así que la corrección de C1 va como argumento en esa misma ejecución.

   ```text
   /speckit-plan C1: las pruebas se ejecutan en el navegador abriendo tests.html desde el servidor local, sin Node, como exige el principio 5. Actualiza además el plan con las aclaraciones nuevas de la spec.
   ```
4. **Tareas (U1):** se resuelve solo al regenerar las tareas, que de todos modos toca hacerlo porque el plan cambió.

   ```text
   /speckit-tasks
   ```
5. Vuelves a ejecutar `/speckit-analyze` y repites hasta que no quede ningún CRITICAL ni HIGH. Los MEDIUM y LOW puedes resolverlos o dejarlos, pero que sea una decisión tuya y no un descuido.

> Como todavía no implementaste nada, regenerar `tasks.md` no te hace perder ninguna marca `[X]`.
{: .prompt-tip }

### 5.6 Implementar

Este es el primer paso que escribe código. Hasta aquí todo fueron documentos: la constitución, la spec, el plan y las tareas. Ahora el agente toma `tasks.md` y, tarea por tarea, crea los archivos del juego que definió el plan (`index.html`, `style.css`, `src/game.js`, `src/ui.js` y las pruebas en `tests/`).

Si llegaste hasta aquí con los documentos revisados y sin hallazgos CRITICAL ni HIGH, el agente no tiene nada que inventar: cada línea de código responde a una tarea, cada tarea a un requisito y cada requisito a algo que tú aprobaste.

**[Claude Code]**

```text
/speckit-implement
```

Qué pasa:

1. Revisa las listas de chequeo de `checklists/`. Si queda algún punto sin marcar, se detiene y pregunta si quieres continuar igual. En modo estricto respondes `no` y vuelves a `/speckit-clarify`: la spec todavía tiene problemas de calidad.
2. Ejecuta las tareas en orden y marca cada una con `[X]`. Si una falla, se detiene. Al volver a ejecutar `/speckit-implement`, sigue con las pendientes.

Para probar el juego:

**[Terminal 2]**

```bash
python3 -m http.server 8000
```

Abre `http://localhost:8000` para jugar y `http://localhost:8000/tests.html` para ver las pruebas.

> Si algo no funciona, no le pidas al agente que lo arregle. Sigue con el paso 5.7.
{: .prompt-warning }

Commit.

### 5.7 Converger: comprobar el código contra los documentos

**[Claude Code]**

```text
/speckit-converge
```

Compara el código con la spec, el plan y las tareas, y clasifica cada diferencia en uno de cuatro tipos:

| Tipo | Significado |
| --- | --- |
| `missing` | Falta algo que los documentos piden |
| `partial` | Está hecho a medias |
| `contradicts` | El código hace algo distinto de lo que dicen los documentos |
| `unrequested` | El código hace algo que nadie pidió |

Si encuentra diferencias, muestra una tabla y agrega al final de `tasks.md` una sección `## Phase N: Convergence` con tareas nuevas, numeradas a continuación de las existentes. No toca nada más. Después ejecutas `/speckit-implement` otra vez, y repites hasta que `converge` informe que no queda nada pendiente. En ese caso `tasks.md` no cambia.

**Si al jugar encuentras algo que la spec no contempla**, `converge` no lo va a detectar, porque compara contra los documentos y el problema no está escrito en ninguno. Por ejemplo: las piezas caen demasiado rápido para un principiante y la spec nunca dijo a qué velocidad. Mientras la feature siga abierta, el camino es:

```text
/speckit-clarify velocidad de caída de las piezas
/speckit-plan
/speckit-converge
/speckit-implement
```

Cada línea es un comando aparte, con su rutina de control.

> Aquí se usa `converge` en vez de `tasks` porque `tasks` reescribe `tasks.md` completo y perderías todas las marcas `[X]`. `converge` solo agrega lo que falta.
{: .prompt-warning }

### 5.8 Cerrar la feature

La feature está cerrada cuando se cumplen estas cinco condiciones:

- [ ] Todas las tareas están en `[X]`.
- [ ] `converge` no informa diferencias.
- [ ] `analyze` no tiene CRITICAL ni HIGH.
- [ ] `tests.html` está todo en verde.
- [ ] El juego funciona.

**[Terminal]**

```bash
git add -A && git commit -m "Feature 001 Tetris base cerrada"
git tag 001-cerrada
```

Desde aquí, nada de `specs/001-...` se vuelve a modificar.

## Parte 6. Feature 002: evolucionar el juego

Es el mismo ciclo de la Parte 5, con su rutina de control en cada paso.

**[Claude Code]**

```text
/speckit-specify Mostrar al costado del tablero cuál será la siguiente pieza. Agregar niveles: el juego empieza en el nivel 1, sube un nivel cada 10 filas borradas y en cada nivel las piezas caen más rápido. Mostrar el nivel actual. Al reiniciar, el nivel vuelve a 1.
```

`specify` crea `specs/002-...` y la deja como feature activa. Para comprobarlo:

**[Terminal]**

```bash
cat .specify/feature.json
```

Ejemplo de salida:

```text
{"feature_directory": "specs/002-siguiente-pieza-niveles"}
```

Después, en orden:

```text
/speckit-clarify
/speckit-plan Mantener la estructura actual. La lógica de siguiente pieza y niveles va en src/game.js; ui.js dibuja un panel lateral con la siguiente pieza y el nivel.
/speckit-tasks
/speckit-analyze
```

Resuelves los hallazgos como en el paso 5.5, y luego:

```text
/speckit-implement
/speckit-converge
```

Ejemplo de salida de `converge`:

| ID | Gap Type | Severity | Source | Evidence | Remaining Work |
| --- | --- | --- | --- | --- | --- |
| F1 | contradicts | HIGH | FR-005 | `ui.js` reinicia el tablero pero no el nivel | Volver al nivel 1 al reiniciar |

`converge` agrega una tarea, por ejemplo T019, en la fase *Convergence*. Ejecutas `/speckit-implement`, luego `converge` otra vez para confirmar, y cierras con el tag `002-cerrada`.

**Si más adelante quieres cambiar una regla ya decidida**, por ejemplo subir de nivel cada 5 filas en vez de cada 10, eso es una feature nueva con `/speckit-specify`. No existe un comando para reescribir un requisito ya decidido, y la 002 está cerrada.

## Parte 7. Feature 003: corregir un bug

Jugando, descubres que la pieza I, pegada a la pared derecha, al rotar queda con un bloque fuera del tablero.

**Paso 1. Reproducir el bug.** Anota los pasos exactos para provocarlo y repítelo dos veces, para estar seguro de que es real.

**Paso 2. Clasificarlo.** Busca qué dicen las specs sobre la rotación:

**[Terminal]**

```bash
grep -rn -i "rota" specs/
```

Encuentras la aclaración del paso 5.2: "Q: ¿Qué pasa si al rotar choca…? → A: La rotación no ocurre". La spec es clara, así que se trata de un defecto del código. Pero la 001 está cerrada y no se toca, así que la corrección es una feature nueva. Si la spec no hubiera dicho nada, el camino sería el mismo, con la diferencia de que la spec nueva tendría que definir la regla.

**Paso 3. Spec del bug.**

**[Claude Code]**

```text
/speckit-specify Corrección de bug: la pieza I, pegada a la pared derecha, al rotar queda con un bloque fuera del tablero. La regla vigente (spec 001, aclaración sobre rotación) dice que si la rotación choca con una pared u otra pieza, la rotación no ocurre. Escenario de aceptación: dada una pieza I vertical en la última columna, cuando el jugador la rota, entonces la pieza sigue vertical y ningún bloque queda fuera del tablero. Lo mismo para las 7 piezas en ambas paredes. Se requiere una prueba automática que reproduzca el bug y falle antes de la corrección.
```

**Paso 4. Aclarar.** Ejecuta `/speckit-clarify`. Lo más probable es que responda que no hay ambigüedades críticas.

**Paso 5. Plan.**

```text
/speckit-plan La corrección va en la función de rotación de src/game.js. Primero se agrega en tests/ una prueba que reproduce el bug con las 7 piezas contra ambas paredes. Esa prueba debe fallar con el código actual.
```

**Paso 6. Tareas.** Ejecuta `/speckit-tasks` y comprueba que la tarea de la prueba esté **antes** que la de la corrección.

**Paso 7. Analizar.** Ejecuta `/speckit-analyze` y resuelve los hallazgos como en el paso 5.5.

**Paso 8. Ver fallar la prueba.** `/speckit-implement` acepta como argumento qué tareas ejecutar:

```text
/speckit-implement solo la tarea que agrega la prueba del bug
```

Abre `tests.html`: la prueba nueva tiene que estar en rojo. Si está en verde, no reproduce el bug y hay que volver al plan.

**Paso 9. Corregir.** Ejecuta `/speckit-implement` sin argumento para las tareas pendientes. La prueba debe pasar a verde y el resto de las pruebas seguir en verde.

**Paso 10. Cerrar.** Ejecuta `/speckit-converge`, juega para comprobarlo, y cierra:

**[Terminal]**

```bash
git add -A && git commit -m "Fix: la rotación ya no saca piezas del tablero (feature 003)"
git tag 003-cerrada
```

La spec 001 queda como estaba. El historial muestra que la regla existía desde la 001 y que la 003 corrigió el código para cumplirla.

## Parte 8. Tabla de decisión: me pasó esto, ¿qué comando uso?

| Situación | ¿Ya implementaste? | Comandos, en orden |
| --- | --- | --- |
| A la spec le falta algo o es ambigua | No | `clarify` → `plan` → `tasks` → `analyze` |
| A la spec le falta algo o es ambigua | Sí, con la feature abierta | `clarify` → `plan` → `converge` → `implement` |
| Una decisión técnica está mal | No | `plan <corrección>` → `tasks` → `analyze` |
| Una decisión técnica está mal | Sí, con la feature abierta | `plan <corrección>` → `converge` → `implement` |
| Las tareas están mal (imposibles, obsoletas o incompletas) | No | `tasks <indicación>` → `analyze` |
| El código no cumple lo que dicen los documentos | Sí | `converge` → `implement` |
| El plan o la spec chocan con la constitución | Da igual | Corregir el plan o la spec (lo preferido), o `constitution <enmienda>`. Después, la cascada hacia abajo |
| Quieres cambiar una regla ya decidida | Da igual | `specify` (feature nueva) |
| Cualquier cambio en una feature cerrada | No aplica | `specify` (feature nueva) |

## Parte 9. En qué feature estás y cómo cambiar de una a otra

Para ver la feature activa:

**[Terminal]**

```bash
cat .specify/feature.json
```

`/speckit-specify` cambia la feature activa automáticamente. Para volver a una anterior, por ejemplo para ejecutar `analyze` sobre la 001, sales de Claude Code y lo abres así:

```bash
SPECIFY_FEATURE_DIRECTORY="$PWD/specs/001-tetris-navegador" claude
```

Los scripts de Spec Kit leen primero esa variable y además la guardan en `feature.json`, así que esa feature queda activa también en las sesiones siguientes. Ajusta el nombre de la carpeta al que tengas en `specs/`.

Si prefieres que cada feature tenga su propia rama de git, Spec Kit tiene una extensión para eso (`specify init ... --extension git`). Esta guía no la usa para no sumar piezas.

## Parte 10. Errores frecuentes y qué significan

| Lo que ves | Qué significa | Qué haces |
| --- | --- | --- |
| "Feature directory not found" | No hay ninguna feature activa | Ejecutar `/speckit-specify`, o fijar la variable de la Parte 9 |
| "plan.md not found… Run /speckit-plan first" | Saltaste un paso | Ejecutar el comando que indica el mensaje |
| `implement` pregunta por listas de chequeo incompletas | La spec tiene problemas de calidad | Responder `no` y volver a `/speckit-clarify` |
| `plan` se detiene en *Constitution Check* | El plan viola un principio | `/speckit-plan` con la corrección, o enmendar la constitución |
| `tasks.md` no tiene tareas de prueba | Nadie las pidió explícitamente | `/speckit-tasks` con la indicación de incluir pruebas |
| El diff muestra código cambiado después de `clarify`, `plan`, `tasks`, `analyze` o `converge` | El agente se salió de lo que ese comando debe hacer | `git restore .` y `git clean -fd`, y repetir el comando |
| Desaparecieron las marcas `[X]` | Ejecutaste `tasks` después de implementar | Volver al commit anterior y usar `converge` en su lugar |

Si algo de esta guía no cuadra con tu versión de Spec Kit, o te trabaste en un paso que no está aquí, cuéntamelo en redes sociales.
