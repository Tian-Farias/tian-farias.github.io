---
title: "Memoria por ventana: 90% menos tokens y un agente que olvida"
author: Cristian
description: "Enviar solo los últimos mensajes bajó el gasto un 90% y el agente olvidó 7 de 10 respuestas. La trampa de una memoria que olvida sin avisar."
date: 2026-11-14 09:00:00 -0300
categories: [IA]
tags: [LearningAgent, Agentes, LLM, litellm, Python, Memoria]
toc: true
comments: true
image:
  path: /assets/img/learningagent-v002-ventana-de-memoria.webp
  alt: "Plano técnico de lagent-v002: el historial completo guardado en mem_session/, una ventana móvil que envía solo los últimos mensajes, la configuración en lagent.toml y un monigote al que el agente ya no recuerda su nombre porque quedó fuera de la ventana"
---

> **Serie LearningAgent** · **Arco 1: memoria**, capítulo 2 de 3 \\
> ← **Anterior:** {% include post-link.html slug="learningagent-v001-memoria-de-la-conversacion" text="v001, recordar cuesta" %} \\
> → **Siguiente:** {% include post-link.html slug="learningagent-v003-compactacion-de-memoria" text="v003, resumir antes de olvidar" %} \\
> [Repositorio en GitHub](https://github.com/Tian-Farias/LearningAgent)
{: .prompt-info }

## El problema que hereda

{% include post-link.html slug="learningagent-v001-memoria-de-la-conversacion" text="v001" %} recuerda todo porque reenvía todo, y por eso cada mensaje cuesta más que el anterior. La pregunta de [v002](https://github.com/Tian-Farias/LearningAgent/tree/main/lagent-v002) es cómo evitar que lo enviado crezca sin límite sin borrar la conversación guardada. Es el segundo capítulo del **arco de la memoria**: el agente ya recuerda, y ahora toca acotar el costo.

El capítulo completo está en el [README de v002](https://github.com/Tian-Farias/LearningAgent/blob/main/lagent-v002/README.md).

## Memoria guardada y memoria enviada

La idea central de esta versión es que lo que guardo y lo que envío pueden ser cosas distintas. El archivo de la sesión sigue teniendo toda la conversación, y el modelo recibe solo los últimos mensajes. A ese recorte se le llama ventana: como una ventana que se desliza sobre la conversación, siempre muestra los mensajes más recientes y deja fuera los más antiguos. Su tamaño es `window`, la cantidad máxima de mensajes que se envían, y el recorte se calcula justo antes de llamar al modelo:

`main.py`:

```python
                sent = window_messages(messages, window)
                reply, usage = send_message(model, system_prompt, sent)
```

`messages` sigue siendo el historial completo, igual que en [v001](https://github.com/Tian-Farias/LearningAgent/tree/main/lagent-v001). Lo único que cambia es que al modelo le llega `sent`, el recorte.

## Una ventana que empieza en una pregunta

`window_messages` toma los últimos `window` mensajes (en Python, `messages[-window:]` significa "desde el elemento que está `window` posiciones antes del final, hasta el final") y hace un ajuste: si el corte cae en una respuesta del modelo, también la descarta, porque su pregunta quedó fuera. Así el modelo nunca recibe una respuesta sin su pregunta.

`memory.py`:

```python
def window_messages(messages, window):
    recent = messages[-window:]
    while recent and recent[0]["role"] != "user":
        recent = recent[1:]
    return recent
```

Ese ajuste tiene una consecuencia visible. En un chat normal los mensajes se alternan entre `user` y `assistant`, y al momento de llamar al modelo el último siempre es tu pregunta nueva. Contando ocho hacia atrás desde ahí, el primero cae en una respuesta, que se descarta, así que con `window = 8` se envían 7. Antes de cada respuesta, el chat muestra cuántos mensajes envió y cuántos tiene el historial completo:

```text
[mensajes enviados: 7 de 9]
[mensajes enviados: 7 de 11]
```

## La configuración sale del código

Con un parámetro nuevo que ajustar, pasé la configuración a un archivo `lagent.toml` junto al código de la versión. TOML es un formato de configuración de texto simple, con pares `clave = valor` agrupados en secciones entre corchetes, y Python 3.11 lo lee sin instalar nada (`tomllib`). Cada versión tiene el suyo. La clave de la API y la URL base siguen en variables de entorno, para que el archivo se pueda subir al repositorio sin datos sensibles. La variable `MODEL`, si está definida, reemplaza el modelo del archivo.

`lagent.toml`:

```toml
model = "anthropic/claude-haiku-5-5"
system_prompt = "Eres un asistente útil."

[memory]
dir = "mem_session"              # carpeta de las sesiones
window = 8                 # v002: mensajes que se envían al modelo
```

El código dejó de tener valores por defecto. Si falta una clave o tiene un valor no válido, el agente termina al arrancar con un mensaje claro, en vez de fallar más tarde en medio del chat. `window` muestra por qué vale la pena:

`config.py`:

```python
    # Sin esta validación window = 0 no daría error: messages[-0:] es la lista completa
    # y se enviaría todo el historial. Se usa type() porque True también es un int.
    if type(memory.get("window")) is not int or memory["window"] < 1:
        raise ValueError("memory.window debe ser un entero mayor que 0.")
```

Python tiene estas trampas. Un `0` parece una ventana vacía, pero `messages[-0:]` es lo mismo que `messages[0:]`, la lista entera. Y un `window = true` en el TOML llega como `True`, que en Python es un tipo de entero (vale 1), así que pasaría la validación si se revisara con `isinstance(..., int)`. `type(...) is int` exige un entero de verdad. Sin esa línea, una ventana mal configurada convertiría a [v002](https://github.com/Tian-Farias/LearningAgent/tree/main/lagent-v002) en [v001](https://github.com/Tian-Farias/LearningAgent/tree/main/lagent-v001) sin ningún aviso.

## Cómo probarlo

Desde la carpeta `LearningAgent`, con el entorno virtual y las variables configuradas como se explica en la introducción:

```bash
source .venv/bin/activate   # entorno creado en la introducción
cd lagent-v002
python main.py pruebas
```

`window = 8` es bajo a propósito, para que el recorte aparezca en pocos mensajes. Si escribes "Me llamo Ana" como primer mensaje y preguntas "¿Cómo me llamo?" en el quinto, el historial ya tiene nueve mensajes (cuatro tuyos con sus cuatro respuestas, más la pregunta nueva), se envían los últimos siete y el primero ya salió de la ventana y el modelo no lo recibe, aunque siga en `mem_session/pruebas.json`.

## Lo que mostró la medición

En el benchmark (la misma conversación guionada de 100 mensajes, con `anthropic/claude-haiku-5-5`), [v002](https://github.com/Tian-Farias/LearningAgent/tree/main/lagent-v002) envió 342722 tokens de entrada y costó 0.0992 USD. Frente a [v001](https://github.com/Tian-Farias/LearningAgent/tree/main/lagent-v001) gastó 90% menos tokens (entrada más salida) y costó 81% menos.

Acertó 3 de las 10 preguntas de control. En el turno 50, cuando el guion pregunta "¿Te acuerdas de cómo me llamo?", el nombre dicho en el turno 1 llevaba 49 turnos fuera de la ventana. Y uno de sus aciertos es la pregunta del turno 95 por la distribución favorita, la misma que acertó {% include post-link.html slug="learningagent-v000-conversacion-sin-memoria" text="v000" hash="el-acierto-que-no-prueba-nada" %} sin recordar nada, así que tampoco prueba memoria.

Esa es la trampa de la ventana: olvida sin avisar. El dato sigue en el archivo de la sesión y el modelo no sabe que existe. Para un chat de prueba da lo mismo. Para un agente que decide algo a partir de lo que se le dijo al principio, es una falla silenciosa. Lo viví desde el otro lado con un agente de programación que, con el tiempo, perdía decisiones que habíamos tomado en las primeras sesiones (lo conté en [El vibe coding no deja rastro](/posts/el-vibe-coding-no-deja-rastro/#lo-que-el-agente-olvidaba)).

## Lo que todavía falta

El modelo olvida de golpe lo que sale de la ventana. Además, la ventana cuenta mensajes y no tokens, así que unos pocos mensajes muy largos (un log pegado, por ejemplo) todavía pueden costar mucho o superar el límite de contexto. El siguiente capítulo resume lo viejo antes de que se pierda, y mide en tokens.

## El repositorio

{% include embed/github.html repo='Tian-Farias/LearningAgent' description='Construcción de un agente de IA paso a paso' %}

---

> **Serie LearningAgent** · **Arco 1: memoria**, capítulo 2 de 3 \\
> ← **Anterior:** {% include post-link.html slug="learningagent-v001-memoria-de-la-conversacion" text="v001, recordar cuesta" %} \\
> → **Siguiente:** {% include post-link.html slug="learningagent-v003-compactacion-de-memoria" text="v003, resumir antes de olvidar" %} \\
> [Repositorio en GitHub](https://github.com/Tian-Farias/LearningAgent)
{: .prompt-info }
