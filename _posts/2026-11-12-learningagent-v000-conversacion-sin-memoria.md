---
title: "Por qué un LLM no recuerda nada: un chat mínimo en Python"
author: Cristian
description: "Un chat en la terminal con litellm y sin memoria, el punto de partida de LearningAgent. Y una pregunta que acertó sin recordar nada."
date: 2026-11-12 09:00:00 -0300
categories: [IA]
tags: [LearningAgent, Agentes, LLM, litellm, Python]
toc: true
comments: true
image:
  path: /assets/img/learningagent-v000-conversacion-sin-memoria.webp
  alt: "Plano técnico de lagent-v000: la terminal, el bucle de main.py y los cuatro archivos (main.py, config.py, llm.py y commands.py), un embudo que arma la lista de mensajes desde cero en cada llamada y un recuadro con la medición de v000"
---

> **Serie LearningAgent** · **Punto de partida** \\
> ← **Anterior:** [Introducción](/posts/learningagent-un-agente-desde-cero/) \\
> → **Siguiente:** {% include post-link.html slug="learningagent-v001-memoria-de-la-conversacion" text="v001, recordar cuesta" %} \\
> [Repositorio en GitHub](https://github.com/Tian-Farias/LearningAgent)
{: .prompt-info }

## La pregunta de partida

Un modelo de lenguaje, por sí solo, hace una sola cosa: recibe un texto y devuelve otro. Todo lo que llamamos agente (recordar la conversación, usar herramientas, saber cuándo terminó una tarea) lo hace el programa que lo rodea. Para entender qué agrega ese programa, primero necesitaba el punto más bajo posible. La pregunta de [v000](https://github.com/Tian-Farias/LearningAgent/tree/main/lagent-v000) es la más básica: ¿qué es lo mínimo que hace falta para conversar con un modelo desde un programa propio?

La respuesta es un chat en la terminal. Lee lo que escribes, se lo envía al modelo y muestra la respuesta. Nada más. Para hablar con el modelo uso [litellm](https://github.com/BerriAI/litellm), una biblioteca de Python con una sola función, `completion`, que traduce la misma llamada al formato de cada proveedor (Anthropic, OpenAI o un modelo local). Es la única dependencia externa del proyecto. El capítulo completo, con el diagrama del flujo, está en el [README de v000](https://github.com/Tian-Farias/LearningAgent/blob/main/lagent-v000/README.md).

## Cuatro archivos para un programa corto

El programa está separado en un archivo por funcionalidad, aunque sea corto, porque a medida que el agente crece quiero que se vea en qué archivo aparece cada capacidad nueva:

| Archivo | Qué hace |
|---------|----------|
| `main.py` | El bucle del chat: lee, decide qué hacer con la entrada y muestra la respuesta. |
| `config.py` | El modelo a usar y las instrucciones generales. |
| `llm.py` | Envía el mensaje al modelo con `litellm`. |
| `commands.py` | Atiende los comandos `/exit`, `/quit` y `/help`. |
{: .tabla-ajustada }

## El recorrido de un mensaje

Todo pasa dentro de un bucle en `main.py` que se repite hasta que sales del chat. En cada vuelta lee una línea, revisa si es un comando y, si no lo es, se la envía al modelo. Este es el bucle, sin los comentarios:

`main.py`:

```python
        while True:
            user_input = input(">>> ").strip()
            if not user_input:
                continue

            result = handle_command(user_input)

            if result is True:
                break
            elif result is False:
                continue

            try:
                print(send_message(SYSTEM_PROMPT, user_input))
            except Exception as e:
                print(f"Error: {e}")
```

Las tres piezas que usa vienen de los otros archivos: `handle_command` (de `commands.py`) decide si el texto es un comando, `send_message` (de `llm.py`) habla con el modelo y `SYSTEM_PROMPT` (de `config.py`) son las instrucciones generales. Las secciones siguientes abren cada una.

## Tres respuestas para un comando

Los comandos son textos que empiezan con `/` y que el programa atiende sin llamar al modelo: `/exit` y `/quit` para salir, y `/help` para ver la ayuda. `handle_command` recibe lo que escribiste y devuelve uno de tres valores, y cada uno le dice al bucle qué hacer:

`commands.py`:

```python
# Devuelve:
#   - None: el texto no es un comando, hay que enviarlo al modelo.
#   - True: era un comando de salida, hay que terminar el chat.
#   - False: era un comando (o uno desconocido) ya atendido, el chat continúa.
```

Son tres valores porque el bucle tiene tres caminos posibles: salir, seguir sin llamar al modelo o llamar al modelo. Cualquier texto que empiece con `/` y no se reconozca se trata como un comando mal escrito. Así un `/hepl` se queda en la terminal en vez de gastar una llamada al modelo.

## Por qué no recuerda nada

Para el modelo, una conversación es una lista de mensajes, y cada mensaje tiene un rol que dice quién habla. En [v000](https://github.com/Tian-Farias/LearningAgent/tree/main/lagent-v000) hay dos roles: `system`, con las instrucciones generales que el modelo debe seguir siempre (en `config.py` son simplemente "Eres un asistente útil."), y `user`, con lo que escribe la persona. En el capítulo siguiente aparece un tercero, `assistant`, para las respuestas del modelo.

En [v000](https://github.com/Tian-Farias/LearningAgent/tree/main/lagent-v000) esa lista siempre tiene dos elementos:

`llm.py`:

```python
        # La conversación es una lista de mensajes, cada uno con un rol:
        # "system" para las instrucciones y "user" para lo que escribe la persona.
        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": user_message
            },
        ],
```

`send_message` arma esta lista, se la entrega a `litellm.completion` y devuelve el texto de la respuesta. La lista se arma desde cero en cada llamada. Cada llamada a la API es independiente y el modelo no guarda nada entre una y otra, así que si no le envío lo anterior, para él no existe. La memoria de un agente es responsabilidad del programa, y de eso tratan los tres capítulos siguientes, el **arco de la memoria**.

## Un error nunca es una respuesta

Una llamada al modelo puede fallar: se cae la red, la clave de la API es inválida o el proveedor está saturado. `send_message` no atrapa esos errores. Los deja pasar como una excepción, y es el bucle de `main.py` el que los muestra en pantalla como `Error: ...`:

`llm.py`:

```python
# Si algo falla (red, clave inválida, etc.) lanza la excepción: quien la llama decide
# qué hacer, así un error nunca se confunde con una respuesta del modelo.
```

Si `send_message` atrapara el error y devolviera su mensaje como texto, el bucle lo mostraría como si lo hubiera dicho el modelo. En [v000](https://github.com/Tian-Farias/LearningAgent/tree/main/lagent-v000) da lo mismo, porque la respuesta se muestra y se olvida. Desde [v001](https://github.com/Tian-Farias/LearningAgent/tree/main/lagent-v001) cada respuesta se guarda en el historial de la conversación, y ese historial se le reenvía al modelo en cada llamada. Un error guardado como respuesta quedaría ahí para siempre, y el modelo lo leería como algo que él mismo dijo.

## Cómo probarlo

Desde la carpeta `LearningAgent`, con el entorno virtual y las variables `API_KEY` y `MODEL` configuradas como se explica en la introducción:

```bash
source .venv/bin/activate   # entorno creado en la introducción
cd lagent-v000
python main.py
```

```text
>>> Me llamo Ana
>>> ¿Cómo me llamo?
```

El modelo responde la primera sin problema. En la segunda, la llamada lleva solo las instrucciones y `¿Cómo me llamo?`, así que el modelo no tiene de dónde sacar el nombre.

## El acierto que no prueba nada

Para comparar las versiones, el repo trae un *benchmark* en la carpeta `bench/`, que conté en la introducción. Le entrega a cada versión la misma conversación guionada de 100 mensajes (cada mensaje es un turno), con datos plantados en distintos momentos y diez preguntas de control cuya respuesta se conoce de antemano. Al final, un script revisa si cada respuesta a esas preguntas contiene el texto esperado.

En la medición real con `anthropic/claude-haiku-5-5`, [v000](https://github.com/Tian-Farias/LearningAgent/tree/main/lagent-v000) respondió los 100 mensajes con 3633 tokens de entrada en total, unos 36 por llamada, porque cada llamada lleva solo las instrucciones y el mensaje del momento. Costó 0.0452 USD, casi todo en tokens de salida. Acertó 1 de las 10 preguntas de control, y esa es la parte entretenida.

La pregunta que acertó fue la del turno 95: "¿Cuál es mi distribución favorita?". La respuesta esperada era Debian, que el guion planta en el turno 5. [v000](https://github.com/Tian-Farias/LearningAgent/tree/main/lagent-v000) no puede saberlo, porque no recuerda nada. Respondió con un texto que contenía "Debian" igual, y la revisión automática, que solo busca el texto esperado dentro de la respuesta, lo contó como acierto.

Lo que me llevo de esto: una métrica que busca texto se puede engañar sola. Un acierto aislado no prueba memoria, y por eso el script de reporte tiene la opción `--detalle`, que muestra el comienzo de cada respuesta a las preguntas de control para revisarlas a ojo. En Linux hay apuestas peores que Debian, y el modelo lo sabía.

## Lo que todavía falta

El modelo no recuerda nada. No se puede sostener una conversación ni retomarla después, porque nada queda guardado. El siguiente capítulo, [v001](https://github.com/Tian-Farias/LearningAgent/tree/main/lagent-v001), le da memoria y abre el **arco de la memoria**, el primero de la serie.

## El repositorio

{% include embed/github.html repo='Tian-Farias/LearningAgent' description='Construcción de un agente de IA paso a paso' %}

---

> **Serie LearningAgent** · **Punto de partida** \\
> ← **Anterior:** [Introducción](/posts/learningagent-un-agente-desde-cero/) \\
> → **Siguiente:** {% include post-link.html slug="learningagent-v001-memoria-de-la-conversacion" text="v001, recordar cuesta" %} \\
> [Repositorio en GitHub](https://github.com/Tian-Farias/LearningAgent)
{: .prompt-info }
