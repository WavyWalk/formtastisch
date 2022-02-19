import * as React from 'react'
import { makeFormStateWithModel } from 'formtastisch'
import { validateIsRequired, validatePattern } from 'formtastisch'
import { validateMatches } from 'formtastisch'

const formState = makeFormStateWithModel({
  initialData: {
    name: 'joe',
    email: '',
    password: '',
    passwordConfirmation: ''
  },
  validations: {
    name: (value) => validateIsRequired(value),
    email: (value) => validatePattern(value, /^\S+@\S+\.\S+$/),
    password: (value) => validateIsRequired(value),
    passwordConfirmation: (value, model, validator) => {
      return validateMatches({ value, toMatchWith: model!.password })
    },
    // will validate only name and eamil on formState.validate()
    // if not provided all will be considered default
    validateDefault: ['name', 'email']
  }
})

export default function CreatingFormState() {
  formState.use()
  const errors = formState.rootModel.errors

  return (
    <div className="componentSection">
      <input
        {...formState.makeInputProps('name', {
          additionallyOnChange: () => {
            // will only validate on each name change, only methods specified in default will run
            formState.validate()
          }
        })}
      />
      <input {...formState.makeInputProps('email')} placeholder="email" />
      <input {...formState.makeInputProps('password')} placeholder="password" />
      <input
        {...formState.makeInputProps('passwordConfirmation')}
        placeholder="passwordConfirmation"
      />
      <p>errors: {errors && JSON.stringify(errors)}</p>
      <button
        onClick={() => {
          formState.rootModel.validator.password()
          formState.rootModel.validator.passwordConfirmation()
          formState.validate()
        }}
      >
        submit
      </button>
    </div>
  )
}
