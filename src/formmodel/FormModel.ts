import { ModelValidator } from './validator/ModelValidator'

export type PureModelData<T extends FormModel> = Omit<T, 'validator'>

/**
 * Wraps and holds the data and errors for it.
 * Each instance has own validator.
 */
export class FormModel<MODEL_T = any> {
  static uniqueKey = 0
  private _uniqueReferenceKey?: number

  errors?: Record<keyof MODEL_T, string[] | undefined>
  // @ts-ignore
  validator: ModelValidator<FormModel<MODEL_T> & MODEL_T> = new ModelValidator(
    this
  )

  constructor(data: MODEL_T) {
    if (data) {
      Object.assign(this, data)
    }
  }

  /**
   * for usage in components, when e.g. you have empty instance without any identifier
   * <Foo model={model} key={model.getUniqueKey()}>
   */
  getUniqueReferenceKey = () => {
    this._uniqueReferenceKey ??= (this.constructor as any).uniqueKey += 1
    return this._uniqueReferenceKey
  }
}
