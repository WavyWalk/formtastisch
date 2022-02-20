import {
  FormModel,
  FormState,
  makeFormStateWithModel,
  validateMinLength
} from 'formtastisch'
import type { BaseInputProps } from 'formtastisch'
import * as React from 'react'
import { RenderCount } from '~/utilcomponents/RenderCount'

/**
 * Actually strength of formtastisch is its straitforward state management capability
 * You just specify the data, on which components rely, and thus you dont get unnecessary rerenders.
 * as well you don't need any context, so update do not affect children.
 *
 * here each component as well will show the render count, so you can see what gets updated
 */

const initialData = { firstName: '', lastName: '' }
const formState = makeFormStateWithModel({
  initialData,
  validations: {
    firstName: (value) => validateMinLength(value, 3),
    lastName: (value) => validateMinLength(value, 3)
  }
})

export default function OptimizingRerenders() {
  // controlling on which data components depend is easy,
  // just provide them as an arg to use, empty [] means that component will NOT render on state changes
  formState.use({ updateDeps: () => [] })

  return (
    <div className="componentSection">
      <RenderCount />
      <MyInput
        formState={formState}
        model={formState.model}
        property="firstName"
      />
      <MyInput
        formState={formState}
        model={formState.model}
        property="lastName"
      />
      <SubmitGroup formState={formState} />
    </div>
  )
}

/**
 * first you need to extract inputs so they're not coupled with a parent
 * note: generic needed just for typing, it can be omitted
 */
function MyInput<T extends FormModel>({
  formState,
  model,
  property
}: BaseInputProps<T>) {
  // use for input will use use() behind the scenes and will dep the model, property and errors for property
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

/**
 * as well extract something that can be moved from parent and updated separately
 */
function SubmitGroup({ formState }: { formState: FormState }) {
  formState.use({ updateDeps: (state) => [state.isValid({ validate: false })] })

  const active = formState.touched
    ? formState.isValid({ validate: false })
      ? 'can submit'
      : 'can not submit'
    : 'can not submit'

  return (
    <div className="componentSection">
      <RenderCount />
      <button>button. {active}</button>
    </div>
  )
}
