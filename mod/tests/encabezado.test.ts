import { expect, test } from 'claude-code/testing'
import { BRASA, COLUMNAS, RENGLONES, SUNSET, celdas } from '../hooks/lapiz'

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

test('el ovillo tiene su tamaño, la punta en brasa y quieto es siempre igual', () => {
  const filas = celdas(0, true)
  expect(filas.length).toBe(RENGLONES)
  for (const fila of filas) expect(fila.length).toBe(COLUMNAS)
  expect(filas.flat().some(c => c.fg === BRASA)).toBe(true)
  expect(filas.flat().some(c => c.fg === SUNSET[0])).toBe(true)
  expect(JSON.stringify(celdas(5, true))).toBe(JSON.stringify(filas))
  expect(JSON.stringify(celdas(1.2, false))).not.toBe(JSON.stringify(celdas(1.4, false)))
})
