import React from 'react'

/**
 * EnvironmentBackdrop renders context-appropriate scenery, tracks, and metric markers
 * for horizontal, vertical, and projectile motion.
 */
export function EnvironmentBackdrop({ visual, sceneWidth, vertical, projectile, minX, maxX, minY, maxY, toScreen, number }) {
  const env = visual?.environment || (vertical ? 'shaft' : projectile ? 'field-sky' : 'floor')
  const compactScene = sceneWidth < 450
  const ticks = compactScene ? [0, 1] : [0, 0.25, 0.5, 0.75, 1]

  // Render horizontal ground surface backdrop
  const renderHorizontalBackdrop = () => {
    const groundY = 214

    switch (env) {
      case 'road':
      case 'runway':
        return (
          <g className="env-road">
            {/* Asphalt road bed */}
            <rect x="10" y={groundY} width={sceneWidth - 20} height="32" rx="4" fill="#334155" />
            <line x1="10" y1={groundY} x2={sceneWidth - 10} y2={groundY} stroke="#cbd5e1" strokeWidth="2" />
            {/* Dashed center lane or runway markings */}
            <line
              x1="16"
              y1={groundY + 12}
              x2={sceneWidth - 16}
              y2={groundY + 12}
              stroke={env === 'runway' ? '#ffffff' : '#facc15'}
              strokeWidth={env === 'runway' ? '3' : '2'}
              strokeDasharray={env === 'runway' ? '16 12' : '10 8'}
              opacity="0.85"
            />
            {/* Curb edge */}
            <line x1="10" y1={groundY + 28} x2={sceneWidth - 10} y2={groundY + 28} stroke="#1e293b" strokeWidth="1.5" />
          </g>
        )

      case 'rails':
        return (
          <g className="env-rails">
            {/* Ballast gravel bed */}
            <polygon points={`10,${groundY + 26} 24,${groundY + 4} ${sceneWidth - 24},${groundY + 4} ${sceneWidth - 10},${groundY + 26}`} fill="#94a3b8" opacity="0.6" />
            {/* Wooden cross-ties */}
            {Array.from({ length: Math.floor((sceneWidth - 40) / 22) }, (_, i) => 24 + i * 22).map(x => (
              <rect key={x} x={x} y={groundY + 4} width="8" height="18" rx="1.5" fill="#78350f" opacity="0.8" />
            ))}
            {/* Steel rail head */}
            <rect x="10" y={groundY} width={sceneWidth - 20} height="4" rx="1" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.75" />
            <line x1="10" y1={groundY + 1} x2={sceneWidth - 10} y2={groundY + 1} stroke="#ffffff" strokeWidth="1" opacity="0.9" />
          </g>
        )

      case 'maglev-track':
        return (
          <g className="env-maglev">
            {/* Precision elevated guideway beam */}
            <rect x="10" y={groundY + 2} width={sceneWidth - 20} height="20" rx="4" fill="#1e293b" />
            <rect x="14" y={groundY} width={sceneWidth - 28} height="5" rx="2" fill="#0284c7" opacity="0.9" />
            {/* Electromagnetic stator pole segments */}
            {Array.from({ length: Math.floor((sceneWidth - 40) / 28) }, (_, i) => 24 + i * 28).map(x => (
              <rect key={x} x={x} y={groundY + 8} width="16" height="8" rx="2" fill="#0ea5e9" opacity="0.4" />
            ))}
            {/* Blue levitation glow line */}
            <line x1="14" y1={groundY - 1} x2={sceneWidth - 14} y2={groundY - 1} stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.7" />
          </g>
        )

      case 'ice':
      case 'snow':
        return (
          <g className="env-ice-snow">
            {/* Glacial ice / packed snow base */}
            <rect x="10" y={groundY} width={sceneWidth - 20} height="28" rx="3" fill={env === 'ice' ? '#e0f2fe' : '#f1f5f9'} />
            <line x1="10" y1={groundY} x2={sceneWidth - 10} y2={groundY} stroke="#38bdf8" strokeWidth="1.5" />
            {/* Glint and frost highlight streaks */}
            {Array.from({ length: 6 }, (_, i) => 30 + i * (sceneWidth / 7)).map(x => (
              <line key={x} x1={x} y1={groundY + 6} x2={x + 22} y2={groundY + 6} stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
            ))}
          </g>
        )

      case 'water':
        return (
          <g className="env-water">
            {/* Water body */}
            <rect x="10" y={groundY + 3} width={sceneWidth - 20} height="28" rx="3" fill="#0284c7" opacity="0.35" />
            {/* Surface wave contour */}
            <path
              d={`M10,${groundY} ` + Array.from({ length: Math.floor((sceneWidth - 30) / 36) }, (_, i) => {
                const x0 = 10 + i * 36
                return `Q${x0 + 9},${groundY - 3} ${x0 + 18},${groundY} Q${x0 + 27},${groundY + 3} ${x0 + 36},${groundY}`
              }).join(' ') + ` L${sceneWidth - 10},${groundY}`}
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="2"
            />
          </g>
        )

      case 'conveyor':
        return (
          <g className="env-conveyor">
            {/* Belt track strip */}
            <rect x="10" y={groundY} width={sceneWidth - 20} height="6" rx="2" fill="#334155" />
            <line x1="10" y1={groundY} x2={sceneWidth - 10} y2={groundY} stroke="#64748b" strokeWidth="1" />
            {/* Conveyor drive rollers spaced underneath */}
            {Array.from({ length: Math.floor((sceneWidth - 40) / 32) }, (_, i) => 24 + i * 32).map(x => (
              <g key={x} transform={`translate(${x} ${groundY + 12})`}>
                <circle r="6" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
                <circle r="2" fill="#334155" />
              </g>
            ))}
            {/* Lower support rail */}
            <line x1="14" y1={groundY + 20} x2={sceneWidth - 14} y2={groundY + 20} stroke="#cbd5e1" strokeWidth="2" />
          </g>
        )

      case 'dirt':
      case 'gravel':
      case 'regolith':
        return (
          <g className="env-soil">
            {/* Natural compacted earth / regolith bed */}
            <rect x="10" y={groundY} width={sceneWidth - 20} height="28" rx="3" fill={env === 'dirt' ? '#b45309' : env === 'gravel' ? '#78716c' : '#475569'} opacity="0.75" />
            <line x1="10" y1={groundY} x2={sceneWidth - 10} y2={groundY} stroke={env === 'dirt' ? '#92400e' : env === 'gravel' ? '#57534e' : '#334155'} strokeWidth="2" />
            {/* Soil texture stipples */}
            {Array.from({ length: Math.floor((sceneWidth - 30) / 20) }, (_, i) => 18 + i * 20).map((x, i) => (
              <circle key={x} cx={x + (i % 3) * 3} cy={groundY + 8 + (i % 4) * 4} r={1.5} fill="#ffffff" opacity="0.3" />
            ))}
          </g>
        )

      case 'turf':
        return (
          <g className="env-turf">
            {/* Athletic stadium grass */}
            <rect x="10" y={groundY} width={sceneWidth - 20} height="28" rx="3" fill="#15803d" opacity="0.8" />
            <line x1="10" y1={groundY} x2={sceneWidth - 10} y2={groundY} stroke="#22c55e" strokeWidth="2" />
            {/* Blades of grass highlights */}
            {Array.from({ length: Math.floor((sceneWidth - 40) / 18) }, (_, i) => 20 + i * 18).map(x => (
              <line key={x} x1={x} y1={groundY} x2={x + 2} y2={groundY - 3} stroke="#86efac" strokeWidth="1" strokeLinecap="round" />
            ))}
          </g>
        )

      case 'track-lane':
        return (
          <g className="env-running-track">
            {/* Red synthetic running track */}
            <rect x="10" y={groundY} width={sceneWidth - 20} height="30" rx="3" fill="#c2410c" />
            <line x1="10" y1={groundY} x2={sceneWidth - 10} y2={groundY} stroke="#ea580c" strokeWidth="1.5" />
            {/* White lane running line */}
            <line x1="10" y1={groundY + 14} x2={sceneWidth - 10} y2={groundY + 14} stroke="#ffffff" strokeWidth="2" opacity="0.85" />
          </g>
        )

      case 'warehouse':
        return (
          <g className="env-warehouse">
            {/* Polished concrete warehouse floor */}
            <rect x="10" y={groundY} width={sceneWidth - 20} height="28" rx="3" fill="#e2e8f0" />
            <line x1="10" y1={groundY} x2={sceneWidth - 10} y2={groundY} stroke="#94a3b8" strokeWidth="1.5" />
            {/* Safety hazard border stripe */}
            {Array.from({ length: Math.floor((sceneWidth - 30) / 16) }, (_, i) => 16 + i * 16).map(x => (
              <polygon key={x} points={`${x},${groundY + 1} ${x + 8},${groundY + 1} ${x + 4},${groundY + 7} ${x - 4},${groundY + 7}`} fill="#eab308" opacity="0.85" />
            ))}
          </g>
        )

      case 'lab-track':
      case 'floor':
      default:
        return (
          <g className="env-floor-lab">
            {/* Anodized aluminium lab track or clean room floor */}
            <rect x="20" y={groundY + 1} width={sceneWidth - 40} height="7" rx="3.5" fill="#e1e9f5" />
            <line x1="20" y1={groundY} x2={sceneWidth - 20} y2={groundY} stroke="#b6c7df" strokeWidth="1.5" />
          </g>
        )
    }
  }

  // Render vertical shaft, tower, sky, space, or underwater column
  const renderVerticalBackdrop = () => {
    const shaftX = sceneWidth / 2 - 59
    const shaftWidth = 118
    const topY = 48
    const bottomY = 254

    if (env === 'underwater') {
      return (
        <g className="env-underwater-column">
          <rect x={shaftX - 24} y={topY} width={shaftWidth + 48} height={bottomY - topY} rx="12" fill="#0c4a6e" fillOpacity="0.16" stroke="#0284c7" strokeWidth="1.25" />
          {[68, 114, 158, 204].map((y, i) => (
            <circle key={y} cx={sceneWidth / 2 - 36 + (i % 3) * 34} cy={y} r={2.5 + (i % 2)} fill="#7dd3fc" opacity="0.55" />
          ))}
          {[topY + 34, topY + 78, topY + 122, topY + 166].map(y => (
            <line key={y} x1={shaftX - 14} x2={shaftX + shaftWidth + 14} y1={y} y2={y} stroke="#0284c7" strokeWidth="0.75" strokeDasharray="4 4" opacity="0.28" />
          ))}
        </g>
      )
    }

    if (env === 'sky') {
      return (
        <g className="env-sky-column">
          <rect x={shaftX - 28} y={topY} width={shaftWidth + 56} height={bottomY - topY} rx="14" fill="#e0f2fe" fillOpacity="0.45" stroke="#bae6fd" strokeWidth="1.25" />
          {/* Soft atmospheric cloud bands */}
          <path d={`M${sceneWidth / 2 - 64} 88 Q${sceneWidth / 2 - 42} 78 ${sceneWidth / 2 - 22} 88`} fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity="0.85" />
          <path d={`M${sceneWidth / 2 + 18} 142 Q${sceneWidth / 2 + 42} 132 ${sceneWidth / 2 + 64} 142`} fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity="0.85" />
          <path d={`M${sceneWidth / 2 - 58} 202 Q${sceneWidth / 2 - 32} 192 ${sceneWidth / 2 - 10} 202`} fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.75" />
        </g>
      )
    }

    if (env === 'space') {
      return (
        <g className="env-space-column">
          <rect x={shaftX - 28} y={topY} width={shaftWidth + 56} height={bottomY - topY} rx="14" fill="#0f172a" fillOpacity="0.88" stroke="#334155" strokeWidth="1.25" />
          {[[-52, 70], [44, 84], [-38, 134], [54, 152], [-48, 198], [32, 212]].map(([dx, y], idx) => (
            <circle key={idx} cx={sceneWidth / 2 + dx} cy={y} r={idx % 2 === 0 ? 1.5 : 1} fill="#f8fafc" opacity="0.8" />
          ))}
          {/* Lunar / planetary horizon at bottom of column */}
          <path d={`M${shaftX - 26} ${bottomY - 12} Q${sceneWidth / 2} ${bottomY - 22} ${shaftX + shaftWidth + 26} ${bottomY - 12} L${shaftX + shaftWidth + 26} ${bottomY} L${shaftX - 26} ${bottomY} Z`} fill="#475569" opacity="0.7" />
        </g>
      )
    }

    if (env === 'tower-shaft' || env === 'vacuum-tube') {
      return (
        <g className="env-tower-column">
          <rect x={shaftX} y={topY} width={shaftWidth} height={bottomY - topY} rx="8" fill="#f8fafc" fillOpacity="0.4" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1={shaftX + 6} y1={topY + 6} x2={shaftX + 6} y2={bottomY - 6} stroke="#ffffff" strokeWidth="2" opacity="0.7" />
          {[-53, 53].map(x => (
            <line key={x} x1={sceneWidth / 2 + x} x2={sceneWidth / 2 + x} y1={topY + 6} y2={bottomY - 6} stroke="#64748b" strokeWidth="3" />
          ))}
        </g>
      )
    }

    // Default structural elevator shaft
    return (
      <g className="env-elevator-shaft">
        <rect x={shaftX} y={topY} width={shaftWidth} height={bottomY - topY} rx="8" fill="#edf3fc" fillOpacity="0.6" stroke="#d3deee" />
        {[-53, 53].map(x => (
          <line key={x} x1={sceneWidth / 2 + x} x2={sceneWidth / 2 + x} y1={topY + 6} y2={bottomY - 6} stroke="#bacbe1" strokeWidth="3" />
        ))}
      </g>
    )
  }

  // Projectile sports field or atmospheric open sky
  const renderProjectileBackdrop = () => {
    const projectileTicks = [0, 0.5, 1]
    return (
      <g className="env-projectile-field">
        <rect x="10" y="214" width={sceneWidth - 20} height="28" rx="3" fill="#15803d" opacity="0.85" />
        <line x1="10" y1="214" x2={sceneWidth - 10} y2="214" stroke="#22c55e" strokeWidth="2" />
        {projectileTicks.map(v => {
          const p = toScreen({ x: minX + (maxX - minX) * v, y: 0 })
          return (
            <g key={v}>
              <line x1={p.x} x2={p.x} y1="214" y2="224" stroke="#ffffff" strokeWidth="1.5" opacity="0.9" />
              <text x={p.x} y="236" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="700">
                {number(minX + (maxX - minX) * v)} m
              </text>
            </g>
          )
        })}
      </g>
    )
  }

  const isDarkGround = ['road', 'runway', 'maglev-track', 'dirt', 'gravel', 'regolith', 'turf', 'track-lane', 'conveyor'].includes(env)

  return (
    <g className="motion-environment-backdrop" aria-hidden="true">
      {/* Horizontal space / underwater atmospheric band */}
      {env === 'space' && !vertical && (
        <g>
          <rect x="10" y="40" width={sceneWidth - 20} height="174" rx="8" fill="#0f172a" opacity="0.85" />
          {[0.15, 0.32, 0.51, 0.68, 0.84].map((fx, idx) => (
            <circle key={idx} cx={sceneWidth * fx} cy={70 + (idx % 3) * 34} r="1.5" fill="#f8fafc" opacity="0.8" />
          ))}
        </g>
      )}
      {env === 'underwater' && !vertical && (
        <rect x="10" y="40" width={sceneWidth - 20} height="174" rx="8" fill="#0369a1" opacity="0.18" />
      )}

      {/* Render core landscape / track structure */}
      {projectile ? renderProjectileBackdrop() : vertical ? renderVerticalBackdrop() : renderHorizontalBackdrop()}

      {/* Distance ticks along horizontal ground track */}
      {!vertical && !projectile && (
        <g className="env-metric-ticks">
          {ticks.map(v => {
            const p = toScreen({ x: minX + (maxX - minX) * v, y: 0 })
            return (
              <g key={v}>
                <line x1={p.x} x2={p.x} y1="222" y2="228" stroke={isDarkGround ? '#e2e8f0' : '#92a7c4'} strokeWidth="1.25" />
                <text
                  x={p.x}
                  y="240"
                  textAnchor="middle"
                  fill={isDarkGround ? '#f8fafc' : '#475569'}
                  stroke={isDarkGround ? '#0f172a' : '#f8fbff'}
                  strokeWidth="2.5"
                  paintOrder="stroke"
                  fontSize="9"
                  fontWeight="700"
                >
                  {number(minX + (maxX - minX) * v)} m
                </text>
              </g>
            )
          })}
        </g>
      )}

      {/* Vertical height metric ticks */}
      {vertical && (
        <g className="env-vertical-ticks">
          {[0, 0.5, 1].map(v => (
            <text key={v} x={sceneWidth / 2 - 92} y={203 - v * 70} textAnchor="end" fill="#627692" fontSize="9" fontWeight="600">
              {number(minY + (maxY - minY) * v)} m
            </text>
          ))}
        </g>
      )}
    </g>
  )
}

