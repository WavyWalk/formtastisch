import { SubscriptionState } from '../subscriptionstate'
import { ChangeEvent, useMemo } from 'react'
import { FormModel } from '../formmodel/FormModel'
import { modelToObject } from '../formmodel/modelToObject'
import { InputUseOptions } from './InputUseOptions'
import { UseForInputReturns } from './UseForInputReturns'

export class FormState<
  T extends FormModel = FormModel
> extends SubscriptionState {
  touched = false
  validateAllOnChange = false

  constructor(public rootModel: T) {
    super()
    this.rootModel = rootModel
  }

  makeInputProps = (
    property: keyof this['rootModel'],
    options?: InputUseOptions
  ) => {
    return this.makeInputPropsForModel(this.rootModel, property as any, options)
  }

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
  makeInputPropsForModel<T extends FormModel>(
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
            (this.rootModel as any)[property],
            property as any,
            options
          )
        }
      },
      value: (model as any)[property] ?? ''
    }
  }

  useForInput<T extends FormModel>(
    model: T,
    property: Extract<keyof T, string>,
    options?: InputUseOptions
  ): UseForInputReturns<T> {
    this.use({
      updateDeps: () => [
        model,
        model[property],
        model.validator.getFirstErrorFor(property as any)
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
          return !!model.validator.getFirstErrorFor(property as any)
        },
        getFirstError: () => {
          return model.validator.getFirstErrorFor(property as any)
        },
        onBlur: () => {
          if (options?.validateOnBlur) {
            this.runValidate(model, (model as any)[property], property, options)
          }
        },
        getValue: () => model[property]
      }
    }, [this, model])
  }

  makeOnChangeHandler = <T extends FormModel>(
    model: T,
    property: Extract<keyof T, string>,
    options?: InputUseOptions
  ) => {
    return (e: ChangeEvent<any>) => {
      this.onChangeEventHandler(e, model, property, options)
    }
  }

  private runValidate<T extends FormModel>(
    value: any,
    model: T,
    property: Extract<keyof T, string>,
    options?: InputUseOptions
  ) {
    if (options?.skipValidationOnChange) {
      // do nothing
    } else if (options?.validate) {
      model.validator.handleValidationResult(
        property as any,
        options.validate(value)
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
  }

  onValueChange<T extends FormModel>(
    value: any,
    model: T,
    property: Extract<keyof T, string>,
    options?: InputUseOptions
  ) {
    model[property] = value
    this.runValidate(value, model, property, options)
    options?.additionallyOnChange?.()
    this.touched = true
    this.update()
  }

  onChangeEventHandler = <T extends FormModel>(
    e: ChangeEvent<any>,
    model: T,
    property: Extract<keyof T, string>,
    options?: InputUseOptions
  ) => {
    this.onValueChange(e.target.value, model, property, options)
  }

  validate(validateNested = true, update = true) {
    this.rootModel.validator.validateDefault(validateNested)
    if (update) {
      this.update()
    }
    return this.rootModel.validator.isValid()
  }

  isValid(options: { validate: boolean }) {
    if (options?.validate) {
      this.validate()
    }
    return this.rootModel.validator.isValid()
  }

  getData(options?: Parameters<typeof modelToObject>[1]) {
    return modelToObject(this.rootModel, options)
  }
}
