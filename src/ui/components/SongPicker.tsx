import { useEffect, useRef, useState } from 'react'
import type { Engine, EngineStatus } from '@/engine'
import { SONGS } from '../songLibrary'

/** Pick a song from the library, open any .mid file, or drag & drop one anywhere. */
export function SongPicker({ engine, status }: { engine: Engine; status: EngineStatus }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const loadAndPlay = async (buffer: ArrayBuffer, name: string) => {
    engine.load(buffer, name)
    await engine.play()
  }

  const loadFile = async (file: File) => loadAndPlay(await file.arrayBuffer(), file.name)

  const loadLibrarySong = async (url: string, name: string) => {
    const response = await fetch(url)
    await loadAndPlay(await response.arrayBuffer(), name)
  }

  useEffect(() => {
    const onDragOver = (event: DragEvent) => {
      event.preventDefault()
      setDragging(true)
    }
    const onDragLeave = (event: DragEvent) => {
      if (event.relatedTarget === null) setDragging(false)
    }
    const onDrop = (event: DragEvent) => {
      event.preventDefault()
      setDragging(false)
      const file = event.dataTransfer?.files[0]
      if (file) void loadFile(file)
    }
    window.addEventListener('dragover', onDragOver)
    window.addEventListener('dragleave', onDragLeave)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragover', onDragOver)
      window.removeEventListener('dragleave', onDragLeave)
      window.removeEventListener('drop', onDrop)
    }
  })

  const selected = SONGS.find((song) => song.fileName === status.songName)

  return (
    <>
      <div className="panel file">
        <h1>MIDI Fireworks</h1>
        <div className="row">
          <select
            className="songs"
            value={selected?.fileName ?? ''}
            onChange={(event) => {
              const song = SONGS.find((s) => s.fileName === event.target.value)
              if (song) void loadLibrarySong(song.url, song.fileName)
              event.target.blur() // keep the keyboard for playing notes
            }}
          >
            <option value="" disabled>
              {status.songName && !selected ? status.songName : 'Choose a song…'}
            </option>
            {SONGS.map((song) => (
              <option key={song.fileName} value={song.fileName}>
                {song.title}
              </option>
            ))}
          </select>
          <button onClick={() => inputRef.current?.click()}>Open…</button>
        </div>
        {status.warning && <p className="warning">{status.warning}</p>}
        {status.error && <p className="error">{status.error}</p>}
        <input
          ref={inputRef}
          type="file"
          accept=".mid,.midi,audio/midi"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void loadFile(file)
            event.target.value = ''
          }}
        />
      </div>
      {dragging && <div className="drop-overlay">Drop a MIDI file</div>}
    </>
  )
}
