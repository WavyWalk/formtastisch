import { ModelValidator } from './validator/ModelValidator'

export type PureModelData<T extends FormModel> = Omit<T, 'validator'>

export class FormModel<MODEL_T = any> {
  errors?: Record<keyof MODEL_T, string[] | undefined>
  validator: ModelValidator<FormModel<MODEL_T>> = new ModelValidator(this)

  constructor(data: MODEL_T) {
    if (data) {
      Object.assign(this, data)
    }
  }
}
