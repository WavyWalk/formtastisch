import {
  makeFormStateWithModel,
  validateIsRequired,
  validateEquals,
  chainValidations,
} from 'formtastisch'
import {
  validateMaxLength,
  validateMinLength,
  validatePattern,
} from 'formtastisch'
import * as React from 'react'

const initialData = {
  required: '',
  pattern: '',
  minLength: '',
  maxLength: '',
  matches: '',
  multiple: '',
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
    matches: (value) =>
      validateEquals({ value, toMatchWith: 'hello' }, 'errors.notHello'),
    // chaining
    multiple: (value) =>
      chainValidations(
        () => validateIsRequired(value),
        () => validateMinLength(value, 2, 'error.minLength.2'),
        () => validateMinLength(value, 4, 'error.minLength.4')
      ),
  },
})

export function IncludedValidations() {
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

      <pre>
        {JSON.stringify(
          formState.model.toObject({ includeErrors: true }),
          null,
          2
        )}
      </pre>
    </div>
  )
}
