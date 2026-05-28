function EcommerceDashboardPage() {
  return (
    <section className="ecommerce-dashboard" aria-label="Ecommerce dashboard">
      <header className="ecommerce-dashboard-head">
        <div>
          <p className="ecommerce-breadcrumb">Dashboard &gt; Ecommerce</p>
          <h1>eCommerce</h1>
          <p className="ecommerce-subtitle">Sales performance and product analytics</p>
        </div>
      </header>

      <section className="ecommerce-hero" aria-label="Sales summary">
        <div className="ecommerce-hero-main">
          <div className="ecommerce-hero-copy">
            <p className="ecommerce-kicker">Total Sales</p>
            <strong className="ecommerce-sum">$182,420</strong>
            <p className="ecommerce-meta">
              vs $165,200 last month <span className="ecommerce-chip is-positive">+10.4%</span>
            </p>
          </div>

          <div className="ecommerce-chart" aria-hidden="true">
            <div className="ecommerce-chart-line" />
          </div>
        </div>

        <aside className="ecommerce-hero-side" aria-label="Quick metrics">
          <article className="ecommerce-side-card">
            <span className="ecommerce-side-icon is-blue">$</span>
            <div>
              <p className="ecommerce-side-label">Avg. Order Value</p>
              <strong>$142</strong>
            </div>
          </article>

          <article className="ecommerce-side-card">
            <span className="ecommerce-side-icon is-green">🛒</span>
            <div>
              <p className="ecommerce-side-label">Orders Today</p>
              <strong>23</strong>
            </div>
          </article>

          <article className="ecommerce-side-card">
            <span className="ecommerce-side-icon is-red">↩</span>
            <div>
              <p className="ecommerce-side-label">Refund Rate</p>
              <strong>2.1%</strong>
            </div>
          </article>
        </aside>
      </section>

      <section className="ecommerce-pipeline" aria-label="Order pipeline">
        <article className="ecommerce-pipeline-card">
          <span className="ecommerce-pipeline-icon is-orange">◔</span>
          <strong>24</strong>
          <p>Pending</p>
        </article>
        <article className="ecommerce-pipeline-card">
          <span className="ecommerce-pipeline-icon is-blue">✳</span>
          <strong>18</strong>
          <p>Processing</p>
        </article>
        <article className="ecommerce-pipeline-card">
          <span className="ecommerce-pipeline-icon is-violet">🚚</span>
          <strong>156</strong>
          <p>Shipped</p>
        </article>
        <article className="ecommerce-pipeline-card">
          <span className="ecommerce-pipeline-icon is-green">✓</span>
          <strong>1086</strong>
          <p>Delivered</p>
        </article>
      </section>

      <section className="ecommerce-grid" aria-label="Analytics sections">
        <article className="ecommerce-panel">
          <div className="ecommerce-panel-head">
            <h2>Sales by Category</h2>
          </div>

          <div className="ecommerce-bars" aria-hidden="true">
            <div className="ecommerce-bar-row">
              <div className="ecommerce-bar-label">
                <span>Electronics</span>
                <span>$68.4K (38%)</span>
              </div>
              <div className="ecommerce-bar-track"><div className="ecommerce-bar-fill is-green" style={{ width: '38%' }} /></div>
            </div>
            <div className="ecommerce-bar-row">
              <div className="ecommerce-bar-label">
                <span>Wearables</span>
                <span>$42.3K (23%)</span>
              </div>
              <div className="ecommerce-bar-track"><div className="ecommerce-bar-fill is-blue" style={{ width: '23%' }} /></div>
            </div>
            <div className="ecommerce-bar-row">
              <div className="ecommerce-bar-label">
                <span>Accessories</span>
                <span>$31.2K (17%)</span>
              </div>
              <div className="ecommerce-bar-track"><div className="ecommerce-bar-fill is-orange" style={{ width: '17%' }} /></div>
            </div>
            <div className="ecommerce-bar-row">
              <div className="ecommerce-bar-label">
                <span>Home &amp; Office</span>
                <span>$24.5K (13%)</span>
              </div>
              <div className="ecommerce-bar-track"><div className="ecommerce-bar-fill is-violet" style={{ width: '13%' }} /></div>
            </div>
          </div>
        </article>

        <article className="ecommerce-panel">
          <div className="ecommerce-panel-head">
            <h2>Top Products</h2>
          </div>

          <ul className="ecommerce-products">
            <li>
              <div>
                <strong>Wireless Noise-Cancelling Headphones</strong>
                <span>342 units sold</span>
              </div>
              <span className="ecommerce-price">$27.4K</span>
            </li>
            <li>
              <div>
                <strong>Smart Fitness Watch Pro</strong>
                <span>278 units sold</span>
              </div>
              <span className="ecommerce-price">$22.2K</span>
            </li>
            <li>
              <div>
                <strong>Portable Bluetooth Speaker</strong>
                <span>198 units sold</span>
              </div>
              <span className="ecommerce-price">$12.9K</span>
            </li>
          </ul>
        </article>
      </section>
    </section>
  )
}

export default EcommerceDashboardPage