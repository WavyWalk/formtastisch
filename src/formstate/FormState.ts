import { SubscriptionState } from '../statemanagement'
import { BaseModel } from '../frontmodel'
import { ChangeEvent, useMemo } from 'react'
import { handleValidationResult } from '../frontmodel/validation/validates'
import { IValidateFunction } from '../frontmodel/validation/validate'

export interface InputUseOptions {
  validateFunc?: IValidateFunction
  skipValidationOnChange?: boolean
  additionallyOnChange?: () => void
}

export abstract class FormState extends SubscriptionState {
  model!: BaseModel
  touched = false

  useForInput<T extends BaseModel>(
    model: T,
    property: Extract<keyof T, string>,
    options?: InputUseOptions
  ) {
    this.use({
      updateDeps: () => [
        model,
        model.modelData[property],
        model.validator.getFirstErrorFor(property)
      ]
    })
    return useMemo(() => {
      return {
        onValueChange: (value: any) =>
          this.onValueChange(value, model, property, options),
        onChange: (e: ChangeEvent<any>) => {
          this.onChangeEventHandler(e, model, property, options)
        },
        getIsValid: () => {
          return this.model.validator.getFirstErrorFor(property)
        },
        getFirstError: () => {
          return this.model.validator.getFirstErrorFor(property)
        }
      }
    }, [this])
  }

  makeOnChangeHandler = <T extends BaseModel>(
    model: T,
    property: Extract<keyof T, string>,
    options?: InputUseOptions
  ) => {
    return (e: ChangeEvent<any>) => {
      this.onChangeEventHandler(e, model, property, options)
    }
  }

  onValueChange<T extends BaseModel>(
    value: any,
    model: T,
    property: Extract<keyof T, string>,
    options?: InputUseOptions
  ) {
    model.modelData[property] = value
    if (options?.skipValidationOnChange) {
      // do nothing
    } else if (options?.validateFunc) {
      handleValidationResult(model, property, options.validateFunc(value))
    } else {
      if (!(model.validator as any)[property]) {
        console.warn(
          `no default validation function defined for property ${property} on ${model}.validator`
        )
      } else {
        ;(model.validator as any)[property]?.()
      }
    }
    options?.additionallyOnChange?.()
    this.touched = true
    this.update()
  }

  onChangeEventHandler = <T extends BaseModel>(
    e: ChangeEvent<any>,
    model: T,
    property: Extract<keyof T, string>,
    options?: InputUseOptions
  ) => {
    this.onValueChange(e.target.value, model, property, options)
  }

  isValid() {
    this.model.validator.isValid()
  }

  validateAll(update = false) {
    this.model.validator.runAdditionallyOnValidate()
    update && this.update()
  }
}
