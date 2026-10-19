---
title: "Antonia: lo que aprendí montando un gateway LLM para toda una empresa"
author: Cristian
description: "Cómo pasamos de una factura de IA sin desglose a un gateway propio, el ataque que nos obligó a reforzar la seguridad y lo que haría distinto hoy."
categories: [IA]
tags: [IA Generativa, LLM, Gateway, Infraestructura, Seguridad]
toc: true
comments: true
# PENDIENTE: descomentar cuando exista la imagen en assets/img
# image:
#   path: /assets/img/antonia-gateway-llm.webp
#   alt: "Diagrama de un gateway que recibe solicitudes de varios equipos y las distribuye hacia los modelos de IA."
---

Cuando una empresa empieza a usar IA, rara vez lo decide en una reunión. Pasa de a poco: un equipo prueba un modelo para un prototipo, otro lo integra en un proyecto, alguien arma un agente para automatizar una tarea repetitiva. Cada uno se conecta por su lado y, al principio, nadie lo ve como un problema.

En [SmartJob](https://smartjob.cl), donde trabajo, el uso de IA creció así, repartido entre proyectos. Consumíamos los modelos directamente desde Vertex AI, el servicio de IA de Google Cloud.

Para entender lo que vino después hay que saber cómo se cobran estos modelos. Los modelos de lenguaje (LLM) se pagan por uso, según la cantidad de texto que procesan, medida en tokens. Si todos los proyectos consumen desde la misma cuenta de nube, la factura llega como un solo número. Sabíamos cuánto gastábamos en IA. Lo que no sabíamos era en qué.

¿Qué equipo gastó más? ¿Qué proyecto lo justificaba? ¿Qué uso valía la pena y cuál era ruido? Imposible saberlo. Íbamos a ciegas, y no se puede administrar lo que no se ve.

La salida fue poner un intermediario entre la gente y los modelos, que registrara cada consumo y lo separara por equipo y por proyecto. Primero como prueba, después en producción.

Así nació Antonia.

El nombre tiene su historia. La mascota de SmartJob es una hormiga, así que había que partir por **ANT**. Además, Antonia es un nombre bonito y termina en **IA**. Técnicamente, entonces, es **ANT on IA**: la hormiga sobre la IA. Un hermoso juego de palabras, y en infraestructura uno se toma muy en serio los nombres de sus servidores.

En realidad, el nombre estaba pensado para otra cosa. Antonia iba a ser nuestro asistente interno, un chatbot que respondiera preguntas. Ese proyecto nunca se materializó, así que el nombre quedó huérfano y decidí dárselo a lo que terminó siendo el core de IA de SmartJob: el punto único de acceso a los modelos.

## ¿Qué es Antonia?

Un gateway LLM es un intermediario. Las aplicaciones y las personas le hablan a él como si fuera el proveedor de IA, y él decide a qué modelo enviar cada solicitud, registra cuánto se gastó y aplica las reglas que definas: quién puede usar qué, con cuánto presupuesto y con qué límites.

Antonia es eso y un poquito más. Por decisiones de arquitectura, también es un proyecto de Google Cloud dedicado: la única cuenta que tiene habilitado el acceso a los modelos de IA, y existe solo para ese consumo. Todos los proyectos donde usamos IA pasan por ahí, y con eso la factura dejó de ser un número único. Hoy la usan los distintos equipos de la empresa para acceder a modelos Claude vía Vertex AI, cada uno con sus keys, presupuestos y límites, tanto desde aplicaciones como desde herramientas de agentes, por ejemplo Claude Code.

## Empezó como un experimento

La primera versión fue un servidor pequeño en una cuenta de desarrollo. Funcionaba, pero la idea era probar capacidades, no operar nada serio.

Primero fue el control de costos con API keys por persona y por equipo. Después vino la gestión de agentes, luego los guardrails, luego la gestión de prompts. Cada cosa que agregábamos hacía que más gente la usara, y cada persona nueva traía un caso de uso nuevo. En algún punto dejó de ser un experimento sin que nadie lo decidiera formalmente. Hoy es el centro neurálgico del consumo de IA en nuestros proyectos, y es trabajo del equipo de IA e Innovación de SmartJob, que la mantiene andando día a día.

## Ha fallado de todo

Pérdida de datos, contenedores que se caen, modelos que no están disponibles cuando más los necesitas. El espíritu de la máquina exige sus ofrendas, y Antonia las ha cobrado todas. Como cualquier proyecto que escala más rápido de lo planeado, las fallas catastróficas vienen incluidas.

La peor fue un ataque. Alguien empezó a intentar entrar por fuerza bruta al proxy. Lo interesante es que el riesgo de intrusión fue lo de menos. El problema real fue la carga: la avalancha de intentos saturó el servicio y empezó a provocar denegaciones de servicio. La gente que lo necesitaba para trabajar se quedó sin acceso.

Ahí pusimos una capa de seguridad delante del gateway, para que el tráfico malicioso se detuviera antes de llegar al servidor. Un sacerdote del Mechanicus no revela los ritos de protección de su forja, así que el detalle queda en casa. La lección general sí sirve para cualquiera: cuando expones un servicio a internet, además de preguntarte quién puede entrar, pregúntate cuánto aguanta cuando alguien lo golpea sin parar.

El desafío con Antonia siempre fue el mismo: mantenerla barata y segura al mismo tiempo. Esas dos cosas tiran en direcciones opuestas más seguido de lo que uno quisiera.

## Lo que mis años de infraestructura me habrían dicho

Hace diez años no habría puesto un servicio en producción expuesto a internet sin pasar por una auditoría amplia y extensa. Así aprendí a trabajar en infraestructura, y por buenas razones.

Antonia nació con otra filosofía: partir rápido, fallar rápido y corregir después. El ataque fue uno de esos "después". Aun así, mirando hacia atrás, creo que ese enfoque aportó más valor que ir a la segura con auditorías y procesos largos de diseño. Si hubiéramos esperado a tener todo resuelto en papel, todavía estaríamos sin saber en qué se nos iba el presupuesto de IA.

Mi opinión cambió con los años, y lo digo sin vergüenza. La auditoría sigue teniendo su lugar. Lo que aprendí es que para una herramienta interna que todavía está descubriendo para qué sirve, la velocidad de aprendizaje vale más que el diseño perfecto inicial.

## No todo debe pasar por el gateway

Una de las sorpresas fue descubrir que hay proyectos en los que conviene más pagar una suscripción directa a un proveedor de IA que usar Antonia. Depende de cómo se interactúa con el proyecto.

Centralizar el consumo tiene mucho sentido para controlar costos y aplicar reglas, pero un gateway propio es un medio para entender y controlar el gasto. Cuando una suscripción resuelve el caso más barato y con menos fricción, la respuesta correcta es la suscripción.

Me pasó a mí. Me tocó desarrollar un prototipo de software integrado con IA, y quien me conoce sabe que soy un cero a la izquierda en diseño de interfaces. Siempre lo digo: nací y me crié con [UNIX](https://www.opengroup.org/unix), para mí una aplicación es un comando en la terminal.

Así que me lancé a armar el prototipo con Claudito Code conectado a Antonia. No voy a decir cuánto gasté, pero fue tanto que me dio vergüenza. Saqué una suscripción de [Anthropic](https://www.anthropic.com), la de 100 dólares, y me alcanzó de sobra para todo el desarrollo, UI incluida.

Fue un acierto. El consumo de tokens es como dejar la llave abierta todo un mes: en un día no se nota, pero a la larga la cuenta equivale a vender un riñón.

## La parte que no se resuelve con tecnología

Montar el gateway fue la parte fácil. Lo difícil fue explicar por qué hacía falta.

La reacción inicial que más encontré fue la incredulidad. Me gusta ir más rápido que el resto, y eso tiene un costo: lo que para mí es evidente después de ver la factura, para otros todavía necesita contexto. Sigo aprendiendo a darlo antes de construir, y no después.

## Si la montara mañana

Usaría contenedores en Cloud Run y no una VM.

Bueno, partiría con una VM para medir capacidades, pero haría el salto a contenedores pronto. Los contenedores escalan rápido y, con un buen monitoreo, se puede controlar sin problema el flujo y el escalamiento.

Hay que entender algo: no somos Anthropic y no tenemos su infraestructura. Cuando mucha gente consume modelos al mismo tiempo, el sistema se pone lento, y eso le pega a la velocidad con que avanzan los proyectos. Con contenedores puedes asignar memoria, CPU y red a cada instancia y levantar más instancias cuando sube la demanda, y eso ayuda a que la respuesta se sienta más rápida.

Lo demás lo volvería a hacer igual, incluido partir con un servidor chico en una cuenta de desarrollo. Ese experimento barato fue lo que nos permitió aprender qué necesitábamos de verdad.

> Este post refleja mi experiencia y opinión personal y no representa a SmartJob ni a sus clientes.
{: .prompt-info }
