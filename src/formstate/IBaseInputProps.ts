import { BaseModel } from '../frontmodel'
import { FormState } from './FormState'

export interface IBaseInputProps {
  model: BaseModel
  formState: FormState
  property: string
}
