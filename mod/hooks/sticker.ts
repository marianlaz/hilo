// El ovillo como sticker: un disco de papel con tres vueltas de lana en tinta
// y la hebra que sale abajo a la izquierda con la punta en brasa (los colores
// de la marca). Se dibuja en píxeles, no en braille: cada celda de la terminal
// son dos píxeles apilados (medios bloques ▀ ▄) con color de 24 bits, y cada
// píxel se calcula con supermuestreo, así los trazos salen suaves aunque el
// sticker sea chico. La hebra lleva un borde de papel alrededor de la tinta
// para verse tanto en una terminal clara como en una oscura: el mod no sabe
// cuál es (el tema es "auto").

export type Celda = { ch: string; fg: number | null; bg: number | null }

export const COLUMNAS = 20
export const RENGLONES = 7
const W = COLUMNAS
const H = RENGLONES * 2

export const PAPEL: RGB = [0xf3, 0xed, 0xe3]
export const TINTA: RGB = [0x2a, 0x24, 0x1d]
export const BRASA: RGB = [0xc4, 0x70, 0x2e]

type RGB = [number, number, number]
type Punto = [number, number]
type Trazo = { pts: Punto[]; w: number; a: number; col: RGB; clip?: boolean }

const SS = 5 // subsamples por lado de cada píxel

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

// La escena en el tiempo t (segundos): dónde está el disco y qué trazos lleva.
function escena(t: number, quieto: boolean) {
  const s = quieto ? 0 : t
  const cx = W * 0.62
  const r = 5.6
  // flota apenas, como en la web
  const cy = H * 0.46 + (quieto ? 0 : Math.sin(s * 2.4) * r * 0.05)
  const trazos: Trazo[] = []

  // vueltas de lana como en el 🧶: arcos paralelos desplazados, dos en una
  // diagonal y uno en la otra, recortados al disco. Se corren despacio, como
  // si el ovillo rodara apenas.
  const RB = r * 1.35
  const FAMILIAS: [number, number[]][] = [
    [-0.75, [-0.42, 0.38]],
    [0.85, [0.05]],
  ]
  FAMILIAS.forEach(([phi, offs], f) => {
    const nx = -Math.sin(phi)
    const ny = Math.cos(phi)
    offs.forEach((o, k) => {
      const ok = r * o + Math.sin(s * 0.5 + f * 1.7 + k * 2.1) * r * 0.07
      const kx = cx + nx * (ok + RB)
      const ky = cy + ny * (ok + RB)
      const base = Math.atan2(cy - ky, cx - kx)
      const pts: Punto[] = []
      for (let j = 0; j <= 24; j++) {
        const a = base + (j / 24 - 0.5) * 2.2
        pts.push([kx + RB * Math.cos(a), ky + RB * Math.sin(a)])
      }
      trazos.push({ pts, w: 0.46, a: 0.62, col: TINTA, clip: true })
    })
  })

  // contorno blando: da una vuelta y un poco más, no es un círculo perfecto
  const ol: Punto[] = []
  for (let j = 0; j <= 72; j++) {
    const th = (j / 72) * Math.PI * 2.05
    const rr = r * (1 + 0.04 * Math.sin(th * 3 + 1))
    ol.push([cx + rr * Math.cos(th), cy + rr * Math.sin(th)])
  }
  trazos.push({ pts: ol, w: 0.65, a: 0.95, col: TINTA })

  // la hebra: sale a 2,25 rad y baja a la izquierda con vaivén; la punta en brasa
  const ex = cx + r * Math.cos(2.25)
  const ey = cy + r * Math.sin(2.25)
  const wg = quieto ? 0 : Math.sin(s * 2) * 0.6
  const mx = ex - r * 0.55
  const my = ey + r * 0.95 + wg
  const bx = 0.7
  const by = H - 0.9
  const hebra: Punto[] = []
  for (let j = 0; j <= 30; j++) {
    const u = j / 30
    const m = 1 - u
    hebra.push([m * m * ex + 2 * m * u * mx + u * u * bx, m * m * ey + 2 * m * u * my + u * u * by])
  }
  trazos.push({ pts: hebra, w: 0.95, a: 1, col: PAPEL })
  trazos.push({ pts: hebra.slice(0, 20), w: 0.45, a: 0.9, col: TINTA })
  trazos.push({ pts: hebra.slice(19), w: 0.7, a: 1, col: BRASA })

  return { cx, cy, r, trazos }
}

// Los píxeles del sticker, W x H, cada uno [r, g, b, cobertura 0..1].
export function pixeles(t: number, quieto: boolean): [number, number, number, number][] {
  const { cx, cy, r, trazos } = escena(t, quieto)
  const out: [number, number, number, number][] = []
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let R = 0
      let G = 0
      let B = 0
      let A = 0
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = x + (sx + 0.5) / SS
          const py = y + (sy + 0.5) / SS
          const d = Math.hypot(px - cx, py - cy)
          // fondo: papel adentro del disco, nada afuera
          let cr = 0
          let cg = 0
          let cb = 0
          let ca = 0
          if (d <= r + 0.3) {
            cr = PAPEL[0]
            cg = PAPEL[1]
            cb = PAPEL[2]
            ca = 1
          }
          for (const tr of trazos) {
            if (tr.clip && d > r * 0.97) continue
            if (distPoly(px, py, tr.pts) > tr.w) continue
            const a = tr.a
            const na = a + ca * (1 - a)
            cr = (cr * ca * (1 - a) + tr.col[0] * a) / na
            cg = (cg * ca * (1 - a) + tr.col[1] * a) / na
            cb = (cb * ca * (1 - a) + tr.col[2] * a) / na
            ca = na
          }
          R += cr * ca
          G += cg * ca
          B += cb * ca
          A += ca
        }
      }
      out.push(A === 0 ? [0, 0, 0, 0] : [R / A, G / A, B / A, A / (SS * SS)])
    }
  }
  return out
}

const hex = (p: number[]) => (Math.round(p[0]!) << 16) | (Math.round(p[1]!) << 8) | Math.round(p[2]!)

// Un píxel medio transparente sobre un fondo que no conocemos: se muestra si
// cubre más de la mitad, y si no queda vacío. Así no inventamos un fondo.
const visible = (p: number[]) => p[3]! >= 0.45

// Las celdas de la terminal: RENGLONES filas de COLUMNAS celdas, cada una un
// medio bloque con su color de frente y de fondo (null es el de la terminal).
export function celdas(t: number, quieto: boolean): Celda[][] {
  const px = pixeles(t, quieto)
  const filas: Celda[][] = []
  for (let row = 0; row < RENGLONES; row++) {
    const fila: Celda[] = []
    for (let col = 0; col < COLUMNAS; col++) {
      const arriba = px[row * 2 * W + col]!
      const abajo = px[(row * 2 + 1) * W + col]!
      const va = visible(arriba)
      const vb = visible(abajo)
      if (va && vb) fila.push({ ch: '▀', fg: hex(arriba), bg: hex(abajo) })
      else if (va) fila.push({ ch: '▀', fg: hex(arriba), bg: null })
      else if (vb) fila.push({ ch: '▄', fg: hex(abajo), bg: null })
      else fila.push({ ch: ' ', fg: null, bg: null })
    }
    filas.push(fila)
  }
  return filas
}

export const aHex = (c: number) => `#${c.toString(16).padStart(6, '0')}`
