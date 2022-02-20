import {
  validateIsRequired,
  ModelValidator,
  FormModel,
  FormState
} from 'formtastisch'
import { useMemo } from 'react'
import * as React from 'react'

/**
 * although makeFormModel and makeFormStateWithModel cover most cases.
 * You can for better typing control and maintainability implement custom
 * models, validators and states
 */

/** this is how you create custom validator */
class UserValidator extends ModelValidator {
  declare model: UserFormModel

  // this with default is same as if youd pass makeFormModel({validations: {firstName, lastName}})

  firstName = (value: string) =>
    this.validateProperty('firstName', (value) => validateIsRequired(value))
  lastName = (value: string) =>
    this.validateProperty('lastName', (value) => validateIsRequired(value))

  defaultValidations = {
    firstName: this.firstName,
    lastName: this.lastName
  }
}

type CreateUserDto = {
  firstName: string
  lastName: string
}

/** this is how you create a custom form model */
class UserFormModel extends FormModel implements CreateUserDto {
  validator = new UserValidator(this)

  // this will be fed throgh contstructor
  firstName = ''
  lastName = ''

  // restrict type of constructor arg data
  constructor(data: CreateUserDto) {
    super(data)
  }
}

class UserFormState extends FormState {
  // will be set in constructor
  declare model: UserFormModel

  // you can, and even should as well extract logic to this state.
  // than you have clear methods, that control the logic and components just update.
  // in combination with use({updateDeps}) optimization, this gets super performant, as
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
  lastName: ''
}

export default function CustomModelValidatorAndState() {
  const formState = useMemo(
    () => new UserFormState(new UserFormModel(initialData)),
    []
  )
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
      {formState.showDetails ? (
        <div>
          <p>{JSON.stringify(formState.getData({ includeErrors: true }))}</p>
          <button
            className={'btn'}
            onClick={() => {
              formState.setShowDetails(false)
            }}
          >
            collapse data
          </button>
        </div>
      ) : (
        <button
          className={'btn'}
          onClick={() => {
            formState.setShowDetails(true)
          }}
        >
          show data
        </button>
      )}

      <button
        className={'btn'}
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
