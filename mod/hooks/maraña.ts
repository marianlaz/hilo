// El ovillo como en el dibujo de Mariano (25/11/2026): vueltas finas que se
// cruzan, sin cara, y la hebra que sale abajo a la izquierda con la punta en
// brasa. Se dibuja en braille (2 x 4 puntos por celda) con el algoritmo del
// MicroOrbe de la web: cada vuelta es una elipse inclinada, con bultos, que se
// mece a su ritmo; el trazo "hierve" porque cada cuadro cambia la semilla.

export type Tono = 'tinta' | 'tenue' | 'brasa'
export type Tramo = { texto: string; tono: Tono }

export const COLUMNAS = 18
export const RENGLONES = 7
const W = COLUMNAS * 2
const H = RENGLONES * 4

const BIT = [
  [0x01, 0x08],
  [0x02, 0x10],
  [0x04, 0x20],
  [0x40, 0x80],
]

const VUELTAS = Array.from({ length: 5 }, (_, i) => ({
  rot: (i / 5) * Math.PI + ((i * 7) % 5) * 0.11,
  inc: 0.3 + (((i * 37) % 10) / 10) * 1.3,
  sway: 0.25 + ((i * 13) % 7) / 18,
  ph: i * 1.7,
  k: 0.88 + ((i * 29) % 9) / 70,
  lump: ((i * 11) % 6) / 6,
}))

export function dibujar(t: number, quieto: boolean): Tramo[][] {
  let seed = quieto ? 7 : (Math.floor(t * 5) % 9973) + 1
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  const tono: (Tono | null)[] = new Array(W * H).fill(null)
  const fuerza: Record<Tono, number> = { tenue: 1, tinta: 2, brasa: 3 }
  const punto = (x: number, y: number, que: Tono) => {
    const px = Math.round(x)
    const py = Math.round(y)
    if (px < 0 || py < 0 || px >= W || py >= H) return
    const antes = tono[py * W + px]
    if (!antes || fuerza[que] > fuerza[antes]) tono[py * W + px] = que
  }

  const cx = W * 0.6
  const cy = H * 0.44
  const r = H * 0.4
  const s = quieto ? 0 : t

  for (const v of VUELTAS) {
    const inc = v.inc + Math.sin(s * 0.45 + v.ph) * v.sway
    const ry = Math.max(0.5, r * v.k * Math.abs(Math.cos(inc)))
    const frente = Math.cos(inc) > 0 ? 0 : Math.PI
    const n = 90
    for (let i = 0; i < n; i++) {
      const th = (i / n) * Math.PI * 2
      const bulto = 1 + 0.07 * Math.sin(th * 3 + v.lump * 6) + 0.04 * Math.sin(th * 5 + v.ph)
      const x = r * v.k * bulto * Math.cos(th)
      const y = ry * bulto * Math.sin(th)
      const px = cx + x * Math.cos(v.rot) - y * Math.sin(v.rot) + (rnd() - 0.5) * 0.35
      const py = cy + x * Math.sin(v.rot) + y * Math.cos(v.rot) + (rnd() - 0.5) * 0.35
      const adelante = ((th - frente + Math.PI * 2) % (Math.PI * 2)) < Math.PI
      if (adelante || rnd() < 0.3) punto(px, py, adelante ? 'tinta' : 'tenue')
    }
  }

  // contorno blando: no es un círculo perfecto
  const k1 = rnd() * 6
  for (let i = 0; i < 110; i++) {
    const th = (i / 110) * Math.PI * 2 * 0.8 + k1
    const rr = r * (1 + 0.06 * Math.sin(th * 2 + k1))
    punto(cx + rr * Math.cos(th) + (rnd() - 0.5) * 0.5, cy + rr * Math.sin(th) + (rnd() - 0.5) * 0.5, 'tinta')
  }

  // la hebra: sale a 2,25 rad y se va abajo a la izquierda; la punta, en brasa
  const a = 2.25
  const x0 = cx + r * Math.cos(a)
  const y0 = cy + r * Math.sin(a)
  const wig = Math.sin(s * 1.6) * 0.8
  for (let i = 0; i <= 60; i++) {
    const u = i / 60
    const x = x0 + (0.5 - x0) * u
    const y = y0 + (H - 1 - y0) * Math.sin(u * Math.PI * 0.5) + Math.sin(u * Math.PI * 2) * wig * u
    punto(x, y, u > 0.72 ? 'brasa' : 'tinta')
  }

  const filas: Tramo[][] = []
  for (let row = 0; row < RENGLONES; row++) {
    const fila: Tramo[] = []
    for (let col = 0; col < COLUMNAS; col++) {
      let bits = 0
      let celda: Tono | null = null
      for (let dy = 0; dy < 4; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          const que = tono[(row * 4 + dy) * W + col * 2 + dx]
          if (que) {
            bits |= BIT[dy]![dx]!
            if (!celda || fuerza[que] > fuerza[celda]) celda = que
          }
        }
      }
      const texto = bits ? String.fromCharCode(0x2800 + bits) : ' '
      const que = celda ?? 'tinta'
      const ultimo = fila[fila.length - 1]
      if (ultimo && ultimo.tono === que) ultimo.texto += texto
      else fila.push({ texto, tono: que })
    }
    filas.push(fila)
  }

  return filas
}
