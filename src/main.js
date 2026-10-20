import { createClient } from '@supabase/supabase-js'
import './styles.css'

const SUPABASE_URL = 'https://hugnkvxshrhomjnaefuh.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_tMB8JbUjV6P4yCfCA3vQdg_S6Hcc7SN'
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)

const state = {
  session: null,
  isAdmin: false,
  books: [],
  selectedBook: null,
  pages: [],
  panel: null,
  uploadProgress: null,
  previewIndex: 0,
}

const futureFeatures = [
  ['Sales', 'Revenue, book performance, transaction history'],
  ['Payments', 'Verification queue and payment settings'],
  ['Customers', 'Customer records and purchase history'],
  ['Refunds', 'Refund records and reconciliation'],
  ['Audio', 'Audio uploads and book-level audio management'],
  ['Expenses', 'Operating expense tracking'],
  ['Analytics', 'Reader, sales and traffic insights'],
  ['SEO', 'Search visibility and indexing controls'],
  ['Business', 'Renewals, reminders and operational notices'],
  ['Settings', 'Publisher profile, branding and configuration'],
]

function naturalCompare(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[ch]))
}

function setMessage(message, type = 'info') {
  const node = document.querySelector('#toast')
  if (!node) return
  node.textContent = message
  node.className = `toast ${type} show`
  clearTimeout(setMessage.timer)
  setMessage.timer = setTimeout(() => node.classList.remove('show'), 3500)
}

async function init() {
  const { data } = await supabase.auth.getSession()
  state.session = data.session
  if (state.session) await hydrateAdmin()
  render()
  supabase.auth.onAuthStateChange(async (_event, session) => {
    state.session = session
    state.isAdmin = false
    if (session) await hydrateAdmin()
    render()
  })
}

async function hydrateAdmin() {
  const { data, error } = await supabase.rpc('is_admin')
  if (error || data !== true) {
    state.isAdmin = false
    await supabase.auth.signOut()
    return
  }
  state.isAdmin = true
  await loadBooks()
}

async function loadBooks() {
  const { data, error } = await supabase.from('books').select('id,title,price,currency,status,has_audio').order('created_at')
  if (error) return setMessage(error.message, 'error')
  state.books = data || []
  if (!state.selectedBook && state.books.length) state.selectedBook = state.books[0]
  if (state.selectedBook) await loadPages(state.selectedBook.id)
}

async function loadPages(bookId) {
  const { data, error } = await supabase.from('book_pages').select('*').eq('book_id', bookId).order('sort_order')
  if (error) return setMessage(error.message, 'error')
  state.pages = data || []
  await Promise.all(state.pages.map(async page => {
    const { data: signed } = await supabase.storage.from('book-assets').createSignedUrl(page.storage_path, 3600)
    page.url = signed?.signedUrl || ''
  }))
}

async function login(event) {
  event.preventDefault()
  const form = new FormData(event.currentTarget)
  const email = String(form.get('email') || '').trim()
  const password = String(form.get('password') || '')
  const button = event.currentTarget.querySelector('button')
  button.disabled = true
  button.textContent = 'Signing in…'
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    button.disabled = false
    button.textContent = 'Sign in'
    setMessage('Unable to sign in. Check your credentials.', 'error')
  }
}

async function logout() {
  await supabase.auth.signOut()
}

function openPanel(name) {
  state.panel = name
  render()
}

function closePanel() {
  state.panel = null
  render()
}

async function selectBook(id) {
  state.selectedBook = state.books.find(b => b.id === id)
  await loadPages(id)
  render()
}

function sanitizeFilename(name) {
  return name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'page'
}

async function uploadFiles(fileList) {
  const book = state.selectedBook
  if (!book) return setMessage('Choose a book first.', 'error')
  const files = [...fileList].filter(file => ['image/jpeg','image/png','image/webp'].includes(file.type))
  if (!files.length) return setMessage('Choose JPG, PNG or WebP page images.', 'error')
  files.sort((a,b) => naturalCompare(a.name,b.name))
  let completed = 0
  for (const file of files) {
    state.uploadProgress = { completed, total: files.length, current: file.name }
    render()
    const path = `${book.id}/pages/${crypto.randomUUID()}-${sanitizeFilename(file.name)}`
    const { error: uploadError } = await supabase.storage.from('book-assets').upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type })
    if (uploadError) {
      setMessage(`Upload failed: ${file.name}`, 'error')
      continue
    }
    const { error: registerError } = await supabase.rpc('register_book_page', {
      p_book_id: book.id,
      p_storage_path: path,
      p_original_filename: file.name,
      p_mime_type: file.type,
      p_file_size_bytes: file.size,
      p_width_px: null,
      p_height_px: null,
      p_page_type: 'content',
      p_checksum_sha256: null,
    })
    if (registerError) {
      await supabase.storage.from('book-assets').remove([path])
      setMessage(`Could not register: ${file.name}`, 'error')
      continue
    }
    completed++
  }
  state.uploadProgress = null
  await loadPages(book.id)
  render()
  setMessage(`${completed} page${completed === 1 ? '' : 's'} uploaded.`, completed === files.length ? 'success' : 'info')
}

