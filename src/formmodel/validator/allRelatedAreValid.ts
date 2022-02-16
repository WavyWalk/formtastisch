import { FormModel } from '../FormModel'
import { valueIsModelArray } from '../valueIsModelArray'
import { valueIsModel } from '../valueIsModel'

/**
 * iterates model, if property is relation based,
 * calls isValid on it
 * case invalid breaks the loop
 * returns false if at least one related is invalid true otherwise
 */
export const allRelatedAreValid = (model: FormModel<any>) => {
  for (const property of Object.keys(model)) {
    const value = (model as any)[property]
    if (!value) {
      continue
    }
    if (valueIsModelArray(value)) {
      for (let i = 0; i < value.length; i++) {
        if (!value[i].validator.isValid()) {
          return false
        }
      }
      continue
    }

    if (valueIsModel(value)) {
      if (!value.validator.isValid()) {
        return false
      }
    }
  }
  return true
}
