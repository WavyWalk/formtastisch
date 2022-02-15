import { BaseModel } from '../BaseModel'
import { ModelSerializeArgs } from '../serialization/modelSerializationUtils'

export interface IModelConstructor {
  new (modelData?: any, serializeOptions?: ModelSerializeArgs<any>): BaseModel
}
