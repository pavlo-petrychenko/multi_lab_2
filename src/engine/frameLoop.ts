/** Calls `onFrame` on every animation frame until the returned stop function is called. */
export function startFrameLoop(onFrame: () => void): () => void {
  let id = 0
  const loop = () => {
    onFrame()
    id = requestAnimationFrame(loop)
  }
  id = requestAnimationFrame(loop)
  return () => cancelAnimationFrame(id)
}
