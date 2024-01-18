import type { Score } from './types'

class NoScore implements Score {
  get value() {
    return 'N/A'
  }
}

class NumericScore implements Score {
  constructor(protected score: number) {}

  get value() {
    return this.score.toString()
  }
}

class ScaledScore extends NumericScore {
  constructor(score: number) {
    super(score)
  }

  get value() {
    return Math.round(this.score / 100).toString()
  }
}

export { NoScore, NumericScore, ScaledScore }
