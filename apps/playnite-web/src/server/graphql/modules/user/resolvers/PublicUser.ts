import type { PublicUserResolvers } from './../../../../../../.generated/types.generated'
export const PublicUser: PublicUserResolvers = {
  /* Implement PublicUser resolver logic here */
  libraries: (parent, _args, _ctx) => {
    return parent.Libraries
  },
}
