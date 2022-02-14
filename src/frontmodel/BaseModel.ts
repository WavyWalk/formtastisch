import { IModelData } from './interfaces/IModelData'
import { ModelValidator } from './validation/ModelValidator'
import type { IRelationsConfig } from './realtions/IRelationsConfig'
import { modelDeserializer } from './serialization/ModelDeserializer'
import { modelSerializer } from './serialization/ModelSerializer'
import { ModelSerializeArgs } from './serialization/serializationShared'
import { modelMerger } from './serialization/ModelMerger'

export class BaseModel {
  /** @see getRelationsConfig */
  static relationsConfig: IRelationsConfig | null = null

  /** map of properties of the model */
  static knownProperties: Record<string, boolean> = {}

  static getKnownProperties() {
    return this.knownProperties
  }

  /**
   * required for hydrating related entities.
   * @see HasMany, HasOne will populate this config, so later
   * it be used during de/serialization
   * as well in other contexts.
   * e.g. will allow understand if property 'foo' is relation
   * and get required metadata for such relation
   */
  static getRelationsConfig(): IRelationsConfig {
    const config = this.relationsConfig
    if (!config) {
      this.relationsConfig = {}
    }
    return this.relationsConfig!
  }

  /**
   * used in component based ui libs
   * as well as when you need a unique key associated with this instance
   * p.s unique in sense among T extends BaseModel instances in current process
   */
  static uniqueKey = 0

  /**
   * core of your model
   * plain object that keeps modelData required for your business
   * class modelData annotated with
   * @see Property will get set values here directly under same key
   * accessing `modelData` directly is discouraged
   * */
  modelData!: IModelData

  /**
   * will be lazily initialized in getter
   * @see validator
   */
  _validator?: any

  /**
   * just invokes constructor passing the modelData,
   * additionally gives you a typings for serializeOptions.
   * first arg some weird shit to get typing of static "this" so to say :)
   * */
  static parse<T>(
    this: new () => T,
    modelData?: any,
    serializeOptions?: ModelSerializeArgs<T>
  ): T {
    return new (this as any)(modelData, serializeOptions) as T
  }

  static parseArray<T>(
    this: new () => T,
    modelData?: any,
    serializeOptions?: ModelSerializeArgs<T>
  ): T[] {
    return modelData.map((it: any) => {
      return new (this as any)(it, serializeOptions) as T
    })
  }

  constructor(modelData?: any, serializeOptions?: ModelSerializeArgs<any>) {
    /** @see ModelDeserializer */
    this.parseModelData(modelData, serializeOptions)
  }

  private parseModelData(
    modelData?: any,
    serializeOptions?: ModelSerializeArgs<this>
  ) {
    /** @see ModelDeserializer */
    this.modelData = modelDeserializer.deserializeModelData({
      relationsConfig: (
        this.constructor as typeof BaseModel
      ).getRelationsConfig(),
      modelData: modelData,
      serializeOptions: serializeOptions,
      knownProperties: (
        this.constructor as typeof BaseModel
      ).getKnownProperties()
    })
  }

  /**
   * just a shortcut so you don't access via modelData.errors
   */
  // @ts-ignore
  get errors() {
    return this.modelData.errors
  }

  // @ts-ignore
  set errors(value) {
    this.modelData.errors = value
  }

  /**
   * lazily intializes validator
   * by default will initialize base validator @see ModelValidator
   * to serializeOptions for usage with specific validator e.g. your AccountValidator
   * simply serializeOptions it with short implementation
   * e.g.
   * get validator() {return this._validator ??= new AccountValidator(this)}
   */
  // @ts-ignore
  get validator(): ModelValidator<any, any> {
    return (this._validator ??= new ModelValidator(this))
  }

  /**
   * @see ModelSerializer
   */
  serialize(options: ModelSerializeArgs<this> = {}) {
    return modelSerializer.serialize(
      this,
      (this.constructor as typeof BaseModel).getRelationsConfig(),
      options
    )
  }

  private uniqueKey!: number
  getUniqueKey = () => {
    this.uniqueKey = this.uniqueKey ?? (BaseModel.uniqueKey += 1)
    return this.uniqueKey
  }

  replaceErrorsFrom<T extends BaseModel>(thatModel: T) {
    modelMerger.replaceWithErrorsFrom(this, thatModel)
  }
}
