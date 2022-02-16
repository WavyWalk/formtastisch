import { makeFormModel, ValidationMethods } from '../formmodel/makeFormModel'
import { FormState } from './FormState'

export const makeFormWithModel = <
  DATA_T,
  V_T extends ValidationMethods<DATA_T, DATA_T>,
  TAP_T
>(
  data: DATA_T,
  defaultValidations: V_T,
  tap?: (data: DATA_T) => TAP_T
) => {
  const formModel = makeFormModel(data, defaultValidations, tap)
  return new FormState(formModel)
}
