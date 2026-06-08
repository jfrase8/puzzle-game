import { BORDER_SIZE, PUZZLE_SIZE } from '#/constants/dragAndDropConstants'
import { useDraggable } from '@dnd-kit/react'
import DraggableSquare from '../drag-n-drop/DraggableSquare'

const LetterMap: Record<string, number> = {
  a: 1,
  b: 2,
  c: 3,
  d: 4,
  e: 5,
  f: 6,
  g: 7,
  h: 8,
  i: 9,
  j: 10,
}

interface PieceProps {
  id: string
  gridInfo: {
    gridSize: number
    gridGap: number
  }
  squares: string[]
  /** Visual feedback state applied to every square while dragging */
  dropState?: 'idle' | 'valid' | 'invalid'
  /** Called with the square index (into `squares`) that the user grabbed */
  onGrabSquare?: (index: number) => void
}

export default function Piece({
  id,
  gridInfo,
  squares,
  dropState = 'idle',
  onGrabSquare,
}: PieceProps) {
  const { gridSize, gridGap } = gridInfo

  const innerPuzzle = PUZZLE_SIZE - BORDER_SIZE * 2
  const gridGapTotal = (gridSize - 1) * gridGap
  const size = (innerPuzzle - gridGapTotal) / gridSize

  const { maxRow, maxCol } = squares.reduce(
    (acc, sq) => ({
      maxRow: Math.max(acc.maxRow, LetterMap[sq[0]] ?? 1),
      maxCol: Math.max(acc.maxCol, Number(sq[1])),
    }),
    { maxRow: 1, maxCol: 1 },
  )

  const draggableWidth = size * maxCol + gridGap * (maxCol - 1)
  const draggableHeight = size * maxRow + gridGap * (maxRow - 1)

  const { ref, isDragging } = useDraggable({ id })

  return (
    <div
      ref={ref}
      className="grid touch-none select-none cursor-grab active:cursor-grabbing"
      style={{
        width: draggableWidth,
        height: draggableHeight,
        gap: gridGap,
        gridTemplateColumns: `repeat(${maxCol}, ${size}px)`,
        gridTemplateRows: `repeat(${maxRow}, ${size}px)`,
        opacity: isDragging ? 0.35 : 1,
        transition: 'opacity 120ms',
      }}
    >
      {squares.map((square, index) => {
        const row = LetterMap[square[0]]
        const col = Number(square[1])
        return (
          <DraggableSquare
            key={index}
            row={row}
            col={col}
            size={size}
            state={dropState}
            onPointerDown={() => onGrabSquare?.(index)}
          />
        )
      })}
    </div>
  )
}
