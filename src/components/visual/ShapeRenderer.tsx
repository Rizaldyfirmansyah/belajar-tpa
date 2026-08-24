import type { ShapeDescriptor, Size } from '@/types'
import { ShapePath, SIZES } from './shapes'

interface ShapeRendererProps {
  descriptor: ShapeDescriptor
  size?: Size
  strokeColor?: string
  fillColor?: string
  className?: string
}

export default function ShapeRenderer({
  descriptor,
  size = 'medium',
  strokeColor = '#374151',
  fillColor,
  className,
}: ShapeRendererProps) {
  const s = SIZES[size]
  const rotation = descriptor.rotation ?? 0
  const effectiveSize = descriptor.size ?? size

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      className={className}
      aria-hidden="true"
    >
      <g transform={rotation !== 0 ? `rotate(${rotation}, ${s / 2}, ${s / 2})` : undefined}>
        <ShapePath
          shape={descriptor.shape}
          fill={descriptor.fill}
          inner={descriptor.inner}
          size={effectiveSize}
          strokeColor={strokeColor}
          fillColor={fillColor}
        />
      </g>
    </svg>
  )
}
