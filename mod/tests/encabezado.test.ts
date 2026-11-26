import { expect, test } from 'claude-code/testing'
import { COLUMNAS, RENGLONES, celdas } from '../hooks/emoji'

const PROPS = { version: '2.1.332', model: 'Opus 5.5', plan: 'Claude Ultra', cwd: '~/Documents/hilo', agent: 'hilo:hilo' }

test('el encabezado se dibuja con el ovillo vivo', async $ => {
  const ui = await $.ui.mount({ plugin: 'hilo-mod', surface: 'terminal', component: 'Welcome', props: { ...PROPS, isLive: true } })
  expect(await ui.find({ type: 'Client' })).toBeDefined()
  await ui.unmount()
})

test('una copia del encabezado va quieta', async $ => {
  const ui = await $.ui.mount({ plugin: 'hilo-mod', surface: 'terminal', component: 'Welcome', props: { ...PROPS, isLive: false } })
  expect(await ui.find({ type: 'Client' })).toBeUndefined()
  await ui.unmount()
})

test('el sticker tiene su tamaño, es naranja y quieto es siempre igual', () => {
  const filas = celdas(0, true)
  expect(filas.length).toBe(RENGLONES)
  for (const fila of filas) expect(fila.length).toBe(COLUMNAS)
  const naranja = (c: number | null) => c !== null && (c >> 16) > 150 && ((c >> 8) & 255) < 150 && (c & 255) < 100
  expect(filas.flat().some(c => naranja(c.fg) || naranja(c.bg))).toBe(true)
  expect(JSON.stringify(celdas(5, true))).toBe(JSON.stringify(filas))
  expect(JSON.stringify(celdas(1.2, false))).not.toBe(JSON.stringify(celdas(1.4, false)))
})
