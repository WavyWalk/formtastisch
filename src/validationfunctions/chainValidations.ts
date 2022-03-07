import { ValidationReturn } from './validate'

/**
 * used for chaining validations.
 *
 * runs validations one by one, stops and on any that returns valid: false, otherwise goes to end and returns valid true
 *
 * @example
 * ```
 * const formState = makeFormStateWithModel({
 *   initialData: {
 *     name: 'joe'
 *   },
 *   validations: {
 *     name: (value) => chainValidations(
 *       () => validateIsRequired(value),
 *       () => validateMinLength(value, 1, 'must be > 1'),
 *       () => validateMinLength(value, 2, 'must be > 2'),
 *       () => validateMinLength(value, 3, 'must be > 3')
 *     )
 *   }
 * })
 * ```
 */
export const chainValidations = (...validations: (() => ValidationReturn)[]): ValidationReturn => {
  let lastResult: ValidationReturn = {valid: true}
  for (let i = 0; i < validations.length; i++) {
    const validation = validations[i]
    lastResult = validation()
    if (lastResult.errors && !Array.isArray(lastResult.errors)) {
      lastResult.errors = [lastResult.errors as string]
    }
    if (!lastResult.valid) {
      return lastResult
    }
  }

  return lastResult
}