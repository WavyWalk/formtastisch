import { ValidationReturn } from '../../validationfunctions/validate'
import { FormModel } from '../FormModel'
import { resetModelDataOnAllRelated } from '../resetModelDataOnAllRelated'
import { allRelatedAreValid } from './allRelatedAreValid'
import { validateDefaultRelated } from './validateDefaultRelated'

/**
 * Each FormModel has corresponding ModelValidator.
 * Model Validator is responsible mostly for
 * - validating a model
 * - accessing and setting model's errors
 *
 * @example Object flow basic usage:
 * ```
 * // this will not only initialize a FormModel with the initial data, but as well will instantiate instance of this
 * // class.
 * const foo = makeFormModel({email: '', name: 'bar'},
 *  {
 *    email: (value) => validatePattern(value, regex)
 *    name: (value) => validateIsRequired(value)
 *  }
 * )
 *
 * foo.validator // instance of ModelValidator<FormModel<{email: '', name: 'bar'}>>
 *
 * // above will create instance methods email and name, so whenever you call them and on their return values, the errors
 * // will be set or removed on the model
 * foo.email = 'email@foo.com'
 * // validation succceeds nothing happens.
 * foo.validator.email() // {valid: true}
 * foo.email = 'asd'
 * // validation fails, so if your validation method returns {valid: false, ...}, instance takes care of handling what
 * // to do with errors
 * foo.validator.email() // {valid: false, ...}
 * foo.errors // {email: ["yourMessage"]}
 * foo.email = 'email@foo.com'
 * foo.validator.email() // {valid: true}
 * foo.errors // {} | undefined,
 *
 * // in makeFormModel flow, the methods that you provide for validations, will be used for
 * // default validations. aka whenever you call {@link validateDefault}.
 * // this as well will be called by {@link FormState} in it's validate method.
 * foo.validator.validateDefault() // will call both validator.email() and validator.name()
 * ```
 * @example custom "recommended" flow
 * ```
 * // in case you need more control, you can easily achieve same by introducing you own ModelValidators
 * // here we recreate example from above
 * class UserModelValidator extends ModelValidtor<UserModel> {
 *
 *   // in order the validation methods with {@link ValidationReturn} get handled they must be wrapped in {@link validatesProperty}
 *   email = () => this.validateProperty('email', (value) => validateIsRequired)
 *   name = () => this.validateProperty('name', (value) => validateIsRequired)
 *
 *   // you can call methods and they're result than will be handled by validator.
 *   // in order so these methods as well auto called on validator.validateDefault()
 *   // you need to refernce them in default validations.
 *   // now it's fully connected to any form state, and will be called automatically
 *   defaultValidations = {
 *     email: this.email,
 *     name: this.name
 *   }
 * }
 * // if you need a controll, or e.g. have some logic which validations need to be run,
 * // you don't put them into default validations but call them conditionally in you form states.
 * SomeFormState {
 *   validatePaymentStep = () => {
 *     this.rootModel.validator.paymentMethod()
 *     this.rootModel.validator.tosAcceptance()
 *   }
 * ```
 *
 * @example very customized usage:
 * nothing stands in your way, you can do whatever you want:
 * ```
 * if (random === foo) {
 *   model.validator.addError('name', 'bad')
 *   else model.validator.removeSpecificError('name', 'bad')
 * }
 * you can do custom validation methods and whatever.
 * ```
 * */
export class ModelValidator<MODEL_T extends FormModel = any> {
  /**
   * each model instance has own instance of validator.
   * model is passed in constructor, so validator can operate on it.
   */
  model: MODEL_T

  /**
   * is used for caching values, so if optimization is neccessary you can e.g. check,
   * if new value is not different than old one, you can skip expensive validation logic.
   * the last value will be added on cache in @validates decorator.
   * if you use @validates decorator it's happening automatically
   * if not you can do it manually
   *
   * @remark
   * cache is ignored by default.
   * @example
   * ```
   *
   * ```
   */
  valuesCache: Record<string, any> = {}

  /**
   * this exists for cloning. Because the default usage is "object" based, this needs to be saved during initialization
   * as the defaultValidationValidations do not exist on prototype
   * in order so it could be fed to a clone.
   */
  protected argValidations: any

