import * as React from 'react'
import { makeFormStateWithModel } from 'formtastisch'
import { validateIsRequired, validatePattern } from 'formtastisch'
import { validateEquals } from 'formtastisch'

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
      return validateEquals({ value, toMatchWith: model!.password })
    },
    // will validate only name and eamil on formState.validate()
    // if not provided all will be considered default
    validateDefault: ['name', 'email']
  },
  // this yields data and and you can override here the properties. The returned object,
  // will be merged with the data (this will be usefull later for nested data, or if you need to transform it in any way)
  tap: (data) => {
    return { email: 'someEmail' }
  }
})

export default function CreatingFormState() {
  formState.use()
  const model = formState.model
  const errors = formState.model.errors

  return (
    <div className="componentSection">
      <input
        {...formState.makeInputProps('name', {
          additionallyOnChange: () => {
            // will validate on each name change only methods specified in default during initialization
            formState.validate()
          }
        })}
      />
      <input {...formState.makeInputProps('email')} placeholder="email" />
      <input
        {...formState.makeInputProps('password', {
          additionallyOnChange: () => {
            model.validator.passwordConfirmation()
          }
        })}
        placeholder="password"
      />
      <input
        value={model.passwordConfirmation}
        onChange={(e) => {
          console.log('custom on change handler')
          formState.onValueChange(e.target.value, model, 'passwordConfirmation')
        }}
        placeholder="passwordConfirmation"
      />
      <p>errors: {errors && JSON.stringify(errors)}</p>
      <button
        className={'btn'}
        onClick={() => {
          // if beacause we limited default validations , but we want still validate all,
          // we can either call them one by one or do
          model.validator.validate(
            'name',
            'email',
            'password',
            'passwordConfirmation'
          )
          // formState.validate() basically calls validateDefault on model and updates.
          // but because we now controll, in order that components and state are synced, we need to
          // explicitly call update.
          formState.update()
        }}
      >
        submit
      </button>
      <button
        onClick={() => {
          model.passwordConfirmation = model.password
          model.validator.passwordConfirmation()
          formState.update()
        }}
      >
        copy password to confirmation
      </button>
    </div>
  )
}
