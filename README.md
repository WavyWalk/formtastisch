# formtastisch - solid performant forms.

* 3kb all, treeshakable, depending on usage will be even less.
* performance first
* typescript first
* works with any ui lib, custom inputs, and literally with anything that can return data. 
* Can be customized and optimized to death. Edgecase friendly, and doesn't stand in your way.

```typescript jsx
const initialData = { firstName: '', lastName: '' }
const formState = makeFormStateWithModel(initialData, {
    firstName: (value) => validateIsRequired(value),
    lastName: (value) => validateIsRequired(value)
  })

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

# installation
`yarn add formtastisch` or `npm i formtastisch`

types included.

# api docs
https://wavywalk.github.io/formtastisch/apidocs/index.html
