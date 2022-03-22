import {
  FormModel,
  makeFormStateWithModel,
  validateIsRequired,
  ModelValidator,
  FormState,
} from 'formtastisch'
import { useMemo } from 'react'
import * as React from 'react'

/**
 * because makeFormStateWithModel has dyncamic initialization, you need to do some typing if you want to pass
 * it around
 *
 * just hover with pressed control/option over vars to see types
 *
 * Even for dynamic cases formtastisch tries to be typesafe and you will have a good typing and autocompletion
 */

/**
 * good practice is to have an interface for your data:
 */
type CreateUserDto = {
  firstName: string
  lastName: string
}

const initialData: CreateUserDto = { firstName: '', lastName: '' }

const formState = makeFormStateWithModel({
  initialData,
  validations: {
    firstName: (value) => validateIsRequired(value),
    lastName: (value) => validateIsRequired(value),
  },
})

/** you can extrac types like this */
type UserFormState = typeof formState
type UserFormModel = UserFormState['model']
// if you have nested models you could type them as well like this
// e.g. type AccountFormModel = UserFormModel['account']

/**
 * or better move initialization to a function
 */
const createUserForm = (initialData: CreateUserDto) => {
  return makeFormStateWithModel({
    initialData,
    validations: {
      firstName: (value) => validateIsRequired(value),
      lastName: (value) => validateIsRequired(value),
    },
  })
}
/** type for factory func can be extracted via */
type UserFormStateRecommended = ReturnType<typeof createUserForm>
type UserFormDataRecommended = UserFormStateRecommended['model']

// IMPORTANT
// if you do not have validations just initialize it with empty object, otherwise compiler will complain.
const anotherState = makeFormStateWithModel({
  initialData: { name: '' },
  // even if don't have provide empty for typing
  validations: {},
})

export function CorrectlyTypingFormStateAndData() {
  const userState = useMemo(() => createUserForm(initialData), [])
  // don't forget to subscribe component
  userState.use()

  return (
    <div>
      <p>see source code for this example</p>
      <input
        {...userState.makeInputProps('firstName')}
        placeholder="first name"
      />
      <input {...userState.makeInputProps('lastName')} placeholder="lastName" />
      <p>{JSON.stringify(userState.getData({ includeErrors: true }))}</p>
    </div>
  )
}
