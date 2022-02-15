import { IRelationsConfig } from './IRelationsConfig'
import { BaseModel } from '../BaseModel'

export const getRelationConfigForModel = (model: BaseModel) => {
  return (model.constructor as any).relationsConfig as IRelationsConfig
}

export const getRelationConfigEntryForModel = (
  model: BaseModel,
  property: string
) => {
  return getRelationConfigForModel(model)?.[property]
}
