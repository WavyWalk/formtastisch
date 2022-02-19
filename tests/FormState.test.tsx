import {
  ISubscribeOptions,
  validateIsRequired,
  ModelValidator,
  FormModel,
  FormState,
  InputUseOptions,
  PureModelData,
  makeFormStateWithModel
} from '../src'
import React, { FC, useRef } from 'react'
import TestRenderer, { act, ReactTestRenderer } from 'react-test-renderer'

class AccountValidator extends ModelValidator<Account> {
  email = () =>
    this.validateProperty('email', (value) => validateIsRequired(value))

  userName = () =>
    this.validateProperty('userName', (value) => validateIsRequired(value))

  validateDefault(validateNested: boolean = true) {
    super.validateDefault(validateNested)
  }
}

class Account extends FormModel {
  validator = new AccountValidator(this)
  email?: string
  userName?: string

  constructor(data: PureModelData<Account> = {}) {
    super(data)
  }
}

class UserValidator extends ModelValidator<User> {
  firstName = () =>
    this.validateProperty('firstName', (value) => validateIsRequired(value))

  lastName = () =>
    this.validateProperty('lastName', (value) => validateIsRequired(value))
}

class User extends FormModel {
  validator = new UserValidator(this)
  firstName?: string

  lastName?: string
  account = new Account({})

  constructor(data?: any) {
    super(data)
  }
}

export function PlainInput<T extends FormModel>({
  formState,
  model,
  property,
  validate,
  additionallyOnChange
}: {
  formState: FormState<any>
  model: T
  property: Extract<keyof T, string>
} & InputUseOptions) {
  const controls = formState.useForInput(model, property, {
    validate,
    additionallyOnChange
  })

  return (
    <input
      style={{
        borderWidth: 'thin',
        borderColor: controls.getFirstError() ? 'red' : 'black'
      }}
      type="text"
      onChange={controls.onChange}
      value={(model[property] as unknown as string) ?? ''}
    />
  )
}

class UserForm extends FormState<User> {}

const Form: FC<{
  form: UserForm
  useOptions?: ISubscribeOptions<any>
}> = ({ form, useOptions }) => {
  form.use(useOptions)

  const renderTimes = useRef<number>(0)
  renderTimes.current += 1

  return (
    <div>
      <p id={'renderCounter'}>{renderTimes.current}</p>
      <PlainInput
        model={form.rootModel}
        formState={form}
        property={'firstName'}
      />
    </div>
  )
}

const getCounter = (component: ReactTestRenderer) => {
  return component.root.findByProps({ id: 'renderCounter' }).props.children
}

describe('FormState', () => {
  test('update updates component', () => {
    const userForm = new UserForm(new User())
    const component = TestRenderer.create(<Form form={userForm} />)

    expect(getCounter(component)).toEqual(1)

    act(() => userForm.update())

    expect(getCounter(component)).toEqual(2)
  })

  test('update dependencies handled properly', () => {
    const userForm = new UserForm(new User())
    const component = TestRenderer.create(
      <Form
        form={userForm}
        useOptions={{ updateDeps: (it: UserForm) => [it.rootModel.firstName] }}
      />
    )

    expect(getCounter(component)).toEqual(1)

    act(() => userForm.update())

    expect(getCounter(component)).toEqual(1)

    act(() => {
      userForm.rootModel.firstName = '1'
      userForm.update()
    })

    expect(getCounter(component)).toEqual(2)

    for (let i = 0; i < 10; i++) {
      act(() => {
        userForm.rootModel.firstName = `${i}`
        userForm.update()
        userForm.rootModel.firstName = `${i}`
        userForm.update()
        userForm.rootModel.firstName = `${i}`
        userForm.update()
      })
    }

    expect(getCounter(component)).toEqual(12)
  })
})

// const foo = makeFormStateWithModel({
//   initialData: { firstName: '' },
//   validations: {
//     firstName: (value) => validateIsRequired(value)
//   }
// })
//
// function ErrorContainer({ formState }: { formState: FormState }) {
//   formState.use()
//   const validator = formState.rootModel.validator
//
//   return (
//     <div>
//       <p>I use the state so I will update whenever it changes</p>
//       <p>
//         errors: {validator.getFirstErrorFor('firstName')}
//         <br />
//         firstName: {validator.getFirstErrorFor('lastName')}
//       </p>
//     </div>
//   )
// }
