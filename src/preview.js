import './styles.css'

const state = {
  panel: null,
  selectedBookId: '2e8d922a-b000-41a8-a8e3-e0cb3c9a3086',
}

const books = [
  { id: '2e8d922a-b000-41a8-a8e3-e0cb3c9a3086', title: 'Book 1', price: 780, status: 'draft' },
  { id: '18fb807e-5845-4a38-9123-44e26adf5ab0', title: 'Book 2', price: 995, status: 'draft' },
  { id: '1a23d1f2-b81e-43ab-af1b-13f62ba5b7b2', title: 'Book 3', price: 895, status: 'draft' },
  { id: '224dd867-489e-40b4-9e64-37810bfe368d', title: 'Book 4', price: 850, status: 'draft' },
]

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

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[ch]))
}

function selectedBook() {
  return books.find(book => book.id === state.selectedBookId) || books[0]
}

function setMessage(message) {
  const node = document.querySelector('#toast')
  if (!node) return
  node.textContent = message
  node.className = 'toast info show'
  clearTimeout(setMessage.timer)
  setMessage.timer = setTimeout(() => node.classList.remove('show'), 3200)
}

function openPanel(name) {
  state.panel = name
  render()
}

function closePanel() {
  state.panel = null
  render()
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

function featureCards() {
  return futureFeatures.map(([name, desc]) => `
    <button class="feature-card glass" data-open="${escapeHtml(name)}">
      <span class="coming">COMING SOON</span>
      <strong>${escapeHtml(name)}</strong>
      <span>${escapeHtml(desc)}</span>
    </button>`).join('')
}

function uploadPanel() {
  const book = selectedBook()
  const options = books.map(item => `<option value="${item.id}" ${item.id === book.id ? 'selected' : ''}>${escapeHtml(item.title)} · ₱${item.price.toLocaleString()}</option>`).join('')
  return `
    <div class="panel panel-left glass panel-large">
      <div class="panel-header">
        <div><span class="eyebrow">BOOK PUBLISHING</span><h2>Book Pages</h2></div>
        <button class="icon-button" data-close aria-label="Close">×</button>
      </div>
      <div class="book-toolbar">
        <label>Choose book<select id="book-select">${options}</select></label>
        <span class="status-pill">${book.status}</span>
      </div>
      <label class="dropzone" id="dropzone">
        <input id="page-files" type="file" multiple accept="image/jpeg,image/png,image/webp" hidden />
        <span class="drop-icon">＋</span>
        <strong>Upload book pages</strong>
        <span>Drag JPG, PNG or WebP pages here, or browse files.</span>
      </label>
      <div class="panel-actions">
        <button class="secondary" data-preview-action>Auto-arrange by filename</button>
        <button class="secondary" data-preview-action>Preview</button>
        <button class="primary" data-preview-action>Publish</button>
      </div>
      <div class="page-count">0 pages · page manager ready for publisher uploads</div>
      <div class="page-grid"><div class="empty-state">No pages uploaded yet.</div></div>
    </div>`
}

function comingPanel(name) {
  return `
    <div class="panel panel-right glass">
      <div class="panel-header">
        <div><span class="eyebrow">COMING SOON</span><h2>${escapeHtml(name)}</h2></div>
        <button class="icon-button" data-close aria-label="Close">×</button>
      </div>
      <div class="coming-panel-copy">
        <div class="coming-orb">✦</div>
        <p>This area is already reserved in the publisher console. Its controls will activate as we build out the platform.</p>
      </div>
    </div>`
}

function dashboardView() {
  return `
    <div class="dashboard-shell">
      ${rails()}
      <header class="topbar">
        <div>
          <span class="eyebrow">CARLOS PUBLISHING</span>
          <h1>Publisher Console</h1>
        </div>
        <div class="topbar-user">
          <span>Preview mode</span>
          <span class="status-pill active">Powered by Pages Technology</span>
        </div>
      </header>
      <main class="dashboard-main">
        <section class="hero glass">
          <div><span class="live-dot"></span><span class="eyebrow">PUBLISHER WORKSPACE</span></div>
          <h2>Your publishing workspace.</h2>
          <p>Book Page Upload & Management is the first live workspace. Sales, payments, customers, analytics, SEO and the rest of the publishing operations are mapped into the same console.</p>
          <button class="primary" data-open="Book Pages">Open Book Pages</button>
        </section>
        <section class="feature-grid">${featureCards()}</section>
      </main>
      <div class="panel-layer">${state.panel === 'Book Pages' ? uploadPanel() : (state.panel ? comingPanel(state.panel) : '')}</div>
    </div>`
}

function render() {
  document.querySelector('#app').innerHTML = `${dashboardView()}<div id="toast" class="toast"></div>`
  bindEvents()
}

function bindEvents() {
  document.querySelectorAll('[data-open]').forEach(el => el.addEventListener('click', () => openPanel(el.dataset.open)))
  document.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closePanel))
  document.querySelector('#book-select')?.addEventListener('change', event => {
    state.selectedBookId = event.target.value
    render()
  })
  document.querySelector('#page-files')?.addEventListener('change', () => setMessage('Uploads will be activated when publisher authentication is connected.'))
  const dropzone = document.querySelector('#dropzone')
  dropzone?.addEventListener('dragover', event => { event.preventDefault(); dropzone.classList.add('dragover') })
  dropzone?.addEventListener('dragleave', () => dropzone.classList.remove('dragover'))
  dropzone?.addEventListener('drop', event => {
    event.preventDefault()
    dropzone.classList.remove('dragover')
    setMessage('Uploads will be activated when publisher authentication is connected.')
  })
  document.querySelectorAll('[data-preview-action]').forEach(el => el.addEventListener('click', () => setMessage('This control is visible for preview. Live actions stay protected until publisher login is connected.')))
}

render()
