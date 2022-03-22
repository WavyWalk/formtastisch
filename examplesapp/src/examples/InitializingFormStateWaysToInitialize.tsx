import { makeFormStateWithModel } from 'formtastisch'
import { validateIsRequired } from 'formtastisch'
import { useMemo } from 'react'
import * as React from 'react'

/**
 * in previous example we initialized form state outside of component, and accessed it via singleton.
 * It does not matter where form state comes from so you can initialize it however you like. What's importatnt, is that components use it.
 *
 * for each way look in the implementation of corresponding component
 */
export function InitializingFormStateWaysToInitialize() {
  return (
    <div>
      <UserFormInitializeInMemo />
      <UserFormInitializeInMemoExtracted />
      <div>
        <UsingFromContext />
        <UsingFromContext />
      </div>
      <div>
        <UsingSingleton />
        <UsingSingleton />
      </div>
    </div>
  )
}

function UserFormInitializeInMemo() {
  // you can do it in memo, it makes sense of course to extract it outside to a hook
  const formState = useMemo(
    () =>
      makeFormStateWithModel({
        initialData: { name: '' },
        validations: { name: (value) => validateIsRequired(value) },
      }),
    []
  )
  // no matter where from it comes, it's important that component uses it.
  formState.use()

  return (
    <div className="componentSection">
      <p>initialized in memo</p>
      <input {...formState.makeInputProps('name')} />
    </div>
  )
}

/**
 * best practice - extract initialization
 *
 * // p.s. even better extract creation to e.g. makeUserFormStateWithModel
 * // and that call it in useInitializeUserForm
 */
const useInitializeUserForm = () => {
  return useMemo(
    () =>
      makeFormStateWithModel({
        initialData: { name: '' },
        validations: { name: (value) => validateIsRequired(value) },
      }),
    []
  )
}
// this way you can as well extract type
type UserForm = ReturnType<typeof useInitializeUserForm>

function UserFormInitializeInMemoExtracted() {
  const formState = useInitializeUserForm()
  // no matter where from it comes, it's important that component uses it.
  formState.use()

  return (
    <div className="componentSection">
      <p>initialized in memo extracted</p>
      <input {...formState.makeInputProps('name')} />
    </div>
  )
}

/**
 * if you form used in a lot of components it even makes sense to put it into a separate context, so it's instance is available from there.
 * as a bonus your context does not rerender on state changes, we use it purely to retrieve form state instance
 */

const userForm = makeFormStateWithModel({
  initialData: { name: 'joe' },
  validations: { name: (value) => validateIsRequired(value) },
})

const UserFormContext = React.createContext<typeof userForm>(userForm)

function UsingFromContext() {
  const formState = React.useContext(UserFormContext)
  formState.use()

  return (
    <div className="componentSection">
      <p>im one of components that use formState instance from context</p>
      <input {...formState.makeInputProps('name')} />
    </div>
  )
}

/**
 * to not fuck around with context, if you know you have a single instance of form in app you
 * can just use a singleton.
 * just export it, and any component that "uses" it will be subscribed and controlled by this instance
 * this way you can use it anywhere in app, and any component that .use() it will get updated on changes
 */

const myUserForm = makeFormStateWithModel()

function UsingSingleton() {
  myUserForm.use()
  return (
    <div className="componentSection">
      <p>im one of components that use formState instance as singleton</p>
      <input {...myUserForm.makeInputProps('a')} />
    </div>
  )
}
