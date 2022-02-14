import { BaseModel } from '../BaseModel'
import { IPlainObject } from '../utils/IPlainObject'
import { getRelationConfigForModel } from '../realtions/relationUtils'
import { RelationTypesEnum } from '../RelationTypesEnum'

/**
 * walks modelData, if property is relation based,
 * will call resetErrors() on them, taking into account the relation type
 */
export const resetModelDataOnAllRelated = (
  validatable: BaseModel,
  modelData: IPlainObject
) => {
  for (const property of Object.keys(modelData)) {
    const relation = getRelationConfigForModel(validatable)[property]
    if (!relation) {
      continue
    }
    const related = modelData[property]
    if (!related) {
      continue
    }
    switch (relation.associationType) {
      case RelationTypesEnum.hasMany:
        related.forEach((it: BaseModel) => {
          it.validator?.resetErrors()
        })
        break
      case RelationTypesEnum.hasOne:
        related.validator?.resetErrors()
        break
    }
  }
}

/**
 * call isValid depending on relation type
 * HasOne - plain call,
 * HasMany in loop - first invalid breaks, true after loop otherwise
 */
const isRelatedValid = (value: any, relationType: RelationTypesEnum) => {
  switch (relationType) {
    case RelationTypesEnum.hasOne:
      return value.validator.isValid()

    case RelationTypesEnum.hasMany:
      for (const related of value) {
        if (related.validator.isValid()) {
          continue
        }
        return false
      }
      return true
  }
}

/**
 * iterates modelData, if property is relation based,
 * calls isValid on it
 * firts invalid breaks the loop
 * returns false if at least one related is invalid true otherwise
 */
export const allRelatedAreValid = (
  validatable: BaseModel,
  modelData: IPlainObject
) => {
  for (const property of Object.keys(modelData)) {
    const relation = getRelationConfigForModel(validatable)[property]
    if (!relation) {
      continue
    }
    const value = modelData[property]
    if (!value) {
      continue
    }
    if (isRelatedValid(value, relation.associationType)) {
      continue
    }
    return false
  }
  return true
}
