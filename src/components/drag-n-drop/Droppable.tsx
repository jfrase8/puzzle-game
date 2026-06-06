import { useDroppable } from '@dnd-kit/react'
import type { ReactNode } from 'react'

interface DroppableProps {
  id: number
  children?: ReactNode
}
export default function Droppable({ id, children }: DroppableProps) {
  const { ref } = useDroppable({
    id,
    type: 'droppable',
  })

  return (
    <div ref={ref} className="relative size-full bg-mauve-800">
      {children}
    </div>
  )
}
