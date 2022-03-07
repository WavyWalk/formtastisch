import { makeFormStateWithModel, makeFormModel, FormState } from 'formtastisch'
import { validateMinLength } from 'formtastisch'
import * as React from 'react'

const initialData: CreateUserDto = {
  name: '',
  address: {
    street: ''
  },
  hobbies: [{ hobbyName: 'sleeping' }]
}

// with this we will create a nested model, we'll call it later
const makeHobbyModel = (hobbyData: Hobby) => {
  // notice that we create model not state with model, see later
  return makeFormModel({
    initialData: hobbyData,
    validations: {
      hobbyName: (value) => validateMinLength(value, 2)
    }
  })
}

const formState = makeFormStateWithModel({
  initialData,
  validations: {
    name: (value) => validateMinLength(value, 2)
  },
  // if tap returns object it overrides data
  tap: (data) => {
    return {
      // nested data has own FormModel, so we initialize one for it. Note that it's makeFormModel and not makeFormStateWithModel. The first only creates model, whereas makeFormStateWithModel as well initializes the state.
      // good practive to extract to factory method, like in case with hobby
      address: makeFormModel({
        initialData: data.address,
        validations: {
          street: (value) => validateMinLength(value, 2)
        }
      }),
      // for multiple sub models
      hobbies: data.hobbies.map((hobbyData) => {
        return makeHobbyModel(hobbyData)
      })
    }
  }
})

const addHobby = (state: typeof formState) => {
  const hobby = makeHobbyModel({ hobbyName: '' })
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

export default function DynamicAndNestedForms() {
  formState.use()
  const user = formState.model
  const address = user.address
  const hobbies = user.hobbies

  return (
    <div className="componentSection">
      <input {...formState.makeInputProps('name')} placeholder="name" />
      <AddressForm formState={formState} address={address} />
      {hobbies.map((hobby) => {
        return (
          <HobbyForm
            key={hobby.getUniqueReferenceKey()}
            formState={formState}
            hobby={hobby}
          />
        )
      })}
      <button
        className={'btn'}
        onClick={() => {
          addHobby(formState)
        }}
      >
        add hobby
      </button>
      <p>{JSON.stringify(formState.getData())}</p>
    </div>
  )
}

const AddressForm: React.FC<{
  formState: typeof formState
  address: typeof formState['model']['address']
}> = ({ formState, address }) => {
  // subscribe to changes on state
  formState.use()
  // notice here we call makeInputPropsForModel instead of makeInputProps. In reality makeInputProps exists for brevity, it calls the same but with a 'model'. Here we specify for which instance the property is in question.
  return (
    <div className="componentSection">
      <input
        {...formState.makeInputPropsForModel(address, 'street')}
        placeholder="street"
      />
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

// just types for state and data
type Hobby = {
  hobbyName: string
}

type Address = {
  street: string
}

type CreateUserDto = {
  name: string
  address: Address
  hobbies: Hobby[]
}
