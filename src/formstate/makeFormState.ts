import { FormState } from './FormState'
import { FormModel } from '../formmodel/FormModel'

export const makeFormState = <T extends FormModel>(model: T): FormState<T> => {
  return new FormState(model)
}
