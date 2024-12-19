import { expect, test } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin')
  })

  test('should display validation errors for empty form submission', async ({ page }) => {
    // Click sign in without entering any data
    await page.getByRole('button', { name: /sign in/i }).click()

    // Check for validation messages
    await expect(page.getByText(/email is required/i)).toBeVisible()
    await expect(page.getByText(/password is required/i)).toBeVisible()
  })

  test('should display error for invalid email format', async ({ page }) => {
    // Enter invalid email
    await page.getByLabel(/email/i).fill('invalid-email')
    await page.getByLabel(/password/i).fill('password123')
    await page.getByRole('button', { name: /sign in/i }).click()

    // Check for validation message
    await expect(page.getByText(/invalid email address/i)).toBeVisible()
  })

  test('should display error for short password', async ({ page }) => {
    // Enter short password
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/password/i).fill('123')
    await page.getByRole('button', { name: /sign in/i }).click()

    // Check for validation message
    await expect(page.getByText(/password must be at least 8 characters/i)).toBeVisible()
  })

  test('should navigate to reset password page', async ({ page }) => {
    await page.getByText(/forgot your password/i).click()
    await expect(page).toHaveURL('/auth/reset-password')
  })

  test('should navigate to sign up page', async ({ page }) => {
    await page.getByText(/need an account/i).click()
    await expect(page).toHaveURL('/auth/signup')
  })

  test('should show loading state during sign in', async ({ page }) => {
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/password/i).fill('password123')

    // Start watching for button state before clicking
    const signInPromise = page.getByRole('button', { name: /signing in/i }).waitFor()
    await page.getByRole('button', { name: /sign in/i }).click()

    // Verify loading state appeared
    await signInPromise
  })

  test('should handle failed authentication', async ({ page }) => {
    await page.getByLabel(/email/i).fill('wrong@example.com')
    await page.getByLabel(/password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /sign in/i }).click()

    // Check for error toast
    await expect(page.getByText(/failed to sign in/i)).toBeVisible()
  })

  test('should maintain form state after failed submission', async ({ page }) => {
    const email = 'test@example.com'
    await page.getByLabel(/email/i).fill(email)
    await page.getByLabel(/password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /sign in/i }).click()

    // Verify email field still contains the entered value
    await expect(page.getByLabel(/email/i)).toHaveValue(email)
  })

  test('should clear validation errors on input change', async ({ page }) => {
    // Trigger validation errors
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByText(/email is required/i)).toBeVisible()

    // Enter valid data
    await page.getByLabel(/email/i).fill('test@example.com')

    // Verify error message is gone
    await expect(page.getByText(/email is required/i)).not.toBeVisible()
  })

  test('should handle social authentication initiation', async ({ page }) => {
    // Click Google sign in button
    await page.getByRole('button', { name: /continue with google/i }).click()

    // Verify redirect or popup
    // Note: Full OAuth flow can't be tested in E2E due to third-party redirects
    await expect(page.url()).toContain('oauth')
  })

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Verify all important elements are visible
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    await expect(page.getByText(/forgot your password/i)).toBeVisible()
    await expect(page.getByText(/need an account/i)).toBeVisible()

    // Verify form inputs are properly sized
    const emailInput = await page.getByLabel(/email/i)
    const box = await emailInput.boundingBox()
    expect(box?.width).toBeLessThan(375) // Should fit in viewport
  })
}) 