import { FormModel } from './FormModel'

export const valueIsModel = (value: any) => {
  return value instanceof FormModel
}
