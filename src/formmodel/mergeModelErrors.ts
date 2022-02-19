import { valueIsModelArray } from './valueIsModelArray'
import { valueIsModel } from './valueIsModel'

/**
 * Copies recursively errors from other.
 * Use case e.g. if you submitted, and server returned errors, so you merge in order to show them on ui.
 */
export const mergeModelErrors = (model: any, toMerge: any) => {
  const keys = Object.keys(toMerge)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (key === 'errors') {
      model.errors = toMerge[key]
    }
    if (valueIsModel(model[key])) {
      mergeModelErrors(model[key], toMerge[key])
      continue
    }
    if (valueIsModelArray(model[key])) {
      if (Array.isArray(toMerge[key])) {
        toMerge[key].forEach((value: any, index: number) => {
          mergeModelErrors(model[key][index], toMerge[key][index])
        })
      }
    }
  }
}
