import type { IScore } from './types'

class NoScore implements IScore {
  toString() {
    return 'N/A'
  }
  valueOf() {
    return -1
  }

  toJSON() {
    return null
  }
}

class NumericScore implements IScore {
  constructor(private score: number) {}

  toString() {
    return this.score.toString()
  }

  valueOf() {
    return this.score
  }

  toJSON() {
    return this.score
  }
}

class ScaledScore implements IScore {
  constructor(private score: NumericScore) {}

  toString() {
    return Math.round(this.score.valueOf() / 100).toString()
  }

  valueOf() {
    return this.score.valueOf()
  }

  toJSON() {
    return this.score.toJSON()
  }
}

export { NoScore, NumericScore, ScaledScore }
