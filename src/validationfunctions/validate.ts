export interface ValidationReturn {
  valid: boolean
  errors?: string[] | string
  ignore?: boolean
}

export type ValidateFunction = (value: any, ...rest: any[]) => ValidationReturn

export const validateIsRequired = (
  value: any,
  message: string = 'required'
): ValidationReturn => {
  if (!value) {
    return { valid: false, errors: message }
  }
  return { valid: true }
}

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

export const validateMinLength = (
  value: string,
  minLength: number,
  message: string = 'errors.tooShort'
): ValidationReturn => {
  if (value.length >= minLength) {
    return { valid: true }
  }
  return { valid: false, errors: message }
}

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

export const validateMatches = (
  {
    value,
    toMatchWith
  }: {
    value?: string
    toMatchWith?: string
  },
  message = 'errors.doesNotMatch'
): ValidationReturn => {
  if (!value && !toMatchWith) {
    return { valid: true }
  }
  if (value !== toMatchWith) {
    return { valid: false, errors: message }
  }
  return { valid: true }
}
