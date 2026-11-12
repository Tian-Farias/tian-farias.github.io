---
title: "Cómo darle memoria a un agente de IA (y cuánto cuesta)"
author: Cristian
description: "Darle memoria a un agente es reenviarle todo el historial. Acertó las 10 preguntas de control y gastó tres cuartos de los tokens de la medición."
date: 2026-11-13 09:00:00 -0300
categories: [IA]
tags: [LearningAgent, Agentes, LLM, litellm, Python, Memoria]
toc: true
comments: true
image:
  path: /assets/img/learningagent-v001-memoria-de-la-conversacion.webp
  alt: "Plano técnico de lagent-v001: el historial de mensajes que se reenvía completo al modelo, la sesión guardada en mem_session/, el cuidado de lo que entra a la memoria y una curva de tokens enviados que crece con cada mensaje, junto a la medición de v001"
---

> **Serie LearningAgent** · **Arco 1: memoria**, capítulo 1 de 3 \\
> ← **Anterior:** {% include post-link.html slug="learningagent-v000-conversacion-sin-memoria" text="v000, lo mínimo para hablar con un modelo" %} \\
> → **Siguiente:** {% include post-link.html slug="learningagent-v002-ventana-de-memoria" text="v002, la ventana que olvida" %} \\
> [Repositorio en GitHub](https://github.com/Tian-Farias/LearningAgent)
{: .prompt-info }

## El problema que hereda

En {% include post-link.html slug="learningagent-v000-conversacion-sin-memoria" text="v000" %} cada mensaje viajaba solo. Si escribía "Me llamo Ana" y después preguntaba "¿Cómo me llamo?", la segunda llamada llevaba únicamente esa pregunta.

Con [v001](https://github.com/Tian-Farias/LearningAgent/tree/main/lagent-v001) empieza el **arco de la memoria**. Sus tres capítulos persiguen la misma meta: que el agente recuerde la conversación con un costo acotado. Este capítulo consigue que recuerde. Los dos siguientes se ocupan del costo, y vas a ver por qué hacía falta.

El capítulo completo está en el [README de v001](https://github.com/Tian-Farias/LearningAgent/blob/main/lagent-v001/README.md).

## Recordar es reenviar

La clave de esta versión es aceptar que el modelo no guarda nada entre llamadas. Para que "recuerde", hay que enviarle toda la conversación cada vez. El historial pasa a ser parte del contexto (todo lo que el modelo recibe en una llamada), que es lo que define el techo de lo que puede responder (lo conté en [lo que cambió en mi marco de productos de IA generativa](/posts/productos-ia-generativa-lo-que-cambio/#la-calidad-del-contexto-define-el-techo)). El cambio central ocupa pocas líneas: `send_message` deja de recibir un mensaje suelto y recibe el historial completo, con el prompt de sistema adelante.

`llm.py`:

```python
        messages=[
            {
                "role": "system",
                "content": system_prompt
            }
            ] + messages,
```

El historial vive en `main.py` como una lista de mensajes. Por cada mensaje que escribes, el bucle hace tres cosas: agrega tu texto a la lista con el rol `user`, envía la lista completa al modelo y agrega la respuesta con el rol `assistant`, que aparece en esta versión. Así la lista crece de a dos mensajes por intercambio.

Además, la lista se guarda en un archivo después de cada intercambio, para que la conversación sobreviva si cierras el programa. Cada conversación es una sesión con nombre: el nombre se indica al ejecutar (`python main.py pruebas`) y, si no se indica, se usa `default`. La sesión `pruebas` se guarda en `mem_session/pruebas.json`, y al volver a abrirla el programa carga ese archivo y la conversación sigue donde quedó. Elegí JSON porque conserva la estructura de la lista: se carga directo, sin tener que interpretar un texto libre para recuperar cada mensaje.

## Cuidar lo que entra

Con una lista que se reenvía entera, un mensaje malo acompaña a la conversación para siempre. Por eso casi todo el bucle nuevo se dedica a cuidar qué entra a la memoria. Tu mensaje se agrega a la lista antes de llamar al modelo, así que si la llamada falla hay que sacarlo (`messages.pop()` quita el último elemento de la lista) para poder reintentar sin duplicarlo. Una respuesta vacía recibe el mismo trato:

`main.py`:

```python
            # Una respuesta vacía no se guarda: un mensaje vacío en el historial se
            # reenviaría en cada pregunta siguiente y la API podría rechazarlo, dejando
            # la sesión inutilizable. Se avisa y se quita el mensaje del usuario para reintentar.
            if not reply:
                messages.pop()
                print("El modelo devolvió una respuesta vacía. Intenta de nuevo.")
                continue
```

Esta es una protección preventiva. Todavía no he visto a un modelo devolver una respuesta vacía en este chat, pero el costo de que ocurra es una sesión que no se puede volver a usar, y el costo de prevenirlo son cuatro líneas.

## Un contador que no puede romper nada

Antes de cada respuesta, [v001](https://github.com/Tian-Farias/LearningAgent/tree/main/lagent-v001) muestra cuántos tokens envió. Los modelos no leen palabras sino tokens, pedazos de texto de unos pocos caracteres, y los proveedores cobran por token. Como el historial completo viaja en cada llamada, este número crece con la conversación y hace visible el precio de recordar.

Junto con la respuesta, la API devuelve un campo `usage` con los tokens que consumió la llamada, y `prompt_tokens` es la parte que se envió. Según el proveedor o el proxy, ese campo puede venir vacío, y por eso se lee con `getattr`, que devuelve `None` en vez de fallar si el dato no existe.

Lo interesante es dónde quedó este código. Si estuviera dentro del `try` de la llamada, un problema al leer el contador activaría el `except`, que muestra el error y saca tu mensaje de la lista como si la llamada hubiera fallado, y se perdería una respuesta que el modelo ya generó y que ya se cobró:

`main.py`:

```python
            # Mostramos los tokens enviados, que crecen con el historial y es lo que se cobra.
            # Va fuera del try anterior a propósito: ese except descarta la respuesta, y un
            # contador incompleto no debe tirar una respuesta que el modelo ya generó (y que
            # ya se cobró). Por eso se lee con getattr y se muestra solo si existe.
            prompt_tokens = getattr(usage, "prompt_tokens", None)
            if prompt_tokens is not None:
                print(f"[tokens enviados: {prompt_tokens}]")
```

Es el tipo de decisión que no se ve en un diagrama y que define si un programa es confiable.

## Un nombre de sesión que no escapa

El nombre de la sesión se usa para armar la ruta del archivo, y eso abre una puerta: `..` significa la carpeta de arriba, así que una sesión llamada `../x` terminaría escribiendo fuera de `mem_session/`. Por eso el nombre se valida (solo letras, números, `-` y `_`) y, si no cumple, se rechaza en vez de limpiarlo. Así un nombre raro no se transforma en silencio en otro archivo, y no hay forma de salirse de la carpeta.

```bash
python main.py ../x
```

```text
Nombre de sesión inválido: usa solo letras, números, '-' y '_'.
```

## Cómo probarlo

Desde la carpeta `LearningAgent`, con el entorno virtual y las variables configuradas como se explica en la introducción:

```bash
source .venv/bin/activate   # entorno creado en la introducción
cd lagent-v001
python main.py pruebas
```

```text
Sesión 'pruebas' (0 mensajes en memoria). Usa /help para ver los comandos.
>>> Me llamo Ana
>>> ¿Cómo me llamo?
```

La segunda llamada lleva cuatro mensajes (sistema, usuario, asistente, usuario), así que el modelo tiene el nombre a la vista. Si sales con `/exit` y vuelves a ejecutar `python main.py pruebas`, la conversación sigue ahí. Y la línea `[tokens enviados: N]` sube de una respuesta a la siguiente.

## Lo que mostró la medición

En el benchmark, la conversación guionada de 100 mensajes con diez preguntas de control que expliqué en {% include post-link.html slug="learningagent-v000-conversacion-sin-memoria" text="v000" hash="el-acierto-que-no-prueba-nada" %}, y con `anthropic/claude-haiku-5-5`, [v001](https://github.com/Tian-Farias/LearningAgent/tree/main/lagent-v001) acertó las 10 preguntas de control. Recuerda todo, como se esperaba.

El precio también se cumplió: 4756081 tokens de entrada y 0.5266 USD, la más cara de las cuatro versiones. Sumando las cuatro, la medición envió 6.3 millones de tokens de entrada, y tres cuartos de esos los envió [v001](https://github.com/Tian-Farias/LearningAgent/tree/main/lagent-v001) sola. Cada mensaje carga con todos los anteriores, así que el último del guion le cuesta al modelo leer la conversación entera una vez más.

Con un chat de 100 mensajes y un modelo barato, la cuenta es de centavos. Con un agente que trabaja horas, con herramientas que devuelven archivos enteros, esa curva es la que vacía el presupuesto o choca con el límite de contexto del modelo, que es la cantidad máxima de tokens que acepta en una sola llamada.

## Lo que todavía falta

La memoria crece sin límite y solo se vacía a mano con `/clear`, el comando nuevo de esta versión, que borra la sesión completa. Cada mensaje lleva más contexto que el anterior. El siguiente capítulo deja de enviar todo y se queda con los últimos mensajes.

## El repositorio

{% include embed/github.html repo='Tian-Farias/LearningAgent' description='Construcción de un agente de IA paso a paso' %}

---

> **Serie LearningAgent** · **Arco 1: memoria**, capítulo 1 de 3 \\
> ← **Anterior:** {% include post-link.html slug="learningagent-v000-conversacion-sin-memoria" text="v000, lo mínimo para hablar con un modelo" %} \\
> → **Siguiente:** {% include post-link.html slug="learningagent-v002-ventana-de-memoria" text="v002, la ventana que olvida" %} \\
> [Repositorio en GitHub](https://github.com/Tian-Farias/LearningAgent)
{: .prompt-info }
