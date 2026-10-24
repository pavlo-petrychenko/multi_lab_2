import { useEffect } from 'react'
import { KeyboardHint } from './components/KeyboardHint'
import { SongPicker } from './components/SongPicker'
import { Stage } from './components/Stage'
import { TrackLegend } from './components/TrackLegend'
import { TransportBar } from './components/TransportBar'
import { useEngine } from './hooks/useEngine'
import './styles.css'

export function App() {
  const { engine, status } = useEngine()

  // Space toggles play / pause.
  useEffect(() => {
    if (!engine) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return
      event.preventDefault()
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur() // no double toggle via a focused button
      if (engine.status().state === 'playing') engine.pause()
      else void engine.play()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [engine])

  if (!engine || !status) return null

  return (
    <main className="app">
      <Stage engine={engine} />
      <SongPicker engine={engine} status={status} />
      <TrackLegend engine={engine} status={status} />
      <KeyboardHint status={status} />
      <TransportBar engine={engine} status={status} />
    </main>
  )
}
