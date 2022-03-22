import { makeFormStateWithModel, makeFormModel, FormState } from 'formtastisch'
import { validateMinLength } from 'formtastisch'
import { validateIsRequired, modelToObject } from 'formtastisch'
import * as React from 'react'

/**
 * Nested and dynamic forms are super easy, just when you initialize a model, wrap the nested object/array that,
 * you want to behave as nested in own model and that's it.
 */

const formState = makeFormStateWithModel({
  initialData: {
    name: '',
    // nested data has own FormModel, so we initialize one for it. Note that it's makeFormModel and not makeFormStateWithModel. The first only creates model, whereas makeFormStateWithModel as well initializes the state, because it's nested it will be controlled through parent state.
    address: makeFormModel({
      initialData: { street: '' },
      validations: {
        street: (value) => validateMinLength(value, 2),
      },
    }),
    hobbies: [
      // although we do it here inline, you could as well extract model initializaion to separate func, e.g. makeHobbyModel
      makeFormModel({
        initialData: { hobbyName: '' },
        validations: {
          hobbyName: (value) => validateMinLength(value, 2),
        },
      }),
    ],
  },
  validations: {
    name: (value) => validateMinLength(value, 2),
  },
})

const addHobby = (state: typeof formState) => {
  // create new model
  const hobby = makeFormModel({
    initialData: { hobbyName: '' },
    validations: {
      hobbyName: (value) => validateMinLength(value, 2),
    },
  })
  // push to parent
  formState.model.hobbies.push(hobby)
  // update state, sync with components, any subscribed component that 'uses' gets notified of update
  state.update()
}

const removeHobby = (
  state: typeof formState,
  // normally you can define types here for shortcut, but because make.. is dynamic
  // this is recommended way to extract types (e.g could do type HobbyFormModel = typeof formState['model']['hobbies'][0])
  hobby: typeof formState['model']['hobbies'][0]
) => {
  const hobbies = state.model.hobbies.filter((it) => it !== hobby)
  state.model.hobbies = hobbies
  // update state, sync with components, any subscribed component that 'uses' gets notified of update
  state.update()
}

export function DynamicAndNestedForms() {
  formState.use()
  // here we have access to all models
  const user = formState.model
  const address = user.address
  const hobbies = user.hobbies

  return (
    <div className="componentSection">
      {/** makeInputProps makes props for top/root level model */}
      <input {...formState.makeInputProps('name')} placeholder="name" />
      {/**  notice here we call makeInputPropsForModel instead of makeInputProps.
       * In reality makeInputProps exists for brevity, it calls the same but with a root 'model'.
       * Here we simply specify for which instance the property is in question */}
      <input
        {...formState.makeInputPropsForModel(address, 'street')}
        placeholder="street"
      />
      {hobbies.map((hobby) => {
        return (
          <HobbyForm
            // each model has a unique key which can as well be used in components as a key
            key={hobby.getUniqueReferenceKey()}
            formState={formState}
            hobby={hobby}
          />
        )
      })}
      <button
        onClick={() => {
          addHobby(formState)
        }}
      >
        add hobby
      </button>
      <button
        onClick={() => {
          console.log(formState.model)
          formState.validate()
        }}
      >
        submit
      </button>
      <pre>
        {JSON.stringify(formState.getData({ includeErrors: true }), null, 2)}
      </pre>
    </div>
  )
}

const HobbyForm: React.FC<{
  formState: typeof formState
  hobby: typeof formState['model']['hobbies'][0]
}> = ({ formState, hobby }) => {
  formState.use()

  return (
    <div className="componentSection">
      <input {...formState.makeInputPropsForModel(hobby, 'hobbyName')} />
      <button
        onClick={() => {
          removeHobby(formState, hobby)
        }}
      >
        remove hobby {hobby.hobbyName}
      </button>
    </div>
  )
}