async function autoArrange() {
  if (state.pages.length < 2) return
  const sorted = [...state.pages].sort((a,b) => naturalCompare(a.original_filename,b.original_filename))
  await persistOrder(sorted)
  setMessage('Pages arranged by filename.', 'success')
}

async function persistOrder(orderedPages) {
  const ids = orderedPages.map(p => p.id)
  const { error } = await supabase.rpc('reorder_book_pages', { p_book_id: state.selectedBook.id, p_page_ids: ids })
  if (error) return setMessage(error.message, 'error')
  await loadPages(state.selectedBook.id)
  render()
}

let draggedId = null
function dragStart(id) { draggedId = id }
async function dropOn(targetId) {
  if (!draggedId || draggedId === targetId) return
  const pages = [...state.pages]
  const from = pages.findIndex(p => p.id === draggedId)
  const to = pages.findIndex(p => p.id === targetId)
  const [item] = pages.splice(from, 1)
  pages.splice(to, 0, item)
  draggedId = null
  await persistOrder(pages)
}

async function changePageType(id, type) {
  const { error } = await supabase.from('book_pages').update({ page_type: type }).eq('id', id)
  if (error) return setMessage(error.message, 'error')
  await loadPages(state.selectedBook.id)
  render()
}

async function deletePage(id) {
  const page = state.pages.find(p => p.id === id)
  if (!page || !confirm(`Delete ${page.original_filename}?`)) return
  const { error: storageError } = await supabase.storage.from('book-assets').remove([page.storage_path])
  if (storageError) return setMessage(storageError.message, 'error')
  const { error } = await supabase.from('book_pages').delete().eq('id', id)
  if (error) return setMessage(error.message, 'error')
  const remaining = state.pages.filter(p => p.id !== id)
  if (remaining.length) await persistOrder(remaining)
  else { await loadPages(state.selectedBook.id); render() }
  setMessage('Page deleted.', 'success')
}

async function replacePage(id, file) {
  if (!file || !['image/jpeg','image/png','image/webp'].includes(file.type)) return setMessage('Choose a JPG, PNG or WebP image.', 'error')
  const page = state.pages.find(p => p.id === id)
  if (!page) return
  const path = `${state.selectedBook.id}/pages/${crypto.randomUUID()}-${sanitizeFilename(file.name)}`
  const { error: uploadError } = await supabase.storage.from('book-assets').upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type })
  if (uploadError) return setMessage(uploadError.message, 'error')
  const { error } = await supabase.from('book_pages').update({ storage_path: path, original_filename: file.name, mime_type: file.type, file_size_bytes: file.size }).eq('id', id)
  if (error) {
    await supabase.storage.from('book-assets').remove([path])
    return setMessage(error.message, 'error')
  }
  await supabase.storage.from('book-assets').remove([page.storage_path])
  await loadPages(state.selectedBook.id)
  render()
  setMessage('Page replaced.', 'success')
}

async function publishBook() {
  if (!state.selectedBook) return
  if (!state.pages.length) return setMessage('Upload pages before publishing.', 'error')
  const { error } = await supabase.from('books').update({ status: 'active' }).eq('id', state.selectedBook.id)
  if (error) return setMessage(error.message, 'error')
  state.selectedBook.status = 'active'
  render()
  setMessage('Book marked as published.', 'success')
}

function loginView() {
  return `
    <main class="login-shell">
      <section class="login-card glass">
        <div class="eyebrow">PAGES TECHNOLOGY</div>
        <h1>Publisher Console</h1>
        <p class="muted">Private administration area. Authorized publishers only.</p>
        <form id="login-form" class="login-form">
          <label>Email<input name="email" type="email" autocomplete="username" required /></label>
          <label>Password<input name="password" type="password" autocomplete="current-password" required /></label>
          <button class="primary" type="submit">Sign in</button>
        </form>
      </section>
    </main>`
}

