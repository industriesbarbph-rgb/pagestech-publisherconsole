import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://hugnkvxshrhomjnaefuh.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_tMB8JbUjV6P4yCfCA3vQdg_S6Hcc7SN'
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)

const PROTECTED_CONTROL_SELECTOR = '.preview-shell .rail button, .preview-shell .analytics-menu button'

document.documentElement.dataset.adminAccess = 'locked'

function getRedirectUrl() {
  return `${window.location.origin}${window.location.pathname}`
}

function removeLegacySettings() {
  document.querySelectorAll('[data-panel="Settings"], .preview-panel[aria-label="Settings panel"]').forEach(node => node.remove())
}

function closeProtectedUi() {
  document.querySelector('.analytics-menu')?.classList.remove('is-open')
  const layer = document.querySelector('.preview-panel-layer')
  if (layer) layer.innerHTML = ''
  document.querySelectorAll('.rail button').forEach(button => button.classList.remove('is-active'))
}

function setProtectedControlsEnabled(enabled) {
  removeLegacySettings()
  document.documentElement.dataset.adminAccess = enabled ? 'unlocked' : 'locked'
  document.querySelectorAll(PROTECTED_CONTROL_SELECTOR).forEach(control => {
    control.disabled = !enabled
    control.setAttribute('aria-disabled', enabled ? 'false' : 'true')
    if (!enabled) control.setAttribute('tabindex', '-1')
    else control.removeAttribute('tabindex')
  })
  if (!enabled) closeProtectedUi()
}

async function refreshAdminAccess() {
  setProtectedControlsEnabled(false)

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  const session = sessionData?.session
  if (sessionError || !session) return false

  const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin')
  if (adminError || isAdmin !== true) {
    await supabase.auth.signOut()
    setProtectedControlsEnabled(false)
    return false
  }

  setProtectedControlsEnabled(true)
  closeVerificationDialog()
  return true
}

function closeVerificationDialog() {
  document.querySelector('.admin-verification-backdrop')?.remove()
}

function openVerificationDialog() {
  if (document.documentElement.dataset.adminAccess === 'unlocked') return
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

function enforceLockedInteraction(event) {
  if (document.documentElement.dataset.adminAccess === 'unlocked') return
  const protectedControl = event.target.closest?.(PROTECTED_CONTROL_SELECTOR)
  if (!protectedControl) return
  event.preventDefault()
  event.stopImmediatePropagation()
}

document.addEventListener('click', enforceLockedInteraction, true)
document.addEventListener('keydown', event => {
  if ((event.key === 'Enter' || event.key === ' ') && event.target.closest?.(PROTECTED_CONTROL_SELECTOR)) {
    enforceLockedInteraction(event)
  }
  if (event.key === 'Escape') closeVerificationDialog()
}, true)

const observer = new MutationObserver(() => {
  removeLegacySettings()
  const enabled = document.documentElement.dataset.adminAccess === 'unlocked'
  document.querySelectorAll(PROTECTED_CONTROL_SELECTOR).forEach(control => {
    control.disabled = !enabled
    control.setAttribute('aria-disabled', enabled ? 'false' : 'true')
    if (!enabled) control.setAttribute('tabindex', '-1')
  })
})
observer.observe(document.body, { childList: true, subtree: true })

removeLegacySettings()
bindAdminConsoleTrigger()
refreshAdminAccess()

supabase.auth.onAuthStateChange(() => {
  setTimeout(() => refreshAdminAccess(), 0)
})
