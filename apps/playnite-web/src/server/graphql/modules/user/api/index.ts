import { autoBind, type DomainApi } from '../../../Domain'
import * as getUser from './getUser'

function create(this: DomainApi) {
  return {
    ...autoBind(this, getUser),
  }
}

export default create
