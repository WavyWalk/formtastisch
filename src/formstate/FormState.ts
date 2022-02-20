import { SubscriptionState } from '../subscriptionstate'
import { ChangeEvent, useMemo } from 'react'
import { FormModel } from '../formmodel/FormModel'
import { modelToObject } from '../formmodel/modelToObject'
import { InputUseOptions } from './InputUseOptions'
import { UseForInputReturns } from './UseForInputReturns'

type FormStateValidateArgs<T extends FormState> = {
  validateNested?: true
  update?: boolean
  methods?: Parameters<T['model']['validator']['validate']>[0][]
}

/**
 * instances of this class will be responsible for managing logic and binding Models Validators and components together.
 * For relevant usages refer to {@link makeFormStateWithModel} and {@link makeFormModel}
 *
 */
export class FormState<
  T extends FormModel = FormModel & Record<string, any>
> extends SubscriptionState {
  /**
   * if any managed property was at least once updated, will become true.
   * used for logic to specify identify if user started using the form.
   * @remark this is wired if model gets updated through {@link onValueChange} or {@link onChangeEventHandler} or on change handlers, returned by useForInput()
   */
  touched = false

  /**
   * every form state has one root model. Root model is instance of {@link FormModel}
   * nested models can reside as well on root model.
   */
  model: T

  constructor(model: T) {
    super()
    this.model = model
  }

  /**
   * creates props for inputs for root model. For details refer to {@link makeInputPropsForModel}
   * @param property - managed property
   * @param options - {@see InputUseOptions}
   */
  makeInputProps = (
    property: keyof this['model'],
    options?: InputUseOptions
  ) => {
    return this.makeInputPropsForModel(this.model, property as any, options)
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
            (this.model as any)[property],
            property as any,
            options
          )
        }
      },
      value: (model as any)[property] ?? ''
    }
  }

  /**
   * For usage in custom input wrappers, input/ui lib adaptations.
   * This method calls use() behind the scenes and subscribes to formState changes.
   * But it will not update on every change but only when stuff relevant to property is changed.
   *
   * Call will also return a set of controls you can pass to input components like getValue(), onChange() on valueChange()
   * and etc.
   *
   * @example usage in custom input wrapper:
   * ```
   * const MyInput: React.FC<{
   *  formState: FormState
   *  model: FormModel
   *  property: string
   *}> = ({ formState, model, property }) => {
   *  // call use() with update dependencies, so updates only on relevant changes
   *  const controls = formState.useForInput(model, property)
   *  const error = controls.getFirstError()
   *
   * return (
   *   <div className="componentSection">
   *     <input
   *       type="text"
   *        value={controls.getValue() as any}
   *        onChange={controls.onChange}
   *      />
   *      {error && <p className="inputError">{error}</p>}
   *      <button onClick={() => console.log(controls)}>
   *        log useInput controls
   *      </button>
   *    </div>
   *  )
   *}
   *
   * ```
   *
   * @param model - model to wired
   * @param property - property of model
   * @param options - {@link InputUseOptions}
   *
   * @remark all returned properties are getter functions. This was done due to perf reasons.
   * @returns onChange - handler for wrapped in ChangeEvent value, will get the value and pass to same onValueChange
   * @returns onValueChange - this is handler for raw value non event wrapped value, it is important to update through it
   * because it runs some additional logic, and updates the state.
   * @returns getIsValid - if property on model is valid
   * @returns getFirstError - string if any for first error
   * @returns getValue - value on model for property
   */
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

  /**
   * makes a changeEvent handler for updating model proeprty
   */
  makeOnChangeHandler = <T extends FormModel>(
    model: T,
    property: Extract<keyof T, string>,
    options?: InputUseOptions
  ) => {
    return (e: ChangeEvent<any>) => {
      this.onChangeEventHandler(e, model, property, options)
    }
  }

  /**
   * validates the property.
   */
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

  /**
   * This is primary method to update the property on model from input. Other on change methods, call this anyway.
   * @param value - new value that be set
   * @param model - model on which value be set
   * @param property - property to update value on
   * @param options.validate - optional validation method to use instead of default one. If not provided, the validation
   * method with same name as property be called on validator.
   * @param options.skipValidationOnChange - skips validation
   * @param options.additionallyOnChange - any function that will be run after property is updated and validated.
   * @param options.validateOnBlur - prevents immediate validation after assignment, and runs it on blur instead
   */
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

  /**
   * will unwrap events value and pass it to {@link onValueChange}
   */
  onChangeEventHandler = <T extends FormModel>(
    e: ChangeEvent<any>,
    model: T,
    property: Extract<keyof T, string>,
    options?: InputUseOptions
  ) => {
    this.onValueChange(e.target.value, model, property, options)
  }

  /**
   * will validate depending on options either all default validations, or passed in options.methods list of methods.
   * this method calls {@link ModelValidator.validate} or {@link ModelValidator.validateDefault}, so see them for details.
   * @param options.methods - if specified will only run methods specified, otherwise will run default validations on validator.
   * @param options.validateNested - true by default and used for case where no options.methods are provided. Specifies for validator
   * if nested data shall as well be validator.validateDefault on them.
   * @param options.update - true by default, if true will as well update state, so components be synced.
   */
  validate(
    options: FormStateValidateArgs<this> = {
      validateNested: true,
      update: true
    }
  ) {
    if (options.methods) {
      this.model.validator.validate(...options.methods)
    } else {
      this.model.validator.validateDefault(options.validateNested)
    }
    if (options?.update === undefined || options?.update === true) {
      this.update()
    }
    return this.model.validator.isValid()
  }

  /**
   * calls isValid on validator {@see ModelValidator.isValid}.
   * @param options.validate - optional if true, will as well call {@link FormState.validate}
   */
  isValid(options?: { validate: boolean }) {
    if (options?.validate) {
      this.validate()
    }
    return this.model.validator.isValid()
  }

  /**
   * returns serialized root model (including nested data) to object.
   * @see modelToObject
   * @param options - same as args for {@link modelToObject}
   */
  getData(options?: Parameters<typeof modelToObject>[1]) {
    return modelToObject(this.model, options)
  }
}
