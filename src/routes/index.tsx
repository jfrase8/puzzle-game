import Droppable from '#/components/drag-n-drop/Droppable'
import Piece from '#/components/puzzle/Piece'
import { BORDER_SIZE, PUZZLE_SIZE } from '#/constants/dragAndDropConstants'
import { DragDropProvider } from '@dnd-kit/react'
import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState } from 'react'

export const Route = createFileRoute('/')({ component: Home })

const PIECE_SQUARES = ['a1', 'b1', 'b2']
const PIECE_ID = 'piece-0'

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

/** Parse squares into 0-based [row, col] offsets anchored at top-left of piece */
function parseSquareOffsets(squares: string[]): Array<[number, number]> {
  const parsed = squares.map(
    (sq) =>
      [(LetterMap[sq[0]] ?? 1) - 1, Number(sq[1]) - 1] as [number, number],
  )
  const minRow = Math.min(...parsed.map(([r]) => r))
  const minCol = Math.min(...parsed.map(([, c]) => c))
  return parsed.map(([r, c]) => [r - minRow, c - minCol])
}

/**
 * Given the hovered cell index and which square the user grabbed,
 * compute all cell indices the piece would occupy.
 * The grabbed square is placed on the hovered cell; all others are relative to it.
 * Returns null if any cell falls out of bounds.
 */
function getOccupiedCells(
  hoveredCellIndex: number,
  offsets: Array<[number, number]>,
  grabbedSquareIndex: number,
  gridSize: number,
): number[] | null {
  const hoveredRow = Math.floor(hoveredCellIndex / gridSize)
  const hoveredCol = hoveredCellIndex % gridSize

  // The grabbed square's offset relative to the piece's top-left
  const [grabDr, grabDc] = offsets[grabbedSquareIndex]

  const cells: number[] = []
  for (const [dr, dc] of offsets) {
    // Shift so the grabbed square aligns with the hovered cell
    const r = hoveredRow + (dr - grabDr)
    const c = hoveredCol + (dc - grabDc)
    if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) return null
    cells.push(r * gridSize + c)
  }
  return cells
}

function Home() {
  const [gridSize, setGridSize] = useState<number>(4)
  const gridGap = Math.floor(50 / gridSize)

  // Cell index where piece is placed after a successful drop (null = tray)
  const [placedAnchor, setPlacedAnchor] = useState<{
    cell: number
    squareIndex: number
  } | null>(null)

  // Cell index currently being hovered (-1 = none)
  const [hoverCell, setHoverCell] = useState<number>(-1)

  // Which square the user grabbed — use a ref so it's always current in dnd callbacks
  const grabbedSquareIndexRef = useRef<number>(0)

  const offsets = parseSquareOffsets(PIECE_SQUARES)

  // Cells the piece would occupy if dropped at hoverCell
  const previewCells =
    hoverCell >= 0
      ? getOccupiedCells(
          hoverCell,
          offsets,
          grabbedSquareIndexRef.current,
          gridSize,
        )
      : null

  const isValidDrop = previewCells !== null

  // Currently occupied cells (where piece is placed)
  const occupiedCells =
    placedAnchor !== null
      ? getOccupiedCells(
          placedAnchor.cell,
          offsets,
          placedAnchor.squareIndex,
          gridSize,
        )
      : null

  const dropState =
    hoverCell >= 0 ? (isValidDrop ? 'valid' : 'invalid') : 'idle'

  const piece = (
    <Piece
      id={PIECE_ID}
      gridInfo={{ gridSize, gridGap }}
      squares={PIECE_SQUARES}
      dropState={dropState}
      onGrabSquare={(index) => {
        grabbedSquareIndexRef.current = index
      }}
    />
  )

  return (
    <DragDropProvider
      onDragOver={(e) => {
        const targetId = e.operation.target?.id
        setHoverCell(typeof targetId === 'number' ? targetId : -1)
      }}
      onDragEnd={(e) => {
        setHoverCell(-1)
        if (e.canceled) return
        const targetId = e.operation.target?.id
        console.log(targetId)
        if (targetId === undefined) {
          setPlacedAnchor(null)
          return
        }
        if (typeof targetId !== 'number') return
        const cells = getOccupiedCells(
          targetId,
          offsets,
          grabbedSquareIndexRef.current,
          gridSize,
        )
        if (cells)
          setPlacedAnchor({
            cell: targetId,
            squareIndex: grabbedSquareIndexRef.current,
          })
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

          <div
            className="bg-mauve-700 border-mauve-500 grid"
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

              // Render piece at the first cell in occupiedCells (top-left of the placed piece)
              const isPlacedOrigin = occupiedCells?.[0] === i

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
