import { ModelValidator } from './validator/ModelValidator'
import { modelToObject, ModelToObjectOptions } from './modelToObject'

export type PureModelData<T extends FormModel> = Omit<
  T,
  | '_general'
  | 'validator'
  | '_uniqueReferenceKey'
  | 'getUniqueReferenceKey'
  | 'toObject'
>

/**
 * Wraps and holds the data and errors for it.
 * Each instance has own validator.
 *
 * Whenever you use {@link makeFormStateWithModel}
 * they will initialize instance of this class and it will be passed to formState.
 *
 * You can create form separately via {@link makeFormModel}
 * and pass it e.g. in your own formState, or use it as nested model.
 *
 * Generally FormData (holds data) - ModelValidator (validates it) - FormState (Controls logic)
 *
 * @example form model via {@link makeFormStateWithModel}
 * ```
 * const formState = makeFormStateWithModel({
 *   initialData: {firstName: 'foo'},
 *   validations: {
 *     foo: (value) => isRequired(value)
 *   }
 * })
 *
 * const formModel = makeFormModel({
 *   initialData: {firstName: 'foo'},
 *   validations: {
 *     foo: (value) => isRequired(value)
 *   }
 * })
 *
 * // formModel and formState.model will be functionally same (not referentially)
 * // makeFormStateWithModel intantiates model and passes it as model to formState.
 * ```
 * @example usage {@link makeFormModel}
 * ```
 * const formModel = makeFormModel({
 *   initialData: {firstName: 'foo'},
 *   validations: {
 *     foo: (value) => isRequired(value)
 *   }
 * })
 *
 * formModel.validator.foo()
 * formModel.errors // {foo: ['required']}
 * formModel.foo = 'bar'
 * formModel.errors // {foo: ['required']} // it wa not yet revalidated with new value
 * formModel.validate()
 * formModel.errors // undefined
 * ```
 *
 * @example custom form model
 * ```
 * //nothing stops you from creating custom form models, and it's even recommended. Its more type safe, and you can add
 * //methods:
 * class UserFormModel extends FormModel {
 *   validator = new UserValidator(this) // you can create custom validators as well
 *
 *   name = 'foo'
 *   email = 'baz'
 *   // you can also modify data in constructor
 *
 *   get name() {
 *     // write some behaviour funcs, etc.
 *   }
 *
 * }
 * ```
 */
export class FormModel<MODEL_T = any> {
  /** {@see FormModel.getUniqueReferenceKey} */
  static uniqueKey = 0
  private _uniqueReferenceKey?: number
  /**
   * property for holding general information / flag if needed,
   * and for adding _general errors.
   * important: this will be excluded during serialization
   */
  _general: any

  /**
   * holds an errors for properties, this value will be managed by validator.
   * errors have following signature:
   * ```
   * {
   *   [propertyName]?: string[]
   * }
   * ```
   *
   * each property may have multiple errors, that's why errors are array for each property.
   */
  errors?: Record<keyof MODEL_T, string[] | undefined>
  /**
   * validator always accompanies model. Each model has own validator instance so referential integrity can be ensured.
   */
  // ignored for typing
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
   * @example
   * ```
   * <Foo model={model} key={model.getUniqueKey()}>
   * ```
   */
  getUniqueReferenceKey = () => {
    this._uniqueReferenceKey ??= (this.constructor as any).uniqueKey += 1
    return this._uniqueReferenceKey!
  }

  /**
   * serializes to object.
   * for details refer {@link modelToObject}
   */
  toObject = (options?: ModelToObjectOptions<this>): MODEL_T => {
    return modelToObject(this, options) as unknown as MODEL_T
  }
}
