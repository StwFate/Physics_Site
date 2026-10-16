const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { chromium } = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'))

async function run() {
  const outputDir = path.resolve(__dirname, '../output/playwright/eval')
  fs.mkdirSync(outputDir, { recursive: true })

  console.log('🚀 Launching Chromium at 1920x1080 (1080p)...')
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
  })

  try {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    })
    const page = await context.newPage()

    const errors = []
    page.on('pageerror', err => errors.push(err.message))
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    console.log('🌐 Navigating to https://mr-williams-physics.web.app ...')
    await page.goto('https://mr-williams-physics.web.app', { waitUntil: 'networkidle' })

    // Check if on Auth screen, sign in via Guest
    const guestBtn = page.getByRole('button', { name: /Continue as Guest/i })
    if (await guestBtn.isVisible()) {
      console.log('🔑 Clicking Continue as Guest...')
      await guestBtn.click()
      await page.waitForTimeout(500)
    }

    // ==========================================
    // MODULE 1: BALANCED VS UNBALANCED FORCES
    // ==========================================
    console.log('\n--- TESTING MODULE 1: BALANCED FORCES ---')
    await page.getByRole('tab', { name: /Balanced forces/i }).click()
    await page.waitForTimeout(500)

    // Verify simulation is initially hidden
    let simVisible = await page.locator('.motion-model').isVisible()
    console.log(`[Mod 1] Simulation visible before answer: ${simVisible} (Expected: false)`)
    assert.equal(simVisible, false, 'Simulation should be hidden before answering')

    // Capture initial 1080p clean view
    await page.screenshot({ path: path.join(outputDir, 'mod1_unanswered_1080p.png') })

    // Answer Q01 correctly
    // In Apprentice Q01, typical prompt: Constant speed / Balanced forces (or check radio buttons)
    // Let's inspect the radio options
    const speedRadios = page.locator('input[name="motionState"]')
    const forceRadios = page.locator('input[name="forceState"]')
    
    // Choose Constant speed and Balanced forces (standard Q1 archetype)
    await page.locator('label', { hasText: 'Constant speed' }).click()
    await page.locator('label', { hasText: 'Balanced forces' }).click()
    
    const checkBtn = page.getByRole('button', { name: /Check answer/i })
    await checkBtn.click()
    await page.waitForTimeout(600)

    // Check if simulation mounted
    simVisible = await page.locator('.motion-model').isVisible()
    console.log(`[Mod 1] Simulation visible after answer: ${simVisible} (Expected: true)`)
    assert.equal(simVisible, true, 'Simulation should be visible after correct answer')

    // Inspect simulation elements
    const model = page.locator('.motion-model')
    const metrics = await model.locator('.motion-metric-value').allInnerTexts()
    console.log(`[Mod 1] Telemetry metrics:`, metrics)

    // Test Play / Pause / Scrubbing
    const playBtn = model.locator('button.motion-play')
    console.log(`[Mod 1] Play button text: "${await playBtn.innerText()}"`)
    
    // Pause
    if ((await playBtn.innerText()).includes('Pause')) {
      await playBtn.click()
      console.log(`[Mod 1] Clicked Pause, text now: "${await playBtn.innerText()}"`)
    }

    // Test timeline slider
    const slider = model.locator('input[type="range"]')
    await slider.fill('3.0')
    await slider.dispatchEvent('input')
    await page.waitForTimeout(200)
    console.log(`[Mod 1] Scrubbed to 3.0s, readout: ${await model.locator('.motion-time').innerText()}`)

    // Toggle Forces and Trail
    const forcesToggle = model.getByRole('button', { name: /Forces/i })
    await forcesToggle.click()
    console.log(`[Mod 1] Toggled forces off (pressed: ${await forcesToggle.getAttribute('aria-pressed')})`)
    await forcesToggle.click()
    console.log(`[Mod 1] Toggled forces back on (pressed: ${await forcesToggle.getAttribute('aria-pressed')})`)

    // Speeds: 0.5x, 1x, 2x
    const speed2x = model.getByRole('button', { name: '2 times playback speed' })
    await speed2x.click()
    assert.equal(await speed2x.getAttribute('aria-pressed'), 'true')
    console.log(`[Mod 1] Speed 2x active: ${await speed2x.getAttribute('aria-pressed')}`)

    // Capture screenshot of Mod 1 simulation in action
    await page.screenshot({ path: path.join(outputDir, 'mod1_sim_active_1080p.png') })

    // ==========================================
    // MODULE 2: FREE-BODY DIAGRAMS
    // ==========================================
    console.log('\n--- TESTING MODULE 2: FREE-BODY DIAGRAMS ---')
    await page.getByRole('tab', { name: /Free-body diagrams/i }).click()
    await page.waitForTimeout(500)

    simVisible = await page.locator('.motion-model').isVisible()
    console.log(`[Mod 2] Simulation visible before answer: ${simVisible} (Expected: false)`)
    assert.equal(simVisible, false, 'Simulation should be hidden before answering in FBD')

    // Scenario 1: Book at rest on tabletop
    // Requires: Up = FN (normal), Down = Fg (normal)
    console.log('[Mod 2] Constructing FBD for Scenario 1...')
    // Click top '+' button (UP)
    const topPlus = page.locator('button[aria-label="Add force pointing up"]')
    if (await topPlus.isVisible()) {
      await topPlus.click()
      await page.waitForTimeout(200)
      await page.getByRole('button', { name: /Normal Force/i }).click()
      await page.waitForTimeout(200)
    }

    // Click bottom '+' button (DOWN)
    const bottomPlus = page.locator('button[aria-label="Add force pointing down"]')
    if (await bottomPlus.isVisible()) {
      await bottomPlus.click()
      await page.waitForTimeout(200)
      await page.getByRole('button', { name: /Gravity Force/i }).click()
      await page.waitForTimeout(200)
    }

    const checkFbdBtn = page.getByRole('button', { name: /Check Diagram/i })
    await checkFbdBtn.click()
    await page.waitForTimeout(600)

    simVisible = await page.locator('.motion-model').isVisible()
    console.log(`[Mod 2] Simulation visible after correct FBD: ${simVisible} (Expected: true)`)
    assert.equal(simVisible, true, 'Simulation should be visible after correct FBD')

    // Capture screenshot of Mod 2 simulation
    await page.screenshot({ path: path.join(outputDir, 'mod2_sim_active_1080p.png') })

    // ==========================================
    // MODULE 3: SOLVE IT! (F = ma)
    // ==========================================
    console.log('\n--- TESTING MODULE 3: SOLVE IT! ---')
    await page.getByRole('tab', { name: /Solve it!/i }).click()
    await page.waitForTimeout(500)

    simVisible = await page.locator('.motion-model').isVisible()
    console.log(`[Mod 3] Simulation visible before answer: ${simVisible} (Expected: false)`)
    assert.equal(simVisible, false, 'Simulation should be hidden before answering in Solve It')

    // Read problem target values from page evaluation
    const solved = await page.evaluate(() => {
      // Find inputs on page
      const inputs = Array.from(document.querySelectorAll('input[type="number"], input[type="text"]'))
      return inputs.map(inp => ({ name: inp.name || inp.getAttribute('aria-label') || inp.placeholder, id: inp.id }))
    })
    console.log('[Mod 3] Inputs found on page:', solved.length)

    // Capture Solve It workspace
    await page.screenshot({ path: path.join(outputDir, 'mod3_unanswered_1080p.png') })

    // Mobile viewport verification
    console.log('\n--- TESTING MOBILE RESPONSIVENESS (375x812) ---')
    await page.setViewportSize({ width: 375, height: 812 })
    await page.getByRole('tab', { name: /Balanced forces/i }).click()
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.join(outputDir, 'mobile_375_balanced_sim.png') })
    console.log('[Mobile] Screenshot captured.')

    console.log('\n✅ ALL EVALUATION CHECKS PASSED!')
    console.log('Errors logged during session:', errors)
  } finally {
    await browser.close()
  }
}

run().catch(err => {
  console.error('❌ Evaluation failed:', err)
  process.exit(1)
})
