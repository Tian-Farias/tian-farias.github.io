---
title: "Compactar la memoria de un agente: el resumen que no obedece"
author: Cristian
description: "Resumir lo viejo recuerda todo con 70% menos tokens. La medición mostró que el modelo ignora el tamaño que le pido al resumen."
date: 2026-11-15 09:00:00 -0300
categories: [IA]
tags: [LearningAgent, Agentes, LLM, litellm, Python, Memoria]
toc: true
comments: true
image:
  path: /assets/img/learningagent-v003-compactacion-de-memoria.webp
  alt: "Plano técnico de lagent-v003: un sensor de umbral que manda los mensajes viejos al generador de resumen, el resumen con secciones de hechos, decisiones y pendientes inyectado en el prompt de sistema, y la comparación medida de v001, v002 y v003"
---

> **Serie LearningAgent** · **Arco 1: memoria**, capítulo 3 de 3 \\
> ← **Anterior:** {% include post-link.html slug="learningagent-v002-ventana-de-memoria" text="v002, la ventana que olvida" %} \\
> → **Siguiente:** v004, herramientas y bucle (en preparación) \\
> [Repositorio en GitHub](https://github.com/Tian-Farias/LearningAgent)
{: .prompt-info }

## El problema que hereda

{% include post-link.html slug="learningagent-v002-ventana-de-memoria" text="v002" %} dejó de crecer sin límite, pero olvida de golpe lo que sale de la ventana. Y como cuenta mensajes, es ciega al tamaño: unos pocos mensajes muy largos todavía cuestan mucho.

Lo que necesitaba era una memoria acotada que conserve lo importante de lo que ya pasó y que reaccione al tamaño real de la conversación. Es el último capítulo del **arco de la memoria**, y une lo que lograron los dos anteriores: recordar como [v001](https://github.com/Tian-Farias/LearningAgent/tree/main/lagent-v001), con un costo acotado como [v002](https://github.com/Tian-Farias/LearningAgent/tree/main/lagent-v002).

El capítulo completo está en el [README de v003](https://github.com/Tian-Farias/LearningAgent/blob/main/lagent-v003/README.md).

## Cómo funciona la compactación

Antes de enviar cada mensaje, si la conversación supera un umbral de tokens, [v003](https://github.com/Tian-Farias/LearningAgent/tree/main/lagent-v003) le pide al modelo que resuma los mensajes viejos y los reemplaza por el resumen. A esa operación se le llama compactar. Desde ahí, al modelo le llega el resumen dentro del prompt de sistema (las instrucciones generales) y después los mensajes recientes completos. El archivo de la sesión también cambia: ahora guarda el resumen y los mensajes recientes, y los mensajes resumidos dejan de existir. La ventana de [v002](https://github.com/Tian-Farias/LearningAgent/tree/main/lagent-v002) desaparece: si siguiera, los mensajes saldrían de ella antes de llegar al umbral y se perderían sin resumirse.

```toml
[memory]
dir = "mem_session"              # carpeta de las sesiones
compact_at_tokens = 8000    # v003: sobre este umbral se resume lo viejo
keep_recent_turns = 3       # v003: turnos recientes que se conservan, si caben
```

`compact_at_tokens` es el umbral: cuando la conversación que se va a enviar supera los 8000 tokens, se compacta. `keep_recent_turns` dice cuántos turnos recientes se conservan completos. Un turno es un mensaje `user` y lo que le sigue hasta el próximo `user`, o sea, tu pregunta con su respuesta.

Para saber si se pasó el umbral sin llamar al modelo, el programa estima los tokens con `litellm.token_counter`, que cuenta en local, sin consultar al proveedor. Esa estimación aparece de nuevo en la medición.

Cuatro decisiones arman el mecanismo.

**Se compacta antes de enviar.** Si esperara a la respuesta, una conversación que ya supera el límite del modelo fallaría al enviarse y nunca llegaría a compactarse.

**El umbral se mide en tokens.** El costo y el límite de contexto se miden en tokens: 20 mensajes cortos no justifican compactar, y 3 muy largos sí.

**El corte cae en un turno.** Lo que queda antes del corte se resume y lo que queda después se conserva. Cortar al inicio de un turno evita dejar una respuesta sin su pregunta. La meta es que, después de compactar, la conversación quede bajo la mitad del umbral: un cuarto para el resumen y otro cuarto para los turnos recientes. Con el umbral en 8000 tokens, son 2000 para el resumen y hasta 2000 para los turnos recientes. La otra mitad queda libre para que la conversación crezca antes de la próxima compactación. Si los últimos tres turnos no caben en su cuarto, se conservan menos.

**El resumen va en el prompt de sistema**, para no alterar la alternancia entre `user` y `assistant`:

`memory.py`:

```python
def build_system_prompt(system_prompt, summary):
    if not summary:
        return system_prompt
    return f"{system_prompt}\n\nResumen de la conversación hasta ahora:\n{summary}"
```

## Un resumen con estructura

La primera compactación resume mensajes. Las siguientes ya tienen un resumen anterior, y si se resumiera ese resumen junto con lo nuevo, cada pasada perdería un poco más, como una fotocopia de una fotocopia. Para evitarlo, el modelo recibe el resumen anterior junto con los mensajes nuevos y lo actualiza, en vez de resumir un resumen. Además, el resumen tiene tres secciones fijas que debe conservar en cada pasada:

`compaction.py`:

```python
# Secciones fijas del resumen. Le dan al modelo una estructura que debe conservar en cada
# compactación, para que el resumen no se degrade resumen tras resumen.
SUMMARY_SECTIONS = ("## Hechos", "## Decisiones", "## Pendientes")
```

La compactación es todo o nada. La llamada de resumen lleva un tope de tokens para la respuesta (`max_tokens`): si el modelo llega a ese tope, la API corta el texto donde iba. Un resumen cortado así, o sin las tres secciones, se rechaza, porque reemplazaría mensajes que ya no se pueden recuperar. Un resumen que no libera tokens también se descarta. En cualquiera de esos casos el historial queda intacto y se vuelve a intentar con el próximo mensaje. El comando `/memoria` muestra lo que el agente recuerda en ese momento.

## Dos errores de la primera versión

La primera versión de la compactación tenía dos problemas que el capítulo cuenta en detalle.

**Un número para dos cosas.** Usaba el mismo valor como tamaño pedido al modelo en las instrucciones ("menos de N tokens") y como tope real de la respuesta (`max_tokens`). El modelo no sabe contar tokens, así que un resumen apenas más largo que lo pedido llegaba al tope, quedaba cortado y se rechazaba. El intento siguiente repetía la misma llamada con el mismo tope, y la compactación fallaba mensaje tras mensaje.

La corrección separa los dos números. Al modelo le pido un cuarto del umbral (2000 tokens) y el tope real es el doble (4000). Si aun así el resumen se corta, lo pido una vez más en el mismo turno con la mitad del tamaño, porque repetir la misma llamada daría el mismo resultado. `finish_reason` es el motivo por el que el modelo dejó de escribir, y `"length"` significa que llegó al tope:

`compaction.py`:

```python
    for target in (target_tokens, target_tokens // 2):
        instructions = f"{SUMMARY_INSTRUCTIONS}\n- Tamaño pedido: menos de {target} tokens."
        summary, _, finish_reason = send_message(model, instructions, [{"role": "user", "content": request}], max_tokens=max_tokens)
        if finish_reason != "length":
            break
        print(f"[resumen cortado: se pidieron menos de {target} tokens y llegó al tope de {max_tokens}]")
```

Y si fallan tres compactaciones seguidas, el tope sube un octavo del umbral (1000 tokens), hasta llegar al umbral.

**Una regla que solo deja crecer.** Las instrucciones pedían conservar todo lo del resumen anterior, sin borrarlo ni generalizarlo. Con esa regla el resumen solo puede crecer, y su espacio es fijo. En una conversación larga llega el momento en que ya no cabe, y desde ahí cada compactación falla. Una memoria de tamaño fijo tiene que elegir qué condensar, así que ahora las reglas lo dicen:

`compaction.py`:

```python
- Conserva lo del resumen anterior que siga vigente, mientras quepa en el tamaño pedido.
- Si no cabe, condensa primero lo ya resuelto y lo más antiguo. Los pendientes abiertos y los datos concretos recientes se conservan.
```

## Lo que mostró la medición

Con las correcciones puestas, el benchmark (la misma conversación guionada de 100 mensajes, con `anthropic/claude-haiku-5-5`) dio esto. [v003](https://github.com/Tian-Farias/LearningAgent/tree/main/lagent-v003) hace más llamadas que las otras porque cada compactación es una llamada extra al modelo:

| | [v001](https://github.com/Tian-Farias/LearningAgent/tree/main/lagent-v001) | [v002](https://github.com/Tian-Farias/LearningAgent/tree/main/lagent-v002) | [v003](https://github.com/Tian-Farias/LearningAgent/tree/main/lagent-v003) |
| --- | --- | --- | --- |
| Llamadas al modelo | 100 | 100 | 133 |
| Tokens de entrada cobrados | 4756081 | 342722 | 1208933 |
| Costo USD | 0.5266 | 0.0992 | 0.2546 |
| Preguntas de control acertadas | 10 de 10 | 3 de 10 | 10 de 10 |
{: .tabla-ajustada }

Es una sola corrida por versión, y los modelos no responden siempre igual, así que las cifras varían entre corridas.

[v003](https://github.com/Tian-Farias/LearningAgent/tree/main/lagent-v003) acierta las mismas preguntas que [v001](https://github.com/Tian-Farias/LearningAgent/tree/main/lagent-v001) con 70% menos tokens, contando entrada y salida, y un costo 52% menor. La meta del arco se cumple. Lo que no esperaba estaba en el registro de las llamadas de resumen:

- **Los resúmenes pesan.** Las 33 llamadas de resumen suman 527516 tokens, el 36% de lo que gasta [v003](https://github.com/Tian-Farias/LearningAgent/tree/main/lagent-v003).
- **20 de esas 33 llamadas se cortaron en el tope**, incluso con el tope holgado y el segundo intento.
- **El modelo ignora el tamaño pedido en tokens.** Pedí menos de 2000, y desde la tercera compactación los resúmenes completos midieron entre 3000 y 4600.
- **El segundo intento acierta por azar.** Pide menos de 1000 tokens y devuelve entre 3000 y 4000, casi lo mismo que el primero. Funcionó en 6 de 13 casos.
- **El resumen llena el espacio que tiene.** Con el tope en 4000 tokens hubo 12 cortes. Cuando subió a 5000, los resúmenes crecieron y hubo 8 cortes más.
- **Se compacta muy seguido.** Un resumen del doble de lo previsto deja poco espacio libre, y la conversación necesitó una compactación cada 6 o 7 turnos.
- **La estimación local queda corta.** El proveedor cobró cerca de 1.5 veces los tokens que estima `litellm.token_counter`, y el umbral se compara contra esa estimación. La conversación real es más grande de lo que dice `compact_at_tokens`.

La lección de fondo: un modelo no sabe contar tokens mientras escribe, así que una instrucción en tokens no cambia lo que produce. Le pedí un tamaño en una unidad que no maneja y el resultado fue un resumen que crece hasta el borde de lo que le dejo. Subir el tope solo le dio más espacio para crecer.

## Lo que haría distinto

Veo dos caminos, y ninguno está probado todavía:

1. **Pedir el tamaño en algo que el modelo sí puede contar**, como un máximo de palabras o de viñetas por sección, y que el segundo intento pida la mitad de esas mismas unidades.
2. **Quitarle al resumen la obligación de guardar el detalle.** Si lo compactado queda en un archivo que el agente puede consultar, el resumen puede ser breve y dejar solo una referencia.

Dejé este capítulo simple, con el problema a la vista. El segundo camino se convirtió en una versión nueva de la hoja de ruta: v007, memoria consultable.

## Lo que todavía falta

El resumen reemplaza. Los mensajes resumidos ya no se pueden recuperar, ni siquiera del archivo, y si el modelo omite algo al resumir, ese dato se pierde sin aviso. En una conversación larga el resumen condensa lo más antiguo para hacer espacio, y ese detalle tampoco vuelve. Es la mecánica detrás de lo que conté en [El vibe coding no deja rastro](/posts/el-vibe-coding-no-deja-rastro/#lo-que-el-agente-olvidaba): en conversaciones largas, lo dicho al principio termina resumido, y un resumen pierde detalle. Cada compactación es al menos una llamada más al modelo, y un resumen rechazado se paga igual.

Con esto el **arco de la memoria** queda cerrado: el agente recuerda con un costo acotado. Pero todavía solo conversa, no puede hacer nada. El **arco 2, de chat a agente**, empieza con v004: herramientas y el bucle que las ejecuta.

## El repositorio

{% include embed/github.html repo='Tian-Farias/LearningAgent' description='Construcción de un agente de IA paso a paso' %}

---

> **Serie LearningAgent** · **Arco 1: memoria**, capítulo 3 de 3 \\
> ← **Anterior:** {% include post-link.html slug="learningagent-v002-ventana-de-memoria" text="v002, la ventana que olvida" %} \\
> → **Siguiente:** v004, herramientas y bucle (en preparación) \\
> [Repositorio en GitHub](https://github.com/Tian-Farias/LearningAgent)
{: .prompt-info }
