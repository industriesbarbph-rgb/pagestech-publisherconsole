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
  }

  @media (prefers-reduced-motion: reduce) {
    .publisher-name,
    .publisher-word,
    .publisher-sparkle { animation: none; }
  }
`

function rails() {
  return `
    <nav class="rail rail-left" aria-label="Content navigation">
      <button type="button">Book Pages</button>
      <button type="button">Customers</button>
    </nav>
    <nav class="rail rail-right" aria-label="Commerce navigation">
      <button type="button">Payments</button>
      <button type="button">Sales</button>
    </nav>
    <nav class="rail rail-top" aria-label="Insights navigation">
      <button type="button">Analytics</button>
      <button type="button">SEO</button>
    </nav>
    <nav class="rail rail-bottom" aria-label="Business navigation">
      <button type="button">Settings</button>
      <button type="button">Business</button>
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

function render() {
  const style = document.createElement('style')
  style.id = 'publisher-preview-brand-styles'
  style.textContent = brandStyles
  document.head.appendChild(style)

  document.querySelector('#app').innerHTML = `
    <main class="dashboard-shell preview-shell">
      ${publisherIdentity()}
      ${rails()}
    </main>
  `
}

render()
