import type { IRelationsConfig } from './IRelationsConfig'
import { BaseModel } from '../BaseModel'
import { RelationTypesEnum } from '../RelationTypesEnum'
import type { IModelConstructor } from '../interfaces/IModelConstructor'

export function HasOne(
  relatedConstructorGetter: () => IModelConstructor,
  aliasedKeys: string[] | null = null
) {
  return function (target: BaseModel, propertyName: string): any {
    const get = function () {
      // @ts-ignore
      return this.modelData[propertyName]
    }

    const set = function (valueToAssign: any) {
      // @ts-ignore
      this.modelData[propertyName] = valueToAssign
    }

    /** get static relationsConfig or assign if undefined */
    const relationsConfig: IRelationsConfig = (
      target.constructor as any
    ).getRelationsConfig()

    relationsConfig[propertyName] = {
      associationType: RelationTypesEnum.hasOne,
      getThatModelConstructor: relatedConstructorGetter,
      aliasedTo: null
    }

    // create entry for alias, so when parsing it defines that model correctly
    // but assigns to the modelData under key to which it is aliased
    aliasedKeys?.forEach((alias) => {
      relationsConfig[alias] = {
        associationType: RelationTypesEnum.hasOne,
        getThatModelConstructor: relatedConstructorGetter,
        aliasedTo: propertyName
      }
    })

    return {
      get,
      set
    }
  }
}
