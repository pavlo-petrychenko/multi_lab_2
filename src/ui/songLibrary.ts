/**
 * Every .mid / .midi file in the project's `songs/` folder, found at build time.
 * Drop a file into that folder and it appears in the song list.
 */
const files = import.meta.glob<string>('/songs/*.{mid,midi}', { query: '?url', import: 'default', eager: true })

export interface SongEntry {
  title: string
  fileName: string
  url: string
}

export const SONGS: SongEntry[] = Object.entries(files)
  .map(([path, url]) => {
    const fileName = path.split('/').pop() ?? path
    return { title: toTitle(fileName), fileName, url }
  })
  .sort((a, b) => a.title.localeCompare(b.title))

/** "gravity-falls_intro.mid" → "Gravity Falls Intro" */
function toTitle(fileName: string): string {
  return fileName
    .replace(/\.midi?$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}
