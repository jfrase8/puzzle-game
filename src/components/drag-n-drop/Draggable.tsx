import { useDraggable } from '@dnd-kit/react'

interface DraggableProps {
  index: number
  row: number
  col: number
  size: number
}
export default function Draggable({ index, row, col, size }: DraggableProps) {
  // Simply extract the main single ref.
  // By default in dnd-kit, the main ref also acts as the handle if handleRef isn't explicitly used.
  const { ref } = useDraggable({
    id: `draggable-${index}`,
  })

  return (
    <button
      ref={ref}
      className="pointer-events-auto bg-emerald-700 border-2 border-emerald-600 flex items-center justify-center rounded-xs"
      style={{
        gridRowStart: row,
        gridColumnStart: col,
        width: size,
        height: size,
      }}
    />
  )
}
