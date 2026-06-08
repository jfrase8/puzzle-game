import { BORDER_SIZE, PUZZLE_SIZE } from '#/constants/dragAndDropConstants'
import { useDraggable } from '@dnd-kit/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import DraggableSquare from '../drag-n-drop/DraggableSquare'

export type Square = [row: number, col: number]

/**
 * Rotate squares 90° CW or CCW.
 * Re-anchors to [1,1] after rotating so the piece always starts at the top-left.
 */
export function rotateSquares(
  squares: Square[],
  direction: 'left' | 'right',
): Square[] {
  const maxRow = Math.max(...squares.map(([r]) => r))
  const maxCol = Math.max(...squares.map(([, c]) => c))

  const rotated: Square[] = squares.map(([r, c]) =>
    direction === 'right' ? [c, maxRow - r + 1] : [maxCol - c + 1, r],
  )

  const minRow = Math.min(...rotated.map(([r]) => r))
  const minCol = Math.min(...rotated.map(([, c]) => c))
  return rotated.map(([r, c]) => [r - minRow + 1, c - minCol + 1])
}

/**
 * Given the grabbed square's [row, col] before rotation, return its new [row, col]
 * after applying the same rotation + re-anchor that rotateSquares uses.
 */
function rotateGrabPoint(
  grabPoint: Square,
  squares: Square[],
  rotatedSquares: Square[],
  direction: 'left' | 'right',
): Square {
  const maxRow = Math.max(...squares.map(([r]) => r))
  const maxCol = Math.max(...squares.map(([, c]) => c))

  // Apply the same raw rotation formula to the grab point
  const [gr, gc] = grabPoint
  const rawRotated: Square =
    direction === 'right' ? [gc, maxRow - gr + 1] : [maxCol - gc + 1, gr]

  // Apply the same re-anchor offset that rotateSquares applied
  const minRow = Math.min(...rotatedSquares.map(([r]) => r))
  const minCol = Math.min(...rotatedSquares.map(([, c]) => c))

  // rotateSquares adds (+1 - minRow) and (+1 - minCol), so mirror that here
  // Actually rotateSquares does: [r - minRow + 1, c - minCol + 1] on already-rotated coords
  // rawRotated is pre-re-anchor, so apply the same shift
  return [rawRotated[0] - minRow + 1, rawRotated[1] - minCol + 1]
}

interface PieceProps {
  id: string
  gridInfo: { gridSize: number; gridGap: number }
  /** Controlled — parent owns rotation state */
  squares: Square[]
  /** Index into squares of the currently grabbed square */
  grabbedSquareIndex: number
  dropState?: 'idle' | 'valid' | 'invalid'
  onGrabSquare?: (index: number) => void
  /** Called with the new squares and the new index of the grabbed square after rotation */
  onSquaresChange?: (squares: Square[], newGrabbedIndex: number) => void
}

export default function Piece({
  id,
  gridInfo,
  squares,
  grabbedSquareIndex,
  dropState = 'idle',
  onGrabSquare,
  onSquaresChange,
}: PieceProps) {
  const { gridSize, gridGap } = gridInfo

  const { ref, isDragging } = useDraggable({ id })

  const rotate = (direction: 'left' | 'right') => {
    const next = rotateSquares(squares, direction)

    // Find where the grabbed square landed in the rotated piece
    const grabPoint = squares[grabbedSquareIndex]
    const rotatedGrabPoint = rotateGrabPoint(
      grabPoint,
      squares,
      next,
      direction,
    )
    const newGrabbedIndex = next.findIndex(
      ([r, c]) => r === rotatedGrabPoint[0] && c === rotatedGrabPoint[1],
    )

    onSquaresChange?.(next, newGrabbedIndex >= 0 ? newGrabbedIndex : 0)
  }

  useHotkey('R', () => rotate('right'), { enabled: isDragging })
  useHotkey('Shift+R', () => rotate('left'), { enabled: isDragging })

  const innerPuzzle = PUZZLE_SIZE - BORDER_SIZE * 2
  const gridGapTotal = (gridSize - 1) * gridGap
  const size = (innerPuzzle - gridGapTotal) / gridSize

  const maxRow = Math.max(...squares.map(([r]) => r))
  const maxCol = Math.max(...squares.map(([, c]) => c))

  const draggableWidth = size * maxCol + gridGap * (maxCol - 1)
  const draggableHeight = size * maxRow + gridGap * (maxRow - 1)

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
      {squares.map(([row, col], index) => (
        <DraggableSquare
          key={index}
          row={row}
          col={col}
          size={size}
          state={dropState}
          onPointerDown={() => onGrabSquare?.(index)}
        />
      ))}
    </div>
  )
}
