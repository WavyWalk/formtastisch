import { FormModel } from './FormModel'

export const valueIsModelArray = (value: any) => {
  return Array.isArray(value) && value[0] instanceof FormModel
}
