import type { Engine, EngineStatus } from '@/engine'
import { cssColor } from '../format'

/** Each track with its firework color; muting removes both its sound and its fireworks. */
export function TrackLegend({ engine, status }: { engine: Engine; status: EngineStatus }) {
  return (
    <div className="panel legend">
      <h2>Tracks</h2>
      <ul>
        {status.tracks.map((track) => (
          <li key={track.id} className={track.muted ? 'muted' : undefined}>
            <label>
              <input type="checkbox" checked={!track.muted} onChange={() => engine.toggleMute(track.id)} />
              <span className="swatch" style={{ background: cssColor(track.color) }} />
              <span className="name">{track.name}</span>
              <span className="badge">{track.kind}</span>
              {track.kind !== 'live' && <span className="count">{track.noteCount}</span>}
            </label>
          </li>
        ))}
      </ul>
      <label className="toggle">
        <input type="checkbox" checked={status.showLabels} onChange={(e) => engine.setShowLabels(e.target.checked)} />
        Show note labels
      </label>
    </div>
  )
}
