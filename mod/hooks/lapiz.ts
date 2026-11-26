// El ovillo del encabezado, dibujado a mano con caracteres: una esfera a lápiz
// con las vueltas adentro y la hebra que sale abajo a la izquierda. Cada
// renglón va de un color del degradé Sunset y la punta de la hebra en brasa.
// Tres cuadros: las vueltas respiran y la hebra se mece.
//
// Es texto plano porque la Terminal de Apple no muestra imágenes y Geist Mono
// solo trae nativos los bloques, las líneas de caja y el ASCII (el braille lo
// toma de otra fuente y sale a puntitos).

export type Celda = { ch: string; fg: number | null; bg: number | null }

export const SUNSET = [0xb0731c, 0xc4622a, 0xc24a35, 0xb03d55, 0x943a6c, 0x73397c]
export const BRASA = 0xc4702e

const CUADROS = [
  [
    '         .-~~~~-. ',
    "       ,'~.-~~-.~`.",
    '      /~(~.~~~.~)~\\',
    "      \\~(~`~~~'~)~/",
    "       `.~'-~~-'~,'",
    "╶────────`-~~~~-' ",
  ],
  [
    '         .-~~~~-. ',
    "       ,'~.-~~-.~`.",
    '      /~(-.~~~.-)~\\',
    "      \\~(~`~~~'~)~/",
    "       `.-'-~~-'-,'",
    "╶─────~──`-~~~~-' ",
  ],
  [
    '         .-~~~~-. ',
    "       ,'-.-~~-.-`.",
    '      /~(~.~~~.~)~\\',
    "      \\-(~`~~~'~)-/",
    "       `.~'-~~-'~,'",
    "╶───~────`-~~~~-' ",
  ],
]

export const COLUMNAS = CUADROS[0]![0]!.length
export const RENGLONES = CUADROS[0]!.length
export const PASO = 400 // ms entre cuadros

const HEBRA_HASTA = 9 // la hebra ocupa las columnas 0 a 8 del último renglón

export function celdas(t: number, quieto: boolean): Celda[][] {
  const k = quieto ? 0 : Math.floor(t / (PASO / 1000)) % CUADROS.length
  return CUADROS[k]!.map((linea, row) =>
    Array.from(linea, (ch, col) => {
      if (ch === ' ') return { ch, fg: null, bg: null }
      const hebra = row === RENGLONES - 1 && col < HEBRA_HASTA
      return { ch, fg: hebra ? BRASA : SUNSET[row]!, bg: null }
    }),
  )
}

export const aHex = (c: number) => `#${c.toString(16).padStart(6, '0')}`
