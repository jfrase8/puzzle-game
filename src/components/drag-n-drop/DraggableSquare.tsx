interface DraggableSquareProps {
  row: number
  col: number
  size: number
  state?: 'idle' | 'valid' | 'invalid'
  onPointerDown?: () => void
}

/** Pure visual square — no drag logic. Piece.tsx owns the drag handle. */
export default function DraggableSquare({
  row,
  col,
  size,
  state = 'idle',
  onPointerDown,
}: DraggableSquareProps) {
  const colorClass =
    state === 'valid'
      ? 'bg-emerald-500 border-emerald-400'
      : state === 'invalid'
        ? 'bg-red-600 border-red-400'
        : 'bg-emerald-700 border-emerald-600'

  return (
    <div
      className={`${colorClass} border-2 flex items-center justify-center rounded-xs`}
      style={{
        gridRowStart: row,
        gridColumnStart: col,
        width: size,
        height: size,
      }}
      onPointerDown={onPointerDown}
    />
  )
}
