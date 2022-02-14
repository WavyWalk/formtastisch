import {
  IRelationsConfig,
  IRelationsConfigEntry
} from '../realtions/IRelationsConfig'
import { RelationTypesEnum } from '../RelationTypesEnum'
import { ModelSerializeArgs, serializationShared } from './serializationShared'

/**
 * class responsible for deserializing plain js object to
 * T extends BaseModel
 */
export class ModelDeserializer {
  /**
   * for serializeOptions will add return value of it's key to result under same key
   * if key is decorated with HasMany or HasOne value of it be instantiated
   */
  deserializeModelData<T>(context: {
    relationsConfig: IRelationsConfig
    modelData: any
    serializeOptions: ModelSerializeArgs<T> | undefined
    knownProperties: Record<string, boolean>
  }) {
    const { relationsConfig, modelData, serializeOptions } = context
    const { exclude, include, doBlock } = serializeOptions ?? {}

    if (!modelData) {
      return {}
    }
    const result: any = {}
    /** defaults to all keys if no include if given */
    let propertyKeys: any[] = include ?? Object.keys(modelData)

    propertyKeys = serializationShared.filterOutKeysToExclude(
      propertyKeys,
      exclude
    )

    propertyKeys = serializationShared.filterOutDoBlockKeys(
      propertyKeys,
      doBlock
    )

    serializationShared.setDoBlockReturnValuesToResult(
      result,
      modelData,
      doBlock
    )

    for (let property of propertyKeys) {
      if (
        serializeOptions?.onlyKnownProperties &&
        !context.knownProperties[property]
      ) {
        continue
      }
      const rawValue = modelData[property]

      const relationEntry = relationsConfig[property]
      if (relationEntry) {
        const preparedValue = this.deserializeRelationValue(
          relationEntry,
          rawValue,
          serializeOptions
        )
        property = relationEntry.aliasedTo ?? property
        result[property] = preparedValue
        continue
      }
      result[property] = rawValue
    }

    return result
  }

  deserializeRelationValue<T>(
    relationsConfig: IRelationsConfigEntry,
    rawValue: any,
    serializeOptions?: ModelSerializeArgs<T>
  ) {
    const ThatConstructor = relationsConfig.getThatModelConstructor()
    try {
      switch (relationsConfig.associationType) {
        case RelationTypesEnum.hasMany:
          return rawValue?.map((it: any) => {
            if (it instanceof ThatConstructor) {
              return it
            }
            return new ThatConstructor(it, {
              onlyKnownProperties: serializeOptions?.onlyKnownProperties
            })
          })

        case RelationTypesEnum.hasOne:
          if (!rawValue) {
            return rawValue
          }
          if (rawValue instanceof ThatConstructor) {
            return rawValue
          }
          return new ThatConstructor(rawValue, {
            onlyKnownProperties: serializeOptions?.onlyKnownProperties
          })
      }
    } catch (e) {
      console.log(
        `failed to initialize relation ${relationsConfig.getThatModelConstructor} withProperty`,
        rawValue
      )
    }
  }
}

export const modelDeserializer = new ModelDeserializer()
