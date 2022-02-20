import {
  makeFormStateWithModel,
  validateIsRequired,
  validateEquals
} from 'formtastisch'
import {
  validateMaxLength,
  validateMinLength,
  validatePattern
} from 'formtastisch'
import * as React from 'react'

const initialData = {
  required: '',
  pattern: '',
  minLength: '',
  maxLength: '',
  matches: '',
  multiple: ''
}

// example usage with included validations
// they are mostly there to serve as reference, although they cover most cases,
// it's really easy to do custom ones
const formState = makeFormStateWithModel({
  initialData,
  validations: {
    required: (value) => validateIsRequired(value),
    pattern: (value) => validatePattern(value, /.+@[^@]+\.[^@]{2,}$/),
    minLength: (value) => validateMinLength(value, 3),
    maxLength: (value) => validateMaxLength(value, 5, 'tooShort'),
    matches: (value) => validateEquals({ value, toMatchWith: 'hello' }),
    // chaining and custom
    multiple: (value) => {
      let result = validateIsRequired(value)
      if (result.valid) {
        result = validateMinLength(value, 2)
      }
      if (result.valid) {
        result = { valid: value === 'foo', errors: 'notFoo' }
      }
      return { ...result, errors: result.errors }
    }
  }
})

export default function IncludedValidations() {
  formState.use()
  // just validate without update of components, because it runs before render we anyway will have access to result
  formState.validate({ update: false })

  return (
    <div className="componentSection">
      <input {...formState.makeInputProps('required')} placeholder="required" />
      <input {...formState.makeInputProps('pattern')} placeholder="pattern" />
      <input
        {...formState.makeInputProps('minLength')}
        placeholder="minLength"
      />
      <input
        {...formState.makeInputProps('maxLength')}
        placeholder="maxLength"
      />
      <input {...formState.makeInputProps('matches')} placeholder="matches" />
      <input {...formState.makeInputProps('multiple')} placeholder="multiple" />

      <p>{JSON.stringify(formState.getData({ includeErrors: true }))}</p>
    </div>
  )
}
