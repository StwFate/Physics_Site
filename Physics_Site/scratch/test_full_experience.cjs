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

    const testUser = {
      uid: 'student_eval_1080p',
      displayName: 'Alex Rivers',
      email: 'alex@school.edu',
      isDemo: true,
    }

    await context.addInitScript((user) => {
      localStorage.setItem('physix_cached_auth_user', JSON.stringify(user))
      localStorage.setItem('physix_demo_google_session', JSON.stringify(user))
    }, testUser)

    const page = await context.newPage()

    const errors = []
    page.on('pageerror', err => errors.push(err.message))
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    console.log('🌐 Navigating to https://mr-williams-physics.web.app ...')
    await page.goto('https://mr-williams-physics.web.app', { waitUntil: 'networkidle' })

    await page.getByRole('tab', { name: /Balanced forces/i }).waitFor({ timeout: 10000 })
    console.log('✅ Main Dashboard loaded for Alex Rivers')

    // ==========================================
    // MODULE 1: BALANCED VS UNBALANCED FORCES
    // ==========================================
    console.log('\n--- TESTING MODULE 1: BALANCED FORCES ---')
    await page.getByRole('tab', { name: /Balanced forces/i }).click()
    await page.waitForTimeout(600)

    // 1. Initial State: simulation MUST NOT be visible
    let simVisible = await page.locator('.motion-model').isVisible()
    console.log(`[Mod 1] Simulation visible before answering: ${simVisible} (Expected: false)`)
    assert.equal(simVisible, false, 'Simulation must be hidden before answering')
    await page.screenshot({ path: path.join(outputDir, 'mod1_unanswered_1080p.png') })

    // 2. Select Answers inside main question card
    console.log('[Mod 1] Answering Question 01...')
    await page.getByRole('main').getByText('Constant speed', { exact: true }).click()
    await page.getByRole('main').getByText('Balanced forces', { exact: true }).click()
    await page.waitForTimeout(200)

    const checkBtn = page.getByRole('button', { name: /Check answer/i })
    await checkBtn.click()
    await page.waitForTimeout(1000)

    // 3. Verify simulation mounts and auto-plays
    simVisible = await page.locator('.motion-model').isVisible()
    console.log(`[Mod 1] Simulation visible after correct answer: ${simVisible} (Expected: true)`)
    assert.equal(simVisible, true, 'Simulation should mount after answering correctly')

    const model = page.locator('.motion-model')
    const metrics = await model.locator('.motion-metric-value').allInnerTexts()
    const metricLabels = await model.locator('.motion-metric-label').allInnerTexts()
    console.log(`[Mod 1] Telemetry:`, metricLabels.map((lbl, idx) => `${lbl}: ${metrics[idx]}`))

    // 4. Test Playback Controls
    const playBtn = model.locator('button.motion-play')
    console.log(`[Mod 1] Play button text: "${await playBtn.innerText()}"`)
    
    // Pause
    if ((await playBtn.innerText()).includes('Pause')) {
      await playBtn.click()
      await page.waitForTimeout(200)
      console.log(`[Mod 1] Paused -> button text: "${await playBtn.innerText()}"`)
    }

    // 5. Test Timeline Scrubber
    const slider = model.locator('input[type="range"]')
    await slider.evaluate((el) => {
      el.value = '3.0'
      el.dispatchEvent(new Event('input', { bubbles: true }))
      el.dispatchEvent(new Event('change', { bubbles: true }))
    })
    await page.waitForTimeout(200)
    console.log(`[Mod 1] Scrubbed to 3.0s -> Readout: ${await model.locator('.motion-time').innerText()}`)

    // 6. Test Feature Toggles: Forces & Trail
    const forcesToggle = model.getByRole('button', { name: /Forces/i })
    await forcesToggle.click()
    console.log(`[Mod 1] Forces toggled off: ${await forcesToggle.getAttribute('aria-pressed')}`)
    await forcesToggle.click()
    console.log(`[Mod 1] Forces toggled on: ${await forcesToggle.getAttribute('aria-pressed')}`)

    const trailToggle = model.getByRole('button', { name: /Motion trail/i })
    await trailToggle.click()
    console.log(`[Mod 1] Trail toggled off: ${await trailToggle.getAttribute('aria-pressed')}`)
    await trailToggle.click()
    console.log(`[Mod 1] Trail toggled on: ${await trailToggle.getAttribute('aria-pressed')}`)

    // 7. Test Speeds: 0.5x, 1x, 2x
    for (const spd of ['0.5', '1', '2']) {
      const btn = model.getByRole('button', { name: `${spd} times playback speed` })
      await btn.click()
      console.log(`[Mod 1] Speed ${spd}x active: ${await btn.getAttribute('aria-pressed')}`)
    }

    // 8. Test Reset Button
    const resetBtn = model.getByRole('button', { name: /Reset motion/i })
    await resetBtn.click()
    await page.waitForTimeout(200)
    console.log(`[Mod 1] Reset -> Time: ${await model.locator('.motion-time').innerText()}`)

    // 9. Resume Playback
    await playBtn.click()
    await page.waitForTimeout(600)
    await page.screenshot({ path: path.join(outputDir, 'mod1_sim_active_1080p.png') })

    // ==========================================
    // MODULE 2: FREE-BODY DIAGRAMS
    // ==========================================
    console.log('\n--- TESTING MODULE 2: FREE-BODY DIAGRAMS ---')
    await page.getByRole('tab', { name: /Free-body diagrams/i }).click()
    await page.waitForTimeout(600)

    simVisible = await page.locator('.motion-model').isVisible()
    console.log(`[Mod 2] Simulation visible before answer: ${simVisible} (Expected: false)`)
    assert.equal(simVisible, false, 'Simulation should be hidden in FBD before solving')

    // Scenario 1
    const scenarioTitle = await page.locator('h3').first().innerText()
    const scenarioDesc = await page.locator('p').first().innerText()
    console.log(`[Mod 2] Current scenario title: "${scenarioTitle}"`)
    console.log(`[Mod 2] Current scenario description: "${scenarioDesc}"`)
    const topPlus = page.locator('button[aria-label="Add force pointing up"]')
    if (await topPlus.isVisible()) {
      await topPlus.click()
      await page.waitForTimeout(200)
      await page.getByRole('button', { name: /Normal Force/i }).click()
      await page.waitForTimeout(200)
    }

    const bottomPlus = page.locator('button[aria-label="Add force pointing down"]')
    if (await bottomPlus.isVisible()) {
      await bottomPlus.click()
      await page.waitForTimeout(200)
      await page.getByRole('button', { name: /Gravity Force/i }).click()
      await page.waitForTimeout(200)
    }

    const rightPlus = page.locator('button[aria-label="Add force pointing right"]')
    if (await rightPlus.isVisible()) {
      await rightPlus.click()
      await page.waitForTimeout(200)
      await page.getByRole('button', { name: /Applied Force/i }).click()
      await page.waitForTimeout(200)
    }

    const leftPlus = page.locator('button[aria-label="Add force pointing left"]')
    if (await leftPlus.isVisible()) {
      await leftPlus.click()
      await page.waitForTimeout(200)
      await page.getByRole('button', { name: /Friction Force/i }).click()
      await page.waitForTimeout(200)
    }

    const checkFbdBtn = page.getByRole('button', { name: /Evaluate Diagram/i })
    await checkFbdBtn.click()
    await page.waitForTimeout(800)

    simVisible = await page.locator('.motion-model').isVisible()
    console.log(`[Mod 2] Simulation visible after correct FBD: ${simVisible} (Expected: true)`)
    assert.equal(simVisible, true, 'Simulation should mount after correct FBD')

    const mod2Model = page.locator('.motion-model')
    console.log(`[Mod 2] Observation: "${await mod2Model.locator('.motion-observation').innerText()}"`)
    await page.screenshot({ path: path.join(outputDir, 'mod2_sim_scenario1_1080p.png') })

    // Test Scenario 4: Projectile Motion (flying baseball)
    console.log('[Mod 2] Navigating to Scenario 4 (Projectile Motion)...')
    const s4Btn = page.getByRole('button', { name: /#4:/i })
    if (await s4Btn.isVisible()) {
      await s4Btn.click()
      await page.waitForTimeout(400)

      // Baseball in flight without air resistance: only downward gravity force
      const s4BottomPlus = page.locator('button[aria-label="Add force pointing down"]')
      if (await s4BottomPlus.isVisible()) {
        await s4BottomPlus.click()
        await page.waitForTimeout(200)
        await page.getByRole('button', { name: /Gravity Force/i }).click()
        await page.waitForTimeout(200)
      }

      await checkFbdBtn.click()
      await page.waitForTimeout(800)

      const s4Model = page.locator('.motion-model')
      const isProjectileVisible = await s4Model.isVisible()
      console.log(`[Mod 2] Scenario 4 Projectile Simulation visible: ${isProjectileVisible}`)
      if (isProjectileVisible) {
        console.log(`[Mod 2] Motion heading: ${await s4Model.locator('.motion-stage-top').innerText()}`)
        await page.screenshot({ path: path.join(outputDir, 'mod2_sim_projectile_1080p.png') })
      }
    }

    // ==========================================
    // MODULE 3: SOLVE IT! (F = ma)
    // ==========================================
    console.log('\n--- TESTING MODULE 3: SOLVE IT! ---')
    await page.getByRole('tab', { name: /Solve it!/i }).click()
    await page.waitForTimeout(600)

    simVisible = await page.locator('.motion-model').isVisible()
    console.log(`[Mod 3] Simulation visible before answer: ${simVisible} (Expected: false)`)
    assert.equal(simVisible, false, 'Simulation should be hidden in Solve It before solving')
    await page.screenshot({ path: path.join(outputDir, 'mod3_unanswered_1080p.png') })

    // Read the given values:
    const massVal = Number(await page.locator('#table-input-mass').inputValue())
    const ffrictVal = Number(await page.locator('#diagram-input-ffrict').inputValue())
    console.log(`[Mod 3] Given Problem 1 values: mass = ${massVal} kg, Ffrict = ${ffrictVal} N`)

    // In Problem 1:
    // Fgrav = mass * 9.8
    // Fnorm = Fgrav
    // Fnet = Ffrict
    // a = Fnet / mass
    const fgravTarget = Math.round(massVal * 9.8 * 10) / 10
    const fnormTarget = fgravTarget
    const fnetTarget = ffrictVal
    const aTarget = Math.round((fnetTarget / massVal) * 100) / 100

    console.log(`[Mod 3] Calculated targets: Fnorm=${fnormTarget}, Fgrav=${fgravTarget}, Fnet=${fnetTarget}, a=${aTarget}`)

    // Type the calculated answers into inputs
    await page.locator('#diagram-input-fnorm').fill(String(fnormTarget))
    await page.locator('#diagram-input-fgrav').fill(String(fgravTarget))
    await page.locator('#table-input-a').fill(String(aTarget))
    await page.locator('#table-input-fnet').fill(String(fnetTarget))
    await page.waitForTimeout(200)

    const checkSolveItBtn = page.getByRole('button', { name: /Check Answers/i })
    await checkSolveItBtn.click()
    await page.waitForTimeout(1000)

    simVisible = await page.locator('.motion-model').isVisible()
    console.log(`[Mod 3] Simulation visible after correct Solve It: ${simVisible} (Expected: true)`)
    assert.equal(simVisible, true, 'Simulation should mount after correct Solve It calculation')

    const mod3Model = page.locator('.motion-model')
    const mod3Metrics = await mod3Model.locator('.motion-metric-value').allInnerTexts()
    console.log(`[Mod 3] Telemetry:`, mod3Metrics)
    await page.screenshot({ path: path.join(outputDir, 'mod3_sim_active_1080p.png') })

    // ==========================================
    // MOBILE VIEWPORT VERIFICATION (375x812)
    // ==========================================
    console.log('\n--- TESTING MOBILE RESPONSIVENESS (375x812) ---')
    await page.setViewportSize({ width: 375, height: 812 })
    await page.getByRole('tab', { name: /Balanced forces/i }).click()
    await page.waitForTimeout(600)

    // Verify simulation on mobile
    const mobileModel = page.locator('.motion-model')
    if (await mobileModel.isVisible()) {
      const noOverflow = await mobileModel.evaluate(el => el.scrollWidth <= el.clientWidth + 1)
      console.log(`[Mobile] Simulation container horizontal overflow: ${!noOverflow} (Fits cleanly: ${noOverflow})`)
      assert.ok(noOverflow, 'Mobile simulation container must not overflow viewport horizontally')
      await page.screenshot({ path: path.join(outputDir, 'mobile_375_balanced_sim.png') })
      console.log('[Mobile] Screenshot captured.')
    }

    console.log('\n🎉 ALL MODULE TESTING & VERIFICATIONS COMPLETED SUCCESSFULLY!')
    console.log('Errors logged during browser run:', errors.length ? errors : 'None (0 errors)')

  } finally {
    await browser.close()
  }
}

run().catch(err => {
  console.error('❌ Test execution failed:', err)
  process.exit(1)
})
