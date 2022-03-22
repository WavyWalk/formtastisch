# formtastisch - solid performant forms for React.

* 🗜 3kb all, treeshakable, depending on usage will be even less.
* 🚀 Performance guaranteed, controlled inputs with performance of uncontrolled.
* 🦾 First class typescript support
* ✅ Zero dependencies
* ✅ Works with any ui lib, custom inputs, and literally with anything that can return data. 
* ✅ Can be customized and optimized to death. Edgecase friendly and doesn't stand in your way.
* ✅ First class support for nested data and dynamic forms.
* ✅ No mess forms code and nice dev experience

```typescript jsx
const initialData = { firstName: '', lastName: '' }
const formState = makeFormStateWithModel({
  initialData,
  validations: {
    firstName: (value) => validateIsRequired(value),
    lastName: (value) => validateIsRequired(value)
  }
})

export const MyForm: FC = () => {
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

All the documented examples as well of examples of API usage you will find in this [Sandbox](https://codesandbox.io/s/formtastisch-750pdu).

* [Basics](https://codesandbox.io/s/formtastisch-750pdu?file=/src/examples/Basic.tsx)
* [Included validations](https://codesandbox.io/s/formtastisch-750pdu?file=/src/examples/IncludedValidations.tsx)
* [Custom validations](https://codesandbox.io/s/formtastisch-750pdu?file=/src/examples/CustomValidations.tsx)
* [Accessing errors and values](https://codesandbox.io/s/formtastisch-750pdu?file=/src/examples/AccessingValuesAndErrors.tsx)
* [Integrating with other libraries](https://codesandbox.io/s/formtastisch-750pdu?file=/src/examples/IntegratingWithOtherLibs.tsx)
* [Optimizing performance](https://codesandbox.io/s/formtastisch-750pdu?file=/src/examples/OptimizingPerformance.tsx)
* [Correctly Typing form state and data](https://codesandbox.io/s/formtastisch-750pdu?file=/src/examples/CorrectlyTypingFormStateAndData.tsx)
* [Creating form state and options](https://codesandbox.io/s/formtastisch-750pdu?file=/src/examples/CreatingFormState.tsx)
* [Sharing form state across components](https://codesandbox.io/s/formtastisch-750pdu?file=/src/examples/SharingFormState.tsx)
* [Dynamic and nested forms](https://codesandbox.io/s/formtastisch-750pdu?file=/src/examples/DynamicAndNestedForms.tsx)
* [Creating custom inputs/lib integration](https://codesandbox.io/s/formtastisch-750pdu?file=/src/examples/CustomInputs.tsx)
* [Custom FormModel ModelValidator and FormState basics](https://codesandbox.io/s/formtastisch-750pdu?file=/src/examples/CustomModelValidatorAndState.tsx)
* [Initializing form state patterns](https://codesandbox.io/s/formtastisch-750pdu?file=/src/examples/InitializingFormStateWaysToInitialize.tsx)
* [Customizing form state](https://codesandbox.io/s/formtastisch-750pdu?file=/src/examples/CustomizingFormState.tsx)

# API docs
[Api documentation](https://wavywalk.github.io/formtastisch/apidocs/index.html)

# Sandbox app
This repo includes a sandbox with examples, so you can try it out locally.

just `cd examplesapp` `npm i && npm run dev` or `yarn` and `yarn dev`
available on localhost:3000

Examples with source code are in `app/examples`
