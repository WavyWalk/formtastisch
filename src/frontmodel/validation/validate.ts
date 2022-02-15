export interface ValidationReturn {
  valid: boolean
  errors?: string[] | string
}

export type ValidateFunc = (value: any, ...rest: any[]) => ValidationReturn

export const validateIsRequired = (
  value: any,
  message: string = 'required'
): ValidationReturn => {
  if (value) {
    return { valid: true }
  }
  return { valid: false, errors: message }
}

export const validatePattern = (
  value: any,
  regEx: RegExp,
  message: string
): ValidationReturn => {
  if (regEx.test(value)) {
    return { valid: true }
  }
  return { valid: false, errors: message }
}

export const validateMinLength = (
  value: string,
  minLength: number,
  message: string
): ValidationReturn => {
  if (value.length >= minLength) {
    return { valid: true }
  }
  return { valid: false, errors: message }
}

export const validateMaxLength = (
  value: string,
  maxLength: number,
  message: string
): ValidationReturn => {
  if (value.length <= maxLength) {
    return { valid: true }
  }
  return { valid: false, errors: message }
}
