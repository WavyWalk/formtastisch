import { BaseModel } from '../BaseModel'
import {
  allRelatedAreValid,
  resetModelDataOnAllRelated
} from './validatorUtils'
import { ModelSerializeArgs } from '../serialization/modelSerializationUtils'
import { ValidationReturn } from './validate'

export class ModelValidator<MODEL_TYPE extends BaseModel> {
  /**
   * each model instance has own instance of validator.
   * model is passed in constructor, so validator can operate on it.
   */
  model: MODEL_TYPE
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
    this.model = model
  }

  /**
   * sets an error on model.
   * if model already has same message it is ignored.
   * errors are set on model.modelData internal object:
   * so all error accessing methods are basically proxies that read from that internal object
   * @param property - property for which an error shall be set on model
   * @param errorMessage - error message for property
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
    const model = this.model as MODEL_TYPE
    model.modelData.errors ??= {}
    model.modelData.errors[property] ??= []
    if (
      model.modelData.errors[property].find((it: string) => it === errorMessage)
    ) {
      return
    }
    model.modelData.errors[property].push(errorMessage)
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
    const model = this.model as MODEL_TYPE
    const errors = model.modelData?.errors
    delete errors?.[property]
    if (errors && Object.keys(errors).length < 1) {
      delete model.modelData.errors
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
    const model = this.model as MODEL_TYPE
    const propertyErrors = model.modelData.errors?.[property] as any[]
    const indexToDelete = propertyErrors?.indexOf?.(errorToDelete)
    if (indexToDelete < 0) {
      return
    }
    propertyErrors?.splice(indexToDelete)
  }

  validate(
    ...methods: (
      | keyof this
      | { [K in keyof MODEL_TYPE]?: (value: MODEL_TYPE[K]) => void }
    )[]
  ) {
    for (const validationMethod of methods) {
      if (typeof validationMethod === 'string') {
        const validateFunc = this[validationMethod as keyof this]
        if (!validateFunc) {
          throw new Error(
            `no ${validationMethod} validation func defined on validator ${this}`
          )
        }
        ;(this[validationMethod as keyof this] as any)()
      } else {
        Object.keys(validationMethod).forEach((key) => {
          ;(validationMethod as any)[key](this.model.modelData[key])
        })
      }
    }
    this.validateDefault()
  }

  /**
   * resets/unsets all errors for all properties on model
   */
  resetErrors() {
    const model = this.model as MODEL_TYPE
    model.modelData.errors = undefined
    const modelData = model.modelData
    if (!modelData) {
      return
    }
    resetModelDataOnAllRelated(model, modelData)
  }

  makeCopy = () => {
    const options: ModelSerializeArgs<any> = {
      withErrors: false,
      exclude: ['validator', 'errors', '_validator']
    }
    // @ts-ignore
    return new this.constructor(
      // @ts-ignore
      new this.model.constructor(this.model.modelData, options)
    ) as this
  }

  isValid() {
    const model = this.model as MODEL_TYPE
    const errors = model.modelData.errors
    const modelData = model.modelData ?? {}
    const hasErrors = errors && Object.keys(errors).length > 0
    if (hasErrors) {
      return false
    }
    return allRelatedAreValid(model, modelData)
  }

  getFirstErrorFor(property: string): undefined | string {
    return this.getErrorsFor(property)?.[0]
  }

  getErrorsFor(property: string): string[] | undefined {
    return (this.model as MODEL_TYPE).errors?.[property]
  }

  isPropertyValid(property: keyof MODEL_TYPE) {
    return !!this.getFirstErrorFor(property as string)
  }

  /**
   * returns last validated cachec value for property. Usefull if you need to skip validation.
   * @param property - property which value will be returned from cache
   * @remarks
   * methods that automatically populate cache are validateProperty and methods decorated with @validates
   * @example
   * ```
   * @validates
   * name()..
   *
   * model.name = 'Joe'
   * model.validator.getPreviousValue('name') // undefined
   * model.validator.name()
   * model.validator.getPreviousValue('name') // 'Joe'
   * model.name = 'Baz'
   * model.validator.getPreviousValue('name') // 'Joe'
   * model.validator.name()
   * model.validator.getPreviousValue('name') // 'Baz'
   * ```
   */
  getPreviousValue(property: keyof MODEL_TYPE) {
    return this.valuesCache[property as string]
  }

  /**
   * compares value on cache and on model.
   * true if values are same AND value was at least once validated
   * @param property - property to compare with cache
   */
  valueIsSameAndValidated(property: keyof MODEL_TYPE) {
    if (!(property in this.valuesCache)) {
      return false
    }
    return this.getPreviousValue(property) === this.model[property]
  }

  /**
   * for overriding, to run your something extra on validate
   */
  protected validateDefault() {}

  /**
   * runs validation function, and handles it's result.
   * behind the scenes will define if validation needs to be run by comparing cache values
   * if validation unnecessary - skips
   * otherwise runs validation and handles result, via adding/removing errors for property and updating cache.
   *
   * @param property - property that's being validated
   * @param validationFunc - any function that accepts value and returns {@link ValidationReturn}. Value will be read from model's property
   *
   * @remarks
   * effectively this method does exactly same as the method decorated with @validates
   * so in case you can't decorate, or e.g. use it outside of validator (e.g. due code splitting/whatever),
   * you can achieve same behavior as with @validates
   * this method is used for edgecases and when your usecase requires customization.
   * @example
   * ```
   *
   *
   * // using with defined validation function
   * validator.validateProperty('email', (value) => return validateEmail(value))
   *
   * // if you need to use something from scope
   * validator.validateProperty('email', (value) => return validationPattern(value, someRegexFromScope, 'invalid'))
   *
   * // as event handler
   * button onClick=(e) => {
   *   model.email = e.target.value
   *   model.validator.validateProperty('email', (value) => validateEmail(value, 'email invalid')
   * }
   * ```
   */
  validateProperty(
    property: keyof MODEL_TYPE,
    validationFunc: (value: any) => ValidationReturn
  ) {
    if (this.valueIsSameAndValidated(property)) {
      return
    }
    const result = validationFunc(this.model.modelData[property as any])
    this.handleValidationResult(property, result)
    this.valuesCache[property as any] = this.model[property]
    return result
  }

  /**
   * depending on result returned by validation function,
   * handles addition/removal of errors on model
   * @param propertyName - property name for which validation result is handled in question
   * @param result - a return result of validation function of type {@link ValidationReturn}
   * if valid: removes all errors for property
   * if valid and single error: adds error if not there, other errors (e.g. from other validators are not removed)
   * above is useful when different methods validate the field, so they do not interfere with each other
   * if valid and multiple: removes all errors, sets errors contained in result.errors
   * above is useful when you have single method that validates property and you support multiple errors
   * @example
   * ```
   * // will set error if it's not there on model
   * handleValidationResult('email', {valid: false, errors: 'invalid'})
   *
   * // removes errors for property
   * handleValidationResult('email', {valid: true})
   * ```
   */
  handleValidationResult(
    propertyName: keyof MODEL_TYPE,
    result: ValidationReturn
  ) {
    if (result.valid) {
      this.removeErrors(propertyName)
      return result
    }
    if (result.errors && Array.isArray(result.errors)) {
      this.model.modelData.errors ??= {}
      this.model.modelData.errors[propertyName] = result.errors.filter(
        (it) => !!it
      )
      return result
    }
    if (result.errors) {
      this.addError(propertyName, result.errors)
    }
    if (!result.valid && !result.errors) {
      console.error(
        'one of validations returns valid false, but specified no errors'
      )
    }
  }
}
