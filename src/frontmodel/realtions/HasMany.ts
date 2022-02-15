import type { IRelationsConfig } from './IRelationsConfig'
import { RelationTypesEnum } from '../RelationTypesEnum'
import { BaseModel } from '../BaseModel'
import type { IModelConstructor } from '../interfaces/IModelConstructor'

export function HasMany(
  relatedConstructorGetter: () => IModelConstructor,
  parseAliases: string[] | null = null
) {
  return function (target: BaseModel, propertyName: string): any {
    /**
     * getter wrapper for property
     * if no value at property
     * assigns empty array to it and returns it
     */
    const get = function () {
      // @ts-ignore
      const valueAtProperty = this.modelData[propertyName]
      if (!valueAtProperty) {
        const defaultValue: Array<BaseModel> = []
        // @ts-ignore
        this[propertyName] = defaultValue
        return defaultValue
      }

      return valueAtProperty
    }

    const set = function (value: Array<BaseModel>) {
      // @ts-ignore
      this.modelData[propertyName] = value
    }

    /**
     * write entry for relations config
     * mark property as hasMany property
     * add the constructor getter (constructor getter required to avoid circular dependencies issues)
     * this config be later used during de/serialization
     * e.g. (for serializer to understand that property is related, as well as to how get the constructor of related)
     * so it will look like:
     * {friends: {associationType: HasMany, getThatModelConstructor: ()=>User}}
     * than during serialization something like
     * modelData['friends', 'foo'] forEach if config[friends]?.hasMany than config[firends].getThatModelConstructor(data)
     */
    const associationsConfig: IRelationsConfig = (
      target.constructor as any
    ).getRelationsConfig()
    associationsConfig[propertyName] = {
      associationType: RelationTypesEnum.hasMany,
      getThatModelConstructor: relatedConstructorGetter,
      aliasedTo: null
    }

    /**
     * if parse aliases provided, they will be used during deserialization.
     * values under aliased name will be assigned to the actual property
     * e.g.
     * @Property(()=>Foo, ['userName']) name
     * data{userName: 'doe'} -> Model(data) -> model.name // #=> doe
     */
    parseAliases?.forEach((alias) => {
      associationsConfig[alias] = {
        associationType: RelationTypesEnum.hasMany,
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
