import {
  FormModel,
  FormState,
  makeFormStateWithModel,
  IsolateInput
} from 'formtastisch'
import type { InputUseOptions } from 'formtastisch'
import { validateMinLength } from 'formtastisch'
import * as React from 'react'
import { RenderCount } from '~/utilcomponents/RenderCount'

/**
 * in this example we will create a benchmark with thousand controlled inputs.
 * each component has an input counter so you will see what and how much renders.
 * as  well we will validate all on submit
 */

export default function ThousandControlledInputs() {
  // we don't need parent to rerender, so empty deps, no rerender
  formState.use(() => [])

  return (
    <div className="componentSection pt-3">
      <RenderCount />
      {fields.map((field: string) => (
        <IsolateInput key={field} formState={formState as any} property={field}>
          {({ onChange, value, getFirstError }) => (
            <div className="componentSection">
              <RenderCount />
              <label>{field}</label>
              <input type="text" value={value} onChange={onChange} />
              {getFirstError() && (
                <p className="inputError">{getFirstError()}</p>
              )}
            </div>
          )}
        </IsolateInput>
      ))}
      <button
        className="btn"
        onClick={() => {
          formState.validate()
          console.log(formState.model.errors)
        }}
      >
        submit
      </button>
    </div>
  )
}

/**
 * first we create a wrapped input, so only it updates when it's data changes
 */
const OurInput: React.FC<{
  formState: FormState
  model: FormModel
  property: string
}> = ({ formState, model, property }) => {
  // reminder useForInput is same as .use but with dependencies and returns controls for input
  const controls = formState.useForInput(model, property as any)
  const error = controls.getFirstError()

  return (
    <div className="componentSection">
      <RenderCount />
      <label>{property}</label>
      <input
        type="text"
        value={controls.getValue() as any}
        onChange={controls.onChange}
      />
      {error && <p className="inputError">{error}</p>}
    </div>
  )
}

/** create an initialData and validations for each field
 * here we just prepare
 * {
 *   initialData: {[for key in 1000]: ''}
 *   validations: {
 *     [for key in 100]: (value) => validateMinLength(value,)
 *   }
 * }
 */
const fields = new Array(1000)
  .fill(undefined)
  .map((_, index) => `field${index}`)
const [initialData, validations] = fields.reduce<any[]>(
  ([initialData, validations], value) => {
    initialData[value] = ''
    validations[value] = (value: string) => {
      return validateMinLength(value, 2)
    }
    return [initialData, validations]
  },
  [{}, {}]
)

/**
 * initialize formState
 */
const formState = makeFormStateWithModel({
  initialData,
  validations
}) as FormState // we cast because fields are created in loop
