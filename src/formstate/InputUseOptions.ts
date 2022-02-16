import { ValidateFunction } from '../validationfunctions/validate'

export interface InputUseOptions {
  validateFunc?: ValidateFunction
  skipValidationOnChange?: boolean
  additionallyOnChange?: () => void
  validateOnBlur?: true
}