function featureCards() {
  return futureFeatures.map(([name, desc]) => `
    <button class="feature-card glass" data-open="${escapeHtml(name)}">
      <span class="coming">COMING SOON</span>
      <strong>${escapeHtml(name)}</strong>
      <span>${escapeHtml(desc)}</span>
    </button>`).join('')
}

function rails() {
  return `
    <nav class="rail rail-left">
      <button data-open="Book Pages">Book Pages</button>
      <button data-open="Customers">Customers</button>
    </nav>
    <nav class="rail rail-right">
      <button data-open="Payments">Payments</button>
      <button data-open="Sales">Sales</button>
    </nav>
    <nav class="rail rail-top">
      <button data-open="Analytics">Analytics</button>
      <button data-open="SEO">SEO</button>
    </nav>
    <nav class="rail rail-bottom">
      <button data-open="Settings">Settings</button>
      <button data-open="Business">Business</button>
    </nav>`
}

function uploadPanel() {
  const bookOptions = state.books.map(book => `<option value="${book.id}" ${state.selectedBook?.id === book.id ? 'selected' : ''}>${escapeHtml(book.title)} · ₱${Number(book.price).toLocaleString()}</option>`).join('')
  const pageCards = state.pages.map((page, index) => `
    <article class="page-card" draggable="true" data-drag="${page.id}" data-drop="${page.id}">
      <div class="page-image">${page.url ? `<img src="${page.url}" alt="Page ${index + 1}" />` : '<span>Preview unavailable</span>'}</div>
      <div class="page-meta">
        <strong>Page ${index + 1}</strong>
        <span title="${escapeHtml(page.original_filename)}">${escapeHtml(page.original_filename)}</span>
        <select data-page-type="${page.id}">
          ${['front_cover','inside_cover','content','back_cover'].map(type => `<option value="${type}" ${page.page_type === type ? 'selected' : ''}>${type.replaceAll('_',' ')}</option>`).join('')}
        </select>
        <div class="page-actions">
          <label class="small-button">Replace<input data-replace="${page.id}" type="file" accept="image/jpeg,image/png,image/webp" hidden /></label>
          <button class="small-button danger" data-delete="${page.id}">Delete</button>
        </div>
      </div>
    </article>`).join('')
  const progress = state.uploadProgress ? `<div class="progress-wrap"><div class="progress-copy"><span>Uploading ${state.uploadProgress.completed + 1} of ${state.uploadProgress.total}</span><span>${escapeHtml(state.uploadProgress.current)}</span></div><div class="progress"><i style="width:${Math.round((state.uploadProgress.completed / state.uploadProgress.total) * 100)}%"></i></div></div>` : ''
  return `
    <div class="panel panel-left glass panel-large">
      <div class="panel-header">
        <div><span class="eyebrow">LIVE FUNCTION</span><h2>Book Pages</h2></div>
        <button class="icon-button" data-close aria-label="Close">×</button>
      </div>
      <div class="book-toolbar">
        <label>Choose book<select id="book-select">${bookOptions}</select></label>
        <span class="status-pill ${state.selectedBook?.status === 'active' ? 'active' : ''}">${escapeHtml(state.selectedBook?.status || 'draft')}</span>
      </div>
      <label class="dropzone" id="dropzone">
        <input id="page-files" type="file" multiple accept="image/jpeg,image/png,image/webp" hidden />
        <span class="drop-icon">＋</span>
        <strong>Upload book pages</strong>
        <span>Drag JPG, PNG or WebP pages here, or browse files.</span>
      </label>
      ${progress}
      <div class="panel-actions">
        <button class="secondary" id="auto-arrange" ${state.pages.length < 2 ? 'disabled' : ''}>Auto-arrange by filename</button>
        <button class="secondary" id="preview-book" ${!state.pages.length ? 'disabled' : ''}>Preview</button>
        <button class="primary" id="publish-book" ${!state.pages.length ? 'disabled' : ''}>Publish</button>
      </div>
      <div class="page-count">${state.pages.length} page${state.pages.length === 1 ? '' : 's'} · drag cards to reorder</div>
      <div class="page-grid">${pageCards || '<div class="empty-state">No pages uploaded yet.</div>'}</div>
    </div>`
}

function comingPanel(name) {
  return `
    <div class="panel panel-right glass">
      <div class="panel-header"><div><span class="eyebrow">COMING SOON</span><h2>${escapeHtml(name)}</h2></div><button class="icon-button" data-close>×</button></div>
      <div class="coming-panel-copy">
        <div class="coming-orb">✦</div>
        <p>This area is already reserved in the production console. Its controls will be activated in a later release without changing the dashboard structure.</p>
      </div>
    </div>`
}

