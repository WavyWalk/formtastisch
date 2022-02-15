import { BaseModel } from '../BaseModel'
import { RelationTypesEnum } from '../RelationTypesEnum'

export type ModelSerializerDoBlockParam<T> = {
  [id in keyof T]?: (it: any) => any
}

export interface ModelSerializeArgs<T extends {}> {
  include?: (keyof T)[]
  exclude?: (keyof T)[]
  withErrors?: boolean
  tap?: ModelSerializerDoBlockParam<T>
  onlyKnownProperties?: boolean
}

/** @see serialize */
export const modelSerializationUtilsFilterOutKeysToExclude = <T>(
  keysToIncludeInResult: any[],
  exclude: (keyof T)[] | undefined
) => {
  if (!exclude) {
    return keysToIncludeInResult
  }
  return keysToIncludeInResult.filter((it: any) => {
    return exclude.indexOf(it) < 0
  })
}

/**
 * @see serialize
 */
export const modelSerializationUtilsFilterOutDoBlockKeys = <T>(
  keysToIncludeInResult: any[],
  doBlock?: ModelSerializerDoBlockParam<T>
) => {
  if (!doBlock) {
    return keysToIncludeInResult
  }
  const doBlockKeys = Object.keys(doBlock)
  return keysToIncludeInResult.filter((it: any) => {
    return doBlockKeys.indexOf(it) < 0
  })
}

/**
 * values of tap assigned to result yielding current value on modelData to func,
 * if doBlock return value for key is undefined - it is not included into result object
 * */
export const modelSerializationUtilsSetDoBlockReturnValuesToResult = <T>(
  result: any,
  modelData: any,
  doBlock?: ModelSerializerDoBlockParam<T>
) => {
  if (!doBlock) {
    return
  }

  for (const key of Object.keys(doBlock)) {
    const value = modelData[key]
    const replaceValue = (doBlock as any)[key](value)
    if (replaceValue === undefined) {
      continue
    }
    result[key] = replaceValue
  }
}

export const modelSerializationUtilsGetRelatedValuesPresentOnModel = <
  T extends BaseModel
>(
  model: T
) => {
  const relationsConfig = (
    model.constructor as typeof BaseModel
  ).getRelationsConfig()
  return Object.keys(relationsConfig).reduce<{
    hasMany: Record<string, BaseModel[]>
    hasOne: Record<string, BaseModel>
  }>(
    (accum, key) => {
      const value = model[key as keyof BaseModel] as BaseModel
      if (!value) {
        return accum
      }
      if (Array.isArray(value) && value.length < 1) {
        return accum
      }
      if (relationsConfig[key].associationType === RelationTypesEnum.hasMany) {
        accum.hasMany[key] = value as unknown as BaseModel[]
      } else {
        accum.hasOne[key] = value
      }
      return accum
    },
    {
      hasMany: {},
      hasOne: {}
    }
  )
}
