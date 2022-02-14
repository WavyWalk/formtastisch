import { BaseModel } from '../BaseModel'
import {
  allRelatedAreValid,
  resetModelDataOnAllRelated
} from './validatorUtils'
import {
  ModelSerializeArgs,
  serializationShared
} from '../serialization/serializationShared'

export class ModelValidator<
  MODEL_TYPE extends BaseModel,
  SUPPORTED_VALIDATION_GROUPS extends string[] = ['default']
> {
  /**
   * contains list of validation funcs to be run when validateDefault is called
   * any method decorated with @validates, will land in here.
   * @example
   * ```
   * class FooValidator extends ModelValidator {
   *   @validates
   *   validateName = (value) => {...}
   *   @validates
   *   validateEmail = (value) => {...}
   * }
   * FooValidator.defaultValidations // ['validateName', 'validateEmail']
   * ```
   */
  static defaultValidations: string[] = []

  /**
   * each model instance has own instance of validator.
   * model is passed in constructor, so validator can operate on it.
   */
  validatable: MODEL_TYPE
  /**
   * is used for caching values, so if optimization is neccessary you can e.g. check,
   * if new value is not different than old one, you can skip expensive validation logic.
   * the last value will be added on cache in @validates decorator.
   * if you use @validates decorator it's happening automatically
   * if not you can do it manually
   * @example
   * ```
   *
   * ```
   */
  valuesCache: Record<string, any> = {}

  constructor(model: MODEL_TYPE) {
    this.validatable = model
  }

  /**
   * sets an error on model.
   * if model already has same message it is ignored.
   * errors are set on model.modelData internal object:
   * so all error accessing methods are basically proxies that read from that internal object
   * @param property property for which an error shall be set on model
   * @param errorMessage error message for property
   * @example
   * ```
   * model.errors // undefined
   * model.modelData.errors // undefined
   * model.validator.addError('email', 'bad')
   * model.errors // {email: ['bad']}
   * model.modelData.errors // {email: ['bad']}
   * model.validator.addError('email', 'uncool')
   * model.errors // {email: ['bad', 'uncool']}
   * model.modelData.errors // {email: ['bad', 'uncool']}
   * model.validator.addError('email', 'uncool') // will not be set two times
   * model.errors // {email: ['bad', 'uncool']}
   * model.modelData.errors // {email: ['bad', 'uncool']}
   * ```
   */
  addError(property: keyof MODEL_TYPE, errorMessage: string) {
    const validatable = this.validatable as MODEL_TYPE
    validatable.modelData.errors ??= {}
    validatable.modelData.errors[property] ??= []
    if (
      validatable.modelData.errors[property].find(
        (it: string) => it === errorMessage
      )
    ) {
      return
    }
    validatable.modelData.errors[property].push(errorMessage)
  }

  /**
   * @param property property for which all errors will be unset on model
   * @example
   * ```
   * model.validator.addError('email', 'invalid')
   * model.validator.addError('email', 'uncool')
   * model.validator.getErrorsFor('email') // ['invalid', 'uncool']
   * model.validator.removeErrors('email')
   * model.validator.getErrorsFor('email') // undefined
   * model.errors.email // undefined
   * model.modelData.errors.email // undefined
   * ```
   */
  removeErrors(property: keyof MODEL_TYPE) {
    const validatable = this.validatable as MODEL_TYPE
    const errors = validatable.modelData?.errors
    delete errors?.[property]
    if (errors && Object.keys(errors).length < 1) {
      delete validatable.modelData.errors
    }
  }

  /**
   * @param property property for which error shall be removed
   * @param errorToDelete if error with value exists for model, it will be removed
   * @example
   * ```
   * model.validator.addError('firstName', 'too long')
   * model.validator.getErrorsFor('firstName') // ['too long']
   * model.validator.addError('firstName', 'uncool')
   * model.validator.getErrorsFor('firstName') // ['too long', 'uncool']
   * model.validator.removeSpecificError('firstName', 'too long')
   * model.validator.getErrorsFor('firstName') // ['uncool']
   * ```
   */
  removeSpecificError(property: keyof MODEL_TYPE, errorToDelete: string) {
    const validatable = this.validatable as MODEL_TYPE
    const propertyErrors = validatable.modelData.errors?.[property]
    const indexToDelete = propertyErrors?.indexOf?.(errorToDelete)
    if (indexToDelete < 0) {
      return
    }
    propertyErrors?.splice(indexToDelete)
  }

  validate(
    options: {
      validationMethods?: string[]
      validationGroup?: SUPPORTED_VALIDATION_GROUPS[0]
    } = {}
  ) {
    const validationMethods =
      options.validationMethods ?? (this.constructor as any).defaultValidations
    for (const validationMethod of validationMethods) {
      const validateFunc = this[validationMethod as keyof this]
      if (!validateFunc) {
        throw new Error(
          `no ${validationMethod} validation func defined on validator ${this}`
        )
      }
      ;(this[validationMethod as keyof this] as any)(options.validationGroup)
    }
    this.runAdditionallyOnValidate()
    const relations = serializationShared.getRelatedValuesPresentOnModel(
      this.validatable
    )
    Object.values(relations.hasOne).forEach((it) => {
      it.validator.validate(options)
    })
    Object.values(relations.hasMany).forEach((it) => {
      it.forEach((model) => model.validator.validate(options))
    })
  }

  /**
   * resets/unsets all errors for all properties on validatable
   */
  resetErrors() {
    const validatable = this.validatable as MODEL_TYPE
    validatable.modelData.errors = undefined
    const modelData = validatable.modelData
    if (!modelData) {
      return
    }
    resetModelDataOnAllRelated(validatable, modelData)
  }

  makeCopy = () => {
    const options: ModelSerializeArgs<any> = {
      withErrors: false,
      exclude: ['validator', 'errors', '_validator']
    }
    // @ts-ignore
    return new this.constructor(
      // @ts-ignore
      new this.validatable.constructor(this.validatable.modelData, options)
    ) as this
  }

  isValid() {
    const validatable = this.validatable as MODEL_TYPE
    const errors = validatable.modelData.errors
    const modelData = validatable.modelData ?? {}
    const hasErrors = errors && Object.keys(errors).length > 0
    if (hasErrors) {
      return false
    }
    return allRelatedAreValid(validatable, modelData)
  }

  getFirstErrorFor(property: string): undefined | string {
    return this.getErrorsFor(property)?.[0]
  }

  getErrorsFor(property: string): string[] | undefined {
    return (this.validatable as MODEL_TYPE).errors?.[property]
  }

  isPropertyValid(property: keyof MODEL_TYPE) {
    return !!this.getFirstErrorFor(property as string)
  }

  getPreviousValue(property: keyof MODEL_TYPE) {
    return this.valuesCache[property as string]
  }

  isValueSameAsPrevious(property: keyof MODEL_TYPE) {
    return this.getPreviousValue(property) === this.validatable[property]
  }

  /**
   * for overriding, to run your something extra on validate
   */
  runAdditionallyOnValidate() {}
}
