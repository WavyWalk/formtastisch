export interface IValidationReturn {
  valid: boolean
  singleError?: string
  errors?: string[]
}

export type IValidateFunction = (
  value: any,
  ...rest: any[]
) => IValidationReturn

export const validateIsRequired = (
  value: any,
  message: string
): IValidationReturn => {
  if (value) {
    return { valid: true }
  }
  return { valid: false, singleError: message }
}

export const validatePattern = (
  value: any,
  regEx: RegExp,
  message: string
): IValidationReturn => {
  if (regEx.test(value)) {
    return { valid: true }
  }
  return { valid: false, singleError: message }
}

export const validateMinLength = (
  value: string,
  minLength: number,
  message: string
): IValidationReturn => {
  if (value.length >= minLength) {
    return { valid: true }
  }
  return { valid: false, singleError: message }
}

export const validateMaxLength = (
  value: string,
  maxLength: number,
  message: string
): IValidationReturn => {
  if (value.length <= maxLength) {
    return { valid: true }
  }
  return { valid: false, singleError: message }
}