  /**
   * {@link validateDefault} takes values of an object under this property and calls all of them.
   * When you use "object flow", the validation methods in constructor will be enriched with {@link validateProperty},
   * and set on instance, as well their references will be set on this property
   * @example
   * ```
   * //effectively whenever you use {@link makeFormModel}
   * const makeFormModel({email: '', foo: 'bar'},
   *  {
   *    email: (value) => validateIsRequired(value)
   *    foo: (value) => validateIsRequired(value)
   *  }
   * )
   * // default model validator constructor be called with following:
   * const foo = new ModelValidator(model, {email: (value) => validateIsRequired(value), foo: (value) => validateIsRequired(value)})
   *
   * // the validation methods will be wrapped with {@link validateProperty}
   * // so (value) => validateIsRequired(value) will be wrapped like:
   *  this.validateProperty('email', (value) => validateIsRequired(value))
   * // than under same name it will be set on instance:
   * email: () => this.validateProperty('email', (value) => validateIsRequired(value))
   * // in order to now which shall be called on {@link validateDefault}
   * it will also land here:
   * defaultValidations = {
   *   email: this.email
   * }
   * ```
   * @remarks
   * if you use recommended custom validator flow, just put here the references that should be validated by default.
   * So you basically do manually what's done auto in "object flow" but with full control and typing etc.:
   * @example
   * ```
   * class MyValidator extends ModelValidator {
   *   name = () => this.validateProperty('name', (value) => validateIsRequired(value)
   *   defaultValidations = {
   *     name: this.name
   *   }
   * }
   * ```
   * @example if you use object flow, and want specify what runs on validateDefault (e.g. if you want to manually run some validator,
   * but still have default validations) you can do it like:
   * ```
   * const makeFormModel({email: '', foo: 'bar'},
   *  {
   *    email: (value) => validateIsRequired(value)
   *    foo: (value) => validateIsRequired(value),
   *    validateDefault: ['email']
   *  }
   * )
   * // both email and foo will present on instance, but only email will be called on 'validateDefault()'.
   * // foo can be still validated, but you need to do it conditionally.
   * ```
   */
  defaultValidations = {}

