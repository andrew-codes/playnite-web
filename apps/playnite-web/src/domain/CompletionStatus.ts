import { ICompletionStatus } from './types'

class ProgressionCompletionStatus implements ICompletionStatus {
  constructor(private status: ICompletionStatus) {}
  get name(): string {
    return this.status.name
  }
  get id(): string {
    return this.status.id
  }
  get progressionOrder(): number {
    const name = this.status.name.toLowerCase()
    switch (name) {
      case 'not played':
        return 0
      case 'plan to play':
        return 24
      case 'playing':
        return 48
      case 'played':
        return 72
      case 'abandoned':
        return 96
      case 'on hold':
        return 120
      case 'beaten':
        return 144
      case 'completed':
        return 168
    }
    return -1
  }
}

export default ProgressionCompletionStatus
