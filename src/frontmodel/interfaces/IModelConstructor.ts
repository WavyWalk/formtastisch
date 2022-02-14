import { BaseModel } from '../BaseModel'
import { ModelSerializeArgs } from '../serialization/serializationShared'

export interface IModelConstructor {
  new (modelData?: any, serializeOptions?: ModelSerializeArgs<any>): BaseModel
}
