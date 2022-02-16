import { FormModel } from '../FormModel'
import { valueIsModelArray } from '../valueIsModelArray'
import { valueIsModel } from '../valueIsModel'

export const validateDefaultRelated = (model: FormModel) => {
  for (const property of Object.keys(model)) {
    const value = (model as any)[property]
    if (!value) {
      continue
    }
    if (valueIsModelArray(value)) {
      for (let i = 0; i < value.length; i++) {
        value[i].validator.validateDefault()
      }
      continue
    }

    if (valueIsModel(value)) {
      value.validator.validateDefault()
    }
  }
  return true
}
