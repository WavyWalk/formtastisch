import { FormModel } from './FormModel'
import { valueIsModelArray } from './valueIsModelArray'
import { valueIsModel } from './valueIsModel'

/**
 * walks modelData, if property is relation based,
 * will call resetErrors() on them, taking into account the relation type
 */
export const resetModelDataOnAllRelated = (model: FormModel<any>) => {
  for (const property of Object.keys(model)) {
    const related = (model as any)[property]
    if (!related) {
      continue
    }

    if (valueIsModel(related)) {
      related.validator.resetErrors()
      continue
    }

    if (valueIsModelArray(related)) {
      for (let i = 0; i < related.length; i++) {
        related[i].validator.resetErrors()
      }
    }
  }
}