  constructor(model: MODEL_T, argValidations?: any) {
    this.model = model
    if (argValidations) {
      this.assignValidations(argValidations)
    }
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
  addError(property: keyof MODEL_T, errorMessage: string) {
    const model = this.model as any
    model.errors ??= {}
    model.errors[property] ??= []
    if (model.errors[property].find((it: string) => it === errorMessage)) {
      return
    }
    model.errors[property].push(errorMessage)
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
  removeErrors(property: keyof MODEL_T) {
    const model = this.model as any
    const errors = model.errors
    delete errors?.[property]
    if (errors && Object.keys(errors).length < 1) {
      delete model.errors
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
  removeSpecificError(property: keyof MODEL_T, errorToDelete: string) {
    const model = this.model as any
    const propertyErrors = model.errors?.[property] as any[]
    const indexToDelete = propertyErrors?.indexOf?.(errorToDelete)
    if (indexToDelete < 0) {
      return
    }
    propertyErrors?.splice(indexToDelete)
  }

  /**
   * @param methods - will call any methods with specified name provided in arg.
   * @param methods - may also contain an object, if provided, will yield a value on model to a callback.
   * this is usefull to have more control over which validation methods are called:
   * @example
   * ```
   * const foo = makeFormModel({email: '', name: 'bar', shipping: {shippingMethod: ''}},
   *  {
   *    paymentMethod: (value) => validateRequired(value, regex)
   *    name: (value) => validateIsRequired(value)
   *    address: (value) => validateIsRequired(value)
   *  },
   *  tap: (data) => ({
   *    shipping: makeFormModel(data.shipping, {shippingMethod: () => validateIsRequired(value)})
   *  })
   * )
   *
   * validateAddressStep() {
   *   model.validator.validate('name', 'address')
   * }
   *
   * validatePaymentStep() {
   *   model.validator.validate('paymentMethod')
   * }
   *
   * validateShippingStep() {
   *   model.validator.validate('address', {shipping: (shippingModel) => shippingModel.validate('shipping') })
   * }
   *
   * validateAll() {
   *   model.validator.validateDefault
   * }
   *
   * ```
   *
   * */
  validate(
    ...methods: (
      | keyof this
      | { [K in keyof MODEL_T]?: (value: MODEL_T[K]) => void }
    )[]
  ) {
    if (methods) {
      for (const validationMethod of methods as any) {
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
            ;(validationMethod as any)[key]((this.model as any)[key])
          })
        }
      }

      return
    }
    this.validateDefault()
  }

  /**
   * resets/unsets all errors for all properties on model
   */
  resetErrors() {
    const model = this.model as any
    model.errors = undefined
    resetModelDataOnAllRelated(model)
  }

  /**
   * false if any error or any nested model has any error
   * */
  isValid() {
    const model = this.model as any
    const errors = model.errors
    const hasErrors = errors && Object.keys(errors).length > 0
    if (hasErrors) {
      return false
    }
    return allRelatedAreValid(model)
  }

  /** because there may be multiple errors, they are contained in array,
   * but normally you need only first one, e.g. to show in component. This returns it
   * @example
   * ```
   * model.validator.addError('name', 'uncool') // errors === {name: ['uncool']}
   * model.validator.addError('name', 'bad') // errors === {name: ['uncool', 'bad']}
   * model.validator.getFirstErrorFor('name') // uncool
   * model.validator.removeErrors('name') // errors === undefined
   * model.validator.getFirstErrorFor('name') // undefined
   * ```
   * */
  getFirstErrorFor(property: keyof MODEL_T): undefined | string {
    return this.getErrorsFor(property)?.[0]
  }

  /** @returns errors - all errors for property  */
  getErrorsFor(property: keyof MODEL_T): string[] | undefined {
    return (this.model as any).errors?.[property]
  }

  /** @return bool - true if property has no error, false otherwise */
  isPropertyValid(property: keyof MODEL_T) {
    return !!this.getFirstErrorFor(property)
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
  getPreviousValue(property: keyof MODEL_T) {
    return this.valuesCache[property as string]
  }

  /**
   * compares value on cache and on model.
   * true if values are same AND value was at least once validated
   * @param property - property to compare with cache
   */
  valueIsSameAndValidated(property: keyof MODEL_T) {
    if (!(property in this.valuesCache)) {
      return false
    }
    return this.getPreviousValue(property) === this.model[property]
  }

  /**
   * runs any validations specified in {@link defaultValidations}.
   * for {@link makeFormModel} flow - any passed validations be called.
   * for custome flow any referenced methods in {@link defaultValidations}
   * @remark
   * this will call validateDefault on any nested model as well
   * @param validateNested - if should validateDefault on nested models' validators. Defaults to true
   */
  validateDefault(validateNested: boolean = true) {
    Object.values((this as any).defaultValidations).forEach((it: any) => {
      it.bind(this)()
    })
    if (validateNested) {
      validateDefaultRelated(this.model)
    }
  }

  /**
   * runs validation function, and handles it's result.
   * behind the scenes will define if validation needs to be run by comparing cache values
   * if validation unnecessary - skips
   * otherwise runs validation and handles result, via adding/removing errors for property and updating cache.
   *
   * @param property - property that's being validated
   * @param validationFunc - any function that accepts value and returns {@link ValidationReturn}. Value will be read from model's property
   * @param options - various options
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
    property: keyof MODEL_T,
    validationFunc: (value: any) => ValidationReturn,
    options?: { skipCached: boolean }
  ) {
    if (options?.skipCached) {
      if (this.valueIsSameAndValidated(property)) {
        return
      }
    }
    const result = validationFunc((this.model as any)[property as any])
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
    propertyName: keyof MODEL_T,
    result: ValidationReturn
  ) {
    if (result.ignore) {
      return
    }
    if (result.valid) {
      this.removeErrors(propertyName)
      return result
    }
    if (result.errors && Array.isArray(result.errors)) {
      ;(this.model as any).errors ??= {}
      ;(this.model as any).errors[propertyName] = result.errors.filter(
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

  /**
   * relevant to {@link makeFormModel} flow
   * @example whenever you pass in constructor of ModelValidator following:
   * ```
   * // e.g. if you create call
   * const formState = makeFormStateWithModel({
   *   validations: {
   *     name: () => return validate...
   *     email: () => return ...
   *   }
   * })
   *
   * // or same arg to makeFormModel
   * // methods specified in 'validations' arg will be passed to initialize instance of ModelValidator as arg.
   * // those validations, will be set on instance.
   * // if you do not provide a 'validateDefault' list, all validations will be run whenever validator.validateDefault() is called
   * // so for example above, calling:
   * formState.rootModel.validator.validateDefault()
   * // both name and email validations will be run.
   *
   * // e.g. if you create with these args
   * const formState = makeFormStateWithModel({
   *   validations: {
   *     name: () => return validate...
   *     email: () => return ...
   *     baz: () => return validate...,
   *     validateDefault: ['name', 'baz']
   *   }
   * })
   * // it will as well set all validation methods on instance, but on call validateDefault(), only name and baz
   * // validations will run. So you can run email e.g. conditionally in logic or, whatever.
   * // e.g.:
   * validateAll:
   * formState.validateAll() // this is effectively same as formState.rootModel.validator.validateDefault()
   * if (something) {
   *   formState.rootModel.validator.email() // will validate email separately.
   * }
   * ```
   *
   * @see defaultValidations
   * @protected
   */
  protected assignValidations(argValidations: any) {
    const validateDefault =
      argValidations.validateDefault ?? Object.keys(argValidations)

    const validations = { ...argValidations }
    delete validations.validateDefault

    Object.keys(validations).forEach((key) => {
      ;(this as any)[key] = () =>
        this.validateProperty(key as any, (value: any) => {
          return (validations as any)[key](value, this.model, this)
        })
    })

    const defaultValidations = {} as any
    ;(this as any).defaultValidations = validateDefault.forEach(
      (key: string) => {
        if (!(this as any)[key]) {
          console.error(
            `validation with name ${key} was specified as default, but was not provided`,
            argValidations
          )
        }
        defaultValidations[key] = (this as any)[key]
      }
    )

    this.defaultValidations = defaultValidations
    this.argValidations = argValidations
  }
}
