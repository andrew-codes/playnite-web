import { IGame, IMatchA } from '../../types'

class MatchFeature implements IMatchA<IGame> {
  constructor(private id: string) {}

  matches(item: IGame): boolean {
    return item.features.some((feature) => feature.id === this.id)
  }
}

export default MatchFeature
