// Run after npm run build. Uses the bundled browser runtime; no account or network needed.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { pathToFileURL } = require('node:url')
const { chromium } = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'))

async function main() {
  const root = path.resolve(__dirname, '..')
  const output = path.resolve(process.argv[2] || path.join(root, 'output/playwright'))
  fs.mkdirSync(output, { recursive: true })
  const { createSeededRng, shuffleWithSeed } = await import(pathToFileURL(path.join(root, 'src/utils/studentSeed.js')))
  const { generateBalancedQuestions } = await import(pathToFileURL(path.join(root, 'src/utils/balancedForcesGenerator.js')))
  const scenarios = JSON.parse(fs.readFileSync(path.join(root, 'src/data/fbdScenarios.json')))
  const source = fs.readFileSync(path.join(root, 'src/components/SolveItModule.jsx'), 'utf8')
  const generatorSource = source.slice(source.indexOf('function generateProblemInstance'), source.indexOf('export default function'))
  const generate = new Function('createSeededRng', `${generatorSource}; return generateProblemInstance`)(createSeededRng)
  const seed = 12345
  const balanced = Object.fromEntries(['Apprentice', 'Master', 'Wizard'].flatMap(l => generateBalancedQuestions(l, seed).map(q => [q.id, true])))
  const fbdAnswers = Object.fromEntries(scenarios.map(q => [q.id, {
    forces: Object.fromEntries(Object.entries(q.vectors).map(([dir, f]) => [dir, f.code])),
    strengths: Object.fromEntries(Object.entries(q.vectors).map(([dir, f]) => [dir, f.magnitude === 2 ? 'strong' : 'standard'])),
  }]))
  const solveAnswers = Object.fromEntries(Array.from({ length: 8 }, (_, i) => [i + 1, { inputs: generate(i + 1, seed).target }]))
  const user = { uid: 'motion_review', displayName: 'Motion Review', isDemo: true }
  const storage = {
    physix_demo_google_session: user, physix_cached_auth_user: user,
    physix_google_motion_review_progress: { balanced, fbd: {}, solveit: {} },
    physix_student_seed_motion_review: seed,
    physix_balanced_completed: balanced,
    physix_fbd_answers: fbdAnswers, physix_solveit_answers: solveAnswers,
  }
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', e => errors.push(e.message))
    // Fulfil requests directly from dist: exercises the actual production bundle offline.
    await page.route('**/*', async route => {
      const url = new URL(route.request().url())
      if (url.hostname !== 'motion.test') return route.abort()
      const file = path.join(root, 'dist', url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname))
      const contentType = file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : file.endsWith('.html') ? 'text/html' : undefined
      await route.fulfill({ path: file, contentType })
    })
    await page.addInitScript(items => {
      for (const [key, value] of Object.entries(items)) localStorage.setItem(key, JSON.stringify(value))
    }, storage)
    await page.goto('http://motion.test/')
    const model = page.locator('.motion-model')
    await model.waitFor()
    // Exclude the site's sticky global header from isolated component captures.
    const capture = name => model.screenshot({ path: path.join(output, name), style: 'body > #root header { visibility: hidden !important; }' })
    const scrub = async value => {
      const slider = model.getByRole('slider', { name: 'Scrub motion timeline' })
      await slider.evaluate((el, v) => { el.value = String(Math.min(v, Number(el.max) - Number(el.step))) }, value)
      await slider.press('ArrowRight')
    }
    await scrub(1)
    await capture('balanced-desktop.png')
    assert.ok(Number(await model.getByRole('slider').inputValue()) > 1)
    await model.getByRole('button', { name: 'Reset motion to the beginning' }).click()
    assert.equal(await model.getByRole('slider').inputValue(), '0')
    await model.getByRole('button', { name: 'Play', exact: true }).click()
    await page.waitForTimeout(250)
    await model.getByRole('button', { name: 'Pause', exact: true }).click()
    const paused = await model.getByRole('slider').inputValue()
    await page.waitForTimeout(150)
    assert.equal(await model.getByRole('slider').inputValue(), paused)
    await model.getByRole('button', { name: '2 times playback speed' }).click()
    assert.equal(await model.getByRole('button', { name: '2 times playback speed' }).getAttribute('aria-pressed'), 'true')
    await model.getByRole('button', { name: 'Forces', exact: true }).click()
    await scrub(100)
    await model.getByRole('button', { name: 'Replay', exact: true }).click()
    await model.getByRole('button', { name: 'Pause', exact: true }).click()
    assert.ok(Number(await model.getByRole('slider').inputValue()) < 1, 'Replay restarts the clock')
    assert.equal(await model.getByRole('button', { name: 'Forces', exact: true }).getAttribute('aria-pressed'), 'false')
    await model.getByRole('button', { name: 'Forces', exact: true }).click()
    await page.getByRole('tab', { name: 'Free-body diagrams' }).click()
    await model.waitFor()
    const ordered = shuffleWithSeed(scenarios, seed + 404)
    for (let i = 0; i < ordered.length; i++) {
      await page.getByRole('button', { name: `#${i + 1}: ${ordered[i].objectContext}`, exact: true }).click()
      await model.waitFor()
      assert.equal(await model.getByRole('slider').inputValue(), '0', 'Changing scenarios resets playback')
      if (ordered[i].id === 3) {
        // Car skidding to a stop - Braking run verification
        assert.ok(await model.getByRole('button', { name: '0.25 times playback speed' }).count() === 1, 'Braking must offer 0.25x')
        assert.ok(await model.getByRole('button', { name: '0.5 times playback speed' }).count() === 1, 'Braking must offer 0.5x')
        assert.ok(await model.getByRole('button', { name: '1 times playback speed' }).count() === 1, 'Braking must offer 1x')
        assert.ok(await model.getByRole('button', { name: '2 times playback speed' }).count() === 0, 'Braking must not offer 2x')
        assert.equal(await model.getByRole('button', { name: '0.5 times playback speed' }).getAttribute('aria-pressed'), 'true', 'Default braking speed is 0.5x')

        // Test arrow-label clearance during active braking
        await scrub(0.2)
        const clearance = await model.evaluate(() => {
          const texts = Array.from(document.querySelectorAll('text'))
          const accLabel = texts.find(t => t.textContent === 'acceleration')
          const accLine = document.querySelector('line[marker-end*="acceleration"]')
          if (!accLabel || !accLine) return null
          const lRect = accLabel.getBoundingClientRect()
          const aRect = accLine.getBoundingClientRect()
          return aRect.left - lRect.right
        })
        if (clearance !== null) {
          assert.ok(clearance >= 15, `Arrow clearance (${clearance}px) must be at least 15px`)
        }

        // Test completion at rest
        await scrub(100)
        assert.ok((await model.locator('.motion-badge').innerText()).includes('At rest'), 'Status badge must show At rest')
        assert.ok((await model.innerText()).includes('0.00 m/s'), 'Velocity display must be 0.00 m/s')
        const observation = await model.locator('.motion-observation').innerText()
        assert.ok(observation.includes('Run complete. At rest.'), 'Observation must indicate run complete at rest')
        assert.ok(observation.includes('This braking run ends when the object comes to rest.'), 'Observation must explain braking termination')
        await capture('braking-rest-desktop.png')
        await page.setViewportSize({ width: 375, height: 900 })
        await capture('braking-rest-mobile.png')
        assert.ok(await model.evaluate(el => el.scrollWidth <= el.clientWidth + 1))
        await page.setViewportSize({ width: 1440, height: 1100 })
      }
      if (ordered[i].id === 4) {
        await scrub(1)
        assert.ok((await model.innerText()).includes('Projectile motion'))
        await capture('projectile-desktop.png')
      }
      if (ordered[i].id === 5) {
        await scrub(3)
        await capture('vertical-desktop.png')
        await page.setViewportSize({ width: 375, height: 900 })
        await capture('vertical-mobile.png')
        assert.ok(await model.evaluate(el => el.scrollWidth <= el.clientWidth + 1))
        await page.setViewportSize({ width: 1440, height: 1100 })
      }
    }
    await page.getByRole('tab', { name: 'Solve it!', exact: false }).click()
    await model.waitFor()
    for (const level of ['Apprentice', 'Master', 'Wizard']) {
      await page.getByRole('button', { name: level, exact: true }).click()
      const ids = level === 'Apprentice' ? [1, 2] : level === 'Master' ? [3, 4, 5] : [6, 7, 8]
      for (const id of ids) {
        await page.getByRole('button', { name: `Problem ${id}`, exact: true }).click()
        await model.waitFor()
        if (id <= 2) {
          // Problems 1 & 2 are braking: [0.25, 0.5, 1], default 0.5
          assert.ok(await model.getByRole('button', { name: '0.25 times playback speed' }).count() === 1)
          assert.equal(await model.getByRole('button', { name: '0.5 times playback speed' }).getAttribute('aria-pressed'), 'true')
        } else {
          // Problems 3-8 are non-braking: [0.5, 1, 2], default 1
          assert.ok(await model.getByRole('button', { name: '2 times playback speed' }).count() === 1)
          assert.equal(await model.getByRole('button', { name: '1 times playback speed' }).getAttribute('aria-pressed'), 'true')
        }
        await scrub(0.5)
      }
    }
    await capture('solveit-desktop.png')
    await page.setViewportSize({ width: 375, height: 900 })
    await capture('horizontal-mobile.png')
    assert.ok(await model.evaluate(el => el.scrollWidth <= el.clientWidth + 1))
    await page.setViewportSize({ width: 1440, height: 1100 })
    await page.getByRole('button', { name: 'Randomize Numbers' }).click()
    await page.waitForTimeout(100)
    assert.equal(await model.count(), 0, 'Old variation answers must not unlock the new model')
    await page.getByRole('tab', { name: 'Balanced forces' }).click()
    await model.waitFor()
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.reload()
    await model.waitFor()
    assert.equal(await model.getByRole('button', { name: 'Pause', exact: true }).count(), 0)
    await page.setViewportSize({ width: 375, height: 900 })
    await scrub(3)
    await capture('balanced-mobile.png')
    assert.ok(await model.evaluate(el => el.scrollWidth <= el.clientWidth + 1))
    await page.setViewportSize({ width: 812, height: 375 })
    assert.ok(await model.evaluate(el => el.scrollWidth <= el.clientWidth + 1))
    assert.deepEqual(errors, [], 'No uncaught browser errors')
    console.log('Browser checks passed: all modules, 12 scenarios, 8 numeric problem types, playback, pause, reset, scrubbing, speed, overlays, reduced motion, 375px and landscape layouts.')
    console.log(`Screenshots: ${output}`)
  } finally {
    await browser.close()
  }
}
main().catch(e => { console.error(e); process.exitCode = 1 })
