import { useDroppable } from '@dnd-kit/react'
import type { ReactNode } from 'react'

interface DroppableProps {
  id: number
  children?: ReactNode
  /** Called whenever hover state changes for this cell */
  onIsOverChange?: (id: number, isOver: boolean) => void
  /** Visual highlight when this cell is part of a valid/invalid drop zone */
  highlight?: 'valid' | 'invalid' | 'none'
}

export default function Droppable({
  id,
  children,
  highlight = 'none',
}: DroppableProps) {
  const { ref, isDropTarget: isOver } = useDroppable({
    id,
    type: 'droppable',
  })

  const highlightClass = isOver
    ? 'bg-mauve-600'
    : highlight === 'valid'
      ? 'bg-emerald-900/40'
      : highlight === 'invalid'
        ? 'bg-red-900/40'
        : 'bg-mauve-800'

  return (
    <div
      ref={ref}
      className={`relative size-full transition-colors duration-100 ${highlightClass}`}
    >
      {children}
    </div>
  )
}
