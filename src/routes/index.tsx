import Droppable from '#/components/drag-n-drop/Droppable'
import type { Square } from '#/components/puzzle/Piece'
import Piece from '#/components/puzzle/Piece'
import { BORDER_SIZE, PUZZLE_SIZE } from '#/constants/dragAndDropConstants'
import { DragDropProvider } from '@dnd-kit/react'
import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState } from 'react'

export const Route = createFileRoute('/')({ component: Home })

const INITIAL_SQUARES: Square[] = [
  [1, 1],
  [2, 1],
  [2, 2],
]
const PIECE_ID = 'piece-0'

function toOffsets(squares: Square[], grabbedIndex: number): Square[] {
  const [grabRow, grabCol] = squares[grabbedIndex]
  return squares.map(([r, c]) => [r - grabRow, c - grabCol])
}

function getOccupiedCells(
  hoveredCellIndex: number,
  offsets: Square[],
  gridSize: number,
): number[] | null {
  const hoveredRow = Math.floor(hoveredCellIndex / gridSize)
  const hoveredCol = hoveredCellIndex % gridSize
  const cells: number[] = []
  for (const [dr, dc] of offsets) {
    const r = hoveredRow + dr
    const c = hoveredCol + dc
    if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) return null
    cells.push(r * gridSize + c)
  }
  return cells
}

/** Pixel offset of a cell's top-left corner within the grid, accounting for gaps and border */
function cellTopLeft(
  cellIndex: number,
  gridSize: number,
  gridGap: number,
): { x: number; y: number } {
  const row = Math.floor(cellIndex / gridSize)
  const col = cellIndex % gridSize

  const innerPuzzle = PUZZLE_SIZE - BORDER_SIZE * 2
  const gridGapTotal = (gridSize - 1) * gridGap
  const cellSize = (innerPuzzle - gridGapTotal) / gridSize

  return {
    x: BORDER_SIZE + col * (cellSize + gridGap),
    y: BORDER_SIZE + row * (cellSize + gridGap),
  }
}

function Home() {
  const [gridSize, setGridSize] = useState<number>(4)
  const gridGap = Math.floor(50 / gridSize)

  const [placedAnchor, setPlacedAnchor] = useState<{
    cell: number
    squareIndex: number
    topLeftCell: number
  } | null>(null)
  const [hoverCell, setHoverCell] = useState<number>(-1)
  const [isDragging, setIsDragging] = useState(false)

  const [squares, setSquares] = useState<Square[]>(INITIAL_SQUARES)
  const [grabbedSquareIndex, setGrabbedSquareIndex] = useState<number>(0)

  const squaresRef = useRef<Square[]>(INITIAL_SQUARES)
  const grabbedSquareIndexRef = useRef<number>(0)

  const handleSquaresChange = (next: Square[], newGrabbedIndex: number) => {
    squaresRef.current = next
    grabbedSquareIndexRef.current = newGrabbedIndex
    setSquares(next)
    setGrabbedSquareIndex(newGrabbedIndex)
  }

  const handleGrabSquare = (index: number) => {
    grabbedSquareIndexRef.current = index
    setGrabbedSquareIndex(index)
  }

  const currentOffsets = toOffsets(squares, grabbedSquareIndex)

  const previewCells =
    hoverCell >= 0
      ? getOccupiedCells(hoverCell, currentOffsets, gridSize)
      : null

  const isValidDrop = previewCells !== null

  const occupiedCells =
    placedAnchor !== null
      ? getOccupiedCells(
          placedAnchor.cell,
          toOffsets(squares, placedAnchor.squareIndex),
          gridSize,
        )
      : null

  const dropState =
    hoverCell >= 0 ? (isValidDrop ? 'valid' : 'invalid') : 'idle'

  const piece = (
    <Piece
      id={PIECE_ID}
      gridInfo={{ gridSize, gridGap }}
      squares={squares}
      grabbedSquareIndex={grabbedSquareIndex}
      dropState={dropState}
      onGrabSquare={handleGrabSquare}
      onSquaresChange={handleSquaresChange}
    />
  )

  return (
    <DragDropProvider
      onDragStart={() => setIsDragging(true)}
      onDragOver={(e) => {
        const targetId = e.operation.target?.id
        setHoverCell(typeof targetId === 'number' ? targetId : -1)
      }}
      onDragEnd={(e) => {
        setIsDragging(false)
        setHoverCell(-1)
        if (e.canceled) return
        const targetId = e.operation.target?.id
        if (typeof targetId !== 'number') return
        const offsets = toOffsets(
          squaresRef.current,
          grabbedSquareIndexRef.current,
        )
        const cells = getOccupiedCells(targetId, offsets, gridSize)
        if (cells) {
          const topLeftCell = cells.reduce((best, cell) => {
            const bRow = Math.floor(best / gridSize)
            const cRow = Math.floor(cell / gridSize)
            if (cRow < bRow) return cell
            if (cRow === bRow && cell % gridSize < best % gridSize) return cell
            return best
          })
          setPlacedAnchor({
            cell: targetId,
            squareIndex: grabbedSquareIndexRef.current,
            topLeftCell,
          })
        }
      }}
    >
      <div className="flex flex-row justify-center gap-6 items-center h-screen w-full bg-linear-to-br from-mauve-950 to-mauve-800 p-6">
        <div
          className="flex flex-col gap-6 items-center h-full justify-center"
          style={{ width: PUZZLE_SIZE }}
        >
          <div className="flex items-center gap-4 py-2 px-6 bg-mauve-400 border-2 border-mauve-600 rounded-lg w-full">
            <span className="text-mauve-900 font-bold text-2xl">
              Grid Size:
            </span>
            <input
              type="range"
              min={2}
              max={10}
              value={gridSize}
              onChange={(e) => {
                setGridSize(Number(e.target.value))
                setPlacedAnchor(null)
              }}
              className="flex-1"
            />
            <span className="text-mauve-900 font-bold text-2xl">
              {gridSize}
            </span>
          </div>

          {/* Grid — position:relative so the overlay is anchored to it */}
          <div
            className="relative bg-mauve-700 border-mauve-500 grid"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              gap: gridGap,
              width: PUZZLE_SIZE,
              height: PUZZLE_SIZE,
              borderWidth: BORDER_SIZE,
            }}
          >
            {Array.from({ length: gridSize * gridSize }).map((_, i) => {
              const isPreview = previewCells?.includes(i) ?? false
              const highlight = isPreview
                ? isValidDrop
                  ? 'valid'
                  : 'invalid'
                : 'none'
              const isPlacedOrigin = placedAnchor?.topLeftCell === i

              return (
                <Droppable key={i} id={i} highlight={highlight}>
                  {isPlacedOrigin && (
                    <div className="absolute top-0 left-0 z-50">{piece}</div>
                  )}
                </Droppable>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col items-center size-full justify-center">
          {placedAnchor === null && piece}
        </div>
      </div>
    </DragDropProvider>
  )
}
