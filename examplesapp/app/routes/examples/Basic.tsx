import { makeFormStateWithModel, validateIsRequired } from 'formtastisch'
import { modelToObject } from 'formtastisch'
import * as React from 'react'

const initialData = { firstName: '', lastName: '' }

const formState = makeFormStateWithModel({
  initialData,
  validations: {
    firstName: (value) => validateIsRequired(value),
    lastName: (value) => validateIsRequired(value)
  }
})

export default function BasicExample() {
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
      <p>{JSON.stringify(formState.getData({ includeErrors: true }))}</p>
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
