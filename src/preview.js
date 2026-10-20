import './styles.css'

const brandStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&display=swap');

  .preview-shell {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 0;
    overflow: hidden;
    isolation: isolate;
    background:
      radial-gradient(circle at 50% 46%, rgba(255,255,255,1) 0 24%, rgba(249,250,251,.98) 46%, rgba(239,241,244,.9) 100%);
  }

  .publisher-identity {
    position: relative;
    z-index: 1;
    width: min(88vw, 1220px);
    display: grid;
    place-items: center;
    text-align: center;
    pointer-events: none;
    user-select: none;
  }

  .publisher-title {
    margin: 0;
    display: grid;
    place-items: center;
    gap: clamp(10px, 1.4vw, 18px);
    font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
    font-weight: 600;
    line-height: .86;
    letter-spacing: -.045em;
  }

  .publisher-name,
  .publisher-word {
    display: block;
    color: transparent;
    -webkit-text-fill-color: transparent;
    -webkit-background-clip: text;
    background-clip: text;
    background-image:
      radial-gradient(circle at 12% 26%, rgba(255,255,255,.95) 0 1px, transparent 1.6px),
      radial-gradient(circle at 38% 72%, rgba(255,255,255,.78) 0 1px, transparent 1.6px),
      radial-gradient(circle at 61% 28%, rgba(255,255,255,.9) 0 1px, transparent 1.7px),
      radial-gradient(circle at 86% 64%, rgba(255,255,255,.72) 0 1px, transparent 1.6px),
      linear-gradient(108deg,
        #0c0e12 0%,
        #454a50 11%,
        #d9dde2 23%,
        #ffffff 31%,
        #8b9198 42%,
        #171a1f 55%,
        #f8fafc 70%,
        #a4a9af 80%,
        #2b2f34 91%,
        #0b0d10 100%);
    background-size: 240px 150px, 290px 180px, 330px 220px, 380px 240px, 220% 100%;
    filter:
      drop-shadow(0 0 5px rgba(255,255,255,.6))
      drop-shadow(0 10px 20px rgba(17,24,39,.12));
    animation: silverSweep 10s ease-in-out infinite alternate;
  }

  .publisher-name {
    font-size: clamp(68px, 10.7vw, 156px);
    white-space: nowrap;
  }

  .publisher-word {
    font-size: clamp(28px, 3.8vw, 54px);
    font-weight: 500;
    letter-spacing: .28em;
    padding-left: .28em;
    line-height: 1.08;
  }

  .publisher-sparkle {
    position: absolute;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: rgba(255,255,255,.92);
    box-shadow:
      128px -46px 0 rgba(255,255,255,.65),
      -172px 62px 0 rgba(255,255,255,.58),
      238px 52px 0 rgba(255,255,255,.5),
      -286px -38px 0 rgba(255,255,255,.44),
      338px -18px 0 rgba(255,255,255,.36);
    filter: drop-shadow(0 0 5px rgba(255,255,255,.85));
    opacity: .72;
    animation: softTwinkle 4.8s ease-in-out infinite alternate;
  }

  .preview-panel-layer {
    position: fixed;
    inset: 0;
    z-index: 40;
    pointer-events: none;
  }

  .preview-panel {
    position: absolute;
    top: 24px;
    bottom: 24px;
    width: min(510px, calc(100vw - 48px));
    display: grid;
    grid-template-rows: auto 1fr;
    gap: 24px;
    padding: 30px;
    border: 1px solid rgba(17,24,39,.08);
    border-radius: 30px;
    background: rgba(255,255,255,.94);
    box-shadow: 0 30px 90px rgba(17,24,39,.14);
    backdrop-filter: blur(24px) saturate(135%);
    -webkit-backdrop-filter: blur(24px) saturate(135%);
    pointer-events: auto;
    opacity: 0;
  }

  .preview-panel[data-side="left"] {
    left: 24px;
    transform: translateX(calc(-100% - 40px));
  }

  .preview-panel[data-side="right"] {
    right: 24px;
    transform: translateX(calc(100% + 40px));
  }

  .preview-panel.is-open[data-side="left"],
  .preview-panel.is-open[data-side="right"] {
    transform: translateX(0);
    opacity: 1;
    transition: transform .34s cubic-bezier(.22,.8,.24,1), opacity .22s ease;
  }

  .preview-panel-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
  }

  .preview-panel-kicker {
    margin: 0 0 7px;
    color: #98a2b3;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .16em;
    text-transform: uppercase;
  }

  .preview-panel-title {
    margin: 0;
    color: #111827;
    font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
    font-size: clamp(38px, 4vw, 54px);
    font-weight: 600;
    letter-spacing: -.035em;
    line-height: .95;
  }

  .preview-panel-close {
    width: 40px;
    height: 40px;
    flex: 0 0 40px;
    border: 1px solid #e5e7eb;
    border-radius: 50%;
    background: #fff;
    color: #475467;
    font-size: 23px;
    line-height: 1;
  }

  .preview-panel-body {
    display: grid;
    place-items: center;
    align-content: center;
    min-height: 0;
    padding: 28px;
    border: 1px dashed #d0d5dd;
    border-radius: 22px;
    color: #667085;
    text-align: center;
    line-height: 1.65;
  }

  .preview-panel-body strong {
    display: block;
    margin-bottom: 6px;
    color: #344054;
    font-size: 14px;
  }

  .rail button.is-active {
    background: #f2f4f7;
    color: #111827;
  }

  @keyframes silverSweep {
    from { background-position: 0 0, 0 0, 0 0, 0 0, 8% 50%; }
    to { background-position: 32px -12px, -24px 20px, 18px 28px, -14px -20px, 92% 50%; }
  }

  @keyframes softTwinkle {
    0%, 35% { opacity: .28; transform: scale(.9); }
    70%, 100% { opacity: .78; transform: scale(1.18); }
  }

  @media (max-width: 860px) {
    .preview-shell { padding: 96px 18px 104px; }
    .publisher-name { white-space: normal; font-size: clamp(58px, 15vw, 96px); line-height: .9; }
    .publisher-word { font-size: clamp(25px, 7vw, 40px); letter-spacing: .2em; padding-left: .2em; }
    .publisher-sparkle { transform: scale(.8); }
    .preview-panel { top: 12px; bottom: 12px; width: min(470px, calc(100vw - 24px)); padding: 24px; }
    .preview-panel[data-side="left"] { left: 12px; }
    .preview-panel[data-side="right"] { right: 12px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .publisher-name,
    .publisher-word,
    .publisher-sparkle { animation: none; }
    .preview-panel { transition: none !important; }
  }
`

const panelSides = {
  Analytics: 'left',
  'Book Pages': 'left',
  Payments: 'left',
  Settings: 'left',
  SEO: 'right',
  Customers: 'right',
  Sales: 'right',
  Business: 'right',
}

function navButton(label) {
  return `<button type="button" data-panel="${label}" data-side="${panelSides[label]}">${label}</button>`
}

function rails() {
  return `
    <nav class="rail rail-left" aria-label="Content navigation">
      ${navButton('Book Pages')}
      ${navButton('Customers')}
    </nav>
    <nav class="rail rail-right" aria-label="Commerce navigation">
      ${navButton('Payments')}
      ${navButton('Sales')}
    </nav>
    <nav class="rail rail-top" aria-label="Insights navigation">
      ${navButton('Analytics')}
      ${navButton('SEO')}
    </nav>
    <nav class="rail rail-bottom" aria-label="Business navigation">
      ${navButton('Settings')}
      ${navButton('Business')}
    </nav>
  `
}

function publisherIdentity() {
  return `
    <section class="publisher-identity" aria-label="Victoria P. Carlos Publishing">
      <span class="publisher-sparkle" aria-hidden="true"></span>
      <h1 class="publisher-title">
        <span class="publisher-name">Victoria P. Carlos</span>
        <span class="publisher-word">Publishing</span>
      </h1>
    </section>
  `
}

function panelMarkup() {
  return `
    <div class="preview-panel-layer" aria-live="polite"></div>
  `
}

function closePanel() {
  const layer = document.querySelector('.preview-panel-layer')
  const panel = layer?.querySelector('.preview-panel')
  if (panel) panel.classList.remove('is-open')

  document.querySelectorAll('.rail button').forEach(button => button.classList.remove('is-active'))

  window.setTimeout(() => {
    if (layer && !layer.querySelector('.preview-panel.is-open')) layer.innerHTML = ''
  }, 360)
}

function openPanel(label, side, trigger) {
  const layer = document.querySelector('.preview-panel-layer')
  if (!layer) return

  document.querySelectorAll('.rail button').forEach(button => button.classList.remove('is-active'))
  trigger.classList.add('is-active')

  layer.innerHTML = `
    <section class="preview-panel" data-side="${side}" aria-label="${label} panel">
      <header class="preview-panel-header">
        <div>
          <p class="preview-panel-kicker">Publisher Console</p>
          <h2 class="preview-panel-title">${label}</h2>
        </div>
        <button class="preview-panel-close" type="button" aria-label="Close ${label} panel">×</button>
      </header>
      <div class="preview-panel-body">
        <div>
          <strong>${label}</strong>
          This panel is ready for its workspace content.
        </div>
      </div>
    </section>
  `

  const panel = layer.querySelector('.preview-panel')
  requestAnimationFrame(() => panel?.classList.add('is-open'))
  layer.querySelector('.preview-panel-close')?.addEventListener('click', closePanel)
}

function bindNavigation() {
  document.querySelectorAll('.rail button[data-panel]').forEach(button => {
    button.addEventListener('click', () => {
      const label = button.dataset.panel
      const side = button.dataset.side
      const current = document.querySelector('.preview-panel.is-open')

      if (current) {
        current.classList.remove('is-open')
        window.setTimeout(() => openPanel(label, side, button), 210)
      } else {
        openPanel(label, side, button)
      }
    })
  })

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closePanel()
  })
}

function render() {
  const style = document.createElement('style')
  style.id = 'publisher-preview-brand-styles'
  style.textContent = brandStyles
  document.head.appendChild(style)

  document.querySelector('#app').innerHTML = `
    <main class="dashboard-shell preview-shell">
      ${publisherIdentity()}
      ${rails()}
      ${panelMarkup()}
    </main>
  `

  bindNavigation()
}

render()
