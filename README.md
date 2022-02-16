# formtastisch - solid performant forms.

* 3kb all, treeshakable, depending on usage will be even less.
* performance first
* typescript first
* works with any ui lib, custom inputs, and literally with anything that can return data.
* Edgecase ready: can be customized and optimized to death. Edgecase will come, and lib will be ready.

```typescript jsx
const initialData = { firstName: '', lastName: '' }
const formModel = makeFormModel(initialData, {
    firstName: (value) => validateIsRequired(value),
    lastName: (value) => validateIsRequired(value)
  })
const formState = new FormState(formModel)

export const NewTest: FC = () => {
  formState.use()
  
  return (
    <div>
      <input {...formState.makeInputProps('firstName')} />
      <input {...formState.makeInputProps('lastName')} />
      <p>{formState.rootModel.firstName} {formState.rootModel.lastName}</p>
      <button
        onClick={() => {
          console.log(formState.isValid())
          console.log(formState.getData({includeErrors: true}))
        }}
      >
        submit
      </button>
    </div>
  )
}
```
