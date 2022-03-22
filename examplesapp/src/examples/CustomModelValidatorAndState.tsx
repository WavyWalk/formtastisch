import {
  validateIsRequired,
  ModelValidator,
  FormModel,
  FormState,
  makeFormModel,
} from 'formtastisch'
import { useMemo } from 'react'
import * as React from 'react'

/**
 * although makeFormModel and makeFormStateWithModel cover most cases.
 * You can for better typing control and maintainability implement custom
 * models, validators and states
 */

const userModel = makeFormModel({
  initialData: {
    firstName: '',
    lastName: '',
  },
  validations: {
    firstName: (value) => validateIsRequired(value),
    lastName: (value) => validateIsRequired(value),
  },
})

class UserFormState extends FormState {
  // will be set in constructor
  model: typeof userModel

  // you can, and even should as well extract logic to this state.
  // than you have clear methods, that control the logic and components just update.
  // in combination with use({deps: () => [dependency]}) | () => [dependency]}  optimization, this gets super performant, as
  // components do not recieve data from props or from context bu read it directly
  // e.g. this state can without context be used in any even non related components.
  // the lower down you extract and the smaller your components that use() state, with smaller deps
  // the more performant it gets.
  showDetails = false
  setShowDetails = (value: boolean) => {
    this.showDetails = value
    this.update()
  }
}

const initialData = {
  firstName: '',
  lastName: '',
}

export function CustomModelValidatorAndState() {
  const formState = useMemo(() => new UserFormState(userModel), [])
  // don't forget to use otherwise, components will not update with data.
  formState.use()

  return (
    <div className="componentSection">
      <input
        {...formState.makeInputProps('firstName')}
        placeholder="first name"
      />
      <input
        {...formState.makeInputProps('lastName')}
        placeholder="last name"
      />
      <ShowDetails formState={formState} />
      <button
        onClick={() => {
          console.log(formState.validate())
          console.log(formState.isValid())
          console.log(formState.model)
        }}
      >
        submit
      </button>
    </div>
  )
}

const ShowDetails: React.FC<{ formState: UserFormState }> = ({ formState }) => {
  formState.use((state) => [state.showDetails])

  return formState.showDetails ? (
    <div>
      <p>{JSON.stringify(formState.getData({ includeErrors: true }))}</p>
      <button
        onClick={() => {
          formState.setShowDetails(false)
        }}
      >
        collapse data
      </button>
    </div>
  ) : (
    <button
      onClick={() => {
        formState.setShowDetails(true)
      }}
    >
      show data
    </button>
  )
}
