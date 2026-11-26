import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'

import { filas } from './ovillo'
import { COLUMNAS, RENGLONES, celdas } from './lapiz'

// Conectores donde Mariano pidió preguntar siempre antes de mandar, borrar o publicar.
const CONECTORES = /^mcp__claude_ai_(Notion|Slack|Google_Drive|Gmail|Google_Calendar|Atlassian_Rovo)__/

// Lectura por el nombre, por si el servidor no marca la herramienta como de solo lectura.
const LECTURA = /(^|[_-])(fetch|search|read|get|list|query|view|download|suggest|authenticate)([_-]|$)/

// Sunset: el papel y la brasa de la web de Hilo, a la hora del atardecer.
// De día, papel durazno; de noche, el cielo cuando ya cayó el sol.
// Solo lo pintan la app de escritorio y el teléfono: la terminal no dibuja temas.
const { theme: SUNSET_COLORES } = makeColors({
  label: 'Sunset',
  roles: { accent: '#c4702e', danger: '#b8362b', success: '#4e7d3a', warning: '#c98a12', pro: '#7a4a8c' },
  light: {
    gray: {
      anchors: {
        'surface-0': '#f6e7d8',
        'surface-1': '#f9eee2',
        'surface-2': '#fcf5ec',
        'text-primary': '#2a1f1a',
        'text-secondary': '#57423a',
        'text-muted': '#6b5549',
      },
    },
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#1c1520',
        'surface-1': '#241b28',
        'surface-2': '#2c2230',
        'surface-3': '#332836',
        'text-primary': '#f6e8dc',
        'text-secondary': '#d9c4b6',
        'text-muted': '#b49e92',
      },
    },
  },
})
const SUNSET: ThemeSetArgs = { colors: SUNSET_COLORES }

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    try {
      const puesto = await $.theme.set(SUNSET)
      if (!puesto.isDrawn) {
        $.ui.log(`hilo-mod: Sunset no se pinta acá (${puesto.reason})`, { to: 'debug' })
      }
    } catch (error) {
      $.ui.log(`hilo-mod: Sunset no se pudo poner: ${String(error)}`, { to: 'debug' })
    }

    return next(e)
  })

  on('ui.render', { component: 'Welcome' }, ($, e, next) => {
    if (e.surface !== 'terminal') {
      return next(e)
    }
    const { Box, Text, Client } = $.ui.resolve(e)
    const p = e.props
    const lugar = [p.agent ? `@${p.agent}` : null, p.cwd || null].filter(Boolean).join(' · ')

    // En una copia del encabezado (/resume, un export) va quieto.
    const ovillo = p.isLive ? (
      <Client key="ovillo" module="./ovillo.tsx" props={null} width={COLUMNAS} height={RENGLONES} />
    ) : (
      <Box flexDirection="column">
        {filas(celdas(0, true), Text)}
      </Box>
    )

    return (
      <Box flexDirection="row" columnGap={2}>
        <Box flexDirection="column" width={COLUMNAS} flexShrink={0}>
          {ovillo}
        </Box>
        <Box flexDirection="column" flexShrink={1}>
          <Text wrap="truncate-end">
            <Text bold color="#c24a35">Hilo</Text>
            <Text dimColor>  Seguime.</Text>
          </Text>
          <Text dimColor wrap="truncate-end">Claude Code v{p.version} · {p.model} · {p.plan}</Text>
          {lugar ? <Text dimColor wrap="truncate-middle">{lugar}</Text> : null}
        </Box>
      </Box>
    )
  })

  on('tool.check', { tool: CONECTORES }, async ($, e, next) => {
    const nombre = e.tool.split('__').pop() ?? e.tool
    if (e.isReadOnly || LECTURA.test(nombre)) {
      return next(e)
    }
    if (!e.approver) {
      return { decision: 'deny', reason: `hilo-mod: ${nombre} escribe afuera y no hay nadie para decir que sí.` }
    }

    return { decision: 'ask', reason: `Hilo quiere usar ${nombre}: manda, borra o publica. ¿Sí?` }
  }).catch(() => ({ decision: 'deny', reason: 'hilo-mod: falló el control de escritura, así que no se ejecuta.' }))
}
