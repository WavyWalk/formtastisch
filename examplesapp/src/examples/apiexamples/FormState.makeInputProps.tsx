import {
  makeFormStateWithModel,
  validateIsRequired,
  makeFormModel,
} from 'formtastisch'
import * as React from 'react'

/** FormState.makeInputProps and FormState.makeInputPropsForModel */

const formState = makeFormStateWithModel({
  initialData: { firstName: '', lastName: '', email: '' },
  validations: {
    firstName: (value) => validateIsRequired(value),
    lastName: (value) => validateIsRequired(value),
  },
  tap: () => {
    return {
      address: makeFormModel({
        initialData: { street: '' },
        validations: {},
      }),
    }
  },
})

export function FormStateMakeInputProps() {
  formState.use()
  const user = formState.model
  const address = user.address

  return (
    <div className="componentSection">
      {/** will create an onChange and value */}
      <input
        {...formState.makeInputProps('firstName')}
        placeholder="first name"
      />
      {/** make input props has options */}
      <input
        {...formState.makeInputProps('lastName', {
          additionallyOnChange: () => {
            console.log('will run additionally')
          },
          skipValidationOnChange: false, // if true will not validate on change,
          validateOnBlur: true, // will validate when input is blurred instead of on change
        })}
        placeholder="last name"
      />
      {/** you can have a full controll on handling, how to set a value, when to validate and when to update state. */}
      {/** make input props has options */}
      <input
        {...formState.makeInputProps('email', {
          // notice that we didn't provide validation during formState init.
          // we can use ad hoc validations as well by passing it to options.
          // once ad hoc validation is used it would be added to default validations.
          validate: (value) => validateIsRequired(value),
        })}
        placeholder="email"
      />

      {/** makeInputPropsForModel behaves exactly like makeInputProps but for specified model.
       * it accepts same options as makeInputProps
       */}
      <input
        {...formState.makeInputPropsForModel(address, 'street')}
        placeholder="Street"
      />

      <pre>
        {JSON.stringify(formState.getData({ includeErrors: true }), null, 2)}
      </pre>
      <button
        onClick={() => {
          console.log(formState.makeInputProps('firstName'))
        }}
      >
        log returns
      </button>
    </div>
  )
}
