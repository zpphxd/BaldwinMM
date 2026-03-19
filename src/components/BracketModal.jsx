import { brackets, champData, upsetData } from '../data/brackets'
import { getTeamLogo } from '../data/teams'

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

export default function BracketModal({ bracket, onClose, setCompareBracket }) {
  if (!bracket) return null

  const style = bracket.upsets <= 3 ? 'Chalk' : bracket.upsets <= 6 ? 'Balanced' : 'Chaos'
  const styleColor = bracket.upsets <= 3 ? colors.success : bracket.upsets <= 6 ? colors.warning : colors.danger
  const styleFlavor = bracket.upsets <= 3 ? 'Playing it safe with heavy favorites' : bracket.upsets <= 6 ? 'Mixed approach with some calculated risks' : 'Embracing chaos with deep sleeper picks'

  // Calculate pool averages and statistics
  const avgUpsets = brackets.reduce((sum, b) => sum + b.upsets, 0) / brackets.length
  const avgTB = Math.round(brackets.filter(b => b.tb).reduce((sum, b) => sum + b.tb, 0) / brackets.filter(b => b.tb).length)

  // Determine which upsets this bracket likely picked
  const getUpsetBets = () => {
    if (bracket.upsets > avgUpsets) {
      // High upset count: show top 3 most-popular upsets
      return upsetData.slice(0, 3)
    } else {
      // Low upset count: show top 3 least-popular upsets
      return upsetData.slice(-3).reverse()
    }
  }

  const upsetBets = getUpsetBets()
  const champPct = champData.find(c => c.team === bracket.champ)?.pct || 0

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header">
          <img src={getTeamLogo(bracket.champ)} alt={bracket.champ} className="modal-logo" />
          <div className="modal-title">
            <h1>{bracket.name}</h1>
            <p className="modal-champ">{bracket.champ}</p>
          </div>
        </div>

        <div className="modal-stats">
          <div className="modal-stat">
            <div className="modal-stat-label">Upsets</div>
            <div className="modal-stat-value" style={{ color: bracket.upsets >= 8 ? colors.danger : colors.warning }}>
              {bracket.upsets}
            </div>
          </div>
          <div className="modal-stat">
            <div className="modal-stat-label">Tiebreaker</div>
            <div className="modal-stat-value">{bracket.tb || '—'}</div>
          </div>
          <div className="modal-stat">
            <div className="modal-stat-label">Style</div>
            <div className="modal-stat-value" style={{ color: styleColor }}>
              {style}
            </div>
          </div>
          <div className="modal-stat">
            <div className="modal-stat-label">Rank vs Pool</div>
            <div className="modal-stat-value">
              #{brackets.indexOf(bracket) + 1}
            </div>
          </div>
        </div>

        <div className="modal-analysis">
          <h3>Bracket Analysis</h3>
          <div className="analysis-items">
            <div className="analysis-item">
              <span className="analysis-label">Champion Choice:</span>
              <span className="analysis-value">{bracket.champ} ({champPct}% pool)</span>
            </div>
            <div className="analysis-item">
              <span className="analysis-label">Upset Count:</span>
              <span className="analysis-value">
                {bracket.upsets} upsets
                {bracket.upsets >= 8 ? ' (Very High Risk 🔥)' : bracket.upsets >= 5 ? ' (Balanced 💨)' : ' (Safe Pick ✓)'}
              </span>
            </div>
            <div className="analysis-item">
              <span className="analysis-label">Tiebreaker Strategy:</span>
              <span className="analysis-value">
                {bracket.tb ? `${bracket.tb} (Pool Avg: ${avgTB})` : 'Not Submitted'}
              </span>
            </div>
          </div>
        </div>

        <div className="modal-comparison">
          <h3>Comparison to Pool</h3>
          <div className="comparison-grid">
            <div className="comparison-item">
              <span>vs Avg Upsets</span>
              <div className="comparison-bar">
                <div className="comparison-fill" style={{
                  width: (bracket.upsets / 12 * 100) + '%',
                  background: colors.primary
                }}></div>
              </div>
              <span>{bracket.upsets} vs {avgUpsets.toFixed(1)} avg</span>
            </div>
            <div className="comparison-item">
              <span>vs Avg TB</span>
              <div className="comparison-bar">
                <div className="comparison-fill" style={{
                  width: (bracket.tb || 0) / 180 * 100 + '%',
                  background: colors.accent
                }}></div>
              </div>
              <span>{bracket.tb || '—'} vs {avgTB} avg</span>
            </div>
          </div>
        </div>

        <div className="modal-strategy-profile">
          <h3>Strategy Profile</h3>

          <div className="strategy-section">
            <h4>Championship Pick</h4>
            <div className="champion-display">
              <img src={getTeamLogo(bracket.champ)} alt={bracket.champ} className="strategy-logo" />
              <div className="champion-info">
                <p className="champion-name">{bracket.champ}</p>
                <p className="champion-pool">{champPct}% of pool chose this</p>
                <div className="champion-prominence">
                  <div className="prominence-bar">
                    <div className="prominence-fill" style={{
                      width: champPct + '%',
                      background: colors.primary
                    }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="strategy-section">
            <h4>Upset Bets</h4>
            <p className="strategy-subtitle">{bracket.upsets > avgUpsets ? 'Most-Popular Upsets' : 'Least-Popular Upsets'}</p>
            <div className="upset-bets-grid">
              {upsetBets.map((upset, idx) => (
                <div key={idx} className="upset-bet-item">
                  <div className="upset-logos">
                    <img src={getTeamLogo(upset.team)} alt={upset.team} className="upset-logo" title={upset.team} />
                    <span className="vs-text">vs</span>
                    <img src={getTeamLogo(upset.vs)} alt={upset.vs} className="upset-logo" title={upset.vs} />
                  </div>
                  <p className="upset-matchup">{upset.team} vs {upset.vs}</p>
                  <p className="upset-adoption">{upset.count} brackets ({upset.pct}%)</p>
                </div>
              ))}
            </div>
          </div>

          <div className="strategy-section">
            <h4>Strategy Archetype</h4>
            <div className="archetype-display">
              <div className="archetype-badge" style={{ background: styleColor }}>
                {style}
              </div>
              <p className="archetype-flavor">{styleFlavor}</p>
            </div>
            <div className="upset-indicator">
              <p className="indicator-label">Upset Count vs Pool Average</p>
              <div className="comparison-bar large">
                <div className="comparison-fill" style={{
                  width: (bracket.upsets / 12 * 100) + '%',
                  background: styleColor
                }}></div>
              </div>
              <p className="indicator-stats">{bracket.upsets} upsets vs {avgUpsets.toFixed(1)} pool avg</p>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button
            className="modal-button compare-button"
            onClick={() => setCompareBracket(bracket)}
          >
            Compare with Another Bracket
          </button>
        </div>
      </div>
    </div>
  )
}
