import { makeFormStateWithModel, validateIsRequired } from 'formtastisch'
import { modelToObject } from 'formtastisch'
import * as React from 'react'

const formState = makeFormStateWithModel({
  initialData: { firstName: '', lastName: '' },
  validations: {
    firstName: (value) => validateIsRequired(value),
    lastName: (value) => validateIsRequired(value)
  }
})

export default function AccessingValuesAndErrors() {
  formState.use()
  // just shortut access to model data
  const model = formState.model

  return (
    <div>
      <input
        {...formState.makeInputProps('firstName')}
        placeholder="first name"
      />
      <input
        {...formState.makeInputProps('lastName')}
        placeholder="last name"
      />
      <p>firstName: {model.firstName}</p>
      <p>lastName: {model.lastName}</p>
      <p>
        errors:
        <br />
        {/* return all errors for property */}
        firstName: {model.errors?.firstName}
        <br />
        {/* same as model.errors?.['lastName'] */}
        lastName: {model.validator.getFirstErrorFor('lastName')}
      </p>
      {/* model holds everything */}
      <p>{JSON.stringify(modelToObject(model))}</p>
      <button
        className={'btn'}
        onClick={() => {
          console.log(formState.validate())
          console.log(model.errors)
          // getData is basically same as modelToObject(formState.model)
          console.log(formState.getData({ includeErrors: true }))
        }}
      >
        submit
      </button>
    </div>
  )
}
