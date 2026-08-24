import type { Fill, Inner, Rotation, Size, Shape } from '@/types'

interface ShapeSvgProps {
  shape: Shape
  fill: Fill
  inner?: Inner
  rotation?: Rotation
  size?: Size
  strokeColor?: string
  fillColor?: string
  className?: string
}

const SIZES = { small: 36, medium: 56, large: 72 }
const STROKE_WIDTH = 2

function getPathForShape(shape: Shape, s: number): string {
  const cx = s / 2
  const cy = s / 2
  const r = s * 0.4

  switch (shape) {
    case 'circle':
      return `M ${cx},${cy - r} A ${r},${r} 0 1,1 ${cx - 0.01},${cy - r} Z`

    case 'square': {
      const hs = r * 1.3
      return `M ${cx - hs},${cy - hs} H ${cx + hs} V ${cy + hs} H ${cx - hs} Z`
    }

    case 'triangle': {
      const h = r * 1.7
      const hw = r * 1.4
      return `M ${cx},${cy - h * 0.6} L ${cx + hw},${cy + h * 0.4} L ${cx - hw},${cy + h * 0.4} Z`
    }

    case 'diamond': {
      const d = r * 1.3
      return `M ${cx},${cy - d} L ${cx + d},${cy} L ${cx},${cy + d} L ${cx - d},${cy} Z`
    }

    case 'star': {
      const outer = r * 1.1
      const inner2 = r * 0.45
      const pts: string[] = []
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5 - Math.PI / 2
        const rad = i % 2 === 0 ? outer : inner2
        pts.push(`${cx + rad * Math.cos(angle)},${cy + rad * Math.sin(angle)}`)
      }
      return `M ${pts[0]} L ${pts.slice(1).join(' L ')} Z`
    }

    case 'pentagon': {
      const pts: string[] = []
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2
        pts.push(`${cx + r * 1.1 * Math.cos(angle)},${cy + r * 1.1 * Math.sin(angle)}`)
      }
      return `M ${pts[0]} L ${pts.slice(1).join(' L ')} Z`
    }

    case 'hexagon': {
      const pts: string[] = []
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3
        pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`)
      }
      return `M ${pts[0]} L ${pts.slice(1).join(' L ')} Z`
    }

    case 'cross': {
      const arm = r * 0.9
      const thick = r * 0.35
      return `M ${cx - thick},${cy - arm} H ${cx + thick} V ${cy - thick} H ${cx + arm} V ${cy + thick} H ${cx + thick} V ${cy + arm} H ${cx - thick} V ${cy + thick} H ${cx - arm} V ${cy - thick} H ${cx - thick} Z`
    }

    case 'arrow': {
      const aw = r * 0.6
      const ah = r * 0.8
      const tail = r * 0.4
      return `M ${cx},${cy - ah} L ${cx + aw},${cy} H ${cx + tail * 0.5} V ${cy + ah * 0.5} H ${cx - tail * 0.5} V ${cy} H ${cx - aw} Z`
    }

    case 'cylinder': {
      const w = r * 1.1
      const h2 = r * 0.3
      const body = r * 0.9
      return `M ${cx - w},${cy - body} Q ${cx - w},${cy - body - h2} ${cx},${cy - body - h2} Q ${cx + w},${cy - body - h2} ${cx + w},${cy - body} L ${cx + w},${cy + body} Q ${cx + w},${cy + body + h2} ${cx},${cy + body + h2} Q ${cx - w},${cy + body + h2} ${cx - w},${cy + body} Z`
    }

    default:
      return `M ${cx},${cy - r} A ${r},${r} 0 1,1 ${cx - 0.01},${cy - r} Z`
  }
}

function getInnerPath(inner: Inner, s: number): string {
  const cx = s / 2
  const cy = s / 2
  const r = s * 0.18

  switch (inner) {
    case 'circle':
      return `M ${cx},${cy - r} A ${r},${r} 0 1,1 ${cx - 0.01},${cy - r} Z`
    case 'dot': {
      const rd = r * 0.5
      return `M ${cx},${cy - rd} A ${rd},${rd} 0 1,1 ${cx - 0.01},${cy - rd} Z`
    }
    case 'cross': {
      const arm = r * 0.9
      const thick = r * 0.35
      return `M ${cx - thick},${cy - arm} H ${cx + thick} V ${cy - thick} H ${cx + arm} V ${cy + thick} H ${cx + thick} V ${cy + arm} H ${cx - thick} V ${cy + thick} H ${cx - arm} V ${cy - thick} H ${cx - thick} Z`
    }
    case 'star': {
      const outer = r
      const innerR = r * 0.4
      const pts: string[] = []
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5 - Math.PI / 2
        const rad = i % 2 === 0 ? outer : innerR
        pts.push(`${cx + rad * Math.cos(angle)},${cy + rad * Math.sin(angle)}`)
      }
      return `M ${pts[0]} L ${pts.slice(1).join(' L ')} Z`
    }
    case 'crescent': {
      const or = r
      const ir = r * 0.7
      const off = r * 0.3
      return `M ${cx},${cy - or} A ${or},${or} 0 1,0 ${cx},${cy + or} A ${ir},${ir} 0 1,1 ${cx},${cy - or + off} A ${ir * 0.5},${ir * 0.5} 0 0,0 ${cx},${cy - or} Z`
    }
    case 'triangle': {
      const h = r * 1.5
      const hw = r * 1.2
      return `M ${cx},${cy - h * 0.5} L ${cx + hw},${cy + h * 0.5} L ${cx - hw},${cy + h * 0.5} Z`
    }
    case 'square': {
      const hs = r * 0.9
      return `M ${cx - hs},${cy - hs} H ${cx + hs} V ${cy + hs} H ${cx - hs} Z`
    }
    default:
      return ''
  }
}

export function ShapePath({ shape, fill, inner, size = 'medium', strokeColor = '#374151', fillColor }: ShapeSvgProps) {
  const s = SIZES[size]
  const cx = s / 2
  const cy = s / 2
  const path = getPathForShape(shape, s)
  const innerPath = inner ? getInnerPath(inner, s) : ''

  let shapeFill = 'none'
  let shapeStroke = strokeColor

  const resolvedFillColor = fillColor || strokeColor

  if (fill === 'solid') {
    shapeFill = resolvedFillColor
    shapeStroke = resolvedFillColor
  } else if (fill === 'outline') {
    shapeFill = 'none'
    shapeStroke = strokeColor
  } else if (fill === 'half') {
    // Use clipPath for half fill
    shapeFill = 'none'
    shapeStroke = strokeColor
  } else if (fill === 'dotted') {
    shapeFill = 'url(#dots)'
    shapeStroke = strokeColor
  }

  const clipId = `half-${shape}-${Math.random().toString(36).slice(2, 7)}`

  return (
    <g>
      {fill === 'half' && (
        <defs>
          <clipPath id={clipId}>
            <rect x={0} y={cy} width={s} height={cy} />
          </clipPath>
        </defs>
      )}
      {fill === 'dotted' && (
        <defs>
          <pattern id="dots" patternUnits="userSpaceOnUse" width="4" height="4">
            <circle cx="1" cy="1" r="1" fill={strokeColor} />
          </pattern>
        </defs>
      )}

      <path
        d={path}
        fill={shapeFill}
        stroke={shapeStroke}
        strokeWidth={STROKE_WIDTH}
        strokeLinejoin="round"
      />

      {fill === 'half' && (
        <path
          d={path}
          fill={resolvedFillColor}
          stroke="none"
          clipPath={`url(#${clipId})`}
        />
      )}

      {innerPath && (
        <path
          d={innerPath}
          fill={fill === 'solid' ? (fillColor || '#fff') : strokeColor}
          stroke="none"
        />
      )}
    </g>
  )
}

export { SIZES }
export default ShapePath
