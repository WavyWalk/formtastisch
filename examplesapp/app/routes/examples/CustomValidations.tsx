import type { ValidationReturn } from 'formtastisch'
import { makeFormStateWithModel } from 'formtastisch'
import * as React from 'react'
/**
 * custom validations are super easy to do and customise. In fact I added some validations just in order
 * it does not look empty :D
 *
 *
 * to make a validation function just do:
 * any function that returns a ValidationReturn type, - {valid: boolean, errors?: string | string[]}
 *
 * and it immediately can be used as validation in formtastisch
 *
 * @remark
 * important
 * if you return an arrray of errors they replace all errors for property
 * if only one string returned, it will not affect the other errors for same property. This is for cases where you have multiple errors for one property in this case just return an array so it's always the most recent one.
 * errors are identified by message.
 */
const validateCoolness = (value: any): ValidationReturn => {
  if (value && !value?.includes('cool')) {
    return { valid: false, errors: 'uncool' }
  }
  return { valid: true }
}

/**
 * you can also access a model an a validator, because they will always be supplied as 2nd and 3d arguments
 * types you can of course specify, anyies are for brevity.
 *
 * important: if you have complex value, e.g. array don't splat and pass it as first arg anyways
 */
const validateSameAsUserName = (
  value: any,
  model: any,
  validator: any
): ValidationReturn => {
  if (value !== model.userName) {
    return { valid: false, errors: 'doe not match username' }
  }
  return { valid: true }
}

type User = {
  userName?: string
  confirmation?: string
}

const initialData: User = {}

const formState = makeFormStateWithModel({
  initialData,
  validations: {
    userName: validateCoolness,
    confirmation: validateSameAsUserName
  }
})

export default function CustomValidations() {
  formState.use()
  const errors = formState.model.errors

  return (
    <div className="componentSection">
      <input {...formState.makeInputProps('userName')} />
      <input {...formState.makeInputProps('confirmation')} />
      <p>errors: {errors && JSON.stringify(errors)}</p>
      <button
        className={'btn'}
        onClick={() => {
          formState.validate()
        }}
      >
        check coolness
      </button>
    </div>
  )
}
