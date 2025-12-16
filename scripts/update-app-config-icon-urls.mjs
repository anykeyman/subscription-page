import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const ICONS_DIR = path.join(ROOT, 'frontend', 'public', 'assets', 'apps-icons')

const CONFIG_PATHS = [
  path.join(ROOT, 'frontend', 'public', 'assets', 'app-config.json'),
  path.join(ROOT, 'public', 'assets', 'app-config.json')
]

const IDS = [
  'clash-meta',
  'clash-mi',
  'clash-verge',
  'exclave',
  'flclashx',
  'happ',
  'hiddify',
  'koala-clash',
  'prizrak-box',
  'shadowrocket',
  'stash',
  'streisand',
  'v2rayNG'
]

function resolveIconUrl(id) {
  const exts = ['.png', '.svg', '.ico', '.icns']
  for (const ext of exts) {
    const p = path.join(ICONS_DIR, `${id}${ext}`)
    if (fs.existsSync(p)) return `/assets/apps-icons/${id}${ext}`
  }
  return null
}

function updateConfig(obj) {
  // Supports both formats:
  // - { config, platforms: { ios: [], ... } }
  // - { ios: [], android: [], pc: [] } (legacy)
  const platforms = obj.platforms || obj

  for (const key of Object.keys(platforms)) {
    const list = platforms[key]
    if (!Array.isArray(list)) continue
    platforms[key] = list.map((app) => {
      if (!app?.id) return app
      if (!IDS.includes(app.id)) return app
      const iconUrl = resolveIconUrl(app.id)
      if (!iconUrl) return app
      return { ...app, iconUrl }
    })
  }

  if (obj.platforms) obj.platforms = platforms
  return obj
}

for (const p of CONFIG_PATHS) {
  const raw = fs.readFileSync(p, 'utf8')
  const json = JSON.parse(raw)
  const updated = updateConfig(json)
  fs.writeFileSync(p, JSON.stringify(updated, null, 4) + '\n')
  console.log(`Updated iconUrl in: ${p}`)
}


