import type { EngineStatus } from '@/engine'

const WHITE_KEYS = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K']
/** Black keys, positioned after the white key with the same index (null = no black key). */
const BLACK_KEYS = ['W', 'E', null, 'T', 'Y', 'U', null, null]

/** Shows how the computer keyboard maps to piano keys, and the current octave. */
export function KeyboardHint({ status }: { status: EngineStatus }) {
  const playing = status.state === 'playing'
  return (
    <div className="panel keys">
      <div className="piano">
        {WHITE_KEYS.map((key, i) => (
          <div key={key} className="white">
            {BLACK_KEYS[i] && <span className="black">{BLACK_KEYS[i]}</span>}
            <span>{key}</span>
          </div>
        ))}
      </div>
      <p>
        Octave <b>C{status.octave}</b> · <kbd>Z</kbd>/<kbd>X</kbd> to shift · <kbd>Shift</kbd> = accent
      </p>
      {!playing && <p className="hint">Press Play to jam along</p>}
    </div>
  )
}
