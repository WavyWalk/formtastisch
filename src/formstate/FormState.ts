import { SubscriptionState } from '../statemanagement'
import { BaseModel } from '../frontmodel'
import { ChangeEvent, useMemo } from 'react'
import { ValidateFunc } from '../frontmodel/validation/validate'

export interface InputUseOptions {
  validateFunc?: ValidateFunc
  skipValidationOnChange?: boolean
  additionallyOnChange?: () => void
  validateOnBlur?: true
}

export abstract class FormState extends SubscriptionState {
  rootModel!: BaseModel
  touched = false
  validateAllOnChange = false

  /**
   * For usage in no edgecase, close to uncontrolled input scenarios that don't require performance tweaking.
   * Usefull for cases when you work with standard html input.
   * Return result shall be passed to an input as spreaded props.
   * @param model - model on which input will set value
   * @param property - property of model which will be updated
   * @param options - {@link InputUseOptions} different options where you can e.g. override validation behaviour
   *
   * @returns call returns following:
   * return values are subset of return of useForInput, that can be passed directly to native inputs.
   * - onChange - same as {@link onChangeEventHandler}, just takes event, gets it's value and passes to func that assigns
   * on model and runs default stuff like validation
   * - onBlur - if you specified options.validateOnBlur, validate func be run
   * - value - value from model.modelData[property]
   *
   * @example
   * ```
   * const userFormState = new UserFormState(new User())
   * const UserForm = () => {
   *   const formState = userFormState.use()
   *   const model = formState.model
   *
   *   return <input {...formState.makeNativeInputProps(model, 'firstName')}/>
   *   // value will be set from model.firstName
   *   // onChange will set model.firstName = event.target.value
   *   // default validation will run -
   * }
   * ```
   */
  makeNativeInputProps<T extends BaseModel>(
    model: T,
    property: Extract<keyof T, string>,
    options?: InputUseOptions
  ) {
    return {
      onChange: (e: ChangeEvent<any>) => {
        this.onChangeEventHandler(e, model, property, options)
      },
      onBlur: () => {
        if (options?.validateOnBlur) {
          this.runValidate(
            model,
            this.rootModel.modelData[property],
            property,
            options
          )
        }
      },
      value: model.modelData[property] ?? ''
    }
  }

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
          return model.validator.getFirstErrorFor(property)
        },
        getFirstError: () => {
          return model.validator.getFirstErrorFor(property)
        },
        onBlur: () => {
          if (options?.validateOnBlur) {
            this.runValidate(
              model,
              model.modelData[property],
              property,
              options
            )
          }
        },
        getValue: () => model.modelData[property]
      }
    }, [this, model])
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

  private runValidate<T extends BaseModel>(
    value: any,
    model: T,
    property: Extract<keyof T, string>,
    options?: InputUseOptions
  ) {
    if (options?.skipValidationOnChange) {
      // do nothing
    } else if (options?.validateFunc) {
      model.validator.handleValidationResult(
        property,
        options.validateFunc(value)
      )
    } else {
      if (!(model.validator as any)[property]) {
        console.warn(
          `no default validation function defined for property ${property} on ${model}.validator`
        )
      } else {
        ;(model.validator as any)[property]?.()
      }
    }
    if (this.validateAllOnChange) {
      this.validateAll()
    }
  }

  onValueChange<T extends BaseModel>(
    value: any,
    model: T,
    property: Extract<keyof T, string>,
    options?: InputUseOptions
  ) {
    model.modelData[property] = value
    this.runValidate(value, model, property, options)
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
    this.rootModel.validator.isValid()
  }

  abstract validateAll(update?: boolean): void
}
