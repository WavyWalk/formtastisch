import {
  BaseModel,
  FormState,
  HasOne,
  ISubscribeOptions,
  ModelValidator,
  Property,
  validateIsRequired,
  validates,
  BaseInputProps
} from '../src'
import React, { FC, useRef } from 'react'
import TestRenderer, { act, ReactTestRenderer } from 'react-test-renderer'

class AccountValidator extends ModelValidator<Account> {
  @validates
  email() {
    return validateIsRequired(this.model.email)
  }

  @validates
  userName() {
    return validateIsRequired(this.model.userName)
  }
}

class Account extends BaseModel {
  @Property
  email?: string

  @Property
  userName?: string

  get validator() {
    return (this._validator ??= new AccountValidator(this))
  }
}

class UserValidator extends ModelValidator<User> {
  @validates
  firstName() {
    return validateIsRequired(this.model.firstName)
  }

  @validates
  lastName() {
    return validateIsRequired(this.model.lastName)
  }
}

class User extends BaseModel {
  @Property
  firstName?: string

  @Property
  lastName?: string

  @HasOne(() => Account)
  account?: string

  get validator() {
    return (this._validator ??= new UserValidator(this))
  }
}

class UserForm extends FormState {
  constructor(public model: User) {
    super()
  }

  validateAll() {
    this.model.validator.validate('firstName', 'lastName')
    this.update()
  }
}

export function Input<T extends BaseModel>({
  formState,
  model,
  property
}: BaseInputProps<T>) {
  const controls = formState.useForInput(model, property)

  return (
    <input
      type="text"
      onChange={controls.onChange}
      value={model.modelData[property] ?? ''}
    />
  )
}

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
      <Input model={form.model} formState={form} property={'firstName'} />
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
        useOptions={{ updateDeps: (it: UserForm) => [it.model.firstName] }}
      />
    )

    expect(getCounter(component)).toEqual(1)

    act(() => userForm.update())

    expect(getCounter(component)).toEqual(1)

    act(() => {
      userForm.model.firstName = '1'
      userForm.update()
    })

    expect(getCounter(component)).toEqual(2)

    for (let i = 0; i < 10; i++) {
      act(() => {
        userForm.model.firstName = `${i}`
        userForm.update()
        userForm.model.firstName = `${i}`
        userForm.update()
        userForm.model.firstName = `${i}`
        userForm.update()
      })
    }

    expect(getCounter(component)).toEqual(12)
  })
})
