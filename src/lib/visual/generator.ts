import type { Shape, Fill, Inner, Rotation, ShapeDescriptor, VisualData } from '@/types'

const SHAPES: Shape[] = ['circle', 'square', 'triangle', 'diamond', 'star', 'pentagon', 'hexagon', 'cross']
const FILLS: Fill[] = ['outline', 'solid', 'half', 'dotted']
const INNERS: Inner[] = ['circle', 'star', 'cross', 'dot', 'crescent', 'triangle', 'square', null]
const ROTATIONS: Rotation[] = [0, 45, 90, 135, 180, 225, 270, 315]
const OPTIONS = ['A', 'B', 'C', 'D', 'E'] as const

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickExcluding<T>(arr: T[], exclude: T): T {
  const filtered = arr.filter(x => x !== exclude)
  return pick(filtered)
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeDescriptor(overrides?: Partial<ShapeDescriptor>): ShapeDescriptor {
  return {
    shape: pick(SHAPES),
    fill: pick(FILLS),
    inner: pick(INNERS),
    rotation: pick(ROTATIONS),
    size: 'medium',
    ...overrides,
  }
}

export function generateOddOneOut(): VisualData {
  const baseShape = pick(SHAPES)
  const baseFill = pick(FILLS)
  const baseInner = pick(INNERS)
  const baseRotation = pick(ROTATIONS)

  const diffProperty = pick(['fill', 'inner', 'rotation'] as const)

  const baseDescriptor: ShapeDescriptor = {
    shape: baseShape,
    fill: baseFill,
    inner: baseInner,
    rotation: baseRotation,
    size: 'medium',
  }

  let oddDescriptor: ShapeDescriptor
  let explanation: string

  if (diffProperty === 'fill') {
    const oddFill = pickExcluding(FILLS, baseFill)
    oddDescriptor = { ...baseDescriptor, fill: oddFill }
    explanation = `Semua gambar memiliki isian "${baseFill}", kecuali satu yang memiliki isian "${oddFill}".`
  } else if (diffProperty === 'inner') {
    const oddInner = INNERS.filter(x => x !== baseInner)[Math.floor(Math.random() * (INNERS.length - 1))]
    oddDescriptor = { ...baseDescriptor, inner: oddInner }
    const innerLabel = (i: Inner) => (i === null ? 'tanpa inner' : i)
    explanation = `Semua gambar memiliki simbol dalam "${innerLabel(baseInner)}", kecuali satu yang memiliki "${innerLabel(oddInner)}".`
  } else {
    const oddRot = pickExcluding(ROTATIONS, baseRotation)
    oddDescriptor = { ...baseDescriptor, rotation: oddRot }
    explanation = `Semua gambar memiliki rotasi ${baseRotation}°, kecuali satu yang memiliki rotasi ${oddRot}°.`
  }

  const positions = shuffle([0, 1, 2, 3, 4])
  const oddIndex = positions[0]
  const optionKey = OPTIONS[oddIndex]

  const items: ShapeDescriptor[] = positions.map((pos, i) => ({
    ...(i === 0 ? oddDescriptor : baseDescriptor),
    id: OPTIONS[pos],
  }))

  const opts = {} as Record<'A' | 'B' | 'C' | 'D' | 'E', ShapeDescriptor>
  items.forEach((item, i) => {
    opts[OPTIONS[i]] = item
  })

  return {
    type: 'odd_one_out',
    question: 'Pada lima gambar berikut, manakah yang berbeda dari yang lain?',
    items,
    options: opts,
    answer: optionKey,
    explanation,
  }
}

export function generateSequence(): VisualData {
  const baseShape = pick(SHAPES)
  const changeProp = pick(['fill', 'rotation', 'inner'] as const)

  let seqItems: ShapeDescriptor[] = []
  let correctItem: ShapeDescriptor
  let explanation: string

  if (changeProp === 'fill') {
    const fillSeq = shuffle(FILLS).slice(0, 4) as [Fill, Fill, Fill, Fill]
    seqItems = fillSeq.slice(0, 3).map(f => makeDescriptor({ shape: baseShape, fill: f }))
    correctItem = makeDescriptor({ shape: baseShape, fill: fillSeq[3] })
    explanation = `Pola: setiap gambar memiliki isian berbeda. Isian berikutnya adalah "${fillSeq[3]}".`
  } else if (changeProp === 'rotation') {
    const startRot = pick([0, 45]) as Rotation
    const step = 45
    const rots = [0, 1, 2, 3].map(i => (((startRot + i * step) % 360) as Rotation))
    seqItems = rots.slice(0, 3).map(r => makeDescriptor({ shape: baseShape, fill: 'outline', rotation: r }))
    correctItem = makeDescriptor({ shape: baseShape, fill: 'outline', rotation: rots[3] })
    explanation = `Pola: rotasi bertambah ${step}° setiap langkah. Berikutnya adalah ${rots[3]}°.`
  } else {
    const innerSeq = shuffle(INNERS.filter(x => x !== null)).slice(0, 4) as Inner[]
    seqItems = innerSeq.slice(0, 3).map(inn => makeDescriptor({ shape: baseShape, fill: 'outline', inner: inn }))
    correctItem = makeDescriptor({ shape: baseShape, fill: 'outline', inner: innerSeq[3] })
    explanation = `Pola: setiap gambar memiliki simbol dalam yang berbeda. Berikutnya adalah "${innerSeq[3]}".`
  }

  const wrongOptions = Array.from({ length: 4 }, () => makeDescriptor({ shape: baseShape }))
  const allOpts = shuffle([correctItem, ...wrongOptions])
  const correctIdx = allOpts.findIndex(o => o === correctItem)

  const opts = {} as Record<'A' | 'B' | 'C' | 'D' | 'E', ShapeDescriptor>
  OPTIONS.forEach((opt, i) => { opts[opt] = allOpts[i] })

  return {
    type: 'sequence',
    question: 'Carilah gambar yang tepat untuk melanjutkan pola berikut.',
    sequence: seqItems,
    options: opts,
    answer: OPTIONS[correctIdx],
    explanation,
  }
}

export function generateMatrix(): VisualData {
  const rowShapes: Shape[] = shuffle(SHAPES).slice(0, 3) as [Shape, Shape, Shape]
  const rowFills: Fill[] = shuffle(FILLS).slice(0, 3) as [Fill, Fill, Fill]

  const grid: ShapeDescriptor[][] = [
    rowShapes.map((s, ci) => makeDescriptor({ shape: s, fill: rowFills[0] })),
    rowShapes.map((s, ci) => makeDescriptor({ shape: s, fill: rowFills[1] })),
    rowShapes.map((s, ci) => makeDescriptor({ shape: s, fill: rowFills[2] })),
  ]

  const correctItem = grid[2][2]
  const nullGrid: (ShapeDescriptor | null)[][] = grid.map((row, ri) =>
    row.map((cell, ci) => (ri === 2 && ci === 2 ? null : cell))
  )

  const wrongOptions = Array.from({ length: 4 }, () =>
    makeDescriptor({ shape: pick(rowShapes), fill: pick(rowFills) })
  )
  const allOpts = shuffle([correctItem, ...wrongOptions])
  const correctIdx = allOpts.findIndex(o => o === correctItem)

  const opts = {} as Record<'A' | 'B' | 'C' | 'D' | 'E', ShapeDescriptor>
  OPTIONS.forEach((opt, i) => { opts[opt] = allOpts[i] })

  return {
    type: 'matrix',
    question: 'Manakah gambar yang tepat untuk melengkapi matriks berikut?',
    grid: nullGrid,
    options: opts,
    answer: OPTIONS[correctIdx],
    explanation: `Baris 3 mengikuti pola: setiap kolom mempertahankan bentuknya (${rowShapes.join(', ')}) dan baris ke-3 menggunakan isian "${rowFills[2]}".`,
  }
}

export function generateMirror(): VisualData {
  type Dir = 'left' | 'right' | 'up' | 'down'
  const directions: Dir[] = ['left', 'right', 'up', 'down']
  const srcDir = pick(directions)
  const mirrorDir: Record<Dir, Dir> = { left: 'right', right: 'left', up: 'down', down: 'up' }
  const correctDir: Dir = mirrorDir[srcDir]

  const srcFill = pick(FILLS)
  const srcTail = pick(['single', 'double'] as const)

  const source: ShapeDescriptor = { shape: 'arrow', fill: srcFill, direction: srcDir, tail: srcTail }
  const correctOpt: ShapeDescriptor = { shape: 'arrow', fill: srcFill, direction: correctDir, tail: srcTail }

  const wrongOpts: ShapeDescriptor[] = [
    { shape: 'arrow', fill: srcFill, direction: srcDir, tail: srcTail },
    { shape: 'arrow', fill: pickExcluding(FILLS, srcFill), direction: correctDir, tail: srcTail },
    { shape: 'arrow', fill: srcFill, direction: correctDir, tail: srcTail === 'single' ? 'double' : 'single' },
    { shape: 'arrow', fill: pickExcluding(FILLS, srcFill), direction: correctDir, tail: srcTail === 'single' ? 'double' : 'single' },
  ]

  const allOpts = shuffle([correctOpt, ...wrongOpts.slice(0, 4)])
  const correctIdx = allOpts.findIndex(o => o === correctOpt)

  const opts = {} as Record<'A' | 'B' | 'C' | 'D' | 'E', ShapeDescriptor>
  OPTIONS.forEach((opt, i) => { opts[opt] = allOpts[i] })

  return {
    type: 'mirror',
    question: 'Manakah bayangan cermin dari gambar berikut?',
    source,
    options: opts,
    answer: OPTIONS[correctIdx],
    explanation: `Bayangan cermin membalik arah horizontal: panah "${srcDir}" menjadi panah "${correctDir}".`,
  }
}

const generators = [generateOddOneOut, generateSequence, generateMatrix, generateMirror]

export function generateVisualQuestion(): VisualData {
  return pick(generators)()
}

export function generateVisualQuestionsBatch(count: number): VisualData[] {
  return Array.from({ length: count }, () => generateVisualQuestion())
}
