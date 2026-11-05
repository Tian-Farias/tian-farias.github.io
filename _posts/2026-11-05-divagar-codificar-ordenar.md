---
title: "Divagar, codificar, ordenar: cómo trabajo con IA cuando programo"
author: Cristian
description: "Un video de Brais Moure le puso nombre a la forma en que trabajo con modelos de lenguaje. Esta es mi versión: vibe coding para aprender, especificaciones para formalizar y prompting donde todavía hace falta."
categories: [IA]
tags: [Vibe Coding, SDD, Spec Kit, Prompting, LLM, Agentes]
toc: true
comments: true
image:
  path: /assets/img/divagar-codificar-ordenar.webp
  alt: "Ilustración en una servilleta: divagar por voz con la IA, el loop de codificación por bloques y el orden que lleva a SDD, con la regla de cuándo divagar y cuándo usar prompting"
---

> Este post parte del video **"Mi nuevo flujo con IA: Adiós a los prompts complejos"** de **[Brais Moure](https://x.com/mouredev)** ([MoureDev](https://www.youtube.com/watch?v=2G4aeaCTsHc)), publicado el 22 de octubre de 2026. Todo el crédito de las ideas del video es suyo. Lo que sigue es cómo esas ideas calzan con mi forma de trabajar, y dónde me separo.
{: .prompt-info }

## El video

{% include embed/youtube.html id='2G4aeaCTsHc' %}

[Moure](https://x.com/mouredev) cuenta que dejó de escribir prompts kilométricos y empezó a hablarle al modelo como a un compañero de equipo. Según explica, los trucos de 2023 (el "actúa como un senior con 50 años de experiencia", el "piensa paso a paso", la propina de 2000 dólares) hoy funcionan de forma inconsistente, porque los modelos tienen ventanas de contexto enormes y ya razonan por defecto. Su propuesta es lo que llama el método del director de ideas, en tres capas: visión, estructura y requisitos. Primero cuentas qué quieres, después pides la estructura y recién al final das las instrucciones precisas, sobre un contexto que construyeron juntos.

Cuando lo vi pensé: así trabajo hace rato, solo que nunca le había puesto nombre.

## Trabajo con dos modos

Uso dos metodologías y las elijo según lo que tengo enfrente. Lo conté con más detalle en [El vibe coding no deja rastro](/posts/el-vibe-coding-no-deja-rastro/), así que aquí va el resumen.

La primera es **vibe coding**. Me gusta prototipar así y hago muchas cosas de esa forma. Te da libertad para llegar rápido a un prototipo funcional, a un MVP, sin preocuparte todavía de la calidad del código. En esa etapa quiero tener algo que se pueda tocar. Mi problema con el vibe coding es que pierdes trazabilidad en el tiempo: tres semanas después nadie sabe por qué una decisión se tomó así.

La segunda es **Spec-Driven Development**, que expliqué paso a paso en la [Guía de Spec Kit](/posts/guia-de-spec-kit/). Cuando la cosa se pone formal, cuando hay un cliente y un proyecto de software que vender, necesitas especificaciones. Un cliente con un producto hecho a puro vibe es una situación peligrosa. Y en entornos muy normados, como la banca, la trazabilidad es una exigencia y no hay otra forma de hacerlo.

Para pasar de un modo al otro trabajo en tres capas.

## Mis tres capas

Mi punto de partida es parecido al de Moure: trato al modelo como un par de mi equipo. No soy el dios de la programación, así que si tengo un modelo delante, converso con él las cosas antes de ejecutar. Mi par programa, yo reviso el código, comento y corrijo.

Ese par, igual que yo, puede hacer cosas que no debería: borrar datos, botar una base de datos, eliminar código que funcionaba u olvidarse de lo que acordamos en la sesión anterior. En el [post del vibe coding](/posts/el-vibe-coding-no-deja-rastro/#lo-que-el-agente-olvidaba) conté cómo un agente volvía a programar en rioplatense aunque se lo corrigiera todos los días. Por eso trabajo con orden.

### Capa 1: divagar

Planteo la idea y converso. Le cuento al modelo qué quiero lograr con la aplicación, sin formato, sin estructura, desordenado. Le pregunto qué opciones tengo y discutimos pros y contras.

Desde esa conversación sale una segmentación: cuáles son los módulos o bloques de funcionalidad sobre los que se construye la aplicación.

### Capa 2: el loop de codificación

Por cada bloque repito el mismo ciclo: divago sobre esa funcionalidad, la desarrollamos, la probamos. Cuando el bloque queda terminado, paso al siguiente con el mismo flujo. A veces vuelvo a divagar para agregar una feature nueva, y el loop sigue.

### Capa 3: el orden

Con las dos primeras capas aprendo en qué pasos quiero construir la aplicación. Si veo que el módulo 3 debería ir antes que el módulo 2, lo corrijo. Así voy descubriendo cómo modularizar la especificación antes de escribirla.

Esto hace 5 años hubiese sonado a locura: como con IA el desarrollo es corto, **puedo botar todo y partir de cero**. En ese mismo post conté que tuve que [rehacer un prototipo completo varias veces](/posts/el-vibe-coding-no-deja-rastro/#el-prototipo-que-creció) porque no tenía nada escrito. Hoy lo hago a propósito: tomo lo aprendido (qué funcionó, en qué orden, qué descarté), elimino el trabajo anterior y vuelvo a empezar con una base mucho mejor. Desde ahí tengo dos caminos: sigo evolucionando con vibe coding o saco las especificaciones y me paso a SDD.

Antes, tirar a la basura dos semanas de código era una tragedia. Hoy borrar un prototipo me duele bastante menos que mantener uno mal parido. El Omnissiah perdona el código eliminado, lo que no perdona es la deuda técnica.

## La voz como herramienta

Con la parte de hablarle al modelo me sentí identificado. Moure cuenta que [Andrej Karpathy](https://x.com/karpathy) trabaja en sesiones largas de divagación, hablando por micrófono durante varios minutos sin orden, y que los modelos actuales son muy buenos para reconstruir y estructurar ese caos.

Me pasa lo mismo. Me resulta mucho más fácil explicar las cosas con mis palabras, en voz alta, y dejar que el modelo resuma y ordene lo que tengo en la cabeza.

Esto cambia también cómo trabajo con clientes. Puedo ir a una reunión, levantar información, y después, conversando por voz, alimentar el sistema inicial. Dentro de la divagación, sin escribir una línea de código, puedo armar toda la especificación. Con esa especificación genero un prototipo vía vibe coding, se lo muestro al cliente, recojo sus comentarios y con todo eso formalizo el desarrollo con SDD. En poco tiempo recopilas mucha información, la ordenas y desde ahí decides si haces un prototipo o vas directo a algo formal.

## Donde no estoy de acuerdo: el prompting no se muere

El video da a entender que la era de los prompts terminó. Yo creo que el prompting cambió de lugar.

Si un desarrollador pasa tres días puliendo un prompt para construir un software, está perdiendo el tiempo. Le conviene más partir divagando y tener una metodología para investigar el requerimiento: un paso a paso, un checklist que vaya capturando lo que se necesita y lo trabaje. [Spec Kit](/posts/guia-de-spec-kit/) es un ejemplo, pero cualquier método que documente y respete las decisiones anteriores sirve. Con eso no necesitas un prompt mágico.

Distinto es un sistema de IA con una tarea fija, por ejemplo uno que genera documentos: toma un requerimiento, compara documentos, busca en una base vectorial o en una memoria y produce una salida. Ahí no hay nada que divagar. Ese sistema necesita un **prompt controlable y medible**, porque el usuario no tiene idea de lo que hay detrás (de hecho, podría no saber que usa IA y lo usaría igual) y los documentos tienen que salir siempre iguales. Eso se logra con prompting. Algo parecido conté en [lo que cambió en mi marco de productos de IA generativa](/posts/productos-ia-generativa-lo-que-cambio/#agentes): darles a todos los agentes un mismo contexto de sistema, más un prompt propio para cada uno, mejoró mucho lo que entregaban.

Mi regla quedó así:

- **Proceso creativo** (diseñar, explorar, construir software): divago y parto creando.
- **Tarea fija y repetitiva automatizada con IA**: prompting serio, versionado y medible, porque ahí la salida tiene que ser siempre la misma.

En cada caso me pregunto dónde me conviene más un prompt y dónde una conversación.

## Para cerrar

Moure cierra diciendo que el valor se movió hacia el criterio: para juzgar lo que devuelve un modelo necesitas saber hacia dónde vas, y eso se construye con fundamentos. Estoy de acuerdo, y le sumo que el criterio también se construye prototipando, equivocándose rápido y botando lo hecho para partir de nuevo con una base mejor.

El video completo de Brais está arriba, por si quieres verlo.