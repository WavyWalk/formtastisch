import { FormModel } from './FormModel'
import { ModelValidator } from './validator/ModelValidator'
import { ValidationReturn } from '../validationfunctions/validate'

/**
 * any validation method in object flow accepts validationMeothods options:
 * all provided validation will be set on a created validator instance.
 *
 * Key is the name of a property on data, whenever it changes on input, form state will call this validation func on validator.
 *
 * The validation must at least accept value, and return a {@link ValidationReturn}. But whenever validator[validationMethod] will be called,
 * it will also pass a model and validator itself, so they are accessible.
 *
 * If you don't specify a validateDefault, all methods will be considered as default validations, and will be called on validator.validateDefault()
 *
 * you can specify which methods shall be validated by default, via:
 * validateDefault: ['nameOfSomeMethod', 'otherMethod']
 *
 * providing validateDefault, does not affect the validation methods so they still accessible on validator.
 *
 * @example basic:
 * ```
 * const model = makeFormModel(initialData: {firstName: '', 'email': ''},
 * validations: {
 *   firstName: (value) => validateIsRequired(value),
 *   email: (value) => validateIsRequired(value)
 * }}
 * model.errors // undefined
 * model.validator.firstName()
 * model.errors // {firstName: ['required']}
 * model.validator.validateDefault()
 * model.errors // {firstName: ['required'], email: ['required']}
 * model.email = 'foo'
 * model.firstName = 'bar'
 * model.validator.validateDefault()
 * model.errors // undefined
 * ```
 *
 * @example default methods:
 * ```
 * const model = makeFormModel(initialData: {firstName: '', 'email': ''},
 * validations: {
 *   firstName: (value) => validateIsRequired(value),
 *   email: (value) => validateIsRequired(value),
 *   validateDefault: ['firstName']
 * }}
 * model.errors // undefined
 * model.validator.validateDefault()
 * model.errors // {firstName: ['required']}
 * model.validator.email()
 * model.errors //  {firstName: ['required'], email: ['required']}
 * ```
 *
 * @example accessing model and validator in validation method:
 * ```
 * const model = makeFormModel(initialData: {firstName: '', 'email': ''},
 * validations: {
 *   firstName: (value) => validateIsRequired(value),
 *   email: (value, model, validator) => {
 *     console.log(model.firstName)
 *     validator.removeSpecificError('email', 'uncool')
 *     return validatePattern(regex, 'invalid email')
 *   }
 * }}
 * model.firstName = "joe"
 * model.errors // undefined
 * model.validator.addError('email', 'uncool')
 * model.errors // {email: 'uncool'}
 * model.email = 'invEmail'
 * model.validator.email() // consoles "joe" // removes 'uncool'
 * model.errors // {email: ['invalid email']}
 * // also anything in scope where initialized is accessible (if you use it there of course), so you can do pretty anything for custom use cases.
 * ```
 */
export type ValidationMethods<T> = {
  [id in keyof T]?: (
    value: T[id],
    model?: FormModel<T> & T,
    validator?: ModelValidator<FormModel<T>>
  ) => ValidationReturn
} & { validateDefault?: (keyof T | string)[] }

/**
 * arguments for "object flow", see {@link makeFormModel} {@link makeFormStateWithModel}
 */
export type MakeFormModelArgs<
  DATA_T,
  V_T extends ValidationMethods<DATA_T>,
  TAP_T
