/**
 * In order so that model can process validation, Every validation function must return this type.
 *
 * valid - if true all errors for property will be cleared
 * valid - if false - if errors are array - will replace all errors for property with array. if single string, will add it, if
 * there is no error with this message, else will ignore.
 *
 * errors - either array of error messages - if valid false will replace all errors for property, if single and false will add error if not there.
 *
 */
export interface ValidationReturn {
  valid: boolean
  errors?: string[] | string
  ignore?: boolean
}

export type ValidateFunction = (value: any, ...rest: any[]) => ValidationReturn

/**
 * valid false is value is undefined or empty string
 */
export const validateIsRequired = (
  value: any,
  message: string = 'required'
): ValidationReturn => {
  if (!value && (value === '' || value === undefined)) {
    return { valid: false, errors: message }
  }
  return { valid: true }
}

/**
 * valid false if value does not match pattern
 */
export const validatePattern = (
  value: any,
  regEx: RegExp,
  message: string = 'errors.isNotEmail'
): ValidationReturn => {
  if (regEx.test(value)) {
    return { valid: true }
  }
  return { valid: false, errors: message }
}

/**
 * valid false if length lt specified
 */
export const validateMinLength = (
  value: string | undefined,
  minLength: number,
  message: string = 'errors.tooShort'
): ValidationReturn => {
  if (!value || value.length >= minLength) {
    return { valid: true }
  }
  return { valid: false, errors: message }
}

/**
 * valid false if length gt than specified
 */
export const validateMaxLength = (
  value: string | undefined,
  maxLength: number,
  message: string = 'errors.tooLong'
): ValidationReturn => {
  if (!value) {
    return { valid: false, errors: message }
  }
  if (value.length > maxLength) {
    return { valid: false, errors: message }
  }
  return { valid: true }
}

/**
 * valid false if value not equals toMatch
 */
export const validateEquals = (
  {
    value,
    toMatchWith
  }: {
    value?: string
    toMatchWith?: string
  },
  message = 'errors.notEqualTo'
): ValidationReturn => {
  if (!value && !toMatchWith) {
    return { valid: true }
  }
  if (value !== toMatchWith) {
    return { valid: false, errors: message }
  }
  return { valid: true }
}