function previewModal() {
  if (state.panel !== 'Preview') return ''
  const page = state.pages[state.previewIndex]
  return `<div class="modal-backdrop" data-preview-close>
    <div class="preview-modal glass" onclick="event.stopPropagation()">
      <button class="icon-button preview-close" data-preview-close>×</button>
      <div class="preview-stage">${page?.url ? `<img src="${page.url}" alt="Preview page" />` : ''}</div>
      <div class="preview-controls">
        <button class="secondary" id="preview-prev" ${state.previewIndex === 0 ? 'disabled' : ''}>Previous</button>
        <span>${state.previewIndex + 1} / ${state.pages.length}</span>
        <button class="secondary" id="preview-next" ${state.previewIndex >= state.pages.length - 1 ? 'disabled' : ''}>Next</button>
      </div>
    </div>
  </div>`
}

function dashboardView() {
  const email = escapeHtml(state.session?.user?.email || '')
  return `
    <div class="dashboard-shell">
      ${rails()}
      <header class="topbar">
        <div><span class="eyebrow">PAGES TECHNOLOGY</span><h1>Publisher Console</h1></div>
        <div class="topbar-user"><span>${email}</span><button class="secondary" id="logout">Sign out</button></div>
      </header>
      <main class="dashboard-main">
        <section class="hero glass">
          <div><span class="live-dot"></span><span class="eyebrow">INITIAL PRODUCTION RELEASE</span></div>
          <h2>Your publishing workspace is taking shape.</h2>
          <p>Book Page Upload & Management is live now. The rest of the console is already mapped and will activate here as the platform expands.</p>
          <button class="primary" data-open="Book Pages">Open Book Pages</button>
        </section>
        <section class="feature-grid">${featureCards()}</section>
      </main>
      <div class="panel-layer">${state.panel === 'Book Pages' ? uploadPanel() : (state.panel && state.panel !== 'Preview' ? comingPanel(state.panel) : '')}</div>
      ${previewModal()}
    </div>`
}

function render() {
  document.querySelector('#app').innerHTML = `${state.session && state.isAdmin ? dashboardView() : loginView()}<div id="toast" class="toast"></div>`
  bindEvents()
}

function bindEvents() {
  document.querySelector('#login-form')?.addEventListener('submit', login)
  document.querySelector('#logout')?.addEventListener('click', logout)
  document.querySelectorAll('[data-open]').forEach(el => el.addEventListener('click', () => openPanel(el.dataset.open)))
  document.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closePanel))
  document.querySelector('#book-select')?.addEventListener('change', e => selectBook(e.target.value))
  const dropzone = document.querySelector('#dropzone')
  const input = document.querySelector('#page-files')
  input?.addEventListener('change', e => uploadFiles(e.target.files))
  dropzone?.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('dragover') })
  dropzone?.addEventListener('dragleave', () => dropzone.classList.remove('dragover'))
  dropzone?.addEventListener('drop', e => { e.preventDefault(); dropzone.classList.remove('dragover'); uploadFiles(e.dataTransfer.files) })
  document.querySelector('#auto-arrange')?.addEventListener('click', autoArrange)
  document.querySelector('#publish-book')?.addEventListener('click', publishBook)
  document.querySelector('#preview-book')?.addEventListener('click', () => { state.previewIndex = 0; state.panel = 'Preview'; render() })
  document.querySelectorAll('[data-drag]').forEach(el => el.addEventListener('dragstart', () => dragStart(el.dataset.drag)))
  document.querySelectorAll('[data-drop]').forEach(el => {
    el.addEventListener('dragover', e => e.preventDefault())
    el.addEventListener('drop', () => dropOn(el.dataset.drop))
  })
  document.querySelectorAll('[data-page-type]').forEach(el => el.addEventListener('change', e => changePageType(el.dataset.pageType, e.target.value)))
  document.querySelectorAll('[data-delete]').forEach(el => el.addEventListener('click', () => deletePage(el.dataset.delete)))
  document.querySelectorAll('[data-replace]').forEach(el => el.addEventListener('change', e => replacePage(el.dataset.replace, e.target.files?.[0])))
  document.querySelectorAll('[data-preview-close]').forEach(el => el.addEventListener('click', () => { state.panel = 'Book Pages'; render() }))
  document.querySelector('#preview-prev')?.addEventListener('click', () => { state.previewIndex--; render() })
  document.querySelector('#preview-next')?.addEventListener('click', () => { state.previewIndex++; render() })
}

init()
