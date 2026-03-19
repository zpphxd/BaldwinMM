import { Chart } from 'react-chartjs-2'
import { brackets, champData } from '../data/brackets'
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

export default function CompareModal({ bracket1, bracket2, onClose }) {
  if (!bracket1 || !bracket2) return null

  const getStyle = (upsets) => upsets <= 3 ? 'Chalk' : upsets <= 6 ? 'Balanced' : 'Chaos'
  const getStyleColor = (upsets) => upsets <= 3 ? colors.success : upsets <= 6 ? colors.warning : colors.danger

  const style1 = getStyle(bracket1.upsets)
  const style2 = getStyle(bracket2.upsets)
  const styleColor1 = getStyleColor(bracket1.upsets)
  const styleColor2 = getStyleColor(bracket2.upsets)

  const avgUpsets = (brackets.reduce((sum, b) => sum + b.upsets, 0) / brackets.length).toFixed(1)
  const avgTb = brackets.filter(b => b.tb).length > 0
    ? Math.round(brackets.filter(b => b.tb).reduce((sum, b) => sum + b.tb, 0) / brackets.filter(b => b.tb).length)
    : 0

  const champ1Data = champData.find(c => c.team === bracket1.champ)
  const champ2Data = champData.find(c => c.team === bracket2.champ)

  const upsetsDeviation1 = (bracket1.upsets - avgUpsets).toFixed(1)
  const upsetsDeviation2 = (bracket2.upsets - avgUpsets).toFixed(1)
  const tbDeviation1 = bracket1.tb ? (bracket1.tb - avgTb).toFixed(0) : 'N/A'
  const tbDeviation2 = bracket2.tb ? (bracket2.tb - avgTb).toFixed(0) : 'N/A'

  const getWinnerPrediction = () => {
    let analysis = []

    const upsetDiff = Math.abs(bracket1.upsets - bracket2.upsets)
    const champDiff = bracket1.champ !== bracket2.champ

    if (bracket1.upsets > bracket2.upsets) {
      analysis.push(`${bracket1.name} has ${upsetDiff} more upsets (riskier, contrarian play).`)
    } else if (bracket2.upsets > bracket1.upsets) {
      analysis.push(`${bracket2.name} has ${upsetDiff} more upsets (riskier, contrarian play).`)
    } else {
      analysis.push('Both brackets have the same upset count.')
    }

    if (champDiff) {
      const champ1Pct = champ1Data?.pct || 0
      const champ2Pct = champ2Data?.pct || 0
      if (champ1Pct > champ2Pct) {
        analysis.push(`${bracket1.name} picked a more popular champion (${champ1Data?.team}, ${champ1Pct}% pool).`)
      } else if (champ2Pct > champ1Pct) {
        analysis.push(`${bracket2.name} picked a more popular champion (${champ2Data?.team}, ${champ2Pct}% pool).`)
      } else {
        analysis.push('Both brackets picked equally popular champions.')
      }
    } else {
      analysis.push(`Both brackets picked ${bracket1.champ} as champion.`)
    }

    if (bracket1.tb && bracket2.tb) {
      const tbDiff = Math.abs(bracket1.tb - bracket2.tb)
      if (bracket1.tb > bracket2.tb) {
        analysis.push(`${bracket1.name}'s tiebreaker (${bracket1.tb}) is ${tbDiff} higher.`)
      } else if (bracket2.tb > bracket1.tb) {
        analysis.push(`${bracket2.name}'s tiebreaker (${bracket2.tb}) is ${tbDiff} higher.`)
      }
    }

    analysis.push(
      bracket1.upsets > bracket2.upsets
        ? `${bracket1.name} is positioned for higher upside but more volatility.`
        : bracket2.upsets > bracket1.upsets
        ? `${bracket2.name} is positioned for higher upside but more volatility.`
        : 'Both brackets have similar risk profiles.'
    )

    return analysis
  }

  const prediction = getWinnerPrediction()

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="compare-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <h2 className="compare-title">Bracket Comparison</h2>

        <div className="compare-brackets">
          {/* Bracket 1 */}
          <div className="compare-bracket">
            <h3 className="compare-bracket-name">{bracket1.name}</h3>

            <div className="compare-champ">
              <img src={getTeamLogo(bracket1.champ)} alt={bracket1.champ} className="compare-champ-logo" />
              <div className="compare-champ-info">
                <div className="compare-champ-label">Champion</div>
                <div className="compare-champ-value">{bracket1.champ}</div>
                <div className="compare-champ-pct">{champ1Data?.pct}% of pool</div>
              </div>
            </div>

            <div className="compare-stat-block">
              <div className="compare-stat-label">Strategy</div>
              <div className="compare-stat-value" style={{ color: styleColor1 }}>{style1}</div>
            </div>

            <div className="compare-stat-block">
              <div className="compare-stat-label">Upsets</div>
              <div className="compare-stat-value">{bracket1.upsets}</div>
              <div className="compare-stat-sub">
                {upsetsDeviation1 > 0 ? '+' : ''}{upsetsDeviation1} vs {avgUpsets} avg
              </div>
            </div>

            <div className="compare-stat-block">
              <div className="compare-stat-label">Tiebreaker</div>
              <div className="compare-stat-value">{bracket1.tb || '—'}</div>
              {bracket1.tb && (
                <div className="compare-stat-sub">
                  {tbDeviation1 > 0 ? '+' : ''}{tbDeviation1} vs {avgTb} avg
                </div>
              )}
            </div>
          </div>

          {/* Bracket 2 */}
          <div className="compare-bracket">
            <h3 className="compare-bracket-name">{bracket2.name}</h3>

            <div className="compare-champ">
              <img src={getTeamLogo(bracket2.champ)} alt={bracket2.champ} className="compare-champ-logo" />
              <div className="compare-champ-info">
                <div className="compare-champ-label">Champion</div>
                <div className="compare-champ-value">{bracket2.champ}</div>
                <div className="compare-champ-pct">{champ2Data?.pct}% of pool</div>
              </div>
            </div>

            <div className="compare-stat-block">
              <div className="compare-stat-label">Strategy</div>
              <div className="compare-stat-value" style={{ color: styleColor2 }}>{style2}</div>
            </div>

            <div className="compare-stat-block">
              <div className="compare-stat-label">Upsets</div>
              <div className="compare-stat-value">{bracket2.upsets}</div>
              <div className="compare-stat-sub">
                {upsetsDeviation2 > 0 ? '+' : ''}{upsetsDeviation2} vs {avgUpsets} avg
              </div>
            </div>

            <div className="compare-stat-block">
              <div className="compare-stat-label">Tiebreaker</div>
              <div className="compare-stat-value">{bracket2.tb || '—'}</div>
              {bracket2.tb && (
                <div className="compare-stat-sub">
                  {tbDeviation2 > 0 ? '+' : ''}{tbDeviation2} vs {avgTb} avg
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="compare-charts">
          <div className="compare-chart-container">
            <h4 className="compare-chart-title">Upsets vs Pool Average</h4>
            <div className="compare-chart">
              <Chart
                type="bar"
                data={{
                  labels: [bracket1.name, bracket2.name, 'Pool Avg'],
                  datasets: [{
                    label: 'Upsets',
                    data: [bracket1.upsets, bracket2.upsets, parseFloat(avgUpsets)],
                    backgroundColor: [colors.primary, colors.accent, colors.seafoam],
                    borderRadius: 4,
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, max: 13 } }
                }}
              />
            </div>
          </div>

          <div className="compare-chart-container">
            <h4 className="compare-chart-title">Tiebreaker vs Pool Average</h4>
            <div className="compare-chart">
              <Chart
                type="bar"
                data={{
                  labels: [
                    bracket1.tb ? bracket1.name : 'No TB',
                    bracket2.tb ? bracket2.name : 'No TB',
                    'Pool Avg'
                  ],
                  datasets: [{
                    label: 'Tiebreaker',
                    data: [bracket1.tb || 0, bracket2.tb || 0, avgTb],
                    backgroundColor: [colors.primary, colors.accent, colors.seafoam],
                    borderRadius: 4,
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, max: 200 } }
                }}
              />
            </div>
          </div>
        </div>

        {/* Winner Prediction */}
        <div className="compare-prediction">
          <h4>Comparison Summary</h4>
          <div className="compare-prediction-text">
            {prediction.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
