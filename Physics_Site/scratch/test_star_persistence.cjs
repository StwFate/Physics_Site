const assert = require('node:assert/strict')
const path = require('node:path')
const { chromium } = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'))

async function main() {
  const root = 'c:/Users/Venus/OneDrive/Desktop/Documents/School/Physics_Site'
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', e => errors.push(e.message))

    await page.route('**/*', async route => {
      const url = new URL(route.request().url())
      if (url.hostname !== 'stars.test') return route.abort()
      const fs = require('node:fs')
      const file = path.join(root, 'dist', url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname))
      const contentType = file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : file.endsWith('.html') ? 'text/html' : undefined
      await route.fulfill({ path: file, contentType })
    })

    // Start with clean storage
    await page.goto('http://stars.test/')

    // 1. Log in by injecting demo user session into localStorage
    await page.evaluate(() => {
      const demoUser = {
        uid: 'demo_google_student_123',
        displayName: 'Student Demo',
        email: 'student@school.edu',
        photoURL: null,
        isDemo: true,
      }
      localStorage.setItem('physix_demo_google_session', JSON.stringify(demoUser))
      localStorage.setItem('physix_cached_auth_user', JSON.stringify(demoUser))
      localStorage.setItem('physix_student_seed_demo_google_student_123', '42')
    })
    page.on('console', msg => console.log('PAGE:', msg.text()))
    await page.reload()
    await page.locator('.h-14').waitFor()
    console.log('✓ Successfully signed in as Student Demo')

    await page.waitForTimeout(500)

    // 2. Solve Question 01 (Seed 42 -> apprentice-21: Slowing Down, Unbalanced)
    await page.getByRole('button', { name: '01', exact: true }).click()
    await page.waitForTimeout(200)
    await page.locator('main').getByText('Slowing down', { exact: true }).click()
    await page.locator('main').getByText('Unbalanced forces', { exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Check answer →' }).click()
    await page.waitForTimeout(400)
    const q1Feedback = await page.locator('.lg\\:col-span-6').last().innerText()
    console.log('Q01 checked. Is correct?', q1Feedback.includes('Correct! Star Earned'))

    // 3. Solve Question 02 (Seed 42 -> apprentice-4: Constant Speed, Balanced)
    await page.getByRole('button', { name: '02', exact: true }).click()
    await page.waitForTimeout(200)
    await page.locator('main').getByText('Constant speed', { exact: true }).click()
    await page.locator('main').getByText('Balanced forces', { exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Check answer →' }).click()
    await page.waitForTimeout(400)
    const q2Feedback = await page.locator('.lg\\:col-span-6').last().innerText()
    console.log('Q02 checked. Is correct?', q2Feedback.includes('Correct! Star Earned'))

    const storageDump = await page.evaluate(() => ({
      completed: localStorage.getItem('physix_balanced_completed'),
      answers: localStorage.getItem('physix_balanced_answers')
    }))
    console.log('Storage before logout:', storageDump)

    // Check stars before sign out
    const headerStarsBefore = await page.locator('.h-14').innerText()
    console.log('Header before logout:', headerStarsBefore.replace(/\n+/g, ' '))
    assert.ok(headerStarsBefore.includes('2 stars'), `Expected header to show 2 stars before sign out, got: ${headerStarsBefore}`)

    const progressBarBefore = await page.locator('text=/\\d+ \\/ 8 mastered/').innerText()
    console.log('Progress bar before logout:', progressBarBefore)
    assert.ok(progressBarBefore.includes('2 / 8 mastered'), `Expected 2 / 8 mastered before sign out, got: ${progressBarBefore}`)

    // 4. Test Sign Out (handle window.confirm)
    let dialogFired = false
    page.on('dialog', async dialog => {
      console.log('Dialog intercepted:', dialog.message())
      dialogFired = true
      await dialog.accept()
    })
    await page.getByRole('button', { name: 'Sign out' }).click()
    await page.waitForTimeout(1000)

    console.log('Dialog fired?', dialogFired)
    console.log('Body after sign out click:', (await page.locator('body').innerText()).slice(0, 300))

    // Verify user is on login screen and local active keys are cleared
    const authScreenVisible = await page.getByRole('button', { name: 'Continue with Google' }).isVisible()
    assert.ok(authScreenVisible, 'AuthScreen must be visible after signing out')
    console.log('✓ Successfully signed out to login screen')

    // 5. Sign back in with the same user ID!
    await page.evaluate(() => {
      const demoUser = {
        uid: 'demo_google_student_123',
        displayName: 'Student Demo',
        email: 'student@school.edu',
        photoURL: null,
        isDemo: true,
      }
      localStorage.setItem('physix_demo_google_session', JSON.stringify(demoUser))
      localStorage.setItem('physix_cached_auth_user', JSON.stringify(demoUser))
    })
    await page.reload()
    await page.locator('.h-14').waitFor()
    await page.waitForTimeout(600)
    console.log('✓ Successfully signed back in as Student Demo')

    // 6. Verify stars and golden buttons AFTER SIGN-IN
    const headerStarsAfter = await page.locator('.h-14').innerText()
    console.log('Header after login:', headerStarsAfter.replace(/\n+/g, ' '))
    assert.ok(headerStarsAfter.includes('2 stars'), `Expected header to show 2 stars after sign in, got: ${headerStarsAfter}`)

    const progressBarAfter = await page.locator('text=/\\d+ \\/ 8 mastered/').innerText()
    console.log('Progress bar after login:', progressBarAfter)
    assert.ok(progressBarAfter.includes('2 / 8 mastered'), `Expected 2 / 8 mastered after sign in, got: ${progressBarAfter}`)

    // Check that button 01 and 02 are golden (amber)
    const btn01Class = await page.getByRole('button', { name: '01', exact: true }).getAttribute('class')
    const btn02Class = await page.getByRole('button', { name: '02', exact: true }).getAttribute('class')
    console.log('Btn 01 class:', btn01Class)
    console.log('Btn 02 class:', btn02Class)
    assert.ok(btn01Class.includes('amber'), 'Button 01 must be golden/amber')
    assert.ok(btn02Class.includes('amber'), 'Button 02 must be golden/amber')
    console.log('✓ Buttons 01 and 02 are both golden!')

    // Click question 02 and check that saved answer is still restored
    await page.getByRole('button', { name: '02', exact: true }).click()
    await page.waitForTimeout(300)
    const q2Text = await page.locator('.lg\\:col-span-6').last().innerText()
    assert.ok(q2Text.includes('Correct! Star Earned') || q2Text.includes('Next Question'), 'Question 02 has answered state restored')
    console.log('✓ Question 02 answered state is restored and intact!')

    // Check motion simulation is unlocked and visible
    const simCount = await page.locator('.motion-model').count()
    assert.equal(simCount, 1, 'Motion model is visible and unlocked')
    console.log('✓ Motion simulation is unlocked and visible!')

    assert.deepEqual(errors, [])
    console.log('🎉 ALL STAR PERSISTENCE CHECKS PASSED!')
  } finally {
    await browser.close()
  }
}

main().catch(err => {
  console.error(err)
  process.exitCode = 1
})
