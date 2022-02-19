import { ValidateFunction } from '../validationfunctions/validate'

export interface InputUseOptions {
  validate?: ValidateFunction
  skipValidationOnChange?: boolean
  additionallyOnChange?: () => void
  validateOnBlur?: true
}
