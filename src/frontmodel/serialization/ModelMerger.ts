import { BaseModel } from '../BaseModel'
import { getRelationConfigEntryForModel } from '../realtions/relationUtils'
import { RelationTypesEnum } from '../RelationTypesEnum'

class ModelMerger {
  replaceWithErrorsFrom(replaceIn?: BaseModel, replaceFrom?: BaseModel) {
    if (!replaceIn || !replaceFrom) {
      return replaceIn
    }
    replaceIn.errors = replaceFrom.errors
    for (const property of Object.keys(replaceFrom.modelData)) {
      const relation = getRelationConfigEntryForModel(replaceFrom, property)
      if (!relation) {
        continue
      }
      const replaceInValue = replaceIn.modelData[property]
      const replaceFromValue = replaceFrom.modelData[property]
      if (!replaceInValue || !replaceFromValue) {
        continue
      }
      if (relation.associationType === RelationTypesEnum.hasOne) {
        this.replaceWithErrorsFrom(replaceInValue, replaceFromValue)
        continue
      }
      if (relation.associationType === RelationTypesEnum.hasMany) {
        this.replaceErrorsForCollection(replaceInValue, replaceFromValue)
      }
    }
  }

  replaceErrorsForCollection(
    mergeToList: BaseModel[],
    mergeFromList: BaseModel[]
  ) {
    if (!mergeFromList || !mergeToList) {
      return
    }
    for (let i = 0; i < mergeToList.length; i++) {
      const mergeTo = mergeToList[i]
      const mergeFrom = mergeFromList[i]
      if (!mergeTo || !mergeFrom) {
        continue
      }
      this.replaceWithErrorsFrom(mergeTo, mergeFrom)
    }
  }
}

export const modelMerger = new ModelMerger()
