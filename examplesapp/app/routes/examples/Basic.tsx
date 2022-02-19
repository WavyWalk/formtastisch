import {makeFormStateWithModel, validateIsRequired} from "formtastisch";

const initialData = {
  firstName: '',
  lastName: ''
}
const formState = makeFormStateWithModel({
  initialData,
  validations: {
    firstName: (value) => validateIsRequired(value),
    lastName: (value) => validateIsRequired(value)
  }
})

export default function BasicExample() {
  formState.use()

  return <div>
    <input type="text" {...formState.makeInputProps('firstName')}/>
    <input type="text" {...formState.makeInputProps('firstName')}/>

    <button>
      submit
    </button>
  </div>
}
