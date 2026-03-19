import { useState, useMemo } from 'react'
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip as ChartTooltip, Legend as ChartLegend } from 'chart.js'
import { Chart } from 'react-chartjs-2'
import { brackets, champData, upsetData, r64Matchups } from './data/brackets'
import { getTeamLogo, getTeamColor } from './data/teams'
import BracketModal from './components/BracketModal'
import CompareModal from './components/CompareModal'
import './App.css'

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ChartTooltip, ChartLegend)

const colors = {
  primary: '#496ce9',
  dark: '#2D3E50',
  light: '#7ec8f8',
  accent: '#9acaed',
  seafoam: '#daf1be',
  sunrise: '#fed27a',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
}

export default function App() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedChamp, setSelectedChamp] = useState(null)
  const [sortBy, setSortBy] = useState('upsets')
  const [selectedBracket, setSelectedBracket] = useState(null)
  const [upsetFilter, setUpsetFilter] = useState('all')
  const [compareBracket, setCompareBracket] = useState(null)

  const stats = useMemo(() => {
    const upsetCounts = {}
    brackets.forEach(b => {
      upsetCounts[b.upsets] = (upsetCounts[b.upsets] || 0) + 1
    })

    const tbVals = brackets.filter(b => b.tb).map(b => b.tb)
    const tbBins = {}
    tbVals.forEach(v => {
      const bin = Math.floor(v / 10) * 10
      const l = bin + '-' + (bin + 9)
      tbBins[l] = (tbBins[l] || 0) + 1
    })

    const styleCount = { chalk: 0, balanced: 0, chaos: 0 }
    brackets.forEach(b => {
      if (b.upsets <= 3) styleCount.chalk++
      else if (b.upsets <= 6) styleCount.balanced++
      else styleCount.chaos++
    })

    const upsetLabels = Object.keys(upsetCounts)
      .map(k => parseInt(k))
      .sort((a, b) => a - b)

    // Upset correlations with champion picks
    const upsetCorrelation = {}
    champData.forEach(c => {
      const bracketsWithChamp = brackets.filter(b => b.champ === c.team)
      const avgUpsets = bracketsWithChamp.length > 0
        ? (bracketsWithChamp.reduce((sum, b) => sum + b.upsets, 0) / bracketsWithChamp.length).toFixed(1)
        : 0
      upsetCorrelation[c.team] = avgUpsets
    })

    return {
      total: brackets.length,
      upsetCounts,
      tbBins,
      styleCount,
      upsetLabels,
      avgUpsets: (brackets.reduce((sum, b) => sum + b.upsets, 0) / brackets.length).toFixed(1),
      avgTb: (tbVals.length > 0 ? (tbVals.reduce((a, b) => a + b, 0) / tbVals.length).toFixed(0) : 0),
      upsetCorrelation,
      maxUpsets: Math.max(...brackets.map(b => b.upsets)),
      minUpsets: Math.min(...brackets.map(b => b.upsets)),
    }
  }, [])

  const filteredBrackets = useMemo(() => {
    let filtered = brackets
    if (selectedChamp) filtered = filtered.filter(b => b.champ === selectedChamp)

    if (upsetFilter !== 'all') {
      if (upsetFilter === 'chalk') filtered = filtered.filter(b => b.upsets <= 3)
      else if (upsetFilter === 'balanced') filtered = filtered.filter(b => b.upsets > 3 && b.upsets <= 6)
      else if (upsetFilter === 'chaos') filtered = filtered.filter(b => b.upsets > 6)
    }

    const sorted = [...filtered]
    if (sortBy === 'upsets') sorted.sort((a, b) => b.upsets - a.upsets)
    else if (sortBy === 'tb') sorted.sort((a, b) => (b.tb || 0) - (a.tb || 0))
    else sorted.sort((a, b) => a.name.localeCompare(b.name))

    return sorted
  }, [selectedChamp, sortBy, upsetFilter])

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1><span className="primary">The Baldwin Group</span> — NCAA Tournament Analysis</h1>
          <p>Comprehensive Pool Analysis • Deep Bracket Insights • Interactive Exploration</p>
        </div>
        <div className="header-stats">
          <div className="stat"><strong>{stats.total}</strong> Brackets</div>
          <div className="stat"><strong>{stats.avgUpsets}</strong> Avg Upsets</div>
          <div className="stat"><strong>{stats.avgTb}</strong> Avg TB</div>
          <div className="stat"><strong>{stats.maxUpsets}</strong> Max Upsets</div>
        </div>
      </header>

      <nav className="tabs">
        {['overview', 'champions', 'upsets', 'brackets', 'rounds', 'detailed'].map(tab => (
          <button
            key={tab}
            className={activeTab === tab ? 'tab active' : 'tab'}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' && '📊 Overview'}
            {tab === 'champions' && '🏆 Champions'}
            {tab === 'upsets' && '🔥 Deep Upsets'}
            {tab === 'brackets' && '📋 Brackets'}
            {tab === 'rounds' && '📈 Rounds'}
            {tab === 'detailed' && '🔍 All Data'}
          </button>
        ))}
      </nav>

      <main className="container">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid-3">
            <section className="card">
              <h2>Champion Distribution</h2>
              <div className="chart-container">
                <Chart
                  type="doughnut"
                  data={{
                    labels: champData.map(c => c.team),
                    datasets: [{
                      data: champData.map(c => c.count),
                      backgroundColor: champData.map(c => c.color),
                      borderColor: '#fff',
                      borderWidth: 2,
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: { legend: { position: 'right', labels: { font: { size: 11 } } } }
                  }}
                />
              </div>
              <div className="champ-legend">
                {champData.map((c, i) => (
                  <div key={i} className="legend-item">
                    <img src={getTeamLogo(c.team)} alt={c.team} className="legend-logo" />
                    <span>{c.team}: {c.count} ({c.pct}%)</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="card">
              <h2>Upsets Distribution</h2>
              <div className="chart-container">
                <Chart
                  type="bar"
                  data={{
                    labels: stats.upsetLabels.map(k => k + ' upsets'),
                    datasets: [{
                      label: 'Brackets',
                      data: stats.upsetLabels.map(k => stats.upsetCounts[k]),
                      backgroundColor: stats.upsetLabels.map(k => {
                        if (k >= 8) return colors.danger
                        if (k >= 5) return colors.warning
                        return colors.success
                      }),
                      borderRadius: 6,
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } }
                  }}
                />
              </div>
            </section>

            <section className="card">
              <h2>Bracket Styles</h2>
              <div className="chart-container">
                <Chart
                  type="doughnut"
                  data={{
                    labels: ['🧊 Chalk (0-3)', '⚖️ Balanced (4-6)', '🔥 Chaos (7+)'],
                    datasets: [{
                      data: [stats.styleCount.chalk, stats.styleCount.balanced, stats.styleCount.chaos],
                      backgroundColor: [colors.success, colors.warning, colors.danger],
                      borderColor: '#fff',
                      borderWidth: 2,
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: { legend: { position: 'right' } }
                  }}
                />
              </div>
            </section>

            <section className="card">
              <h2>Tiebreaker Spread</h2>
              <div className="chart-container">
                <Chart
                  type="bar"
                  data={{
                    labels: Object.keys(stats.tbBins),
                    datasets: [{
                      label: 'Count',
                      data: Object.values(stats.tbBins),
                      backgroundColor: colors.primary,
                      borderRadius: 6,
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } }
                  }}
                />
              </div>
            </section>

            <section className="card">
              <h2>Chaos vs Tiebreaker</h2>
              <div className="chart-container">
                <Chart
                  type="scatter"
                  data={{
                    datasets: [{
                      label: 'Brackets',
                      data: brackets.filter(b => b.tb).map(b => ({ x: b.upsets, y: b.tb })),
                      backgroundColor: colors.primary,
                      pointRadius: 5,
                      pointHoverRadius: 7,
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { title: { display: true, text: 'Upsets' }, min: 0, max: 13 },
                      y: { title: { display: true, text: 'Tiebreaker' }, min: 60, max: 200 }
                    }
                  }}
                />
              </div>
            </section>

            <section className="card">
              <h2>Champion Upset Correlation</h2>
              <div className="correlation-list">
                {champData.map((c, i) => (
                  <div key={i} className="correlation-item">
                    <img src={getTeamLogo(c.team)} alt={c.team} className="corr-logo" />
                    <div className="corr-info">
                      <div className="corr-team">{c.team}</div>
                      <div className="corr-stat">Avg Upsets: {stats.upsetCorrelation[c.team]}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* CHAMPIONS TAB */}
        {activeTab === 'champions' && (
          <div>
            <div className="filter-bar">
              <button
                className={selectedChamp === null ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setSelectedChamp(null)}
              >
                All Teams ({brackets.length})
              </button>
              {champData.map(c => (
                <button
                  key={c.team}
                  className={selectedChamp === c.team ? 'filter-btn active' : 'filter-btn'}
                  onClick={() => setSelectedChamp(c.team)}
                  style={{ borderColor: selectedChamp === c.team ? c.color : 'transparent' }}
                >
                  <img src={getTeamLogo(c.team)} alt={c.team} style={{ height: '20px' }} />
                  {c.team} ({c.count})
                </button>
              ))}
            </div>

            <div className="grid-2">
              <section className="card">
                <h2>Champion Pick Stats</h2>
                <div className="stats-grid">
                  {champData.map(c => (
                    <div
                      key={c.team}
                      className="stat-card clickable"
                      onClick={() => setSelectedChamp(c.team)}
                      style={{ borderLeftColor: c.color }}
                    >
                      <img src={getTeamLogo(c.team)} alt={c.team} className="stat-card-logo" />
                      <div className="stat-value" style={{ color: c.color }}>{c.count}</div>
                      <div className="stat-label">{c.team}</div>
                      <div className="stat-pct">{c.pct}%</div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="card">
                <h2>{selectedChamp ? selectedChamp + ' (' + champData.find(c => c.team === selectedChamp)?.count + ')' : 'All Brackets'}</h2>
                <div className="bracket-list-clickable">
                  {brackets
                    .filter(b => !selectedChamp || b.champ === selectedChamp)
                    .sort((a, b) => b.upsets - a.upsets)
                    .map((b, i) => (
                      <div
                        key={i}
                        className="bracket-card clickable"
                        onClick={() => setSelectedBracket(b)}
                      >
                        <div className="bracket-card-header">
                          <strong>{b.name}</strong>
                          <span className="bracket-card-upsets" style={{
                            color: b.upsets >= 8 ? colors.danger : b.upsets >= 5 ? colors.warning : colors.success
                          }}>
                            {b.upsets} 🔥
                          </span>
                        </div>
                        <div className="bracket-card-footer">
                          <img src={getTeamLogo(b.champ)} alt={b.champ} style={{ height: '20px' }} />
                          <span>{b.champ}</span>
                          <span className="bracket-card-tb">{b.tb || '—'}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* UPSETS TAB */}
        {activeTab === 'upsets' && (
          <div className="grid-2">
            <section className="card">
              <h2>Most Picked Upsets</h2>
              <div className="upset-list">
                {upsetData.map((u, i) => (
                  <div key={i} className="upset-item">
                    <div className="upset-rank" style={{ color: colors.danger }}>#{i + 1}</div>
                    <div className="upset-info">
                      <div className="upset-name">
                        <img src={getTeamLogo(u.team)} alt={u.team} style={{ height: '20px' }} />
                        #{u.seed} {u.team}
                      </div>
                      <div className="upset-vs">vs {u.vs}</div>
                    </div>
                    <div className="upset-stats">
                      <div className="upset-pct" style={{ color: colors.danger }}>{u.pct}%</div>
                      <div className="upset-count">{u.count}/46</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="card">
              <h2>Upset Analysis</h2>
              <div className="analysis-text">
                <p><strong>Pool Upset Trends:</strong></p>
                <ul>
                  <li>Most popular upset: #{upsetData[0].seed} {upsetData[0].team} ({upsetData[0].pct}% of brackets)</li>
                  <li>Least popular upset: #{upsetData[upsetData.length - 1].seed} {upsetData[upsetData.length - 1].team} ({upsetData[upsetData.length - 1].pct}%)</li>
                  <li>Average upsets per bracket: {stats.avgUpsets}</li>
                  <li>Range: {stats.minUpsets} - {stats.maxUpsets} upsets</li>
                  <li>Most common upset count: {stats.upsetLabels[0]} upsets</li>
                </ul>
                <p style={{ marginTop: '16px', color: colors.dark, fontWeight: 600 }}>💡 Consensus vs Contrarian:</p>
                <ul>
                  <li>{stats.styleCount.chalk} brackets (35%) are chalk picks</li>
                  <li>{stats.styleCount.balanced} brackets (48%) are balanced</li>
                  <li>{stats.styleCount.chaos} brackets (17%) are contrarian chaos</li>
                </ul>
              </div>
            </section>
          </div>
        )}

        {/* BRACKETS TAB */}
        {activeTab === 'brackets' && (
          <div>
            <div className="filter-bar">
              <select value={upsetFilter} onChange={e => setUpsetFilter(e.target.value)} className="sort-select">
                <option value="all">Filter: All Brackets</option>
                <option value="chalk">Filter: Chalk (0-3 upsets)</option>
                <option value="balanced">Filter: Balanced (4-6 upsets)</option>
                <option value="chaos">Filter: Chaos (7+ upsets)</option>
              </select>
              <div className="filter-stats">
                Showing {filteredBrackets.length} of {brackets.length} brackets (click to view details)
              </div>
            </div>

            <div className="brackets-grid">
              {filteredBrackets.map((b, i) => {
                const style = b.upsets <= 3 ? 'chalk' : b.upsets <= 6 ? 'balanced' : 'chaos'
                const styleIcon = b.upsets <= 3 ? '🧊' : b.upsets <= 6 ? '⚖️' : '🔥'
                const styleColor = b.upsets <= 3 ? colors.success : b.upsets <= 6 ? colors.warning : colors.danger

                return (
                  <div
                    key={i}
                    className="bracket-card large"
                    onClick={() => setSelectedBracket(b)}
                  >
                    <div className="bracket-card-large-header">
                      <h3>{b.name}</h3>
                      <button className="bracket-view-btn">View Details →</button>
                    </div>
                    <div className="bracket-card-large-body">
                      <div className="bracket-card-large-champ">
                        <img src={getTeamLogo(b.champ)} alt={b.champ} />
                        <div>
                          <div className="bracket-card-large-label">Champion</div>
                          <div className="bracket-card-large-value">{b.champ}</div>
                        </div>
                      </div>
                      <div className="bracket-card-large-stats">
                        <div className="bracket-card-large-stat">
                          <span className="stat-icon">{styleIcon}</span>
                          <div>
                            <div className="bracket-card-large-stat-label">Style</div>
                            <div style={{ color: styleColor, fontWeight: 700 }}>{style}</div>
                          </div>
                        </div>
                        <div className="bracket-card-large-stat">
                          <span className="stat-icon">🔥</span>
                          <div>
                            <div className="bracket-card-large-stat-label">Upsets</div>
                            <div style={{ color: b.upsets >= 8 ? colors.danger : colors.warning, fontWeight: 700 }}>{b.upsets}</div>
                          </div>
                        </div>
                        <div className="bracket-card-large-stat">
                          <span className="stat-icon">🎯</span>
                          <div>
                            <div className="bracket-card-large-stat-label">Tiebreaker</div>
                            <div style={{ fontWeight: 700 }}>{b.tb || '—'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ROUNDS TAB */}
        {activeTab === 'rounds' && (
          <div className="grid-2">
            {/* CHAOS INDEX - Scatter Chart */}
            <section className="card">
              <h2>Chaos Index</h2>
              <p className="chart-subtitle">All 46 brackets plotted by upsets vs tiebreaker, colored by champion</p>
              <div className="chart-container">
                <Chart
                  type="scatter"
                  data={{
                    datasets: champData.map(champ => ({
                      label: champ.team,
                      data: brackets
                        .filter(b => b.champ === champ.team && b.tb)
                        .map(b => ({ x: b.upsets, y: b.tb })),
                      backgroundColor: champ.color,
                      pointRadius: 5,
                      pointHoverRadius: 7,
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      borderWidth: 1,
                    }))
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: { position: 'right', labels: { font: { size: 10 } } },
                      tooltip: {
                        callbacks: {
                          label: (ctx) => {
                            const bracket = brackets.find(b => b.upsets === ctx.raw.x && b.tb === ctx.raw.y && b.champ === ctx.dataset.label)
                            return bracket ? `${bracket.name}: ${ctx.raw.x} upsets, ${ctx.raw.y} TB` : ''
                          }
                        }
                      }
                    },
                    scales: {
                      x: { title: { display: true, text: 'Upsets' }, min: 0, max: 13 },
                      y: { title: { display: true, text: 'Tiebreaker' }, min: 60, max: 200 }
                    }
                  }}
                />
              </div>
            </section>

            {/* CHAMPION CLUSTERS - Bar Chart */}
            <section className="card">
              <h2>Champion Clusters</h2>
              <p className="chart-subtitle">Average upsets per champion (top 7)</p>
              <div className="chart-container">
                <Chart
                  type="bar"
                  data={{
                    labels: champData.slice(0, 7).map(c => c.team),
                    datasets: [{
                      label: 'Avg Upsets',
                      data: champData.slice(0, 7).map(c => {
                        const bracketsWithChamp = brackets.filter(b => b.champ === c.team)
                        return bracketsWithChamp.length > 0
                          ? (bracketsWithChamp.reduce((sum, b) => sum + b.upsets, 0) / bracketsWithChamp.length).toFixed(1)
                          : 0
                      }),
                      backgroundColor: champData.slice(0, 7).map(c => c.color),
                      borderRadius: 6,
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, max: 8 } }
                  }}
                />
              </div>
            </section>

            {/* TIEBREAKER DISTRIBUTION - Histogram */}
            <section className="card">
              <h2>Tiebreaker Distribution</h2>
              <p className="chart-subtitle">Count of brackets in each TB bin</p>
              <div className="chart-container">
                <Chart
                  type="bar"
                  data={{
                    labels: Object.keys(stats.tbBins).sort(),
                    datasets: [{
                      label: 'Brackets',
                      data: Object.keys(stats.tbBins).sort().map(k => stats.tbBins[k]),
                      backgroundColor: colors.primary,
                      borderRadius: 6,
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } }
                  }}
                />
              </div>
            </section>

            {/* UPSET CONSENSUS - Horizontal Bar Chart */}
            <section className="card">
              <h2>Upset Consensus</h2>
              <p className="chart-subtitle">How many brackets picked each upset (sorted)</p>
              <div className="chart-container">
                <Chart
                  type="bar"
                  data={{
                    labels: [...upsetData]
                      .sort((a, b) => b.count - a.count)
                      .map(u => `${u.team} vs ${u.vs}`),
                    datasets: [{
                      label: 'Brackets',
                      data: [...upsetData]
                        .sort((a, b) => b.count - a.count)
                        .map(u => u.count),
                      backgroundColor: colors.danger,
                      borderRadius: 6,
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    indexAxis: 'y',
                    plugins: { legend: { display: false } },
                    scales: { x: { beginAtZero: true, max: 46 } }
                  }}
                />
              </div>
            </section>
          </div>
        )}

        {/* DETAILED TAB */}
        {activeTab === 'detailed' && (
          <div>
            <div className="filter-bar">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="sort-select">
                <option value="upsets">Sort by: Upsets (High to Low)</option>
                <option value="tb">Sort by: Tiebreaker (High to Low)</option>
                <option value="name">Sort by: Name (A-Z)</option>
              </select>
              <div className="filter-stats">
                Showing {filteredBrackets.length} of {brackets.length} brackets
              </div>
            </div>

            <section className="card full">
              <h2>All Brackets - Detailed View</h2>
              <div className="detailed-table">
                <div className="table-header">
                  <div>#</div>
                  <div>Name</div>
                  <div>Champion</div>
                  <div>Upsets</div>
                  <div>TB</div>
                  <div>Style</div>
                  <div>Action</div>
                </div>
                {filteredBrackets.map((b, i) => {
                  const style = b.upsets <= 3 ? 'Chalk' : b.upsets <= 6 ? 'Balanced' : 'Chaos'
                  const styleColor = b.upsets <= 3 ? colors.success : b.upsets <= 6 ? colors.warning : colors.danger
                  return (
                    <div key={i} className="table-row detailed">
                      <div className="rank">{i + 1}</div>
                      <div className="name">{b.name}</div>
                      <div className="champ">
                        <img src={getTeamLogo(b.champ)} alt={b.champ} style={{ height: '20px' }} />
                        {b.champ}
                      </div>
                      <div style={{ color: b.upsets >= 8 ? colors.danger : colors.warning, fontWeight: 700 }}>{b.upsets}</div>
                      <div>{b.tb || '—'}</div>
                      <div style={{ color: styleColor, fontWeight: 700 }}>{style}</div>
                      <div>
                        <button
                          className="view-btn"
                          onClick={() => setSelectedBracket(b)}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>
        )}
      </main>

      <BracketModal bracket={selectedBracket} onClose={() => setSelectedBracket(null)} setCompareBracket={setCompareBracket} />
      <CompareModal bracket1={selectedBracket} bracket2={compareBracket} onClose={() => setCompareBracket(null)} />
    </div>
  )
}