> = {
  initialData: DATA_T
  validations: V_T
  tap?: (data: DATA_T) => TAP_T
}
/**
 * @remarks This is the "non custom flow aka object flow", for using formtastisch.
 *
 * @remarks there is an object flow (aka makeFormModel and makeFormStateWithModel), and there is a custom flow, where you
 * extend the provided classes (FormModel, ModelValidator as well as FormState) and have a fine grained control over everything.
 *
 * Formtastisch follows SOLID principles and separates the
 * - data: representation what will be collected from user:
 *  Data is handled through a {@link FormModel}, it's a minimal, almost data only classes which will wrap the data, and have an
 * access to validators, and serving as container for errors, this what you will get as end result of a form.
 *
 * - validation: logic related to validating the data, holding errors etc.
 * Validations are handled throught {@link ModelValidator}, which knows how to validate a model, set/read errors from it.
 * - state: logic for controlling forms (aka binding data, validation and components with logic)
 * State is handled through {@link FormState} which controls the logic and orchestrates validation, updating data, and updating components.
 * - components: controlled by state, and producers of data. Just any component which will "use" the FormState.
 *
 * for more details explore in following order: {@link makeFormModel} {@link ValidationMethods}(this is args in here) {@link FormModel}, {@link ModelValidator} {@link FormState}
 *
 * @example basic usage is following:
 *```
 * // your initial data for the form. This can effectively be an empty object.
 * const initialData = { firstName: '', lastName: '' }
 * // this initializes the FormModel and FormState, returning instance of formState.
 * const formState = makeFormStateWithModel({
 *   initialData,
 *   // this will be the validation methods. Validation methods are accessible through formState.model.validator.${valiationMethod}
 *   // if you don't specify which validations are default, all validations provided here will be treated as default and will be called:
 *   // whenever formState.validateAll() or formState.model.validator.validateDefault() are called.
 *   // for details {@link ValidationMethods}
 *   validations: {
 *     // every validation method shall return {@link ValidationReturn},
 *     // here as well you cann access a model and validator, if you specify them in arg.
 *     firstName: (value) => validateIsRequired(value),
 *     lastName: (value) => validateIsRequired(value)
 *     // example how to access model and validator with custom validation func:
 *     // firstNameConfirmation: (value: string, model, validator) => {
 *     //   if (model.firstName !== model.firstNameConfirmation) {
 *     //     return {valid: false, errors: 'does not match'}
 *     //   } else {
 *     //     return {valid: true}
 *     //   }
 *
 *     // example how to specify which validation shall be run on formState.validateAll(), and model.validator.validateDefault()
 *     // if validateDefault no specified, every function provided in validations will be considered a default one
 *     // validateDefault: ['firstName] // lastName has to be validated manually, e.g. validator.lastName()
 *     //
 *     // naming is important and should correspond the name on data, later if you use formState.makeInputProps() or formState.useForInput(),
 *     // the validation method (if not overriden) will be called by property name
 *   }
 * })
 *
 *  export const NewTest: FC = () => {
 *   // this how component will be "wired"/subscribed to state. Effectively any component that calls formState.use(), or formState.useForInput()
 *   // will update whenever formState.update() is called.
 *   // use() accepts the options. for details @see FormState.use()
 *   // e.g. the killer thing is that you can have fine grained controls on updates, by specifying deps
 *   formState.use()
 *   // example if you want to only on firstName change. (beware that formtastisch is always controlled, so if input is not wrapped in child component, that also
 *   uses same state, it's value be not updated.)
 *   // example if you want that it's not updated (e.g. in case you extract inputs and submits to separate components that will use state, and only get updated on changes granulary)
 *   // formState.use({deps: () => []})
 *
 *   return (
 *     <div>
 *       // this will create a onChange and value props. Whenever value is changed it will run through:
 *       // will set value on model - basically (e) => formState.model[firstName] = e.target.value
 *       // formState.model.validator.firstName() - this will run the func you passed in validations under same name and set or remove errors
 *       // formState.update - so component is updated, a new value be passed to component - basically value=model[firstName]
 *       <input {...formState.makeInputProps('firstName')} />
 *       <input {...formState.makeInputProps('lastName')} />
 *       // makeInputProps are just defaults, more control can be achieved with e.g.:
 *       // <input
 *       //   placeHolder='coolnessLevel'
 *       //   value={model.value}
 *       //   error={model.validator.getFirstErrorFor('coolnessLevel')}
 *       //   onChange={(e) => {
 *       //     const value = e.target.value + 'dope' // do anything
 *       //     formState.onValueChange(value, model, 'coolnessLevel', {
 *       //         validate: (value) => {
 *       //             const valid = value === 'cool'
 *       //             return valid ? {valid: true} : {valid: false, errors: 'lame'}
 *       //         })
 *       //     }
 *       //   }}
 *       //   aria-invalid={!model.validator.isPropertyValid}
 *       ///>
 *       <p>{formState.model.firstName} {formState.model.lastName}</p>
 *
 *       <button
 *         onClick={() => {
 *           console.log(formState.isValid())
 *           // this serializes data to object and you can e.g. make a call to server
 *           console.log(formState.getData({includeErrors: true}))
 *           // if you need FormData / multipart
 *           // console.log(serializeObjectToFormData(formState.getData()))
 *           // formState.getData is effectively - modelToObject(model)
 *         }}
 *       >
 *         submit
 *       </button>
 *     </div>
 *   )
 * }
 *```
 * @example Writing custom input components, good defaults:
 * ```
 *   const MyInput = ({formState: FormState, model: FormModel, property}) => {
 *      // subscribe to state, so it updates, but notice that it does not use use()
 *      // useForInput is same as calling use({updateDeps: () => [
 *     //      model,
 *     //      model[property],
 *     //      model.validator.getFirstErrorFor(property)
 *     //    ]})
 *     // this way it ensures that this input only updates when things necessary for it will change
 *     // otherwise it will not rerendered.
 *      const controls = formState.useForInput(model, property)
 *      const {
 *        onValueChange, // raw value
 *        onChange, // any ChangeEvent // will just take value and call onValueChange
 *        getIsValid, // bool if model has no error for property
 *        getFirstError, // returns first errror if any for property
 *        onBlur, // if specified in options to validate on blur, will do it
 *        getValue, // value getter
 *      } = controls
 *      const error = getFirstError() // or don't destructure and keep neat controls.getFirstError()
 *      // why getters? you probly don't need all, and because we have a referential integrity this is more performant, and convenient.
 *      // all is memoized.
 *
 *      return <div>
 *        <p>property</p>
 *        <input value={getValue()} />
 *        {error ? 'all good' : error}
 *      </>
 *
 *      // as you can see you need everything to build any custom input. Anything that can give and take data.
 *      // <div>
 *      //   <RenderGoogleMaps coords={controls.getValue()}>
 *      //   <SomeCrazyCanvas onClick={(e) => {controls.onValueChange(e.coords)}>
 *      // </div>
 *
 *      // integration with any ui lib is a breeze.
 *   }
 *
 *   // usage see below
 *
 *
 * ```
 * @example writing custom inputs full control:
 * ```
 * const MyInput = ({formSate: FormState, model: FormModel, property: string}) => {
 *    // specify when component should update when form state updates
 *    // here we don't need e.g. to update when other stuff changes. We need to just (note: updates does not happen immediately
 *    when dep changes, but whenever state's update is called (comparison happens at that moment))
 *    formState.use({updateDeps: () => [
 *      model[property], // we track only own property for input
 *      model.validator.getFirstErrorFor(property). // we update if error changes so render it
 *      someCrazyLogicStuff // whatever you need when it changes so this input updates.
 *    ])
 *
 *    return <div>
 *      <input value={model.value} onChange={(e) => {
 *        // This is super important - formState.onValueChange is recommended because it does required default actions
 *        // this will update value on model, validate and update
 *        formState.onValueChange(e.target.value, model, property)
 *        // if you need fine grained control:
 *        // you could:
 *        const value = e.target.value
 *        model[property] = value
 *        doSomeCrazyShit()
 *        model.validator[property]()
 *        model.validator.someOtherValidation()
 *        // This will rerender components that use the form state (respecting their dependencies)
 *        // e.g. in this example updateing firstName will not rerender MyInput property=lastname
 *        // any time you need components to render, call formState.update()
 *        formState.update()
 *      }}/>
 *    </div>
 * }
 * ```
 *
 *
 * @param initialData
 * @param validations
 * @param tap
 */

export const makeFormModel = <
  DATA_T,
  V_T extends ValidationMethods<DATA_T>,
  TAP_T
>(
  options: MakeFormModelArgs<DATA_T, V_T, TAP_T>
) => {
  const { initialData, validations, tap } = options ?? {}
  const modelData = {
    ...initialData,
    ...tap?.(initialData)
  } as TAP_T extends undefined ? DATA_T : Omit<DATA_T, keyof TAP_T> & TAP_T

  const formModel = new FormModel(modelData) as FormModel<typeof modelData> &
    typeof modelData

  formModel.validator = new ModelValidator(formModel, validations)

  return formModel as typeof formModel & {
    validator: Record<keyof typeof validations, CallableFunction>
  }
}
