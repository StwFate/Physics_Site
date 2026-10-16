import React from 'react'

/**
 * EnvironmentBackdrop renders context-appropriate scenery, tracks, and metric markers
 * for horizontal, vertical, and projectile motion.
 */
export function EnvironmentBackdrop({ visual, sceneWidth, vertical, projectile, minX, maxX, minY, maxY, toScreen, number, id }) {
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
            {Array.from({ length: Math.floor((sceneWidth - 30) / 20) }, (_, i) => 18 + i * 20).map(x => (
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

  // Render vertical shaft, tower, or underwater column
  const renderVerticalBackdrop = () => {
    const shaftX = sceneWidth / 2 - 59
    const shaftWidth = 118
    const topY = 48
    const bottomY = 254

    if (env === 'underwater') {
      return (
        <g className="env-underwater-column">
          {/* Deep ocean column with pressure strata */}
          <rect x={shaftX} y={topY} width={shaftWidth} height={bottomY - topY} rx="8" fill="#0369a1" fillOpacity="0.25" stroke="#0284c7" strokeWidth="1.5" />
          {/* Subtle rising hydro bubbles */}
          {[60, 110, 160, 210].map((y, i) => (
            <circle key={y} cx={sceneWidth / 2 - 25 + (i % 3) * 25} cy={y} r={2.5 + (i % 2)} fill="#bae6fd" opacity="0.4" />
          ))}
          {/* Depth sonar grid markers */}
          {[topY + 30, topY + 70, topY + 110, topY + 150].map(y => (
            <line key={y} x1={shaftX + 8} x2={shaftX + shaftWidth - 8} y2={y} y1={y} stroke="#38bdf8" strokeWidth="0.75" strokeDasharray="3 4" opacity="0.3" />
          ))}
        </g>
      )
    }

    if (env === 'tower-shaft' || env === 'vacuum-tube') {
      return (
        <g className="env-tower-column">
          {/* Vacuum glass tube or open lattice test tower */}
          <rect x={shaftX} y={topY} width={shaftWidth} height={bottomY - topY} rx="8" fill="#f8fafc" fillOpacity="0.4" stroke="#94a3b8" strokeWidth="1.5" />
          {/* Evacuated tube rim specular reflections */}
          <line x1={shaftX + 6} y1={topY + 6} x2={shaftX + 6} y2={bottomY - 6} stroke="#ffffff" strokeWidth="2" opacity="0.7" />
          {/* Lattice steel braces */}
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
        {/* Steel guide rails */}
        {[-53, 53].map(x => (
          <line key={x} x1={sceneWidth / 2 + x} x2={sceneWidth / 2 + x} y1={topY + 6} y2={bottomY - 6} stroke="#bacbe1" strokeWidth="3" />
        ))}
      </g>
    )
  }

  // Projectile sports field or atmospheric open sky
  const renderProjectileBackdrop = () => {
    return (
      <g className="env-projectile-field">
        {/* Stadium turf ground baseline */}
        <rect x="10" y="214" width={sceneWidth - 20} height="28" rx="3" fill="#15803d" opacity="0.8" />
        <line x1="10" y1="214" x2={sceneWidth - 10} y2="214" stroke="#22c55e" strokeWidth="2" />
        {/* Yard line markers */}
        {ticks.map(v => {
          const p = toScreen({ x: minX + (maxX - minX) * v, y: 0 })
          return (
            <g key={v}>
              <line x1={p.x} x2={p.x} y1="214" y2="226" stroke="#ffffff" strokeWidth="1.5" opacity="0.9" />
              <text x={p.x} y="238" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="600">
                {number(minX + (maxX - minX) * v)} m
              </text>
            </g>
          )
        })}
      </g>
    )
  }

  return (
    <g className="motion-environment-backdrop" aria-hidden="true">
      {/* Background tint for special environments */}
      {env === 'space' && (
        <rect width={sceneWidth} height="310" fill="#090d16" opacity="0.8" />
      )}
      {env === 'underwater' && !vertical && (
        <rect width={sceneWidth} height="310" fill="#082f49" opacity="0.45" />
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
                <line x1={p.x} x2={p.x} y1="222" y2="228" stroke="#92a7c4" strokeWidth="1.25" />
                <text x={p.x} y="243" textAnchor="middle" fill="#627692" fontSize="9" fontWeight="600">
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
            <text key={v} x={sceneWidth / 2 - 83} y={203 - v * 70} textAnchor="end" fill="#627692" fontSize="9" fontWeight="600">
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
export function PersonalizedMotionObject({ visual, vertical, projectile, mass, wheelAngle = 0, motionDirection = 'rightward', id }) {
  const family = visual?.family || (vertical ? 'elevator' : projectile ? 'ball' : 'crate')
  const variant = visual?.variant || 'wooden-crate'
  const equip = visual?.equipment || {}
  const title = visual?.title || 'Object'

  // Determine facing orientation (cars, trains, submarines, aircraft, etc.)
  const isLeftward = motionDirection === 'left' || motionDirection === 'leftward' || motionDirection === 'negative'
  const isDirectional = ['car', 'train', 'submarine', 'boat', 'aircraft', 'athlete'].includes(family) ||
    ['rocket-sled', 'agv-cart', 'test-carriage'].includes(variant)
  const facingFlip = isDirectional && isLeftward

  // Effective wheel angle: locked if lockedWheels is true
  const effectiveWheelAngle = equip.lockedWheels ? 0 : wheelAngle

  // Render object badge / pill showing label and mass
  const renderIdentityBadge = (yOffset = -33) => (
    <g transform={`translate(0 ${yOffset})`} pointerEvents="none">
      <rect x="-38" y="-9" width="76" height="17" rx="8" fill="#0f172a" fillOpacity="0.82" stroke="#64748b" strokeWidth="0.75" />
      <text y="3" textAnchor="middle" fill="#f8fafc" fontSize="9" fontWeight="700">
        {title.length > 12 ? title.slice(0, 11) + '…' : title} · {Number(mass.toFixed(1))} kg
      </text>
    </g>
  )

  // Equipment overlays: Parachute, Tension Cable, Thruster Flame, Rotors, Propellers
  const renderEquipment = () => (
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
          {/* Suspension lines */}
          <line x1="0" y1="0" x2="-38" y2="-32" stroke="#64748b" strokeWidth="1" />
          <line x1="0" y1="0" x2="-18" y2="-36" stroke="#64748b" strokeWidth="1" />
          <line x1="0" y1="0" x2="18" y2="-36" stroke="#64748b" strokeWidth="1" />
          <line x1="0" y1="0" x2="38" y2="-32" stroke="#64748b" strokeWidth="1" />
          {/* Canopy shell */}
          <path d="M-42 -30 Q0 -65 42 -30 Q22 -36 0 -34 Q-22 -36 -42 -30 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.5" />
          <path d="M-22 -36 Q0 -64 22 -36 Q11 -38 0 -37 Q-11 -38 -22 -36 Z" fill="#ffffff" opacity="0.85" />
        </g>
      )}

      {/* Thruster exhaust flame plume */}
      {equip.thruster && (
        <g className="equip-thruster">
          {vertical ? (
            <path d="M-9 24 Q0 48 9 24 Q0 36 -9 24 Z" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
          ) : (
            <path d="M-44 -4 Q-66 0 -44 4 Q-54 0 -44 -4 Z" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
          )}
        </g>
      )}

      {/* Spinning quadcopter rotors */}
      {equip.rotors && (
        <g className="equip-rotors">
          {[-34, 34].map(x => (
            <g key={x} transform={`translate(${x} -20)`}>
              <line x1="-16" y1="0" x2="16" y2="0" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" />
              <circle r="2.5" fill="#0369a1" />
            </g>
          ))}
        </g>
      )}

      {/* Stern or fan booster propeller */}
      {equip.propeller && (
        <g className="equip-propeller" transform="translate(-46 4)">
          <line x1="0" y1="-12" x2="0" y2="12" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
          <circle r="3" fill="#1e293b" />
        </g>
      )}

      {/* Tow cables attached to crate or sled */}
      {equip.towCable && (
        <g className="equip-tow-cable">
          <line x1="42" y1="4" x2="120" y2="-10" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 2" />
        </g>
      )}

      {/* Skid marks / tire smoke when wheels are locked */}
      {equip.lockedWheels && (
        <g className="equip-locked-skids" opacity="0.75">
          {[-27, 27].map(x => (
            <g key={x} transform={`translate(${x} 36)`}>
              <line x1="-12" y1="0" x2="12" y2="0" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="-8" y1="-2" x2="6" y2="-2" stroke="#64748b" strokeWidth="1" strokeDasharray="2 2" />
            </g>
          ))}
        </g>
      )}
    </>
  )

  // Submarine Family
  const renderSubmarine = () => (
    <g className="obj-submarine">
      {/* Submarine Hull */}
      <rect x="-48" y="-12" width="92" height="30" rx="15" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
      {/* Conning tower / bridge */}
      <rect x="-8" y="-25" width="22" height="15" rx="3" fill="#334155" stroke="#0f172a" strokeWidth="1" />
      <line x1="3" y1="-25" x2="3" y2="-32" stroke="#64748b" strokeWidth="1.5" />
      {/* Portholes */}
      {[-24, -4, 16].map(x => (
        <circle key={x} cx={x} cy="3" r="4.5" fill="#38bdf8" stroke="#0f172a" strokeWidth="1" />
      ))}
      {/* Diving plane */}
      <rect x="22" y="2" width="16" height="4" rx="2" fill="#64748b" />
      {/* Stern propeller */}
      <g transform="translate(-49 3)">
        <line x1="0" y1="-9" x2="0" y2="9" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </g>
  )

  // Train Family
  const renderTrain = () => (
    <g className="obj-train">
      {/* Locomotive or Bullet-train body */}
      {variant === 'bullet-train' || variant === 'maglev' ? (
        <path d="M-48 -14 L12 -14 Q46 -14 48 16 L-48 16 Z" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
      ) : (
        <rect x="-46" y="-18" width="92" height="38" rx="6" fill="#1e3a8a" stroke="#172554" strokeWidth="1.5" />
      )}
      {/* Cab windshield and side windows */}
      <rect x="18" y="-10" width="18" height="10" rx="2" fill="#bae6fd" stroke="#0f172a" strokeWidth="0.75" />
      <rect x="-38" y="-8" width="14" height="8" rx="1.5" fill="#bae6fd" opacity="0.8" />
      <rect x="-18" y="-8" width="14" height="8" rx="1.5" fill="#bae6fd" opacity="0.8" />
      {/* Rotating flanged steel train wheels */}
      {variant !== 'maglev' && [-30, 2, 32].map(x => (
        <g key={x} transform={`translate(${x} 26) rotate(${effectiveWheelAngle})`}>
          <circle r="9" fill="#334155" stroke="#1e293b" strokeWidth="1.5" />
          <circle r="5" fill="#94a3b8" />
          <path d="M-5 0H5M0 -5V5" stroke="#ffffff" strokeWidth="1.25" />
        </g>
      ))}
    </g>
  )

  // Car Family
  const renderCar = () => (
    <g className="obj-car">
      {variant === 'freight-truck' || variant === 'delivery-van' ? (
        <>
          {/* Cargo box / delivery body */}
          <rect x="-46" y="-22" width="56" height="42" rx="4" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
          {/* Front cab */}
          <path d="M10 -6 L28 -6 Q38 -6 44 8 L44 20 L10 20 Z" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
          <rect x="16" y="-2" width="16" height="9" rx="1.5" fill="#bae6fd" />
        </>
      ) : variant === 'dragster' ? (
        <>
          {/* Dragster chassis */}
          <polygon points="-46,8 -10,8 46,16 46,20 -46,20" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
          {/* Large rear wing */}
          <rect x="-44" y="-18" width="16" height="5" rx="1.5" fill="#1e293b" />
          <line x1="-36" y1="-13" x2="-36" y2="8" stroke="#1e293b" strokeWidth="2" />
        </>
      ) : variant === 'rover' ? (
        <>
          {/* Planetary rover body */}
          <rect x="-30" y="-8" width="60" height="22" rx="4" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
          {/* Mast camera */}
          <line x1="-12" y1="-8" x2="-12" y2="-24" stroke="#64748b" strokeWidth="2.5" />
          <circle cx="-12" cy="-24" r="4.5" fill="#0284c7" stroke="#0f172a" strokeWidth="1" />
        </>
      ) : (
        <>
          {/* Sleek passenger sedan / sports coupe */}
          <path d="M-42 6 L-30 -14 L12 -14 L32 6 L44 8 L44 20 L-42 20 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1.5" />
          {/* Tinted glass windows */}
          <path d="M-26 -10 L9 -10 L24 4 L-26 4 Z" fill="#bae6fd" opacity="0.9" />
          {/* Headlight */}
          <circle cx="41" cy="12" r="3" fill="#fef08a" />
        </>
      )}

      {/* Rotating automotive wheels */}
      {[-27, 27].map(x => (
        <g key={x} transform={`translate(${x} 23) rotate(${effectiveWheelAngle})`}>
          <circle r="9" fill="#1e293b" />
          <circle r="5" fill="#94a3b8" />
          <path d="M-4 0H4M0 -4V4" stroke="#f8fafc" strokeWidth="1.25" />
        </g>
      ))}
    </g>
  )

  // Elevator Family
  const renderElevator = () => (
    <g className="obj-elevator">
      {/* Elevator Cabin / Hoist cage */}
      <rect x="-34" y="-24" width="68" height="48" rx="6" fill="#f1f5f9" stroke="#334155" strokeWidth="1.5" />
      {/* Door reveal / window */}
      <rect x="-24" y="-16" width="22" height="36" rx="2" fill="#bae6fd" opacity="0.75" stroke="#94a3b8" strokeWidth="1" />
      <rect x="2" y="-16" width="22" height="36" rx="2" fill="#bae6fd" opacity="0.75" stroke="#94a3b8" strokeWidth="1" />
      {/* Structural guide shoes on left and right */}
      <rect x="-38" y="-18" width="5" height="12" rx="1.5" fill="#475569" />
      <rect x="-38" y="6" width="5" height="12" rx="1.5" fill="#475569" />
      <rect x="33" y="-18" width="5" height="12" rx="1.5" fill="#475569" />
      <rect x="33" y="6" width="5" height="12" rx="1.5" fill="#475569" />
    </g>
  )

  // Skydiver Family
  const renderSkydiver = () => (
    <g className="obj-skydiver">
      {variant === 'weather-capsule' || variant === 'recovery-capsule' || variant === 'reentry-capsule' || variant === 'cargo-pod' ? (
        <>
          {/* Conical re-entry heatshield capsule */}
          <path d="M-26 14 L-14 -16 L14 -16 L26 14 Z" fill="#e2e8f0" stroke="#334155" strokeWidth="1.5" />
          <ellipse cx="0" cy="14" rx="26" ry="6" fill="#334155" />
          <circle cx="0" cy="-2" r="5" fill="#0284c7" />
        </>
      ) : (
        <>
          {/* Human skydiver in arched freefall */}
          <ellipse cx="0" cy="2" rx="18" ry="8" fill="#f97316" stroke="#c2410c" strokeWidth="1.25" />
          {/* Helmet */}
          <circle cx="0" cy="-8" r="6" fill="#ffffff" stroke="#0f172a" strokeWidth="1" />
          {/* Outstretched arms & legs */}
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
          {/* Bedroom dresser with drawers */}
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
          {/* Steel toolbox / molded equipment case */}
          <rect x="-38" y="-16" width="76" height="38" rx="4" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
          <rect x="-34" y="-14" width="68" height="8" rx="2" fill="#b91c1c" />
          {/* Metal clasps */}
          {[-18, 18].map(x => (
            <rect key={x} x={x - 3} y="-8" width="6" height="9" rx="1" fill="#f1f5f9" stroke="#475569" strokeWidth="0.75" />
          ))}
          {/* Top handle */}
          <path d="M-12 -16 L-12 -22 L12 -22 L12 -16" fill="none" stroke="#334155" strokeWidth="2.5" />
        </>
      ) : (
        <>
          {/* Wooden / cargo container crate with cross-bracing */}
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
          {/* Vulcanized rubber hockey puck */}
          <ellipse cx="0" cy="8" rx="30" ry="12" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
          <ellipse cx="0" cy="0" rx="30" ry="12" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
        </>
      ) : variant === 'curling-stone' ? (
        <>
          {/* Granite curling stone with handle */}
          <ellipse cx="0" cy="8" rx="32" ry="14" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
          <ellipse cx="0" cy="0" rx="30" ry="12" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
          <path d="M-14 -2 L0 -16 L14 -2" fill="none" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
        </>
      ) : variant === 'sled' || variant === 'sledder' ? (
        <>
          {/* Snow sled with curved runners */}
          <path d="M-36 18 L28 18 Q38 18 42 6" fill="none" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
          <rect x="-32" y="4" width="64" height="8" rx="2" fill="#d97706" stroke="#92400e" strokeWidth="1" />
          <line x1="-20" y1="12" x2="-20" y2="18" stroke="#78350f" strokeWidth="2.5" />
          <line x1="16" y1="12" x2="16" y2="18" stroke="#78350f" strokeWidth="2.5" />
          {/* Seated sledder rider */}
          {variant === 'sledder' && (
            <g transform="translate(-4 -2)">
              <circle cx="2" cy="-12" r="6" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1" />
              <rect x="-8" y="-5" width="16" height="12" rx="3" fill="#ef4444" />
            </g>
          )}
        </>
      ) : (
        <>
          {/* Dynamics Cart / Air Glider with low-friction wheels */}
          <rect x="-42" y="-12" width="84" height="26" rx="4" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
          <rect x="-36" y="-8" width="72" height="4" rx="2" fill="#bae6fd" />
          {/* Wheels */}
          {[-24, 24].map(x => (
            <g key={x} transform={`translate(${x} 18) rotate(${effectiveWheelAngle})`}>
              <circle r="6.5" fill="#334155" stroke="#1e293b" strokeWidth="1" />
              <circle r="3" fill="#cbd5e1" />
            </g>
          ))}
        </>
      )}
    </g>
  )

  // Rocket Family
  const renderRocket = () => (
    <g className="obj-rocket">
      {variant === 'lunar-lander' ? (
        <>
          {/* Lunar descent module */}
          <polygon points="-24,14 -16,-6 16,-6 24,14" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
          <circle cx="0" cy="2" r="8" fill="#f1f5f9" stroke="#475569" strokeWidth="1" />
          {/* Landing legs */}
          <line x1="-22" y1="14" x2="-34" y2="28" stroke="#475569" strokeWidth="2" />
          <line x1="22" y1="14" x2="34" y2="28" stroke="#475569" strokeWidth="2" />
        </>
      ) : variant === 'rocket-sled' ? (
        <>
          {/* Supersonic horizontal rocket sled */}
          <rect x="-44" y="-8" width="88" height="22" rx="4" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
          <polygon points="44,-8 58,3 44,14" fill="#dc2626" />
        </>
      ) : (
        <>
          {/* Vertical sounding / model rocket */}
          <rect x="-12" y="-16" width="24" height="40" rx="3" fill="#f8fafc" stroke="#dc2626" strokeWidth="1.5" />
          <polygon points="-12,-16 0,-38 12,-16" fill="#dc2626" stroke="#b91c1c" strokeWidth="1.25" />
          {/* Stabilizer fins */}
          <polygon points="-12,12 -26,24 -12,24" fill="#dc2626" stroke="#b91c1c" strokeWidth="1" />
          <polygon points="12,12 26,24 12,24" fill="#dc2626" stroke="#b91c1c" strokeWidth="1" />
        </>
      )}
    </g>
  )

  // Boat Family
  const renderBoat = () => (
    <g className="obj-boat">
      {/* V-hull or Hovercraft skirt */}
      <path d="M-44 14 L36 14 Q48 14 50 2 L42 -4 L-44 -4 Z" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
      <rect x="-24" y="-14" width="34" height="10" rx="2" fill="#ffffff" stroke="#334155" strokeWidth="1" />
    </g>
  )

  // Aircraft Family
  const renderAircraft = () => (
    <g className="obj-aircraft">
      {/* Jet fuselage */}
      <polygon points="-46,4 -32,-4 34,-4 50,4 34,10 -46,10" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
      {/* Swept wings and vertical stabilizer */}
      <polygon points="-14,-4 2,-22 14,-22 4,-4" fill="#0284c7" />
      <polygon points="-42,-4 -34,-18 -26,-18 -32,-4" fill="#dc2626" />
    </g>
  )

  // Drone Family
  const renderDrone = () => (
    <g className="obj-drone">
      {/* Quadcopter central pod & landing skids */}
      <rect x="-18" y="-10" width="36" height="20" rx="6" fill="#1e293b" stroke="#0284c7" strokeWidth="1.5" />
      <circle cx="0" cy="0" r="4" fill="#38bdf8" />
      {/* Rotor arms */}
      <line x1="-34" y1="-8" x2="34" y2="-8" stroke="#475569" strokeWidth="3" />
      {/* Landing skids */}
      <path d="M-16 10 L-22 18 L-8 18" fill="none" stroke="#64748b" strokeWidth="2" />
      <path d="M16 10 L22 18 L8 18" fill="none" stroke="#64748b" strokeWidth="2" />
    </g>
  )

  // Balloon Family
  const renderBalloon = () => (
    <g className="obj-balloon">
      {/* Hot-air balloon or high-altitude weather balloon envelope */}
      <path d="M-28 -14 Q-36 -50 0 -50 Q36 -50 28 -14 L12 8 L-12 8 Z" fill="#f97316" stroke="#c2410c" strokeWidth="1.5" />
      {/* Basket */}
      <rect x="-8" y="16" width="16" height="12" rx="2" fill="#78350f" stroke="#451a03" strokeWidth="1" />
      <line x1="-8" y1="8" x2="-6" y2="16" stroke="#64748b" strokeWidth="1" />
      <line x1="8" y1="8" x2="6" y2="16" stroke="#64748b" strokeWidth="1" />
    </g>
  )

  // Ball Family
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
          {/* Horizontal head-first sliding player */}
          <ellipse cx="6" cy="4" rx="24" ry="8" fill="#1e40af" stroke="#172554" strokeWidth="1.25" />
          {/* Batting helmet */}
          <circle cx="30" cy="-2" r="7" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
          {/* Outstretched arms */}
          <line x1="24" y1="4" x2="44" y2="6" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
        </>
      ) : (
        <>
          {/* Sprinter driving forward out of blocks */}
          <ellipse cx="-4" cy="-2" rx="14" ry="8" fill="#dc2626" stroke="#991b1b" strokeWidth="1.25" transform="rotate(-25)" />
          <circle cx="12" cy="-18" r="6" fill="#0f172a" />
          <line x1="-10" y1="4" x2="-26" y2="18" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="2" y1="2" x2="14" y2="16" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
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
      {renderIdentityBadge(vertical ? -36 : equip.parachute ? -64 : family === 'ball' ? -26 : -32)}
    </g>
  )
}
