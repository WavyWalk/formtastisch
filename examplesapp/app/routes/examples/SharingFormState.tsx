import {
  FormModel,
  FormState,
  makeFormStateWithModel,
  validateIsRequired
} from 'formtastisch'
import * as React from 'react'
import { RenderCount } from '../../utilcomponents/RenderCount'

const initialData = { firstName: '' }
const formState = makeFormStateWithModel({
  initialData,
  validations: {
    firstName: (value) => validateIsRequired(value)
  }
})
// for typescript users, in order to get a type of form state and all data
// you can just
type UserFormState = typeof formState

export default function SharingFormState() {
  return (
    <>
      {/* here we have two adjacent components that subscribed to same form state */}
      <FormWithChildren />
      <AdjacentComponentThatsAlsoSubScribed />
    </>
  )
}

function FormWithChildren() {
  // whenever form state updates, or formState.update() is called, the components that use it will update
  formState.use()

  return (
    <div className="flexrow componentSection">
      <input
        {...formState.makeInputProps('firstName')}
        placeholder="first name"
      />
      {/* look in implementation */}
      <PropertyData formState={formState} property="firstName" />
      <button
        onClick={() => {
          console.log(formState.validate())
        }}
      >
        submit
      </button>
    </div>
  )
}

function PropertyData({
  formState,
  property
}: {
  formState: UserFormState
  property: keyof UserFormState['model']
}) {
  // this will subscribe to changes
  formState.use()
  const model = formState.model
  const validator = model.validator
  const error = validator.getFirstErrorFor(property)

  return (
    <div className={'componentSection'}>
      <p>
        {property} data - I use form state so I will update whenever it updates
      </p>
      <p>
        {property}: {model[property]}
      </p>
      <p>{error && `error: ${error}`}</p>
    </div>
  )
}

// if your PO ever asks you "let's put errors from form in header", formtastisch got you covered without any contextes
function AdjacentComponentThatsAlsoSubScribed() {
  // this will subscribe to changes
  formState.use()
  const model = formState.model

  return (
    <div className="componentSection">
      <RenderCount />
      <p>
        EroorContainer - I am not child of form but use form state, so I will
        update whenever it updates
      </p>
      <p>errors: {model.errors ? JSON.stringify(model.errors) : 'no errors'}</p>
    </div>
  )
}
