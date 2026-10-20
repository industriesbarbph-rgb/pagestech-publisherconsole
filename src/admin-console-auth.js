import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://hugnkvxshrhomjnaefuh.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_tMB8JbUjV6P4yCfCA3vQdg_S6Hcc7SN'
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)

function getRedirectUrl() {
  return `${window.location.origin}${window.location.pathname}`
}

function closeVerificationDialog() {
  document.querySelector('.admin-verification-backdrop')?.remove()
}

function openVerificationDialog() {
  if (document.querySelector('.admin-verification-backdrop')) return

  const backdrop = document.createElement('div')
  backdrop.className = 'admin-verification-backdrop'
  backdrop.innerHTML = `
    <section class="admin-verification-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-verification-title">
      <div class="eyebrow">AUTHORIZED PUBLISHERS ONLY</div>
      <h2 id="admin-verification-title">Verify your email</h2>
      <p>Enter your authorized publisher email. We’ll send a secure one-time verification link.</p>
      <form class="admin-verification-form">
        <label>
          Email
          <input name="email" type="email" inputmode="email" autocomplete="email" required autofocus />
        </label>
        <p class="admin-verification-message" role="status" aria-live="polite"></p>
        <div class="admin-verification-actions">
          <button type="button" class="cancel-link">Cancel</button>
          <button type="submit" class="send-link">Send verification link</button>
        </div>
      </form>
    </section>`

  document.body.appendChild(backdrop)

  const form = backdrop.querySelector('.admin-verification-form')
  const input = backdrop.querySelector('input[name="email"]')
  const message = backdrop.querySelector('.admin-verification-message')
  const submit = backdrop.querySelector('.send-link')

  backdrop.querySelector('.cancel-link')?.addEventListener('click', closeVerificationDialog)
  backdrop.addEventListener('click', event => {
    if (event.target === backdrop) closeVerificationDialog()
  })

  form?.addEventListener('submit', async event => {
    event.preventDefault()
    const email = String(input?.value || '').trim()
    if (!email) return

    submit.disabled = true
    submit.textContent = 'Sending…'
    message.className = 'admin-verification-message'
    message.textContent = ''

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: getRedirectUrl(),
      },
    })

    submit.disabled = false
    submit.textContent = 'Send verification link'

    if (error) {
      message.className = 'admin-verification-message is-error'
      message.textContent = 'We could not send the verification link. Confirm that this is an authorized publisher email and try again.'
      return
    }

    message.className = 'admin-verification-message is-success'
    message.textContent = 'If this email is authorized, a secure verification link has been sent. Check the inbox and open the link to continue.'
    input.disabled = true
    submit.disabled = true
  })

  requestAnimationFrame(() => input?.focus())
}

function bindAdminConsoleTrigger() {
  const trigger = document.querySelector('.admin-label')
  if (!trigger) return

  trigger.setAttribute('role', 'button')
  trigger.setAttribute('tabindex', '0')
  trigger.setAttribute('aria-label', 'Admin Console — send email verification link')
  trigger.setAttribute('title', 'Send secure verification link')

  trigger.addEventListener('click', openVerificationDialog)
  trigger.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openVerificationDialog()
    }
  })
}

bindAdminConsoleTrigger()

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeVerificationDialog()
})
