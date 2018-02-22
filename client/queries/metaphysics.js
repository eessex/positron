import { stringifyJSONForWeb } from 'client/lib/utils/json'

export function ArtworkQuery (id) {
  return `
    {
      artwork(id: ${stringifyJSONForWeb(id)}) {
        _id
        title
      }
    }
  `
}

export function ArtistQuery (id) {
  return `
    {
      artist(id: ${stringifyJSONForWeb(id)}) {
        _id
        name
      }
    }
  `
}
