const runStates = ['starting', 'running', 'stopping', 'stopped'] as const
type RunState = (typeof runStates)[number]
const runState: Record<RunState, string> = {
  starting: 'starting',
  running: 'running',
  stopping: 'stopping',
  stopped: 'stopped',
}

export { RunState, runState, runStates }
