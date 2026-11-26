import type { ClientModule } from 'claude-code'

import { PASO, aHex, celdas, type Celda } from './emoji'

// Corre en la terminal: pasa al cuadro siguiente cada PASO ms (el ovillo
// flota). Con "reducir movimiento" o sin foco en la ventana, quieto.

// Cada fila de celdas, en tramos: celdas vecinas con el mismo frente y fondo
// van en un solo Text.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function filas(lista: Celda[][], Text: any) {
  return lista.map((fila, i) => {
    const tramos: { texto: string; fg: number | null; bg: number | null }[] = []
    for (const c of fila) {
      const ultimo = tramos[tramos.length - 1]
      if (ultimo && ultimo.fg === c.fg && ultimo.bg === c.bg) ultimo.texto += c.ch
      else tramos.push({ texto: c.ch, fg: c.fg, bg: c.bg })
    }
    return (
      <Text key={`f${i}`} wrap="clip">
        {tramos.map((t, j) => (
          <Text
            key={`t${j}`}
            color={t.fg === null ? undefined : aHex(t.fg)}
            backgroundColor={t.bg === null ? undefined : aHex(t.bg)}
          >
            {t.texto}
          </Text>
        ))}
      </Text>
    )
  })
}

type Estado = { tick: number }

const Ovillo: ClientModule<null, Estado> = (_props, surface) => {
  const { Box, Text } = surface.elements
  if (surface.state === undefined) {
    surface.every(PASO, () => {
      if (surface.isWindowFocused && !surface.isMotionReduced) {
        surface.setState({ tick: (surface.state?.tick ?? 0) + 1 })
      }
    })
    surface.setState({ tick: 1 })
  }
  const tick = surface.state?.tick ?? 1

  return (
    <Box flexDirection="column">
      {filas(celdas((tick * PASO) / 1000, surface.isMotionReduced), Text)}
    </Box>
  )
}

export default Ovillo
