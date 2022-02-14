import { BaseModel } from '../BaseModel'
import { IValidationReturn } from './validate'

/**
 * depending on result returned by validation function,
 * handles addition/removal of errors on model
 * @param model model for which validation result is handled
 * @param propertyName property name for which validation result is handled in question
 * @param result
 * if valid: removes all errors for property
 * if valid and single error: adds error if not there, other errors (e.g. from other validators are not removed)
 * above is useful when different methods validate the field, so they do not interfere with each other
 * if valid and multiple: removes all errors, sets errors contained in result.errors
 * above is useful when you have single method that validates
 */
export const handleValidationResult = <T extends BaseModel>(
  model: T,
  propertyName: keyof T,
  result: IValidationReturn
) => {
  if (result.valid) {
    model.validator.removeErrors(propertyName)
    return result
  }
  if (result.errors) {
    model.validator.validatable.modelData.errors[propertyName] =
      result.errors.filter((it) => !!it)
    return result
  }
  if (result.singleError) {
    model.validator.addError(propertyName, result.singleError)
  }
}

/**
 * decorator for functions that run the validation for specific property.
 * This exists to have a "good" default, you can still run validations and customise behaviour without it.
 * @param property property which is validated
 * @example
 * ```
 * class Foo extends ModelValidator {
 *   @validates('email')
 *   email() {...}
 * // decorator wraps the email function
 * // when email is called somewhere, first decorator will run if function at all must be called, by checking if previous value
 * // is same as the current
 * // if value is different it will call email(), take it's result and feed it to {@link handleValidationResult}
 *   @validates('firstName')
 *   firstName() {...}
 * // in above example, validation group is not provided for firstName and email, so the email will be set to default validation groups
 * // so if you call: model.validator.validateDefault() - those two two methoods will be called automatically
 *   @validates('firstName', 'admin')
 *   firstNameForAdmin() {...}
 *   // group is provided for admin, so it will not run as default validation
 *   // all validation methods with that group must be called with validate({group: 'admin'}})
 *
 *   // but as said this is just a good defaults, if you need to customize it can be easily done via:
 *   firstName() {
 *     if (this.isSameValue('firstName')) {
 *       return
 *     }
 *     const validationResult = validateIsNotEmpty(this.validatable.firstName)
 *     handleValidationResult(this.validatable, 'firstName', validationResult)
 *   }
 * ```
 */
export function validates<T>(property: keyof T) {
  return function validates(
    target: any,
    propertyName: string,
    descriptor: any
  ) {
    const defaultValidations =
      (target.constructor as any).defaultValidations ?? []

    if (defaultValidations.indexOf(property) > -1) {
      throw new Error(
        `More than one validation function is specified for property ${property} on ${target}`
      )
    }

    defaultValidations.push(property)
    ;(target.constructor as any).defaultValidations = defaultValidations

    const original = descriptor.value

    descriptor.value = function (...args: any[]) {
      if (this.isValueSameAsPrevious(property)) {
        return
      }
      const result = original.apply(this, args)
      this.valuesCache[property] = this.validatable[property]
      handleValidationResult((this as any).validatable, propertyName, result)
      this.valuesCache[property] = this.validatable[property]
      return result
    }

    return descriptor
  } as any
}

export const validateWith = <T extends BaseModel>(
  model: T,
  property: keyof T,
  validationFunc: () => IValidationReturn
) => {
  const result = validationFunc()
  handleValidationResult(model, property, result)
}
