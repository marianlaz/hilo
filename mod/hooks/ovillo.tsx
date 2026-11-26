import type { ClientModule } from 'claude-code'

import { dibujar, type Tramo } from './maraña'

// Corre en la terminal: redibuja la maraña cada 200 ms (el trazo hierve y las
// vueltas se mecen). Con "reducir movimiento" o sin foco en la ventana, quieto.

const PASO = 200
const BRASA = '#c4702e'

// Sunset: el cielo del atardecer de arriba abajo, dorado, brasa, coral, rosa,
// violeta. Elegidos para leerse sobre la terminal clara (3,4:1 o más sobre papel).
export const SUNSET = ['#b0731c', '#c4622a', '#c24a35', '#b03d55', '#943a6c', '#73397c', '#73397c']

type Estado = { tick: number }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function filas(lista: Tramo[][], Text: any) {
  return lista.map((fila, i) => (
    <Text key={`f${i}`} wrap="clip">
      {fila.map((tramo, j) =>
        tramo.tono === 'brasa' ? (
          <Text key={`t${j}`} color={BRASA}>{tramo.texto}</Text>
        ) : tramo.tono === 'tenue' ? (
          <Text key={`t${j}`} color={SUNSET[i]} dimColor>{tramo.texto}</Text>
        ) : (
          <Text key={`t${j}`} color={SUNSET[i]}>{tramo.texto}</Text>
        ),
      )}
    </Text>
  ))
}

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
      {filas(dibujar((tick * PASO) / 1000, surface.isMotionReduced), Text)}
    </Box>
  )
}

export default Ovillo
