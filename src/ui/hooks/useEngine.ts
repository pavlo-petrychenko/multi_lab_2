import { useEffect, useState } from 'react'
import { createEngine, type Engine, type EngineStatus } from '@/engine'

interface EngineState {
  engine: Engine | null
  status: EngineStatus | null
}

/** Creates the engine for the lifetime of the component and mirrors its status into React. */
export function useEngine(): EngineState {
  const [state, setState] = useState<EngineState>({ engine: null, status: null })

  useEffect(() => {
    const engine = createEngine()
    const unsubscribe = engine.subscribe((status) => setState({ engine, status }))
    return () => {
      unsubscribe()
      engine.dispose()
    }
  }, [])

  return state
}
