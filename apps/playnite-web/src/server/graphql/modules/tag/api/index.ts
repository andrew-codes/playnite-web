import DataLoader from "dataloader"
import { WithId } from "mongodb"
import { TagEntity } from "../../../data/types"
import { DomainApi, autoBind } from "../../../Domain"

function create(this: DomainApi) {
  const loader = new DataLoader<string, WithId<TagEntity>>(async (ids) => {
    return (await this.db())
      .collection<TagEntity>('tag')
      .find({ id: { $in: ids } })
      .toArray()
  })

  return autoBind(this, {
    async getById(this: DomainApi, id: string) {
      return loader.load(id)
    },
    async getAll(this: DomainApi) {
      return (await this.db())
        .collection<TagEntity>('tag')
        .find()
        .toArray()
    },
  })
}

export default create
