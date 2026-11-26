import { expect, test } from 'claude-code/testing'

const permitir = () => ({ decision: 'allow' as const })

test('leer Notion pasa sin preguntar', async ($, on) => {
  on('tool.check', permitir)
  const r = await $.tool.check({ tool: 'mcp__claude_ai_Notion__notion-fetch', input: { id: 'x' } })
  expect(r.decision).toBe('allow')
})

test('mandar a Slack sin nadie que diga sí se frena', async ($, on) => {
  on('tool.check', permitir)
  const r = await $.tool.check({ tool: 'mcp__claude_ai_Slack__slack_send_message', input: {} })
  expect(r.decision).toBe('deny')
})

test('crear página en Notion sin nadie que diga sí se frena', async ($, on) => {
  on('tool.check', permitir)
  const r = await $.tool.check({ tool: 'mcp__claude_ai_Notion__notion-create-pages', input: {} })
  expect(r.decision).toBe('deny')
})

test('otras herramientas no las toca', async ($, on) => {
  on('tool.check', permitir)
  const r = await $.tool.check({ tool: 'Read', input: { file_path: '/tmp/x' } })
  expect(r.decision).toBe('allow')
})
