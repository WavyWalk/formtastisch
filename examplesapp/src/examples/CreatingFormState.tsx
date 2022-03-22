import * as React from 'react'
import { makeFormStateWithModel } from 'formtastisch'
import { validateIsRequired, validatePattern } from 'formtastisch'
import { validateEquals } from 'formtastisch'
import { validateMinLength } from 'formtastisch'

/**
 * there are multiple ways to initialize form state
 * 1. Easy - very dynamic approach for quick cases, with ad hoc validations. It's untyped and less "encapsulated"  (but it's just a matter of preference)
 * 2. Standard - recommended approach where you specify types and initialData, as well as validations
 * 3. Custom - recommended approach if you have some heavy logic related to form or user input flow (example for this you will find at CustomModelValidatorAndState)
 */

export function CreatingFormState() {
  return (
    <div>
      <EasyFlow />
      <StandardFlow />
    </div>
  )
}

// easy flow

// here we are super dynamic and use "adhoc" validations
const easyState = makeFormStateWithModel()

function EasyFlow() {
  easyState.use()

  return (
    <div className="componentSection">
      <p>easy flow</p>
      <input
        // notice that we use adhoc validation. Whenever you provide an options.validate, in methods
        // that accept UseInputOptions, e.g. this one, this validation will be registered on validator,
        // and will be added to default validations
        // it will validate both on input and on state.validate() just as you would specified it in standard flow
        {...easyState.makeInputProps('name', {
          validate: (value) => validateMinLength(value, 2),
        })}
        placeholder="email"
      />
      <input
        {...easyState.makeInputProps('email', {
          validate: (value) => validateIsRequired(value),
        })}
        placeholder="email"
      />
      <button
        onClick={() => {
          easyState.validate()
          console.log(easyState.model)
        }}
      >
        submit easy
      </button>
    </div>
  )
}

// standart flow. here we use different options so you will see different use cases.
// normally it's just as easy flow, but with specified data and validations.

const standardState = makeFormStateWithModel({
  // will be used to populate initial data. This data will be used for typing as well
  initialData: {
    name: 'joe',
    email: '',
    password: '',
    passwordConfirmation: '',
  },
  // specify validations. By convention method that validates a property must be named same as property that it validates
  validations: {
    name: (value) => validateIsRequired(value),
    email: (value) => validatePattern(value, /^\S+@\S+\.\S+$/),
    password: (value) => validateIsRequired(value),
    passwordConfirmation: (value, model, validator) => {
      return validateEquals({ value, toMatchWith: model!.password })
    },
    // will validate only name and email on formState.validate()
    // if this not provided all will be considered default and everything will be validated on formState.validate()
    validateDefault: ['name', 'email'],
  },
  // this yields data and and you can override here the properties. The returned object,
  // will be merged with the data (this will be usefull later for nested data, or if you need to transform it in any way)
  tap: (data) => {
    return { email: 'someEmail' }
  },
})

export function StandardFlow() {
  standardState.use()
  const model = standardState.model
  const errors = standardState.model.errors

  return (
    <div className="componentSection">
      <p>standard flow</p>
      <input
        {...standardState.makeInputProps('name', {
          // we can as well pas the options, e.g. this will run after any onChange is called and after the
          // property is asigned and validated
          additionallyOnChange: () => {
            // will validate on each name change only methods specified in default during initialization
            standardState.validate()
          },
        })}
      />
      <input {...standardState.makeInputProps('email')} placeholder="email" />
      <input
        {...standardState.makeInputProps('password', {
          additionallyOnChange: () => {
            model.validator.passwordConfirmation()
          },
        })}
        placeholder="password"
      />
      <input
        value={model.passwordConfirmation}
        onChange={(e) => {
          console.log('custom on change handler')
          // here we use onValueChange that accepts raw value without wrapped event
          standardState.onValueChange(
            e.target.value,
            model,
            'passwordConfirmation'
          )
        }}
        placeholder="passwordConfirmation"
      />
      <p>errors: {errors && JSON.stringify(errors)}</p>
      <button
        onClick={() => {
          // beacause we limited default validations , but we want still validate all,
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
          standardState.update()
        }}
      >
        submit
      </button>
      <button
        onClick={() => {
          // here we do some logic, e.g. copy password to confirmation
          model.passwordConfirmation = model.password
          model.validator.passwordConfirmation()
          // above will not trigger an update, we have to explictly call it.
          standardState.update()
        }}
      >
        copy password to confirmation
      </button>
    </div>
  )
}
