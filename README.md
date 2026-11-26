# Hilo

Hilo lee lo que escribís y lo convierte en algo. Corre en tu terminal sobre Claude Code, con casa propia:
una carpeta con su memoria, sus sesiones y sus skills. Se copia a otra Mac y sigue andando.

## Instalar

```
curl -fsSL https://raw.githubusercontent.com/marianlaz/hilo/main/install.sh | sh
```

Pregunta tu nombre y cómo querés llamarlo, instala Claude Code si falta, baja Hilo a `~/Desktop/hilo`
y arranca. La primera vez Claude pide iniciar sesión. Después, desde cualquier carpeta:

```
hilo
```

## La casa

```
ficha.json        quién sos vos y quién es él. La escribe el instalador
bin/hilo          lo arranca: su propia configuración, su memoria, su historial
plugins/hilo/     quién es: el agente y sus skills
mod/              cómo se ve: el ovillo en el encabezado, el tema Sunset, y preguntar antes de escribir afuera
mind/             su mente: CLAUDE.md, settings, sesiones, memoria, tus skills. Nace sola la primera vez
```

Lo que va a git es el producto: el instalador, el lanzador, el plugin y el mod. La casa queda en tu Mac.

## Qué sabe hacer

- `hilo-bienvenida`: la primera charla. Quién sos, qué escribís, dónde lo guardás.
- `hilo-escribir`: cuenta lo que pasó, con cita textual y recibo. Queda como borrador: vos verificás.
- `hilo-critical-thinking`: piensa y verifica antes de afirmar, proponer o preguntar.
- `hilo-simple`: piensa todo, dice lo justo. Pedile "la corta" o "la completa".

Lee sin preguntar. Para mandar, borrar o publicar afuera, siempre pregunta antes.

## Solo el mod, en tu Claude de siempre

```
claude plugin marketplace add marianlaz/hilo
claude plugin install hilo-mod@hilo
```
