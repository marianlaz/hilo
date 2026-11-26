import { expect, test } from 'claude-code/testing'
import { COLUMNAS, RENGLONES, dibujar } from '../hooks/maraña'

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

test('la maraña tiene su tamaño, la punta en brasa y quieta es siempre igual', () => {
  const filas = dibujar(0, true)
  expect(filas.length).toBe(RENGLONES)
  for (const fila of filas) expect(fila.map(x => x.texto).join('').length).toBe(COLUMNAS)
  expect(filas.flat().some(x => x.tono === 'brasa')).toBe(true)
  expect(JSON.stringify(dibujar(5, true))).toBe(JSON.stringify(filas))
  expect(JSON.stringify(dibujar(1.2, false))).not.toBe(JSON.stringify(dibujar(1.4, false)))
})
