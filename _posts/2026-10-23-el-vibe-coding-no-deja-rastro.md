---
title: "El vibe coding no deja rastro"
author: Cristian
description: "Por qué uso vibe coding para prototipar y Spec-Driven Development cuando el proyecto crece, contado desde un prototipo que tuve que rehacer completo varias veces."
categories: [IA]
tags: [Vibe Coding, SDD, Spec Kit, Claude Code, Agentes]
toc: true
comments: true
image:
  path: /assets/img/el-vibe-coding-no-deja-rastro.webp
  alt: "Ilustración en una servilleta: a la izquierda el ciclo del vibe coding y un agente que olvida lo decidido, a la derecha SDD con spec.md, plan.md, tasks.md y la constitución del proyecto"
---

En la [Guía de Spec Kit](/posts/guia-de-spec-kit/) expliqué cómo trabajar con Spec-Driven Development (SDD). Faltaba el porqué, y lo aprendí rehaciendo la misma aplicación completa varias veces.

## Vibrar está bien

Vibe coding es programar conversando con un agente: le describes lo que quieres en lenguaje natural, el agente escribe el código, lo pruebas, le pides cambios y repites. Sin plan escrito, sin especificación, a puro feeling.

Para un prototipo funciona muy bien. Ves algo andando en horas, validas una idea antes de invertir en ella y descubres qué querías realmente construir. Lo sigo usando todas las semanas y no tengo intención de dejarlo.

El problema aparece cuando el prototipo deja de ser prototipo.

## El prototipo que creció

Hace un tiempo tenía que mostrar resultados inmediatos. Armé un prototipo de una aplicación que generaba documentación y contexto para procesos de IA. En pequeño funcionaba bien, así que siguió creciendo.

Y ahí empezaron los problemas. Durante el desarrollo tuve que rehacerla completa varias veces. La causa era simple: en el apuro no tenía documentación ni una guía de trabajo clara. Cada vez que la aplicación crecía, la base sobre la que estaba construida ya no aguantaba, y no tenía un documento al cual volver para entender qué había decidido y por qué.

## Lo que el agente olvidaba

Con el tiempo, el agente perdía contexto que habíamos aclarado al principio. Decisiones que tomamos juntos en las primeras sesiones desaparecían, y yo no tenía cómo recuperarlas porque nunca las formalicé. Habían sido una conversación, y una conversación se pierde.

Lo más curioso fue el idioma. Pese a que se lo aclaraba a diario, el agente siempre terminaba hablando y programando en rioplatense, argentino. Se lo pedía en la mañana y al rato volvía al vos. No hubo caso de que eso cambiara. Ni con incienso ni con letanías al Omnissiah.

Visto hoy, tiene explicación. Una instrucción dada en el chat compite con todo lo demás que hay en el contexto, y en conversaciones largas las indicaciones del principio pierden peso o terminan resumidas. Si la regla no está escrita en un archivo que el agente lee en cada sesión, depende de la suerte.

Esa es justamente una de las cosas que resuelve SDD. En Spec Kit, la constitución del proyecto (`constitution.md`) deja por escrito los principios que no se negocian: idioma, estándares, restricciones. El agente la lee en cada sesión, sin que yo tenga que repetírsela.

## Qué se pierde sin especificación

Cuando todo vive en el chat, se pierde:

- **Las decisiones.** Por qué elegiste esta arquitectura, esta librería o este formato. Seis meses después nadie lo recuerda, ni tú ni el agente.
- **Los cambios.** Git guarda qué cambió en el código. La especificación guarda por qué cambió. Sin ella, el historial muestra diferencias sin intención.
- **El criterio para validar.** Si no hay un documento que diga qué debe hacer el sistema, el agente "arregla" una cosa, rompe otra y no hay contra qué comparar.
- **La posibilidad de que otro retome el trabajo.** Un proyecto que solo existe en tu conversación con el agente es un proyecto de una sola persona.

## Por qué en una empresa no alcanza con vibrar

En un proyecto personal, si algo se rompe el único afectado soy yo. Puedo botarlo y empezar de nuevo un domingo en la tarde.

En una empresa el escenario cambia. Trabajan varias personas, la gente rota, el sistema se mantiene por años y siempre llega el momento en que alguien pregunta "¿por qué se hizo así?". Puede ser un compañero nuevo, quien revisa el código o el mismo cliente. Si la respuesta es "lo conversé con el agente hace unos meses", no hay respuesta.

Ahí la trazabilidad lo es todo. Con SDD cada pieza se conecta con la anterior:

1. El requerimiento queda escrito en una especificación (`spec.md`).
2. La especificación se convierte en un plan técnico con sus decisiones (`plan.md`).
3. El plan se divide en tareas concretas (`tasks.md`).
4. El agente implementa esas tareas y no otras.
5. Las pruebas se validan contra lo que dice la especificación.

Cuando aparece un cambio, entra por la especificación y baja por la misma cadena. Así siempre puedes responder qué se pidió, qué se decidió, qué se construyó y cómo se verificó.

## El vibe coding mal acostumbra

Hay otro efecto que se nota menos: el vibe coding mal acostumbra.

He visto directivos y personas no técnicas convencidas de que el proceso es automático. Que uno pide una app y el agente adivina qué quiero, cómo lo quiero y por qué lo quiero. Se acostumbran a resultados inmediatos que no tienen sustento en el tiempo.

Me ha tocado estar en desarrollos con personas que querían ver la aplicación de inmediato, y que esperaban cerrar una reunión de demo de 30 minutos con la app lista para producción. Una demo muestra que algo funciona hoy. Lo que la sostiene mañana (especificación, decisiones, pruebas, documentación) no aparece en pantalla.

Creo que parte de la responsabilidad de ese pensamiento es nuestra, de quienes operamos la IA. Mostrar resultados rápido da la sensación de que somos eficientes, y caemos en buscar esa sensación frente a quienes lideran, cuyas preocupaciones están en el negocio y no en lo técnico. Para ellos el flujo de desarrollo no se ve, y si no lo explicamos nosotros, nadie más lo va a hacer. Cada demo mágica que entregamos sin explicar lo que falta alimenta la expectativa de que la próxima será igual de mágica.

## Cómo trabajo hoy

Uso los dos, en momentos distintos:

- **Vibe coding para prototipar.** Rápido y sencillo, para ver si la idea tiene sentido.
- **Del prototipo a las especificaciones.** Lo que aprendo prototipando me sirve para darle forma a las especificaciones iniciales.
- **SDD para evolucionar.** Si el proyecto vale la pena o aparecen requerimientos nuevos, sigue creciendo de forma ordenada, con especificación, plan y tareas.

Lo que haría distinto en aquel prototipo es formalizar antes. El momento de escribir las especificaciones es cuando el prototipo empieza a crecer. Hoy, cuando veo que algo se está saliendo de "prueba rápida", paro y escribo antes de seguir.

Vibrar sirve para descubrir qué construir. Para construirlo en serio, y que otro pueda entenderlo después, necesitas dejar rastro.
