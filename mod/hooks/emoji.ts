// El ovillo del encabezado: el 🧶 de Apple como sticker en píxeles. Cada
// celda de la terminal son dos píxeles apilados (medios bloques ▀ ▄) con
// color de 24 bits, así se ve en cualquier terminal con truecolor, incluso
// donde no hay protocolo de imágenes (la Terminal de Apple). Los cuadros
// vienen precalculados de emoji-cuadros.ts: un ciclo de flote con
// desplazamiento subpíxel. Para otro tamaño o proporción se regeneran.

import { COLUMNAS, CUADROS, GLIFOS, PALETA, RENGLONES } from './emoji-cuadros'

export { COLUMNAS, RENGLONES }
export type Celda = { ch: string; fg: number | null; bg: number | null }

export const PASO = 200 // ms entre cuadros

export function celdas(t: number, quieto: boolean): Celda[][] {
  const k = quieto ? 0 : Math.floor(t / (PASO / 1000)) % CUADROS.length
  const f = CUADROS[k]!
  const filas: Celda[][] = []
  for (let row = 0; row < RENGLONES; row++) {
    const fila: Celda[] = []
    for (let col = 0; col < COLUMNAS; col++) {
      const i = (row * COLUMNAS + col) * 3
      const fg = f[i + 1]!
      const bg = f[i + 2]!
      fila.push({ ch: GLIFOS[f[i]!]!, fg: fg ? PALETA[fg - 1]! : null, bg: bg ? PALETA[bg - 1]! : null })
    }
    filas.push(fila)
  }
  return filas
}

export const aHex = (c: number) => `#${c.toString(16).padStart(6, '0')}`
