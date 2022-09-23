import { ValidateFunction } from '../validationfunctions/validate'

/**
 * @param skipValidationOnChange - skips validation
 * @param additionallyOnChange - any function that will be run after property is updated and validated.
 * @param validateOnBlur - prevents immediate validation after assignment, and runs it on blur instead
 */
export interface InputUseOptions {
  validate?: ValidateFunction
  skipValidationOnChange?: boolean
  additionallyOnChange?: () => void
  validateOnBlur?: boolean
}
