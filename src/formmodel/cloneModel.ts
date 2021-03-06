import { valueIsModelArray } from './valueIsModelArray'
import { FormModel } from './FormModel'
import { valueIsModel } from './valueIsModel'

/**
 * clones model recursively (self and all child FormModels), recreating an instances with same data as well as the validator.
 * @param model
 */
export const cloneModel = <T>(model: T): T => {
  const anyModel = model as any
  const keys = Object.keys(model)
  const resultData: any = {}
  /** copy properties */
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const value = anyModel[keys[i]]
    /** handle nested models */
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
    anyModel.validator.argValidations
  )
  thatValidator.model = clone
  clone.validator = thatValidator

  return clone as any
}
