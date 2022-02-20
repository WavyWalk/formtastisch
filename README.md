# formtastisch - solid performant forms.

* 3kb all, treeshakable, depending on usage will be even less.
* Performance first
* First class typescript support
* Zero dependencies
* Works with any ui lib, custom inputs, and literally with anything that can return data. 
* Can be customized and optimized to death. Edgecase friendly and doesn't stand in your way.
* First class support for nested data and dynamic forms. 

```typescript jsx
const initialData = { firstName: '', lastName: '' }
const formState = makeFormStateWithModel({
  initialData,
  validations: {
    firstName: (value) => validateIsRequired(value),
    lastName: (value) => validateIsRequired(value)
  }
})

export const NewTest: FC = () => {
  formState.use()
  
  return (
    <div>
      <input {...formState.makeInputProps('firstName')} />
      <input {...formState.makeInputProps('lastName')} />
      <p>{JSON.stringify(formState.getData({includeErros: true}))}</p>
      <button
        onClick={() => {
          console.log(formState.validate())
          console.log(formState.isValid())
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

# examples
* [Basics](https://stackblitz.com/edit/github-yzzn2y-qptqvk?file=src%2Fexamples%2FBasic.tsx)
* [Included validations](https://stackblitz.com/edit/github-yzzn2y-qptqvk?file=src%2Fexamples%2FIncludedValidations.tsx)
* [Custom validations](https://stackblitz.com/edit/github-yzzn2y-qptqvk?file=src%2Fexamples%2FCustomValidations.tsx)
* [Accessing errors and values](https://stackblitz.com/edit/github-yzzn2y-qptqvk?file=src%2Fexamples%2FAccessingValuesAndErrors.tsx)
* [Correctly Typing form state and data](https://stackblitz.com/edit/github-yzzn2y-qptqvk?file=src%2Fexamples%2FCorrectlyTypingFormStateAndData.tsx)
* [Creating form state and options](https://stackblitz.com/edit/github-yzzn2y-qptqvk?file=src%2Fexamples%2FCustomizingFormState.tsx)
* [Sharing form state across components](https://stackblitz.com/edit/github-yzzn2y-qptqvk?file=src%2Fexamples%2FSharingFormState.tsx)
* [Dynamic and nested forms](https://stackblitz.com/edit/github-yzzn2y-qptqvk?file=src%2Fexamples%2FDynamicAndNestedForms.tsx)
* [Optimizing performance](https://stackblitz.com/edit/github-yzzn2y-qptqvk?file=src%2Fexamples%2FOptimizingRerenders.tsx)
* [Creating custom inputs/lib integration](https://stackblitz.com/edit/github-yzzn2y-qptqvk?file=src%2Fexamples%2FCustomInputs.tsx)
* [Custom FormModel ModelValidator and FormState basics](https://stackblitz.com/edit/github-yzzn2y-qptqvk?file=src%2Fexamples%2FCustomModelValidatorAndState.tsx)
* [Initializing form state patterns](https://stackblitz.com/edit/github-yzzn2y-qptqvk?file=src%2Fexamples%2FInitializingFormStateWaysToInitialize.tsx)
* [Customizing form state](https://stackblitz.com/edit/github-yzzn2y-qptqvk?file=src%2Fexamples%2FCustomizingFormState.tsx)

# api docs
[Api documentation](https://wavywalk.github.io/formtastisch/apidocs/index.html)

# Sandbox app
Remix app with examples, so you can play and test locally is in this repo.

just `cd examplesapp` `npm i && npm run dev`
available on localhost:3000

examples with source code are in `app/routs/examples`
