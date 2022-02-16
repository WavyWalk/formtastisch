import { valueIsModelArray } from './valueIsModelArray'
import { FormModel } from './FormModel'
import { valueIsModel } from './valueIsModel'

export const cloneModel = <T>(model: T): T => {
  const anyModel = model as any
  const keys = Object.keys(model)
  const resultData: any = {}
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const value = anyModel[keys[i]]
    if (valueIsModel(value)) {
      resultData[key] = cloneModel(model)
      continue
    }
    if (valueIsModelArray(value)) {
      resultData[key] = value.map((it: any) => cloneModel(it))
      continue
    }
    resultData[key] = value
  }

  const clone = new FormModel({ ...resultData })
  const thatValidator = new anyModel.validator.constructor(
    clone,
    anyModel.validator.argDefaultValidations
  )
  thatValidator.model = clone
  clone.validator = thatValidator

  return clone as any
}
