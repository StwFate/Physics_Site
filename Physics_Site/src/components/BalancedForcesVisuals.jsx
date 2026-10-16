import React from 'react'
import { ArrowRight, ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react'

// Parses force label or code into structured typographic tokens:
// e.g. "FN" -> [{ type: 'force', sub: 'N' }]
// e.g. "Fa1 + Fa2" -> [{ type: 'force', sub: 'a1' }, { type: 'text', val: ' + ' }, { type: 'force', sub: 'a2' }]
// e.g. "Ff (Brakes)" -> [{ type: 'force', sub: 'f' }, { type: 'text', val: ' (brakes)' }]
export function parseForceTokens(label, code) {
  const str = (label || code || '').trim()

  if (str === 'Fa1 + Fa2') {
    return [
      { type: 'force', sub: 'a1' },
      { type: 'text', val: ' + ' },
      { type: 'force', sub: 'a2' }
    ]
  }
  if (str === 'Fg + Fair') {
    return [
      { type: 'force', sub: 'g' },
      { type: 'text', val: ' + ' },
      { type: 'force', sub: 'air' }
    ]
  }
  if (str === 'Ff + Fair') {
    return [
      { type: 'force', sub: 'f' },
      { type: 'text', val: ' + ' },
      { type: 'force', sub: 'air' }
    ]
  }
  if (str === 'FT1 + FT2') {
    return [
      { type: 'force', sub: 'T1' },
      { type: 'text', val: ' + ' },
      { type: 'force', sub: 'T2' }
    ]
  }
  if (str.toLowerCase().includes('(brakes)')) {
    return [
      { type: 'force', sub: 'f' },
      { type: 'text', val: ' (brakes)' }
    ]
  }
  if (str.toLowerCase().includes('(drive)')) {
    return [
      { type: 'force', sub: 'a' },
      { type: 'text', val: ' (drive)' }
    ]
  }

  // Common physics symbols mapping
  const lower = str.toLowerCase()
  if (code === 'Fnorm' || lower === 'fn' || lower === 'fnorm') return [{ type: 'force', sub: 'N' }]
  if (code === 'Fgrav' || lower === 'fg' || lower === 'fgrav') return [{ type: 'force', sub: 'g' }]
  if (code === 'Fapp' || lower === 'fa' || lower === 'fapp') return [{ type: 'force', sub: 'a' }]
  if (code === 'Ffrict' || lower === 'ff' || lower === 'ffrict') return [{ type: 'force', sub: 'f' }]
  if (code === 'Fair' || lower === 'fair') return [{ type: 'force', sub: 'air' }]
  if (code === 'Ftens' || lower === 'ft' || lower === 'ftens') return [{ type: 'force', sub: 'T' }]
  if (code === 'Fspring' || lower === 'fs' || lower === 'fspring') return [{ type: 'force', sub: 's' }]
  if (code === 'Fthrust' || lower === 'fthrust') return [{ type: 'force', sub: 'thrust' }]
  if (code === 'Fdrag' || lower === 'fdrag') return [{ type: 'force', sub: 'drag' }]
  if (code === 'Fbuoy' || lower === 'fb' || lower === 'fbuoy') return [{ type: 'force', sub: 'b' }]
  if (code === 'Fnet' || lower === 'fnet') return [{ type: 'force', sub: 'net' }]

  if (str.startsWith('F_')) {
    return [{ type: 'force', sub: str.replace('F_', '') }]
  }
  if (str.startsWith('F') && str.length > 1) {
    return [{ type: 'force', sub: str.slice(1) }]
  }

  return [{ type: 'text', val: str }]
}

// Renders authentic physics typography with italic serif 'F' and lowered subscript
export function SvgForceLabel({ label, code, x, y, anchor = 'start' }) {
  const tokens = parseForceTokens(label, code)

  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fill="#000000"
      className="select-none"
    >
      {tokens.map((tok, idx) => {
        if (tok.type === 'force') {
          return (
            <React.Fragment key={idx}>
              <tspan
                fontFamily="Georgia, Cambria, 'Times New Roman', serif"
                fontStyle="italic"
                fontSize="22"
                fontWeight="700"
              >
                F
              </tspan>
              <tspan
                fontFamily="system-ui, -apple-system, sans-serif"
                fontStyle="normal"
                fontSize="14"
                fontWeight="700"
                dy="5"
              >
                {tok.sub}
              </tspan>
            </React.Fragment>
          )
        }
        return (
          <tspan
            key={idx}
            fontFamily="system-ui, -apple-system, sans-serif"
            fontStyle="normal"
            fontSize="14"
            fontWeight="600"
            dy={idx > 0 && tokens[idx - 1].type === 'force' ? -5 : 0}
          >
            {tok.val}
          </tspan>
        )
      })}
    </text>
  )
}

