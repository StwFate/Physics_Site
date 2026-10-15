import React from 'react'

export const FORCE_REGISTRY = {
  1: { id: 'Fgrav', label: 'Gravity', sub: 'g', fullSub: 'grav', color: 'text-rose-600' },
  2: { id: 'Fnorm', label: 'Normal', sub: 'N', fullSub: 'norm', color: 'text-blue-600' },
  3: { id: 'Ffrict', label: 'Friction', sub: 'f', fullSub: 'frict', color: 'text-amber-600' },
  4: { id: 'Fapp', label: 'Applied', sub: 'a', fullSub: 'app', color: 'text-emerald-600' },
  5: { id: 'Fair', label: 'Air Resistance', sub: 'air', fullSub: 'air', color: 'text-purple-600' },
  6: { id: 'Fspring', label: 'Spring', sub: 's', fullSub: 'spring', color: 'text-pink-600' },
  7: { id: 'Ftens', label: 'Tension', sub: 'T', fullSub: 'tens', color: 'text-yellow-700' },
  Fgrav: { id: 'Fgrav', label: 'Gravity', sub: 'g', fullSub: 'grav', color: 'text-rose-600' },
  Fnorm: { id: 'Fnorm', label: 'Normal', sub: 'N', fullSub: 'norm', color: 'text-blue-600' },
  Ffrict: { id: 'Ffrict', label: 'Friction', sub: 'f', fullSub: 'frict', color: 'text-amber-600' },
  Fapp: { id: 'Fapp', label: 'Applied', sub: 'a', fullSub: 'app', color: 'text-emerald-600' },
  Fair: { id: 'Fair', label: 'Air Resistance', sub: 'air', fullSub: 'air', color: 'text-purple-600' },
  Fspring: { id: 'Fspring', label: 'Spring', sub: 's', fullSub: 'spring', color: 'text-pink-600' },
  Ftens: { id: 'Ftens', label: 'Tension', sub: 'T', fullSub: 'tens', color: 'text-yellow-700' },
  Fthrust: { id: 'Fthrust', label: 'Thrust', sub: 'thrust', fullSub: 'thrust', color: 'text-emerald-600' },
  Fdrag: { id: 'Fdrag', label: 'Drag', sub: 'drag', fullSub: 'drag', color: 'text-purple-600' },
  net: { id: 'Fnet', label: 'Net Force', sub: 'net', fullSub: 'net', color: 'text-blue-700' },
  Fnet: { id: 'Fnet', label: 'Net Force', sub: 'net', fullSub: 'net', color: 'text-blue-700' },
  F1: { id: 'F1', label: 'Force 1', sub: '1', fullSub: '1', color: 'text-rose-600' },
  F2: { id: 'F2', label: 'Force 2', sub: '2', fullSub: '2', color: 'text-blue-600' },
  '1_alt': { id: 'F1', label: 'Force 1', sub: '1', fullSub: '1', color: 'text-rose-600' },
  '2_alt': { id: 'F2', label: 'Force 2', sub: '2', fullSub: '2', color: 'text-blue-600' },
  F_grav: { id: 'Fgrav', label: 'Gravity', sub: 'g', fullSub: 'grav', color: 'text-rose-600' },
  F_norm: { id: 'Fnorm', label: 'Normal', sub: 'N', fullSub: 'norm', color: 'text-blue-600' },
  F_frict: { id: 'Ffrict', label: 'Friction', sub: 'f', fullSub: 'frict', color: 'text-amber-600' },
  F_app: { id: 'Fapp', label: 'Applied', sub: 'a', fullSub: 'app', color: 'text-emerald-600' },
  F_app1: { id: 'Fapp1', label: 'Applied 1', sub: 'a1', fullSub: 'app1', color: 'text-emerald-600' },
  F_app2: { id: 'Fapp2', label: 'Applied 2', sub: 'a2', fullSub: 'app2', color: 'text-emerald-600' },
  F_air: { id: 'Fair', label: 'Air Resistance', sub: 'air', fullSub: 'air', color: 'text-purple-600' },
  F_tens: { id: 'Ftens', label: 'Tension', sub: 'T', fullSub: 'tens', color: 'text-yellow-700' },
  F_net: { id: 'Fnet', label: 'Net Force', sub: 'net', fullSub: 'net', color: 'text-blue-700' },
  F_1: { id: 'F1', label: 'Force 1', sub: '1', fullSub: '1', color: 'text-rose-600' },
  F_2: { id: 'F2', label: 'Force 2', sub: '2', fullSub: '2', color: 'text-blue-600' },
  F_thrust: { id: 'Fthrust', label: 'Thrust', sub: 'thrust', fullSub: 'thrust', color: 'text-emerald-600' },
  F_drag: { id: 'Fdrag', label: 'Drag', sub: 'drag', fullSub: 'drag', color: 'text-purple-600' },
  f: { id: 'Ffrict', label: 'Friction', sub: 'f', fullSub: 'frict', color: 'text-amber-600' },
  frict: { id: 'Ffrict', label: 'Friction', sub: 'f', fullSub: 'frict', color: 'text-amber-600' },
  norm: { id: 'Fnorm', label: 'Normal', sub: 'N', fullSub: 'norm', color: 'text-blue-600' },
  grav: { id: 'Fgrav', label: 'Gravity', sub: 'g', fullSub: 'grav', color: 'text-rose-600' },
  app: { id: 'Fapp', label: 'Applied', sub: 'a', fullSub: 'app', color: 'text-emerald-600' },
  air: { id: 'Fair', label: 'Air Resistance', sub: 'air', fullSub: 'air', color: 'text-purple-600' },
  tens: { id: 'Ftens', label: 'Tension', sub: 'T', fullSub: 'tens', color: 'text-yellow-700' },
}

export default function ForceSymbol({
  code,
  type,
  sub,
  full = false,
  className = '',
  style = {},
}) {
  const key = code !== undefined ? code : type
  const entry = FORCE_REGISTRY[key]

  const displaySub = sub !== undefined 
    ? sub
    : (entry ? (full ? entry.fullSub : entry.sub) : String(key || ''))

  return (
    <span
      className={`inline-flex items-baseline font-serif italic font-semibold leading-none select-none ${className}`}
      style={style}
    >
      <span>F</span>
      <span className="not-italic font-sans font-bold text-[0.72em] translate-y-[0.2em] ml-0.5 tracking-tight">
        {displaySub}
      </span>
    </span>
  )
}
