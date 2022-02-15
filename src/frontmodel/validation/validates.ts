/**
 * decorator for functions that run the validation for specific property.
 * This exists to have a "good" default, you can still run validations and customise behaviour without it.
 * @Remark
 * Your validation functions must be named exactly as properties on your model, if you rely on default validation from formState.
 * @example
 * ```
 * class Foo extends ModelValidator {
 *   @validates()
 *   email() {...}
 *   // decorator wraps the email function
 *   // when email is called somewhere, first decorator will run if function at all must be called, by checking if previous cached value
 *   // is same as the current
 *   // if value is different it will call email(), take it's result and feed it to {@link ModelValidator.handleValidationResult}
 *
 *   // but as said this is just a good defaults, you could achieve same with following with {@link ModelValidator.validateProperty}
 *
 *   // or even do it fully on own
 *   firstName() {
 *     if (this.valueIsSameAndValidated('firstName')) {
 *       return
 *     }
 *     const validationResult = validateIsNotEmpty(this.model.firstName)
 *     handleValidationResult(this.model, 'firstName', validationResult)
 *     this.valuesCache[propertyName] = this.model[propertyName]
 *   }
 * ```
 */
export function validates(target: any, propertyName: string, descriptor: any) {
  const original = descriptor.value

  descriptor.value = function (...args: any[]) {
    if (this.valueIsSameAndValidated(propertyName as any)) {
      return
    }
    const result = original.apply(this, args)
    this.valuesCache[propertyName] = this.model[propertyName]
    this.handleValidationResult(propertyName as any, result)
    this.valuesCache[propertyName] = this.model[propertyName]
    return result
  }

  return descriptor
}
