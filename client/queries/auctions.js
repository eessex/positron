import { stringifyJSONForWeb } from 'client/lib/utils/json'

export function AuctionsQuery (ids) {
  return `
    {
      sales(ids: ${stringifyJSONForWeb(ids)}) {
        id
        name
      }
    }
  `
}
