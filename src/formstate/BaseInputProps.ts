import { FormState } from './FormState'
import { FormModel } from '../formmodel/FormModel'

export interface BaseInputProps<T extends FormModel = any> {
  model: T
  formState: FormState<T>
  property: Extract<keyof T, string>
}