// 1. Force Diagram SVG Renderer
export function ForceDiagramView({ renderData, motionDirection }) {
  const forces = renderData?.forces || []
  const cx = 200
  const cy = 150
  const boxSize = 54
  const halfBox = boxSize / 2

  const getLength = (mag) => {
    if (mag === 'small') return 45
    if (mag === 'large') return 90
    return 65 // medium
  }

  return (
    <div className="relative w-full flex flex-col items-center justify-center p-0">
      <svg viewBox="0 0 400 300" className="w-full max-w-[560px] aspect-[4/3] max-h-[350px] select-none rounded-lg border border-slate-200 bg-white shadow-2xs">
        <defs>
          {/* Cartesian Grid Pattern */}
          <pattern id="cartesian-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" strokeWidth="1" />
          </pattern>
          {/* Royal Blue Force Arrowhead */}
          <marker
            id="arrowhead-blue"
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="5"
            orient="auto"
          >
            <polygon points="0 1.5, 9 5, 0 8.5" fill="#0052FF" />
          </marker>
          {/* Black Motion Indicator Arrowhead */}
          <marker
            id="motion-arr"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
          >
            <polygon points="0 1, 7 4, 0 7" fill="#000000" />
          </marker>
          <marker
            id="motion-arr-left"
            markerWidth="8"
            markerHeight="8"
            refX="1"
            refY="4"
            orient="auto"
          >
            <polygon points="7 1, 0 4, 7 7" fill="#000000" />
          </marker>
        </defs>

        {/* Cartesian Grid Background */}
        <rect width="100%" height="100%" fill="url(#cartesian-grid)" />

        {/* Top-Right Motion Indicator */}
        <g className="select-none">
          {motionDirection === 'left' || motionDirection === 'leftward' ? (
            <>
              <line
                x1="375"
                y1="34"
                x2="320"
                y2="34"
                stroke="#000000"
                strokeWidth="1.5"
                markerEnd="url(#motion-arr-left)"
              />
              <text
                x="348"
                y="52"
                textAnchor="middle"
                fill="#000000"
                fontSize="12"
                fontWeight="500"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                ← Motion
              </text>
            </>
          ) : (
            <>
              <line
                x1="320"
                y1="34"
                x2="375"
                y2="34"
                stroke="#000000"
                strokeWidth="1.5"
                markerEnd="url(#motion-arr)"
              />
              <text
                x="348"
                y="52"
                textAnchor="middle"
                fill="#000000"
                fontSize="12"
                fontWeight="500"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                Motion →
              </text>
            </>
          )}
        </g>

        {/* Center Object Box (White 54x54 with crisp black stroke) */}
        <rect
          x={cx - halfBox}
          y={cy - halfBox}
          width={boxSize}
          height={boxSize}
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="1.75"
        />

        {/* Center Mass Point (Solid black dot) */}
        <circle cx={cx} cy={cy} r="3.5" fill="#000000" />

        {/* Dynamic Force Arrows & Non-overlapping Subscript Labels */}
        {forces.map((f, i) => {
          const len = getLength(f.magnitude)
          let x1 = cx
          let y1 = cy
          let x2 = cx
          let y2 = cy
          let lx = cx
          let ly = cy
          let anchor = 'start'

          if (f.dir === 'up') {
            x1 = cx
            y1 = cy - halfBox
            x2 = cx
            y2 = y1 - len
            lx = cx
            ly = y2 - 12
            anchor = 'middle'
          } else if (f.dir === 'down') {
            x1 = cx
            y1 = cy + halfBox
            x2 = cx
            y2 = y1 + len
            lx = cx
            ly = y2 + 28
            anchor = 'middle'
          } else if (f.dir === 'left') {
            y1 = cy
            x1 = cx - halfBox
            y2 = cy
            x2 = x1 - len
            lx = x2 - 14
            ly = cy + 7
            anchor = 'end'
          } else if (f.dir === 'right') {
            y1 = cy
            x1 = cx + halfBox
            y2 = cy
            x2 = x1 + len
            lx = x2 + 14
            ly = cy + 7
            anchor = 'start'
          }

          return (
            <g key={i}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#0052FF"
                strokeWidth="3.5"
                strokeLinecap="round"
                markerEnd="url(#arrowhead-blue)"
              />
              <SvgForceLabel
                label={f.label}
                code={f.code}
                x={lx}
                y={ly}
                anchor={anchor}
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// 2. Position-Time Graph SVG Renderer
export function PositionTimeGraphView({ renderData }) {
  const curveType = renderData?.curveType || 'constant_pos'

  return (
    <div className="relative w-full flex flex-col items-center justify-center p-2">
      <svg viewBox="0 0 320 220" className="w-full max-w-[340px] h-56 select-none">
        <defs>
          <marker id="axis-arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill="#64748b" />
          </marker>
        </defs>

        {/* Gridlines */}
        <g stroke="#f1f5f9" strokeWidth="1">
          <line x1="40" y1="50" x2="290" y2="50" />
          <line x1="40" y1="90" x2="290" y2="90" />
          <line x1="40" y1="130" x2="290" y2="130" />
          <line x1="100" y1="30" x2="100" y2="180" />
          <line x1="160" y1="30" x2="160" y2="180" />
          <line x1="220" y1="30" x2="220" y2="180" />
        </g>

        {/* Axes */}
        <line x1="40" y1="180" x2="295" y2="180" stroke="#64748b" strokeWidth="2" markerEnd="url(#axis-arr)" />
        <line x1="40" y1="180" x2="40" y2="25" stroke="#64748b" strokeWidth="2" markerEnd="url(#axis-arr)" />

        {/* Labels */}
        <text x="280" y="198" fill="#334155" fontSize="11" fontWeight="600" fontFamily="monospace">Time (t)</text>
        <text x="12" y="32" fill="#334155" fontSize="11" fontWeight="600" fontFamily="monospace">Pos (x)</text>
        <text x="28" y="194" fill="#334155" fontSize="11" fontWeight="600" fontFamily="monospace">0</text>

        {/* Plotted Curves */}
        {curveType === 'constant_pos' && (
          <line x1="40" y1="175" x2="280" y2="45" stroke="#2563eb" strokeWidth="3.5" strokeLinecap="round" />
        )}
        {curveType === 'speeding_up_pos' && (
          <path d="M 40 175 Q 170 170 280 45" stroke="#2563eb" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        )}
        {curveType === 'slowing_down_pos' && (
          <path d="M 40 175 Q 130 50 280 45" stroke="#2563eb" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        )}
        {curveType === 'constant_neg' && (
          <line x1="40" y1="45" x2="280" y2="175" stroke="#2563eb" strokeWidth="3.5" strokeLinecap="round" />
        )}
        {curveType === 'speeding_up_neg' && (
          <path d="M 40 45 Q 170 50 280 175" stroke="#2563eb" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        )}
        {curveType === 'slowing_down_neg' && (
          <path d="M 40 45 Q 130 170 280 175" stroke="#2563eb" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        )}
      </svg>
    </div>
  )
}

// 3. Dot Diagram (Ticker Tape) SVG Renderer
export function DotDiagramView({ renderData }) {
  const pattern = renderData?.pattern || 'constant'
  const direction = renderData?.direction || 'right'

  const isVertical = direction === 'up' || direction === 'down'

  let dots = []
  if (isVertical) {
    if (direction === 'up') {
      if (pattern === 'constant') dots = [205, 169, 133, 97, 61, 25]
      else if (pattern === 'accelerating') dots = [205, 190, 165, 125, 75, 25]
      else if (pattern === 'decelerating') dots = [205, 155, 115, 80, 50, 25]
    } else {
      // down
      if (pattern === 'constant') dots = [25, 61, 97, 133, 169, 205]
      else if (pattern === 'accelerating') dots = [25, 40, 65, 105, 155, 205]
      else if (pattern === 'decelerating') dots = [25, 75, 125, 165, 190, 205]
    }
  } else {
    if (direction === 'right') {
      if (pattern === 'constant') dots = [35, 80, 125, 170, 215, 260]
      else if (pattern === 'accelerating') dots = [35, 50, 75, 115, 175, 260]
      else if (pattern === 'decelerating') dots = [35, 120, 180, 220, 245, 260]
    } else {
      // left
      if (pattern === 'constant') dots = [260, 215, 170, 125, 80, 35]
      else if (pattern === 'accelerating') dots = [260, 245, 220, 180, 120, 35]
      else if (pattern === 'decelerating') dots = [260, 175, 115, 75, 50, 35]
    }
  }

  const directionLabels = {
    right: 'Rightward',
    left: 'Leftward',
    up: 'Upward',
    down: 'Downward'
  }

  const DirectionIcon = () => {
    if (direction === 'up') return <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
    if (direction === 'down') return <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
    if (direction === 'left') return <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
    return <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
  }

  return (
    <div className="relative w-full flex flex-col items-center justify-center p-3">
      {/* Motion Banner */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-2.5 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
        <DirectionIcon />
        <span>Direction of Motion ({directionLabels[direction] || 'Rightward'})</span>
      </div>

      {isVertical ? (
        <svg viewBox="0 0 130 230" className="w-full max-w-[140px] h-56 select-none">
          {/* Vertical Tape track */}
          <rect x="25" y="15" width="45" height="200" rx="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
          {/* Baseline dashed */}
          <line x1="47.5" y1="20" x2="47.5" y2="210" stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="1" />
          {/* Dots */}
          {dots.map((y, idx) => (
            <g key={idx}>
              <circle cx="47.5" cy={y} r="5" fill="#1e293b" />
              <text x="80" y={y + 3.5} textAnchor="start" fill="#334155" fontSize="10" fontWeight="600" fontFamily="monospace">
                t{idx}
              </text>
            </g>
          ))}
        </svg>
      ) : (
        <svg viewBox="0 0 300 110" className="w-full max-w-[340px] h-28 select-none">
          {/* Horizontal Tape track */}
          <rect x="15" y="30" width="270" height="45" rx="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
          {/* Baseline dashed */}
          <line x1="25" y1="52.5" x2="275" y2="52.5" stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="1" />
          {/* Dots */}
          {dots.map((x, idx) => (
            <g key={idx}>
              <circle cx={x} cy="52.5" r="5" fill="#1e293b" />
              <text x={x} y="90" textAnchor="middle" fill="#334155" fontSize="10" fontWeight="600" fontFamily="monospace">
                t{idx}
              </text>
            </g>
          ))}
        </svg>
      )}
      <div className="text-[11px] text-slate-700 font-semibold font-mono mt-1">Equal time intervals (Δt = 0.2s)</div>
    </div>
  )
}

// 4. Velocity-Time Graph SVG Renderer
export function VelocityTimeGraphView({ renderData }) {
  const curveType = renderData?.curveType || 'constant_pos'

  return (
    <div className="relative w-full flex flex-col items-center justify-center p-2">
      <svg viewBox="0 0 320 220" className="w-full max-w-[340px] h-56 select-none">
        <defs>
          <marker id="axis-arr-v" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill="#64748b" />
          </marker>
        </defs>

        {/* Grid */}
        <g stroke="#f1f5f9" strokeWidth="1">
          <line x1="40" y1="50" x2="290" y2="50" />
          <line x1="40" y1="110" x2="290" y2="110" />
          <line x1="40" y1="170" x2="290" y2="170" />
          <line x1="100" y1="20" x2="100" y2="200" />
          <line x1="160" y1="20" x2="160" y2="200" />
          <line x1="220" y1="20" x2="220" y2="200" />
        </g>

        {/* Zero Axis (Center horizontal) */}
        <line x1="40" y1="110" x2="295" y2="110" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="2 2" />

        {/* Main Axes */}
        <line x1="40" y1="200" x2="40" y2="20" stroke="#64748b" strokeWidth="2" markerEnd="url(#axis-arr-v)" />
        <line x1="40" y1="180" x2="295" y2="180" stroke="#64748b" strokeWidth="2" markerEnd="url(#axis-arr-v)" />

        {/* Labels */}
        <text x="280" y="196" fill="#475569" fontSize="11" fontWeight="600" fontFamily="monospace">t (s)</text>
        <text x="8" y="25" fill="#475569" fontSize="11" fontWeight="600" fontFamily="monospace">v (m/s)</text>
        <text x="22" y="114" fill="#334155" fontSize="10" fontWeight="600" fontFamily="monospace">0</text>
        <text x="18" y="55" fill="#334155" fontSize="10" fontWeight="600" fontFamily="monospace">+v</text>
        <text x="18" y="175" fill="#334155" fontSize="10" fontWeight="600" fontFamily="monospace">-v</text>

        {/* Velocity lines */}
        {curveType === 'constant_pos' && (
          <line x1="40" y1="60" x2="280" y2="60" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" />
        )}
        {curveType === 'speeding_up_pos' && (
          <line x1="40" y1="110" x2="280" y2="40" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" />
        )}
        {curveType === 'slowing_down_pos' && (
          <line x1="40" y1="40" x2="280" y2="110" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" />
        )}
        {curveType === 'constant_neg' && (
          <line x1="40" y1="150" x2="280" y2="150" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" />
        )}
        {curveType === 'speeding_up_neg' && (
          <line x1="40" y1="110" x2="280" y2="175" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" />
        )}
        {curveType === 'slowing_down_neg' && (
          <line x1="40" y1="175" x2="280" y2="110" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" />
        )}
      </svg>
    </div>
  )
}

// 5. Kinematic Table HTML View
export function KinematicTableView({ renderData }) {
  const rows = renderData?.rows || []
  const colHeader = renderData?.colHeader || 'Position (m)'

  return (
    <div className="w-full flex flex-col items-center justify-center p-3">
      <div className="w-full max-w-xs bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden text-xs">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
              <th className="py-2 px-3 text-left font-mono">Time (s)</th>
              <th className="py-2 px-3 text-right font-mono">{colHeader}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="py-1.5 px-3 font-mono text-slate-600">{r.t}</td>
                <td className="py-1.5 px-3 font-mono text-right font-bold text-blue-700">{r.val}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-[11px] text-slate-500 font-mono mt-2">Data sample recorded at 1.0 s intervals</div>
    </div>
  )
}

// Unified Visual Switcher
export default function BalancedForcesVisuals({ question }) {
  if (!question || !question.renderData) {
    return <div className="text-slate-700 font-semibold text-xs">No diagram available</div>
  }

  const { type } = question.renderData

  if (type === 'force_diagram') {
    return <ForceDiagramView renderData={question.renderData} motionDirection={question.motionDirection} />
  }
  if (type === 'position_time_graph') {
    return <PositionTimeGraphView renderData={question.renderData} />
  }
  if (type === 'dot_diagram') {
    return <DotDiagramView renderData={question.renderData} />
  }
  if (type === 'velocity_time_graph') {
    return <VelocityTimeGraphView renderData={question.renderData} />
  }
  if (type === 'kinematic_table') {
    return <KinematicTableView renderData={question.renderData} />
  }

  return <div className="text-slate-700 font-semibold text-xs">Unsupported representation: {type}</div>
}
