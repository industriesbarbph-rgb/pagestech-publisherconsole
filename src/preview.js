import './styles.css'

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

function render() {
  document.querySelector('#app').innerHTML = `<main class="dashboard-shell">${rails()}</main>`
}

render()
