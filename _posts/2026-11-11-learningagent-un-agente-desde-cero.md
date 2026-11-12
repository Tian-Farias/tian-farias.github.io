---
title: "Cómo funciona un agente de IA: lo construí desde cero"
author: Cristian
description: "Todos explican los agentes con diagramas. Construí uno desde cero, con una sola dependencia, y medí cada versión en tokens y dólares."
date: 2026-11-11 09:00:00 -0300
categories: [IA]
tags: [LearningAgent, Agentes, LLM, litellm, Python, Claude Code]
toc: true
comments: true
image:
  path: /assets/img/learningagent-un-agente-desde-cero.webp
  alt: "Plano técnico de LearningAgent: v000 como cimiento y los arcos de memoria (v001 a v003), de chat a agente (v004 a v007) y de observabilidad y aislamiento (v008 y v009) como pisos de una construcción, con un recuadro de medición de 0.93 USD y 6.3 millones de tokens"
---

> **Serie LearningAgent** · Introducción \\
> → **Siguiente:** {% include post-link.html slug="learningagent-v000-conversacion-sin-memoria" text="v000, lo mínimo para hablar con un modelo" %} \\
> [Repositorio en GitHub](https://github.com/Tian-Farias/LearningAgent)
{: .prompt-info }

## Por qué lo empecé

Todos hablan de agentes. En todos lados explican con diagramas cómo funcionan y cuál es su arquitectura. Se habla de Claude Code, de Codex, de OpenCode y de un sinfín de agentes que hacen mil cosas. Cada día salen herramientas nuevas y nuevas charlas sobre cómo funcionan, siempre desde el alto nivel. Lo que casi no he visto es a alguien construir un agente desde cero, con pocas dependencias externas, explicando de verdad cómo funciona por dentro. Lo mismo pasa con el *harness*, que es el programa que rodea al modelo: el bucle que lo llama, la memoria que le entrega, las herramientas que puede usar y los límites que se le ponen.

Puede que exista y no lo haya encontrado. Igual decidí hacerlo yo, porque construirlo es la mejor forma que conozco de entender algo. Así nació [LearningAgent](https://github.com/Tian-Farias/LearningAgent).

## Qué es LearningAgent

Es un repositorio que cuenta la historia de un agente, desde la idea más simple hasta verlo complejizarse paso a paso. Parte como un programa que le habla a una API de un modelo de lenguaje y la meta es que termine convertido en un agente. El nombre sigue la misma filosofía de sencillez: `lagent` viene de *learning agent*.

Algunas decisiones de base:

- **Una carpeta por versión.** Cada versión vive en su propia carpeta (`lagent-v000/`, `lagent-v001/`, etc.) y es una foto completa e independiente. Así se puede leer, ejecutar y comparar cada etapa por separado, y se ve en qué archivo aparece cada capacidad nueva.
- **Una sola dependencia.** El único paquete externo es [litellm](https://github.com/BerriAI/litellm). Lo elegí porque da acceso a cualquier proveedor con la misma llamada, desde Anthropic u OpenAI hasta un modelo local, y así no gasto tiempo en integraciones propias de cada uno. Todo lo demás (el bucle, la memoria, la compactación) está escrito desde cero y a la vista.
- **Código didáctico.** Funciones y diccionarios en vez de clases, y un comentario sobre cada función que explica el porqué de cada decisión. Los capítulos citan esos comentarios tal cual.
- **Cada versión corre sola.** Requiere Python 3.11 o superior y se ejecuta desde cualquier carpeta.

## Cómo se lee: capítulos y arcos

Cada versión es un capítulo. Agrega una sola capacidad y termina con una limitación a la vista, y esa limitación es el problema que resuelve el capítulo siguiente. Los capítulos se agrupan en arcos, y cada arco persigue una meta mayor:

| Arco | Meta | Versiones |
|------|------|-----------|
| **Punto de partida** | Un chat mínimo con el modelo | [v000](https://github.com/Tian-Farias/LearningAgent/tree/main/lagent-v000) |
| **1: memoria** | Que el agente recuerde la conversación con un costo acotado | [v001](https://github.com/Tian-Farias/LearningAgent/tree/main/lagent-v001) a [v003](https://github.com/Tian-Farias/LearningAgent/tree/main/lagent-v003) |
| **2: de chat a agente** | Que pueda actuar, con límites, con evidencia de que terminó y con una memoria que puede consultar | v004 a v007 |
| **3: observabilidad y aislamiento** | Ver qué pasa dentro del bucle y ejecutar las herramientas en un entorno aislado | v008 y v009 |
| **4: escala** | Repartir el trabajo entre varios modelos y sub-agentes | v010 y v011 |
{: .tabla-ajustada }

Hoy están construidos el **punto de partida** y el **arco de la memoria**. El resto está en la [hoja de ruta](https://github.com/Tian-Farias/LearningAgent/blob/main/TODO.md) y va cambiando a medida que avanzo. Un ejemplo: [v003](https://github.com/Tian-Farias/LearningAgent/tree/main/lagent-v003) resume los mensajes viejos para ahorrar tokens, y al medirla descubrí que el resumen crecía hasta ocupar todo el espacio que le daba, lo que obligaba a compactar cada pocos turnos. Una salida es guardar lo resumido en un archivo que el agente pueda consultar, para que el resumen sea breve. Esa idea no estaba en el plan y hoy es v007, memoria consultable. Quedó dentro del **arco de chat a agente** porque el agente va a consultar ese archivo con herramientas (*tools*), que es la capacidad que se agrega en ese arco.

## Medir en vez de suponer

Decir que una versión "recuerda mejor" o "gasta menos" es fácil. Por eso el repo trae una carpeta [bench/](https://github.com/Tian-Farias/LearningAgent/blob/main/bench/README.md) que mide las versiones desde afuera, sin tocar su código. Reemplaza `litellm.completion` por una función que hace lo mismo y además anota cada llamada (*monkey patching*), y le entrega a cada versión la misma conversación guionada de 100 mensajes. En esa conversación hay datos plantados en distintos momentos (un nombre, una ciudad, un servidor) y diez preguntas de control cuya respuesta se conoce de antemano. Es la idea de las evals que conté en [lo que cambió en mi marco de productos de IA generativa](/posts/productos-ia-generativa-lo-que-cambio/#evals), aplicada a un agente: sin casos con respuesta conocida, cambiar algo es una apuesta.

La primera medición real de las cuatro versiones, con `anthropic/claude-haiku-5-5`, sumó 433 llamadas, 6.3 millones de tokens de entrada y 0.93 USD contando entrada y salida. Cada capítulo de esta serie cuenta lo que esa medición mostró de su versión, incluidas las cosas que no salieron como esperaba.

## Escrito con Claude Code

La documentación del repo (los README de cada capítulo, la hoja de ruta y buena parte de los comentarios) la trabajé con Claude Code. Este blog no esconde que me apoyo en IA, y creo que usar herramientas que te facilitan la vida está bien mientras ellas no te dominen a ti. Cómo trabajo con IA cuando programo lo conté en [Divagar, codificar, ordenar](/posts/divagar-codificar-ordenar/). El Omnissiah aprueba el uso de servidores, siempre que el tecnosacerdote siga al mando.

Para seguir al mando, le dejé reglas claras: el diff contra la versión anterior es la fuente de verdad, ninguna motivación, anécdota ni cifra se inventa, y lo que el código no explica queda como pregunta para mí.

## Cómo probarlo

```bash
git clone https://github.com/Tian-Farias/LearningAgent.git
cd LearningAgent
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

export API_KEY="sk-ant-..."
export MODEL="anthropic/claude-haiku-5-5"
# Con Anthropic, OpenAI u OpenRouter se deja sin definir: litellm conoce la dirección oficial
unset BASE_URL
# Para un proxy, un servidor propio o una API compatible con OpenAI:
# export BASE_URL="https://mi-servidor.ejemplo/v1"
python lagent-v000/main.py
```

Los capítulos asumen que el entorno virtual está activo. En una terminal nueva, vuelve a activarlo con `source .venv/bin/activate` desde la carpeta `LearningAgent`.

Con OpenAI u OpenRouter cambian `API_KEY` y `MODEL`, y `BASE_URL` solo hace falta si usas un proxy o un servidor propio. El README raíz tiene la sección [Conectarse a un proveedor](https://github.com/Tian-Farias/LearningAgent/blob/main/README.md#conectarse-a-un-proveedor) con un ejemplo para cada uno.

## La serie

1. {% include post-link.html slug="learningagent-v000-conversacion-sin-memoria" text="v000: lo mínimo para hablar con un modelo" %}
2. {% include post-link.html slug="learningagent-v001-memoria-de-la-conversacion" text="v001: recordar cuesta" %} (abre el **arco de la memoria**)
3. {% include post-link.html slug="learningagent-v002-ventana-de-memoria" text="v002: la ventana que olvida" %}
4. {% include post-link.html slug="learningagent-v003-compactacion-de-memoria" text="v003: resumir antes de olvidar" %} (cierra el **arco de la memoria**)

Los próximos capítulos llegan cuando el agente aprenda a hacer algo más que conversar.

## El repositorio

{% include embed/github.html repo='Tian-Farias/LearningAgent' description='Construcción de un agente de IA paso a paso' %}

---

> **Serie LearningAgent** · Introducción \\
> → **Siguiente:** {% include post-link.html slug="learningagent-v000-conversacion-sin-memoria" text="v000, lo mínimo para hablar con un modelo" %} \\
> [Repositorio en GitHub](https://github.com/Tian-Farias/LearningAgent)
{: .prompt-info }
