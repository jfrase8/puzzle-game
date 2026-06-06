import Droppable from '#/components/drag-n-drop/Droppable'
import Piece from '#/components/puzzle/Piece'
import { BORDER_SIZE, PUZZLE_SIZE } from '#/constants/dragAndDropConstants'
import type { UniqueIdentifier } from '@dnd-kit/abstract'
import { DragDropProvider } from '@dnd-kit/react'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const [gridSize, setGridSize] = useState<number>(2)
  const gridGap = Math.floor(50 / gridSize)

  const [target, setTarget] = useState<UniqueIdentifier | undefined>(undefined)

  const DraggableComponent = (
    <Piece gridInfo={{ gridSize, gridGap }} squares={['a1', 'b1', 'b2']} />
  )

  return (
    <DragDropProvider
      onDragEnd={(e) => {
        if (e.canceled) return
        setTarget(e.operation.target?.id)
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
              onChange={(e) => setGridSize(Number(e.target.value))}
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
            {Array.from({ length: gridSize * gridSize }).map((_, i) => (
              <Droppable key={i} id={i}>
                {target === i && (
                  // Wrapper takes it out of the layout flow and anchors it top-left
                  <div className="absolute top-0 left-0 z-50">
                    {DraggableComponent}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center size-full justify-center">
          {/* Do not use the absolute wrapper here so it centers normally */}
          {target === undefined && DraggableComponent}
        </div>
      </div>
    </DragDropProvider>
  )
}
