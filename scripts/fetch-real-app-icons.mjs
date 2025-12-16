import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()

const DESTS = [
  path.join(ROOT, 'frontend', 'public', 'assets', 'apps-icons'),
  path.join(ROOT, 'public', 'assets', 'apps-icons')
]

/**
 * Sources:
 * - Apple: iTunes Lookup API -> artworkUrl512
 * - GitHub: use raw file paths via GitHub API contents endpoint
 * - Play Store: parse meta property="og:image"
 */
const ICON_SOURCES = {
  happ: {
    appleIds: ['6504287215', '6746188973'],
    playPackage: 'com.happproxy',
    github: { owner: 'Happ-proxy', repo: 'happ-android' }
  },
  stash: { appleIds: ['1596063349'] },
  streisand: { appleIds: ['6450534064'] },
  shadowrocket: { appleIds: ['932747118'] },
  'clash-mi': { appleIds: ['6744321968'] },

  // Android / Desktop open-source clients
  v2rayNG: { github: { owner: '2dust', repo: 'v2rayNG' } },
  'clash-meta': { github: { owner: 'MetaCubeX', repo: 'ClashMetaForAndroid' } },
  hiddify: { playPackage: 'com.vpn4tv.hiddify' },
  exclave: { github: { owner: 'dyhkwong', repo: 'Exclave' } },
  flclashx: { github: { owner: 'pluralplay', repo: 'FlClashX' } },
  'koala-clash': { github: { owner: 'coolcoala', repo: 'clash-verge-rev-lite' } },
  'prizrak-box': { github: { owner: 'legiz-ru', repo: 'Prizrak-Box' } },
  'clash-verge': { github: { owner: 'clash-verge-rev', repo: 'clash-verge-rev' } }
}

function ensureDirs() {
  for (const d of DESTS) fs.mkdirSync(d, { recursive: true })
}

async function fetchText(url, headers = {}) {
  const resp = await fetch(url, { headers })
  if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText} for ${url}`)
  return await resp.text()
}

async function fetchJson(url, headers = {}) {
  const resp = await fetch(url, { headers })
  if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText} for ${url}`)
  return await resp.json()
}

async function downloadToAll(url, fileName) {
  const resp = await fetch(url, {
    headers: {
      // some hosts require UA
      'User-Agent': 'subscription-page-icon-fetcher'
    }
  })
  if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText} for ${url}`)
  const buf = Buffer.from(await resp.arrayBuffer())

  for (const d of DESTS) {
    const out = path.join(d, fileName)
    fs.writeFileSync(out, buf)
  }
}

async function getAppleArtworkUrl(appleId) {
  // Use US store as default; if app is region-specific, other id in the list will work.
  const url = `https://itunes.apple.com/lookup?id=${encodeURIComponent(appleId)}&country=us`
  const data = await fetchJson(url)
  const result = data?.results?.[0]
  const art = result?.artworkUrl512 || result?.artworkUrl100
  if (!art) throw new Error(`No artworkUrl for Apple id ${appleId}`)
  // Prefer larger if possible (some responses include 512 already).
  return String(art).replace('100x100bb', '512x512bb')
}

async function getPlayStoreIconUrl(pkg) {
  const url = `https://play.google.com/store/apps/details?id=${encodeURIComponent(pkg)}&hl=en&gl=US`
  const html = await fetchText(url, {
    'User-Agent':
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  })

  const m = html.match(/property="og:image" content="([^"]+)"/)
  if (!m?.[1]) throw new Error(`Play Store og:image not found for ${pkg}`)
  return m[1]
}

