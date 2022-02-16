import { FormModel } from './FormModel'
import { ModelValidator } from './validator/ModelValidator'
import { ValidationReturn } from '../validationfunctions/validate'

export type ValidationMethods<T, S> = {
  [id in keyof T]?: (
    value: T[id],
    model?: FormModel<T> & S,
    validator?: ModelValidator<FormModel<T>>
  ) => ValidationReturn
}

export const makeFormModel = <
  DATA_T,
  V_T extends ValidationMethods<DATA_T, DATA_T>,
  TAP_T
>(
  data: DATA_T,
  defaultValidations: V_T,
  tap?: (data: DATA_T) => TAP_T
) => {
  const modelData = { ...data, ...tap?.(data) } as TAP_T extends undefined
    ? DATA_T
    : Omit<DATA_T, keyof TAP_T> & TAP_T
  const formModel = new FormModel(modelData) as FormModel<typeof modelData> &
    typeof modelData

  // @ts-ignore
  formModel.validator = new ModelValidator(formModel, defaultValidations!)

  return formModel as typeof formModel & {
    validator: Record<keyof typeof defaultValidations, CallableFunction> & {
      defaultValidations: Record<
        keyof typeof defaultValidations,
        CallableFunction
      >
    }
  }
}
