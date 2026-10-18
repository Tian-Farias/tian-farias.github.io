---
title: "¿Qué es un dato?"
author: Cristian Farias
description: Una pequeña reflexión sobre lo que es un dato, cómo entenderlo y sus tipos.
categories: [Datos]
tags: [Notas, Datos]
toc: true
comments: true
image:
  path: /assets/img/nota-que-es-un-dato-image.jpg
  alt: Una pequeña reflexión sobre lo que es un dato.
---

> Publicado originalmente en agosto de 2021. Revisado en octubre de 2026 para corregir errores; el contenido conserva su enfoque original.
{: .prompt-info }

Estas son notas que recopilé hace un tiempo cuando estaba participando en un curso de introducción al análisis de datos. Estas fueron anotaciones rápidas que me ayudaron a entender y desarrollar una intuición respecto a los temas que maneja el mundo de los datos, el cual es muy entretenido.

# ¿Qué es un dato?

Según mi experiencia, es una descripción concreta sobre hechos, elementos, sucesos y entidades que permite estudiarlos, analizarlos o conocerlos.

Creo que es importante resaltar que un dato por sí mismo no representa información; es el procesamiento o interpretación de esos datos lo que nos proporciona información.

![Procesamiento Datos](https://upload.wikimedia.org/wikipedia/commons/e/e6/ProcesamientoDatos.svg)

# ¿Cómo entender los datos?

Podemos entender los datos a través de tres formas simples:

1. **Desde el punto de vista de la programación**, en donde nos interesa la estructura específica de los datos y sus tipos para construir funciones y flujos que obtengan y procesen información.

2. **Desde el punto de vista estadístico**, que nos orienta hacia las leyes que los rigen, entender los procesos que sigue una variable al medir un evento y de esta forma establecer la estrategia analítica que nos permita obtener información de esos datos.

3. **Desde nuestro propio conocimiento**, en base a lo que sabemos buscamos extraer información importante de lo que esperamos medir en nuestras observaciones, y de esta forma generar alternativas que mejoren su desempeño.

Quiero insistir en que estas son notas rápidas y esto es un resumen, así que pueden existir infinitas formas de ver los datos; yo solo me limito a tres. Si encuentro más, voy haciendo la actualización.

# Tipos de datos

Básicamente y a grandes rasgos existen dos tipos de datos:

**Numéricos o cuantitativos**, que representan mediciones explícitas como la humedad o la temperatura. En este tipo de datos podemos encontrar:
  - **Datos discretos**, que pueden tomar solo ciertos valores, como la cantidad de participantes de una clase o el número de veces que se lanzó una moneda antes de que dé cara. Son valores finitos y que pueden contarse.
  - **Datos continuos**, que pueden tomar cualquier valor dentro de un rango, como la altura de una persona, que puede tomar cualquier valor entre 60 cm y 200 cm. La cantidad de opciones es infinita, por lo que la única forma de agruparlos es en intervalos, por ejemplo entre 60 cm y 90 cm, o entre 120 cm y 200 cm.

**Categóricos o cualitativos**, que no representan mediciones explícitas, como una pregunta de verdadero o falso o rangos de sueldo en una encuesta. Estos pueden ser:
  - **Datos ordinales**, en donde el orden importa pero el intervalo entre ellos carece de significado, como las notas o calificaciones de una prueba: sabemos que la calificación máxima es una A y que B es la siguiente menor, sin embargo, no podemos restar estas calificaciones y obtener algo útil.
  - **Datos nominales**, o sea, el orden no importa, como una encuesta de respuesta *sí/no/indeciso* o con respuestas codificadas: 1: sí, 2: no y 3: no me importa.

> No está de más indicar que si quieres colaborar en este documento, no dudes en [ponerte en contacto conmigo](https://www.linkedin.com/in/cristianfarias) para que vayamos mejorando el contenido. Se agradece si envían correcciones, puestas al día o incluso párrafos enteros. Esto es muy amable de su parte y es la forma correcta de hacer evolucionar esta guía y el código abierto en general.
{: .prompt-tip }
