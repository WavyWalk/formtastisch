import { makeFormStateWithModel, validateIsRequired } from 'formtastisch'

/**
 * prepopulate with form data.
 */
const initialData = {
  firstName: '',
  lastName: ''
}

/** initialize the state */
const formState = makeFormStateWithModel({
  initialData,
  validations: {
    /** validation that will be used for form, by convention, they are named as properties on data */
    firstName: (value) => validateIsRequired(value),
    lastName: (value) => validateIsRequired(value)
  }
})

export default function BasicExample() {
  /** use the form state so component subscribes to changes and gets rendered on state updates */
  formState.use()
  const user = formState.rootModel

  return (
    <div className={'flex flex-col'}>
      <input
        type="text"
        {...formState.makeInputProps('firstName')}
        className={'input input-bordered'}
      />
      <input
        type="text"
        {...formState.makeInputProps('lastName')}
        className={'input input-bordered'}
      />

      <p>Form is touched: {`${formState.touched}`}</p>
      <p>
        firstName: {user.firstName}, errors:
        {user.validator.getFirstErrorFor('firstName')}
      </p>
      <p>
        lastName: {user.lastName}, errors
        {user.validator.getFirstErrorFor('lastName')}
      </p>

      <button
        className={'btn'}
        onClick={() => {
          if (formState.isValid()) {
            console.log(formState.getData())
          } else {
            console.log(formState.getData({ includeErrors: true }))
          }
        }}
      >
        submit
      </button>
    </div>
  )
}
