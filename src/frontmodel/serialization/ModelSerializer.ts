import type {
  IRelationsConfig,
  IRelationsConfigEntry
} from '../realtions/IRelationsConfig'
import { RelationTypesEnum } from '../RelationTypesEnum'
import { BaseModel } from '../BaseModel'
import { ModelSerializeArgs, serializationShared } from './serializationShared'

/**
 * class is responsible to serialize T extends BaseModel to a plain js object
 * for details @see serialize method of it.
 */
export class ModelSerializer {
  /**
   * serializes model respecting the options you pass:
   * include: will only serialize specified keys
   * exclude: will serialize every key except
   * withErrors: if true will include errors, as well as for related
   * doBlock: will use return value of a func in doBlock key as serialized value for such key
   *  if returned value is undefined will skip such key in result
   *  doBlock is not affected by include or exclude
   *
   * if include is ommitted all modelData keys will be considered as `include`
   *
   * e.g. User({name: "foo", friend: User, foe: User, email: "doe", phone: "123"})
   * user.serialize({
   *     include: ["name", "friend", "foe", "email", "phone"],
   *     exclude: ["phone"]
   *     doBlock: {
   *         friend: it=>it.serialize({only: "name"}),
   *         email: it=>`${it}@baz.com`,
   *         notExisting: it=>'noice'
   *     }
   * })
   * for above:
   * name be serialized with current value
   * foe in include will be defaultly serialized with foe.serialize({withErrors})
   * friend will be serialized with the result in do block
   * phone be excluded from result
   * email will use return result in do block
   */
  serialize<T extends {}>(
    model: T,
    relationsConfig: IRelationsConfig,
    options: ModelSerializeArgs<T>
  ) {
    const { include, exclude, withErrors = false, doBlock } = options

    const result: any = {}
    const modelData = (model as any).modelData

    /** defaults to all keys if no include */
    let keysToIncludeInResult: any[] = include ?? Object.keys(modelData)

    /** filters  out exclude */
    keysToIncludeInResult = serializationShared.filterOutKeysToExclude(
      keysToIncludeInResult,
      exclude
    )

    keysToIncludeInResult = serializationShared.filterOutDoBlockKeys(
      keysToIncludeInResult,
      doBlock
    )

    serializationShared.setDoBlockReturnValuesToResult(
      result,
      modelData,
      doBlock
    )

    if (withErrors) {
      keysToIncludeInResult.push('errors')
    }

    for (const key of keysToIncludeInResult) {
      const rawValue = modelData[key]
      if (rawValue === undefined) {
        continue
      }

      if (relationsConfig[key]) {
        result[key] = this.serializeRelationValue(
          relationsConfig[key],
          rawValue,
          withErrors
        )
        continue
      }

      result[key] = rawValue
    }

    return result
  }

  /**
   * will just serialize model on property calling .serialize({withErrors})
   * if hasMany than will map same to array
   */
  private serializeRelationValue(
    relationsConfigElement: IRelationsConfigEntry,
    rawValue: any,
    withErrors = false
  ) {
    switch (relationsConfigElement.associationType) {
      case RelationTypesEnum.hasOne:
        return this.handleModelValue(rawValue, withErrors)
      case RelationTypesEnum.hasMany:
        return rawValue?.map((it: any) => {
          return this.handleModelValue(it, withErrors)
        })
    }
  }

  /**
   * @see serializeRelationValue
   */
  private handleModelValue(value: BaseModel, withErrors = false) {
    return value.serialize({ withErrors })
  }
}

export const modelSerializer = new ModelSerializer()
