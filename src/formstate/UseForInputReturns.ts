import { ChangeEvent } from 'react'

/**
 *
 */
export type UseForInputReturns<T> = {
  onValueChange: (value: any) => void
  onChange: (e: ChangeEvent<any>) => void
  getIsValid: () => boolean
  getFirstError: () => string | undefined
  onBlur: () => void
  getValue: () => T[Extract<keyof T, string>]
}
