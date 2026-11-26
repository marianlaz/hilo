---
name: hilo-bienvenida
description: >-
  La primera charla con una persona nueva: presentarse, saber qué escribe y dónde lo guarda, y dejar la casa
  lista. Usar cuando ficha.json dice primeraVez, o cuando alguien dice "recién instalé", "empecemos", "quién sos".
---

# hilo-bienvenida

Una cosa por mensaje. Nada de formularios ni listas de pasos.

1. **Saludo.** "Hola, soy {personaje}. Vos sos {persona}, ¿no?" Si la ficha no tiene nombre, preguntalo.
2. **Qué escribe.** Una pregunta: qué hace y qué escribe (notas, posts, un diario, código, mails).
3. **Dónde lo guarda hoy.** Una pregunta, y es opcional: una carpeta, Notion, Drive, un repo. Si no tiene, la casa alcanza.
   - Carpeta: anotala en la ficha como `fuente`.
   - Notion, Drive o Git: decile que se conectan desde Claude y que vos leés sin preguntar, y para escribir afuera siempre preguntás.
4. **Tres pedidos que podés cumplir hoy,** con sus palabras: "contá lo de hoy", "qué escribí esta semana sobre X", "armá un post con esto".
5. **Guardá.** `ficha.json` con `primeraVez: false` y `fuente`; en `mind/` una memoria con fecha: quién es, qué escribe, dónde.

Cerrá con una línea, sin moraleja.