/**
 * PersonalizedMotionObject renders recognizable, detailed SVG artwork
 * for 14 object families, 50+ variants, dynamic wheel rotation, locked skids,
 * equipment attachments (parachute, cable, thrusters, rotors, propellers),
 * and an identity badge.
 */
export function PersonalizedMotionObject({ visual, vertical, projectile, mass, wheelAngle = 0, motionDirection = 'rightward', forces = [] }) {
  const family = visual?.family || (vertical ? 'elevator' : projectile ? 'ball' : 'crate')
  const variant = visual?.variant || 'wooden-crate'
  const equip = visual?.equipment || {}

  // Determine facing orientation (cars, trains, submarines, aircraft, etc.)
  const isLeftward = motionDirection === 'left' || motionDirection === 'leftward' || motionDirection === 'negative'
  const isDirectional = ['car', 'train', 'submarine', 'boat', 'aircraft', 'athlete'].includes(family) ||
    ['rocket-sled', 'agv-cart', 'test-carriage', 'sled', 'sledder'].includes(variant)
  const facingFlip = isDirectional && isLeftward

  // Effective wheel angle: locked if lockedWheels is true; invert sign when mirrored so wheels roll naturally
  const effectiveWheelAngle = equip.lockedWheels ? 0 : (facingFlip ? -wheelAngle : wheelAngle)

  // Determine horizontal force attachment direction for tow cables / thrusters
  const hasRightPull = forces.some(f => f.dir === 'right' && /tens|app|thrust/i.test(f.name))
  const hasLeftPull = forces.some(f => f.dir === 'left' && /tens|app|thrust/i.test(f.name))

  // Render compact object badge / pill showing label and mass
  const renderIdentityBadge = (yOffset = -28) => {
    const rawTitle = visual?.title || 'Object'
    const shortName = rawTitle
      .replace(/^(Accelerating|Decelerating|Pushed|Ascending|Descending|Braking|Coasting|Rising|Skidding|Motorized|Automated|Deployed|High-Speed|Submerged|Deep-Sea|Heavy|Low-Friction)\s+/i, '')
      .replace(/\s+(in Flight|at Apex|at Peak|on Surface)$/i, '')
    const label = `${shortName} · ${Number(mass.toFixed(1))} kg`
    const pillWidth = Math.max(64, label.length * 5.2 + 12)
    return (
      <g transform={`translate(0 ${yOffset})`} pointerEvents="none">
        <rect x={-pillWidth / 2} y="-8" width={pillWidth} height="15" rx="7.5" fill="#0f172a" fillOpacity="0.82" stroke="#64748b" strokeWidth="0.75" />
        <text y="2.5" textAnchor="middle" fill="#f8fafc" fontSize="8.5" fontWeight="700">
          {label}
        </text>
      </g>
    )
  }

  // Equipment overlays: Parachute, Tension Cable, Thruster Flame, Rotors, Propellers
  const renderEquipment = () => {
    const thrusterDir = hasLeftPull && !hasRightPull ? 1 : hasRightPull && !hasLeftPull ? -1 : (isLeftward ? 1 : -1)
    const cableDir = hasLeftPull && !hasRightPull ? -1 : hasRightPull && !hasLeftPull ? 1 : (isLeftward ? -1 : 1)

    return (
      <>
        {/* Overhead elevator or hoist tension cable */}
        {equip.cable && (
          <g className="equip-cable">
            <line x1="0" y1="-26" x2="0" y2="-170" stroke="#475569" strokeWidth="2.5" />
            <circle cx="0" cy="-26" r="3.5" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
          </g>
        )}

        {/* Deployed parachute canopy with suspension rigging */}
        {equip.parachute && (
          <g className="equip-parachute" transform="translate(0 -28)">
            <line x1="0" y1="0" x2="-38" y2="-32" stroke="#64748b" strokeWidth="1.1" />
            <line x1="0" y1="0" x2="-18" y2="-36" stroke="#64748b" strokeWidth="1.1" />
            <line x1="0" y1="0" x2="18" y2="-36" stroke="#64748b" strokeWidth="1.1" />
            <line x1="0" y1="0" x2="38" y2="-32" stroke="#64748b" strokeWidth="1.1" />
            <path d="M-42 -30 Q0 -65 42 -30 Q22 -36 0 -34 Q-22 -36 -42 -30 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.5" />
            <path d="M-22 -36 Q0 -64 22 -36 Q11 -38 0 -37 Q-11 -38 -22 -36 Z" fill="#ffffff" opacity="0.85" />
          </g>
        )}

        {/* Thruster exhaust flame plume */}
        {equip.thruster && (
          <g className="equip-thruster">
            {vertical ? (
              <g>
                <path d="M-10 24 Q0 52 10 24 Q0 38 -10 24 Z" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
                <path d="M-5 24 Q0 40 5 24 Z" fill="#fef08a" />
              </g>
            ) : (
              <g transform={`scale(${-thrusterDir}, 1)`}>
                <path d="M-44 -5 Q-68 2 -44 9 Q-55 2 -44 -5 Z" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
                <path d="M-44 -2 Q-58 2 -44 6 Z" fill="#fef08a" />
              </g>
            )}
          </g>
        )}

        {/* Spinning quadcopter rotors */}
        {equip.rotors && (
          <g className="equip-rotors">
            {[-34, 34].map(x => (
              <g key={x} transform={`translate(${x} -20)`}>
                <ellipse cx="0" cy="0" rx="16" ry="2.5" fill="#38bdf8" opacity="0.45" />
                <line x1="-16" y1="0" x2="16" y2="0" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
                <circle r="2.5" fill="#0369a1" />
              </g>
            ))}
          </g>
        )}

        {/* Stern or fan booster propeller */}
        {equip.propeller && (
          <g className="equip-propeller" transform={`translate(${facingFlip ? 46 : -46} 4)`}>
            <line x1="0" y1="-12" x2="0" y2="12" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
            <circle r="3" fill="#1e293b" />
          </g>
        )}

        {/* Tow / safety cable attached to crate or sled */}
        {equip.towCable && (
          <g className="equip-tow-cable">
            <line x1={cableDir * 40} y1="4" x2={cableDir * 108} y2="-6" stroke="#475569" strokeWidth="2" strokeDasharray="4 2" />
            <circle cx={cableDir * 40} cy="4" r="3" fill="#334155" />
          </g>
        )}

        {/* Skid marks / tire smoke when wheels are locked */}
        {equip.lockedWheels && (
          <g className="equip-locked-skids" opacity="0.8">
            {[-27, 27].map(x => (
              <g key={x} transform={`translate(${x} 33)`}>
                <line x1="-14" y1="0" x2="14" y2="0" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx={isLeftward ? 10 : -10} cy="-3" r="4" fill="#94a3b8" opacity="0.55" />
              </g>
            ))}
          </g>
        )}
      </>
    )
  }

  // Submarine Family (Submarine, Bathyscaphe, Acoustic/Submersible/Ocean Probe)
  const renderSubmarine = () => {
    if (variant === 'bathyscaphe') {
      return (
        <g className="obj-bathyscaphe">
          {/* Upper buoyancy float hull */}
          <rect x="-38" y="-20" width="76" height="22" rx="10" fill="#eab308" stroke="#a16207" strokeWidth="1.5" />
          {/* Underslung spherical deep-sea pressure chamber */}
          <circle cx="0" cy="12" r="13" fill="#334155" stroke="#0f172a" strokeWidth="1.5" />
          <circle cx="4" cy="12" r="5" fill="#38bdf8" stroke="#0f172a" strokeWidth="1" />
          {/* Vertical thruster ducts */}
          <rect x="-28" y="-24" width="8" height="6" rx="1.5" fill="#475569" />
          <rect x="20" y="-24" width="8" height="6" rx="1.5" fill="#475569" />
        </g>
      )
    }

    if (['acoustic-probe', 'submersible-probe', 'ocean-probe'].includes(variant)) {
      return (
        <g className="obj-ocean-probe">
          {/* Cylindrical scientific ROV / sonar instrument package */}
          <rect x="-26" y="-18" width="52" height="36" rx="12" fill="#facc15" stroke="#a16207" strokeWidth="1.5" />
          <rect x="-20" y="-10" width="40" height="20" rx="6" fill="#0f172a" />
          <circle cx="-8" cy="0" r="5" fill="#38bdf8" />
          <circle cx="8" cy="0" r="3.5" fill="#22c55e" />
          {/* Sonar transducer dome at bottom */}
          <path d="M-12 18 Q0 28 12 18 Z" fill="#0284c7" stroke="#0369a1" strokeWidth="1" />
        </g>
      )
    }

    return (
      <g className="obj-submarine">
        {/* Submarine Hull */}
        <rect x="-48" y="-12" width="92" height="30" rx="15" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
        {/* Conning tower / sail */}
        <rect x="-8" y="-25" width="22" height="15" rx="3" fill="#334155" stroke="#0f172a" strokeWidth="1" />
        <line x1="3" y1="-25" x2="3" y2="-32" stroke="#64748b" strokeWidth="2" />
        {/* Portholes */}
        {[-24, -4, 16].map(x => (
          <circle key={x} cx={x} cy="3" r="4.5" fill="#38bdf8" stroke="#0f172a" strokeWidth="1" />
        ))}
        {/* Bow diving plane */}
        <rect x="22" y="2" width="16" height="4" rx="2" fill="#64748b" />
        {/* Stern propeller */}
        <g transform="translate(-49 3)">
          <line x1="0" y1="-9" x2="0" y2="9" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </g>
    )
  }

  // Train Family (Bullet Train, Maglev, Tube Pod, Mine Cart, Locomotive/Cargo Train)
  const renderTrain = () => {
    if (variant === 'mine-cart') {
      return (
        <g className="obj-mine-cart">
          {/* Trapezoidal riveted steel ore hopper */}
          <polygon points="-38,-14 38,-14 30,16 -30,16" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
          <line x1="-36" y1="-14" x2="36" y2="-14" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
          {[-20, 0, 20].map(x => (
            <line key={x} x1={x} y1="-12" x2={x * 0.8} y2="14" stroke="#334155" strokeWidth="1.5" />
          ))}
          {[-20, 20].map(x => (
            <g key={x} transform={`translate(${x} 23) rotate(${effectiveWheelAngle})`}>
              <circle r="7.5" fill="#1e293b" stroke="#0f172a" strokeWidth="1.25" />
              <circle r="3.5" fill="#94a3b8" />
              <path d="M-4 0H4M0 -4V4" stroke="#e2e8f0" strokeWidth="1" />
            </g>
          ))}
        </g>
      )
    }

    if (variant === 'tube-pod') {
      return (
        <g className="obj-tube-pod">
          {/* Pressurized hyperloop / low-pressure tube pod */}
          <rect x="-46" y="-12" width="92" height="28" rx="14" fill="#f8fafc" stroke="#0284c7" strokeWidth="1.5" />
          <path d="M10 -8 L34 -4 Q42 2 34 8 L10 12 Z" fill="#0ea5e9" opacity="0.85" />
          <rect x="-36" y="14" width="72" height="4" rx="2" fill="#0284c7" />
        </g>
      )
    }

    return (
      <g className="obj-train">
        {variant === 'bullet-train' || variant === 'maglev' ? (
          <path d="M-48 -14 L12 -14 Q46 -14 48 16 L-48 16 Z" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
        ) : (
          <rect x="-46" y="-18" width="92" height="38" rx="6" fill="#1e3a8a" stroke="#172554" strokeWidth="1.5" />
        )}
        <rect x="18" y="-10" width="18" height="10" rx="2" fill="#bae6fd" stroke="#0f172a" strokeWidth="0.75" />
        <rect x="-38" y="-8" width="14" height="8" rx="1.5" fill="#bae6fd" opacity="0.85" />
        <rect x="-18" y="-8" width="14" height="8" rx="1.5" fill="#bae6fd" opacity="0.85" />
        {variant === 'maglev' ? (
          <rect x="-42" y="16" width="84" height="5" rx="2.5" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
        ) : (
          [-30, 2, 32].map(x => (
            <g key={x} transform={`translate(${x} 24) rotate(${effectiveWheelAngle})`}>
              <circle r="8.5" fill="#334155" stroke="#1e293b" strokeWidth="1.5" />
              <circle r="4.5" fill="#94a3b8" />
              <path d="M-4.5 0H4.5M0 -4.5V4.5" stroke="#ffffff" strokeWidth="1.25" />
            </g>
          ))
        )}
      </g>
    )
  }

  // Car Family (Sedan, Sports Coupe, Delivery Van, Freight Truck, Dragster, Rover, Scooter, Skateboarder)
  const renderCar = () => {
    if (variant === 'scooter') {
      return (
        <g className="obj-scooter">
          {/* Electric scooter deck & stem */}
          <rect x="-26" y="16" width="52" height="5" rx="2.5" fill="#1e293b" />
          <line x1="20" y1="16" x2="14" y2="-18" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
          <line x1="8" y1="-18" x2="20" y2="-18" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" />
          {/* Rider silhouette */}
          <circle cx="-2" cy="-20" r="5.5" fill="#2563eb" />
          <path d="M-6 -12 L4 -12 L8 4 L-4 16" fill="none" stroke="#1e40af" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="2" y1="-10" x2="14" y2="-16" stroke="#1e40af" strokeWidth="3" strokeLinecap="round" />
          {[-22, 22].map(x => (
            <g key={x} transform={`translate(${x} 24) rotate(${effectiveWheelAngle})`}>
              <circle r="6.5" fill="#0f172a" />
              <circle r="3" fill="#38bdf8" />
            </g>
          ))}
        </g>
      )
    }

    if (variant === 'skateboarder') {
      return (
        <g className="obj-skateboarder">
          {/* Concave skateboard deck */}
          <path d="M-30 14 L-22 18 L22 18 L30 14" fill="none" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round" />
          {/* Rider in coasting crouch */}
          <circle cx="4" cy="-16" r="5.5" fill="#dc2626" />
          <path d="M-6 -8 L8 -8 L4 6 L-10 16 M4 6 L14 16" fill="none" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
          {[-16, 16].map(x => (
            <g key={x} transform={`translate(${x} 24) rotate(${effectiveWheelAngle})`}>
              <circle r="5" fill="#ea580c" stroke="#9a3412" strokeWidth="1" />
              <circle r="2" fill="#fef08a" />
            </g>
          ))}
        </g>
      )
    }

    return (
      <g className="obj-car">
        {variant === 'freight-truck' || variant === 'delivery-van' ? (
          <>
            <rect x="-46" y="-22" width="56" height="42" rx="4" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
            <path d="M10 -6 L28 -6 Q38 -6 44 8 L44 20 L10 20 Z" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
            <rect x="16" y="-2" width="16" height="9" rx="1.5" fill="#bae6fd" />
          </>
        ) : variant === 'dragster' ? (
          <>
            <polygon points="-46,6 -8,6 46,15 46,20 -46,20" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
            <rect x="-44" y="-16" width="16" height="5" rx="1.5" fill="#1e293b" />
            <line x1="-36" y1="-11" x2="-36" y2="6" stroke="#1e293b" strokeWidth="2" />
          </>
        ) : variant === 'rover' ? (
          <>
            <rect x="-32" y="-8" width="64" height="22" rx="4" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
            <rect x="-26" y="-12" width="38" height="4" rx="1" fill="#0284c7" />
            <line x1="16" y1="-8" x2="16" y2="-24" stroke="#64748b" strokeWidth="2.5" />
            <circle cx="16" cy="-24" r="4.5" fill="#0284c7" stroke="#0f172a" strokeWidth="1" />
          </>
        ) : variant === 'sports-coupe' ? (
          <>
            <path d="M-44 6 L-24 -11 L10 -11 L34 6 L46 9 L46 20 L-44 20 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
            <path d="M-20 -8 L8 -8 L24 4 L-20 4 Z" fill="#bae6fd" opacity="0.9" />
            <polygon points="-44,6 -48,-2 -38,-2 -38,6" fill="#991b1b" />
          </>
        ) : (
          <>
            <path d="M-42 6 L-30 -14 L12 -14 L32 6 L44 8 L44 20 L-42 20 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1.5" />
            <path d="M-26 -10 L9 -10 L24 4 L-26 4 Z" fill="#bae6fd" opacity="0.9" />
            <circle cx="41" cy="12" r="3" fill="#fef08a" />
          </>
        )}

        {/* Rotating automotive wheels */}
        {(variant === 'rover' ? [-24, 0, 24] : [-27, 27]).map(x => (
          <g key={x} transform={`translate(${x} 23) rotate(${effectiveWheelAngle})`}>
            <circle r={variant === 'rover' ? 7.5 : 9} fill="#1e293b" />
            <circle r={variant === 'rover' ? 4 : 5} fill="#94a3b8" />
            <path d="M-4 0H4M0 -4V4" stroke="#f8fafc" strokeWidth="1.25" />
          </g>
        ))}
      </g>
    )
  }

  // Elevator Family (Elevator Cab, Freight Elevator, Mining Bucket, Brick Pallet, Aerial Platform/Window Rig, Cable Car)
  const renderElevator = () => {
    if (variant === 'mining-bucket') {
      return (
        <g className="obj-mining-bucket">
          <path d="M-26 -18 L26 -18 L20 22 L-20 22 Z" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
          <rect x="-28" y="-20" width="56" height="5" rx="2" fill="#334155" />
          <path d="M-22 -18 Q0 -32 22 -18" fill="none" stroke="#64748b" strokeWidth="2" />
        </g>
      )
    }

    if (variant === 'brick-pallet') {
      return (
        <g className="obj-brick-pallet">
          {/* Lifting sling cables */}
          <line x1="0" y1="-26" x2="-30" y2="14" stroke="#64748b" strokeWidth="1.5" />
          <line x1="0" y1="-26" x2="30" y2="14" stroke="#64748b" strokeWidth="1.5" />
          {/* Stacked courses of bricks */}
          <rect x="-28" y="-12" width="56" height="26" rx="2" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="1.25" />
          <line x1="-28" y1="-3" x2="28" y2="-3" stroke="#fca5a5" strokeWidth="1" />
          <line x1="-28" y1="6" x2="28" y2="6" stroke="#fca5a5" strokeWidth="1" />
          {/* Wooden pallet base */}
          <rect x="-34" y="14" width="68" height="7" rx="1.5" fill="#b45309" stroke="#78350f" strokeWidth="1" />
        </g>
      )
    }

    if (variant === 'aerial-platform' || variant === 'window-rig') {
      return (
        <g className="obj-aerial-platform">
          <line x1="-28" y1="-24" x2="-28" y2="14" stroke="#64748b" strokeWidth="2" />
          <line x1="28" y1="-24" x2="28" y2="14" stroke="#64748b" strokeWidth="2" />
          <rect x="-34" y="-4" width="68" height="18" rx="2" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
          <rect x="-36" y="12" width="72" height="6" rx="2" fill="#0284c7" />
        </g>
      )
    }

    return (
      <g className="obj-elevator">
        <rect x="-34" y="-24" width="68" height="48" rx="6" fill="#f1f5f9" stroke="#334155" strokeWidth="1.5" />
        <rect x="-24" y="-16" width="22" height="36" rx="2" fill="#bae6fd" opacity="0.75" stroke="#94a3b8" strokeWidth="1" />
        <rect x="2" y="-16" width="22" height="36" rx="2" fill="#bae6fd" opacity="0.75" stroke="#94a3b8" strokeWidth="1" />
        <rect x="-38" y="-18" width="5" height="12" rx="1.5" fill="#475569" />
        <rect x="-38" y="6" width="5" height="12" rx="1.5" fill="#475569" />
        <rect x="33" y="-18" width="5" height="12" rx="1.5" fill="#475569" />
        <rect x="33" y="6" width="5" height="12" rx="1.5" fill="#475569" />
      </g>
    )
  }

  // Skydiver Family
  const renderSkydiver = () => (
    <g className="obj-skydiver">
      {['weather-capsule', 'recovery-capsule', 'reentry-capsule', 'cargo-pod'].includes(variant) ? (
        <>
          <path d="M-26 14 L-14 -16 L14 -16 L26 14 Z" fill="#e2e8f0" stroke="#334155" strokeWidth="1.5" />
          <ellipse cx="0" cy="14" rx="26" ry="6" fill="#334155" />
          <circle cx="0" cy="-2" r="5" fill="#0284c7" />
        </>
      ) : (
        <>
          <ellipse cx="0" cy="2" rx="18" ry="8" fill="#f97316" stroke="#c2410c" strokeWidth="1.25" />
          <circle cx="0" cy="-8" r="6" fill="#ffffff" stroke="#0f172a" strokeWidth="1" />
          <line x1="-14" y1="2" x2="-26" y2="-6" stroke="#ea580c" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="14" y1="2" x2="26" y2="-6" stroke="#ea580c" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="-10" y1="6" x2="-20" y2="16" stroke="#c2410c" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="10" y1="6" x2="20" y2="16" stroke="#c2410c" strokeWidth="3.5" strokeLinecap="round" />
        </>
      )}
    </g>
  )

  // Crate Family
  const renderCrate = () => (
    <g className="obj-crate">
      {variant === 'dresser' ? (
        <>
          <rect x="-38" y="-22" width="76" height="46" rx="3" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
          {[-12, 1, 14].map(y => (
            <g key={y}>
              <rect x="-34" y={y - 8} width="68" height="11" rx="1.5" fill="#d97706" stroke="#78350f" strokeWidth="0.75" />
              <circle cx="-16" cy={y - 2.5} r="2" fill="#fef08a" />
              <circle cx="16" cy={y - 2.5} r="2" fill="#fef08a" />
            </g>
          ))}
        </>
      ) : variant === 'heavy-toolbox' || variant === 'equipment-box' ? (
        <>
          <rect x="-38" y="-16" width="76" height="38" rx="4" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
          <rect x="-34" y="-14" width="68" height="8" rx="2" fill="#b91c1c" />
          {[-18, 18].map(x => (
            <rect key={x} x={x - 3} y="-8" width="6" height="9" rx="1" fill="#f1f5f9" stroke="#475569" strokeWidth="0.75" />
          ))}
          <path d="M-12 -16 L-12 -22 L12 -22 L12 -16" fill="none" stroke="#334155" strokeWidth="2.5" />
        </>
      ) : variant === 'storage-container' || variant === 'shipping-package' ? (
        <>
          <rect x="-40" y="-20" width="80" height="42" rx="3" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
          {[-26, -12, 2, 16, 30].map(x => (
            <line key={x} x1={x} y1="-16" x2={x} y2="18" stroke="#0369a1" strokeWidth="2" />
          ))}
        </>
      ) : (
        <>
          <rect x="-38" y="-20" width="76" height="42" rx="3" fill="#d97706" stroke="#78350f" strokeWidth="1.5" />
          <line x1="-38" y1="-20" x2="38" y2="22" stroke="#92400e" strokeWidth="2" />
          <line x1="-38" y1="22" x2="38" y2="-20" stroke="#92400e" strokeWidth="2" />
          <rect x="-34" y="-16" width="68" height="34" fill="none" stroke="#92400e" strokeWidth="1.25" />
        </>
      )}
    </g>
  )

  // Glider Family (Pucks, Sleds, Dynamics Carts)
  const renderGlider = () => (
    <g className="obj-glider">
      {variant === 'hockey-puck' ? (
        <>
          <ellipse cx="0" cy="14" rx="30" ry="11" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
          <ellipse cx="0" cy="6" rx="30" ry="11" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
        </>
      ) : variant === 'curling-stone' ? (
        <>
          <ellipse cx="0" cy="14" rx="32" ry="12" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
          <ellipse cx="0" cy="6" rx="30" ry="11" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
          <path d="M-14 4 L0 -8 L14 4" fill="none" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
        </>
      ) : variant === 'hover-puck' ? (
        <>
          <ellipse cx="0" cy="16" rx="34" ry="8" fill="#1e293b" />
          <path d="M-28 14 Q0 -4 28 14 Z" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
        </>
      ) : variant === 'sled' || variant === 'sledder' ? (
        <>
          <path d="M-36 22 L28 22 Q38 22 42 10" fill="none" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
          <rect x="-32" y="8" width="64" height="8" rx="2" fill="#d97706" stroke="#92400e" strokeWidth="1" />
          <line x1="-20" y1="16" x2="-20" y2="22" stroke="#78350f" strokeWidth="2.5" />
          <line x1="16" y1="16" x2="16" y2="22" stroke="#78350f" strokeWidth="2.5" />
          {variant === 'sledder' && (
            <g transform="translate(-4 2)">
              <circle cx="2" cy="-12" r="6" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1" />
              <rect x="-8" y="-5" width="16" height="12" rx="3" fill="#ef4444" />
            </g>
          )}
        </>
      ) : variant === 'air-glider' ? (
        <>
          {/* Anodized V-channel air-track glider (no wheels, floats on air cushion) */}
          <polygon points="-42,18 -34,-6 34,-6 42,18" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
          <rect x="-28" y="-12" width="56" height="6" rx="2" fill="#bae6fd" stroke="#0284c7" strokeWidth="1" />
        </>
      ) : (
        <>
          {/* Wheeled Dynamics Cart / AGV / Transport Cart */}
          <rect x="-42" y="-12" width="84" height="26" rx="4" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
          <rect x="-36" y="-8" width="72" height="4" rx="2" fill="#bae6fd" />
          {[-24, 24].map(x => (
            <g key={x} transform={`translate(${x} 20) rotate(${effectiveWheelAngle})`}>
              <circle r="7" fill="#334155" stroke="#1e293b" strokeWidth="1" />
              <circle r="3" fill="#cbd5e1" />
              <path d="M-3.5 0H3.5M0 -3.5V3.5" stroke="#ffffff" strokeWidth="1" />
            </g>
          ))}
        </>
      )}
    </g>
  )

  // Rocket Family (Lunar Lander, Rocket Sled, Space Probe, Model/Sounding Rocket)
  const renderRocket = () => (
    <g className="obj-rocket">
      {variant === 'lunar-lander' ? (
        <>
          <polygon points="-24,14 -16,-6 16,-6 24,14" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
          <circle cx="0" cy="2" r="8" fill="#f1f5f9" stroke="#475569" strokeWidth="1" />
          <line x1="-22" y1="14" x2="-34" y2="28" stroke="#475569" strokeWidth="2" />
          <line x1="22" y1="14" x2="34" y2="28" stroke="#475569" strokeWidth="2" />
        </>
      ) : variant === 'rocket-sled' ? (
        <>
          <rect x="-44" y="-4" width="88" height="22" rx="4" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
          <polygon points="44,-4 58,7 44,18" fill="#dc2626" />
        </>
      ) : variant === 'space-probe' ? (
        <>
          {/* Deep-space probe with solar array wings & parabolic dish */}
          <rect x="-44" y="-5" width="26" height="10" rx="1.5" fill="#0284c7" stroke="#0369a1" strokeWidth="1" />
          <rect x="18" y="-5" width="26" height="10" rx="1.5" fill="#0284c7" stroke="#0369a1" strokeWidth="1" />
          <rect x="-14" y="-12" width="28" height="24" rx="4" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
          <path d="M-12 -12 Q0 -24 12 -12" fill="none" stroke="#94a3b8" strokeWidth="2" />
          <line x1="0" y1="-18" x2="0" y2="-28" stroke="#475569" strokeWidth="1.5" />
        </>
      ) : (
        <>
          <rect x="-12" y="-16" width="24" height="40" rx="3" fill="#f8fafc" stroke="#dc2626" strokeWidth="1.5" />
          <polygon points="-12,-16 0,-38 12,-16" fill="#dc2626" stroke="#b91c1c" strokeWidth="1.25" />
          <polygon points="-12,12 -26,24 -12,24" fill="#dc2626" stroke="#b91c1c" strokeWidth="1" />
          <polygon points="12,12 26,24 12,24" fill="#dc2626" stroke="#b91c1c" strokeWidth="1" />
        </>
      )}
    </g>
  )

  // Boat Family (Hovercraft vs Speedboat)
  const renderBoat = () => (
    <g className="obj-boat">
      {variant === 'hovercraft' ? (
        <>
          {/* Inflated rubber cushion skirt */}
          <rect x="-44" y="10" width="88" height="12" rx="6" fill="#1e293b" stroke="#0f172a" strokeWidth="1.25" />
          <path d="M-40 10 L-32 -4 L28 -4 L40 10 Z" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
          {/* Rear ducted fan pylon */}
          <rect x="-38" y="-18" width="10" height="14" rx="2" fill="#475569" />
        </>
      ) : (
        <>
          {/* Planing V-hull racing speedboat */}
          <path d="M-44 18 L34 18 Q48 14 52 2 L16 2 L4 -8 L-10 2 L-44 2 Z" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
          <polygon points="-8,2 4,-8 14,2" fill="#bae6fd" />
        </>
      )}
    </g>
  )

  // Aircraft Family
  const renderAircraft = () => (
    <g className="obj-aircraft">
      <polygon points="-46,4 -32,-4 34,-4 50,4 34,10 -46,10" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
      <polygon points="-14,-4 2,-22 14,-22 4,-4" fill="#0284c7" />
      <polygon points="-42,-4 -34,-18 -26,-18 -32,-4" fill="#dc2626" />
      {variant === 'jet-aircraft' && [-22, 24].map(x => (
        <circle key={x} cx={x} cy="16" r="4.5" fill="#1e293b" stroke="#94a3b8" strokeWidth="1" />
      ))}
    </g>
  )

  // Drone Family
  const renderDrone = () => (
    <g className="obj-drone">
      <rect x="-18" y="-10" width="36" height="20" rx="6" fill="#1e293b" stroke="#0284c7" strokeWidth="1.5" />
      <circle cx="0" cy="0" r="4" fill="#38bdf8" />
      <line x1="-34" y1="-8" x2="34" y2="-8" stroke="#475569" strokeWidth="3" />
      <path d="M-16 10 L-22 18 L-8 18" fill="none" stroke="#64748b" strokeWidth="2" />
      <path d="M16 10 L22 18 L8 18" fill="none" stroke="#64748b" strokeWidth="2" />
    </g>
  )

  // Balloon Family (Hot-Air Balloon, Weather Balloon, Blimp)
  const renderBalloon = () => {
    if (variant === 'blimp') {
      return (
        <g className="obj-blimp">
          <ellipse cx="0" cy="-12" rx="40" ry="18" fill="#f8fafc" stroke="#0284c7" strokeWidth="1.5" />
          <polygon points="-36,-12 -46,-24 -28,-18" fill="#dc2626" />
          <polygon points="-36,-12 -46,0 -28,-6" fill="#dc2626" />
          <rect x="-10" y="6" width="20" height="8" rx="3" fill="#334155" />
        </g>
      )
    }

    if (variant === 'weather-balloon') {
      return (
        <g className="obj-weather-balloon">
          <circle cx="0" cy="-18" r="22" fill="#f8fafc" fillOpacity="0.9" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="0" y1="4" x2="0" y2="16" stroke="#64748b" strokeWidth="1.25" />
          <rect x="-8" y="16" width="16" height="10" rx="2" fill="#f97316" stroke="#c2410c" strokeWidth="1" />
        </g>
      )
    }

    return (
      <g className="obj-balloon">
        <path d="M-28 -14 Q-36 -50 0 -50 Q36 -50 28 -14 L12 8 L-12 8 Z" fill="#f97316" stroke="#c2410c" strokeWidth="1.5" />
        <rect x="-8" y="16" width="16" height="12" rx="2" fill="#78350f" stroke="#451a03" strokeWidth="1" />
        <line x1="-8" y1="8" x2="-6" y2="16" stroke="#64748b" strokeWidth="1" />
        <line x1="8" y1="8" x2="6" y2="16" stroke="#64748b" strokeWidth="1" />
      </g>
    )
  }

  // Ball Family (Football, Baseball, Basketball, Soccer Ball, Tennis Ball, Bowling Ball, Steel Sphere)
  const renderBall = () => {
    if (variant === 'football') {
      return (
        <g className="obj-football" transform="rotate(-15)">
          <ellipse cx="0" cy="0" rx="24" ry="14" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
          <line x1="-12" y1="0" x2="12" y2="0" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          {[-8, -4, 0, 4, 8].map(x => (
            <line key={x} x1={x} y1="-3" x2={x} y2="3" stroke="#ffffff" strokeWidth="1.5" />
          ))}
        </g>
      )
    }

    if (variant === 'baseball') {
      return (
        <g className="obj-baseball">
          <circle r="16" fill="#f8fafc" stroke="#dc2626" strokeWidth="1.5" />
          <path d="M-10 -11 Q-3 0 -10 11" fill="none" stroke="#dc2626" strokeWidth="1.25" strokeDasharray="2 2" />
          <path d="M10 -11 Q3 0 10 11" fill="none" stroke="#dc2626" strokeWidth="1.25" strokeDasharray="2 2" />
        </g>
      )
    }

    if (variant === 'basketball') {
      return (
        <g className="obj-basketball">
          <circle r="17" fill="#ea580c" stroke="#0f172a" strokeWidth="1.5" />
          <line x1="-17" y1="0" x2="17" y2="0" stroke="#0f172a" strokeWidth="1.5" />
          <line x1="0" y1="-17" x2="0" y2="17" stroke="#0f172a" strokeWidth="1.5" />
        </g>
      )
    }

    if (variant === 'soccer-ball') {
      return (
        <g className="obj-soccer-ball">
          <circle r="16" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
          <polygon points="0,-6 6,-2 4,5 -4,5 -6,-2" fill="#0f172a" />
        </g>
      )
    }

    if (variant === 'tennis-ball') {
      return (
        <g className="obj-tennis-ball">
          <circle r="15" fill="#a3e635" stroke="#4d7c0f" strokeWidth="1.5" />
          <path d="M-9 -11 Q-2 0 -9 11" fill="none" stroke="#ffffff" strokeWidth="1.5" />
          <path d="M9 -11 Q2 0 9 11" fill="none" stroke="#ffffff" strokeWidth="1.5" />
        </g>
      )
    }

    if (variant === 'bowling-ball') {
      return (
        <g className="obj-bowling-ball">
          <circle r="17" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
          <circle cx="-4" cy="-5" r="2" fill="#94a3b8" />
          <circle cx="2" cy="-6" r="2" fill="#94a3b8" />
          <circle cx="-1" cy="0" r="2" fill="#94a3b8" />
        </g>
      )
    }

    // Default sphere / steel ball
    return (
      <g className="obj-sphere">
        <circle r="16" fill="#94a3b8" stroke="#334155" strokeWidth="1.5" />
        <ellipse cx="-4" cy="-5" rx="5" ry="3" fill="#ffffff" opacity="0.75" />
      </g>
    )
  }

  // Athlete Family
  const renderAthlete = () => (
    <g className="obj-athlete">
      {variant === 'softball-slider' ? (
        <>
          <ellipse cx="6" cy="14" rx="24" ry="7" fill="#1e40af" stroke="#172554" strokeWidth="1.25" />
          <circle cx="30" cy="8" r="6.5" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
          <line x1="24" y1="14" x2="44" y2="16" stroke="#f8fafc" strokeWidth="3.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx="-4" cy="-2" rx="14" ry="8" fill="#dc2626" stroke="#991b1b" strokeWidth="1.25" transform="rotate(-25)" />
          <circle cx="12" cy="-18" r="6" fill="#0f172a" />
          <line x1="-10" y1="4" x2="-26" y2="20" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="2" y1="2" x2="14" y2="18" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
        </>
      )}
    </g>
  )

  // Dispatch renderer by family
  const renderArtwork = () => {
    switch (family) {
      case 'submarine': return renderSubmarine()
      case 'train': return renderTrain()
      case 'car': return renderCar()
      case 'elevator': return renderElevator()
      case 'skydiver': return renderSkydiver()
      case 'glider': return renderGlider()
      case 'rocket': return renderRocket()
      case 'boat': return renderBoat()
      case 'aircraft': return renderAircraft()
      case 'drone': return renderDrone()
      case 'balloon': return renderBalloon()
      case 'ball': return renderBall()
      case 'athlete': return renderAthlete()
      case 'crate':
      default:
        return renderCrate()
    }
  }

  return (
    <g className={`motion-object motion-${family} motion-${variant}`}>
      {/* Ground shadow for horizontal objects */}
      {!vertical && !projectile && family !== 'ball' && (
        <ellipse cx="0" cy="35" rx="46" ry="5" fill="#1e4a8920" />
      )}

      {/* Equipment attachments */}
      {renderEquipment()}

      {/* Flipped artwork group for directional leftward travel */}
      <g transform={facingFlip ? 'scale(-1, 1)' : undefined}>
        {renderArtwork()}
      </g>

      {/* Unflipped, upright identity & mass badge */}
      {renderIdentityBadge(
        family === 'crate' || family === 'elevator' ? 0 :
        family === 'car' || family === 'train' || family === 'submarine' || family === 'boat' ? 2 :
        equip.parachute ? 0 :
        family === 'ball' ? -26 : -32
      )}
    </g>
  )
}
