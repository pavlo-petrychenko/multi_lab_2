import { useState } from 'react'
import type { Engine, EngineStatus } from '@/engine'
import { formatTime } from '../format'

/** Play/Pause, Stop and a seekable progress bar with current / total time. */
export function TransportBar({ engine, status }: { engine: Engine; status: EngineStatus }) {
  const [dragTime, setDragTime] = useState<number | null>(null)
  const playing = status.state === 'playing'
  const hasSong = status.duration > 0
  const shownTime = dragTime ?? status.time

  const commitSeek = () => {
    if (dragTime === null) return
    engine.seek(dragTime)
    setDragTime(null)
  }

  return (
    <div className="panel transport">
      <button className="primary" onClick={() => (playing ? engine.pause() : engine.play())}>
        {playing ? 'Pause' : 'Play'}
      </button>
      <button onClick={() => engine.stop()}>Stop</button>
      <input
        className="progress"
        type="range"
        min={0}
        max={hasSong ? status.duration : 1}
        step={0.01}
        value={hasSong ? shownTime : 0}
        disabled={!hasSong}
        onChange={(event) => setDragTime(Number(event.target.value))}
        onPointerUp={commitSeek}
        onKeyUp={commitSeek}
      />
      <span className="time">
        {formatTime(shownTime)} / {hasSong ? formatTime(status.duration) : '–:––'}
      </span>
    </div>
  )
}
