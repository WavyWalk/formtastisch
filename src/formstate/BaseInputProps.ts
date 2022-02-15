import { BaseModel } from '../frontmodel'
import { FormState } from './FormState'

export interface BaseInputProps<T = BaseModel> {
  model: T
  formState: FormState
  property: Extract<keyof T, string>
}