async function getGithubIconUrl(owner, repo) {
  // Try common icon locations across Android/Tauri/Electron repos.
  const candidates = [
    // Root
    'icon.png',
    'logo.png',
    'logo/icon.png',
    'assets/icon.png',
    'assets/logo.png',
    'static/icon.png',
    'static/logo.png',

    // Android
    'app/src/main/ic_launcher-playstore.png',
    'app/src/main/ic_launcher.png',
    'app/src/main/res/mipmap-xxxhdpi/ic_launcher.png',
    'app/src/main/res/mipmap-xxhdpi/ic_launcher.png',
    'app/src/main/res/mipmap-xhdpi/ic_launcher.png',
    'app/src/main/res/mipmap-hdpi/ic_launcher.png',
    'app/src/main/res/mipmap-mdpi/ic_launcher.png',
    'app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml',

    // fastlane (Android)
    'fastlane/metadata/android/en-US/images/icon.png',
    'fastlane/metadata/android/en-US/images/featureGraphic.png',

    // Tauri
    'src-tauri/icons/icon.png',
    'src-tauri/icons/128x128.png',
    'src-tauri/icons/256x256.png',
    'src-tauri/icons/512x512.png',
    'src-tauri/icons/icon@2x.png',
    'src-tauri/icons/Square150x150Logo.png',
    'src-tauri/icons/Square310x310Logo.png',

    // v2rayNG historically had a top-level png in some forks
    'V2rayNG.png',
    'v2rayNG.png'
  ]

  const base = `https://api.github.com/repos/${owner}/${repo}/contents/`
  for (const rel of candidates) {
    try {
      const data = await fetchJson(base + rel, {
        'User-Agent': 'subscription-page-icon-fetcher',
        Accept: 'application/vnd.github+json'
      })
      if (data?.download_url) return data.download_url
    } catch {
      // try next
    }
  }

  // Fallback: scan repository tree and pick the best-looking icon file.
  const repoInfo = await fetchJson(`https://api.github.com/repos/${owner}/${repo}`, {
    'User-Agent': 'subscription-page-icon-fetcher',
    Accept: 'application/vnd.github+json'
  })
  const branch = repoInfo?.default_branch || 'main'
  const tree = await fetchJson(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
    {
      'User-Agent': 'subscription-page-icon-fetcher',
      Accept: 'application/vnd.github+json'
    }
  )

  const files = Array.isArray(tree?.tree) ? tree.tree.filter((t) => t.type === 'blob') : []

  const scorePath = (p) => {
    const s = p.toLowerCase()
    let score = 0
    if (s.includes('src-tauri/icons')) score += 60
    if (s.includes('/icons/')) score += 40
    if (s.includes('appicon') || s.includes('app_icon')) score += 40
    if (s.includes('ic_launcher')) score += 45
    if (s.includes('logo')) score += 25
    if (s.includes('icon')) score += 20
    if (s.includes('favicon')) score += 10

    // Prefer png over svg, then icns/ico
    if (s.endsWith('.png')) score += 30
    if (s.endsWith('.svg')) score += 18
    if (s.endsWith('.icns') || s.endsWith('.ico')) score += 8

    // Prefer larger sizes if encoded in file name
    for (const n of [1024, 512, 256, 128, 64]) {
      if (s.includes(String(n))) {
        score += Math.floor(n / 32)
        break
      }
    }

    // Penalize screenshots / banners
    if (s.includes('screenshot') || s.includes('screenshots') || s.includes('banner') || s.includes('featuregraphic')) {
      score -= 50
    }

    return score
  }

  const candidatesFromTree = files
    .map((f) => String(f.path))
    .filter((p) => /\.(png|svg|icns|ico)$/i.test(p))
    .sort((a, b) => scorePath(b) - scorePath(a))

  const best = candidatesFromTree[0]
  if (!best) {
    throw new Error(`No icon found in ${owner}/${repo} (tried ${candidates.length} candidates + tree scan)`)
  }

  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${best}`
}

async function fetchIconForApp(appId, source) {
  // Priority: Apple -> GitHub -> Play Store (best fidelity & stable)
  if (source.appleIds?.length) {
    for (const appleId of source.appleIds) {
      try {
        const url = await getAppleArtworkUrl(appleId)
        return { url, fileName: `${appId}.png`, note: `apple:${appleId}` }
      } catch {
        // try next id
      }
    }
  }

  if (source.github) {
    const url = await getGithubIconUrl(source.github.owner, source.github.repo)
    const ext = path.extname(new URL(url).pathname) || '.png'
    return {
      url,
      fileName: `${appId}${ext}`,
      note: `github:${source.github.owner}/${source.github.repo}`
    }
  }

  if (source.playPackage) {
    const url = await getPlayStoreIconUrl(source.playPackage)
    return { url, fileName: `${appId}.png`, note: `play:${source.playPackage}` }
  }

  throw new Error(`No sources configured for ${appId}`)
}

async function main() {
  ensureDirs()

  const results = []
  for (const [appId, source] of Object.entries(ICON_SOURCES)) {
    process.stdout.write(`- ${appId}: fetching... `)
    try {
      const { url, fileName, note } = await fetchIconForApp(appId, source)
      await downloadToAll(url, fileName)
      console.log(`OK (${note})`)
      results.push({ appId, fileName, note })
    } catch (e) {
      console.log(`FAIL`)
      console.error(`  ${appId}: ${e?.message || e}`)
      process.exitCode = 1
    }
  }

  if (process.exitCode) return

  const summaryPath = path.join(ROOT, 'scripts', 'fetch-real-app-icons.result.json')
  fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2))
  console.log(`\nSaved summary: ${summaryPath}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})


