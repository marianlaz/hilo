// El ovillo del encabezado, a lápiz: el de la marca. Unas pocas vueltas finas
// que dejan el centro vacío, y la hebra que cae a la izquierda con la punta en
// brasa. Se dibuja en braille (2 x 4 puntos por celda) porque las líneas
// finas no salen con medios bloques. La tinta es el color de texto de la
// terminal, atenuado, así anda en tema claro y oscuro; la brasa es la de la
// marca. Cada punto es ALTO veces más alto que ancho (celda 1:2,4).

export type Celda = { ch: string; fg: number | null; bg: number | null }

export const COLUMNAS = 16
export const RENGLONES = 5
export const ALTO = 1.2
export const BRASA = 0xc4702e

const W = COLUMNAS * 2
const H = RENGLONES * 4
const SS = 4

type Punto = [number, number]
type Trazo = { pts: Punto[]; w: number; brasa?: boolean }

function distSeg(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax
  const dy = by - ay
  const l2 = dx * dx + dy * dy || 1e-9
  const u = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2))
  return Math.hypot(px - (ax + dx * u), py - (ay + dy * u))
}
function distPoly(px: number, py: number, pts: Punto[]) {
  let d = Infinity
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1]!
    const [bx, by] = pts[i]!
    const dd = distSeg(px, py, ax, ay, bx, by)
    if (dd < d) d = dd
  }
  return d
}

// La escena en el tiempo t (segundos), en unidades de ancho de punto.
function escena(t: number, quieto: boolean): Trazo[] {
  const s = quieto ? 0 : t
  const r = 8.4
  const cx = W - r - 1.2
  const cy = r + 0.6 + (quieto ? 0 : Math.sin(s * 2.4) * 0.25)
  const trazos: Trazo[] = []

  // vueltas: elipses inclinadas, la primera casi un círculo (el contorno)
  const VUELTAS: [number, number, number][] = [
    // [rotación, apertura, fase]
    [0.3, 0.97, 0],
    [-0.6, 0.5, 1.7],
    [1.0, 0.36, 3.4],
  ]
  VUELTAS.forEach(([rot0, ap, ph]) => {
    const rot = rot0 + (quieto ? 0 : Math.sin(s * 0.3 + ph) * 0.12)
    const ry = r * ap
    const pts: Punto[] = []
    for (let j = 0; j <= 48; j++) {
      const th = (j / 48) * Math.PI * 2
      const px = r * Math.cos(th)
      const py = ry * Math.sin(th)
      pts.push([cx + px * Math.cos(rot) - py * Math.sin(rot), cy + px * Math.sin(rot) + py * Math.cos(rot)])
    }
    trazos.push({ pts, w: 0.34 })
  })

  // la hebra: sale abajo a la izquierda del ovillo y cae hasta el borde
  const ex = cx + r * Math.cos(2.35)
  const ey = cy + r * Math.sin(2.35)
  const wg = quieto ? 0 : Math.sin(s * 2) * 0.5
  const mx = ex - 3
  const my = ey + 6 + wg
  const bx = 0.8
  const by = H * ALTO - 1.2
  const hebra: Punto[] = []
  for (let j = 0; j <= 30; j++) {
    const u = j / 30
    const m = 1 - u
    hebra.push([m * m * ex + 2 * m * u * mx + u * u * bx, m * m * ey + 2 * m * u * my + u * u * by])
  }
  trazos.push({ pts: hebra.slice(0, 22), w: 0.34 })
  trazos.push({ pts: hebra.slice(21), w: 0.5, brasa: true })
  return trazos
}

// Los puntos del lienzo: 0 nada, 1 tinta, 2 brasa.
export function puntos(t: number, quieto: boolean): Uint8Array {
  const trazos = escena(t, quieto)
  const out = new Uint8Array(W * H)
  const n = SS * SS
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let tinta = 0
      let brasa = 0
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = x + (sx + 0.5) / SS
          const py = (y + (sy + 0.5) / SS) * ALTO
          for (const tr of trazos) {
            if (distPoly(px, py, tr.pts) <= tr.w) {
              if (tr.brasa) brasa++
              else tinta++
              break
            }
          }
        }
      }
      out[y * W + x] = brasa >= n * 0.25 ? 2 : tinta >= n * 0.35 ? 1 : 0
    }
  }
  return out
}

// bit de cada punto de la celda braille: columnas 0 y 1, filas 0 a 3
const BITS = [
  [0x01, 0x08],
  [0x02, 0x10],
  [0x04, 0x20],
  [0x40, 0x80],
]

export function celdas(t: number, quieto: boolean): Celda[][] {
  const p = puntos(t, quieto)
  const filas: Celda[][] = []
  for (let row = 0; row < RENGLONES; row++) {
    const fila: Celda[] = []
    for (let col = 0; col < COLUMNAS; col++) {
      let bits = 0
      let brasa = 0
      let tinta = 0
      for (let dy = 0; dy < 4; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          const v = p[(row * 4 + dy) * W + col * 2 + dx]!
          if (!v) continue
          bits |= BITS[dy]![dx]!
          if (v === 2) brasa++
          else tinta++
        }
      }
      if (!bits) fila.push({ ch: ' ', fg: null, bg: null })
      else fila.push({ ch: String.fromCharCode(0x2800 + bits), fg: brasa > tinta ? BRASA : null, bg: null })
    }
    filas.push(fila)
  }
  return filas
}

export const aHex = (c: number) => `#${c.toString(16).padStart(6, '0')}`
