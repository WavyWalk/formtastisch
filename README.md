# formtastisch - solid performant forms.

* always controlled
* doesn't stand in your way, you are in full control
* performance oriented
* typescript first
* works with any ui lib, custom inputs, and literally with anything that returns data.

### minimal example:



```typescript jsx
/** separate logic and controls */
import { BaseModel, Property, ModelValidator, validateMinLength, validatePattern } from "formtastisch"


class UserFormState extends FormState {
  
  validateEmail = (value: string) => validatePattern(regex, value)
  
  validatePassword = (value: string) => validateMinLength(value, 5)
  
  validateAll() {
    this.model.validator.validate({
      'email': this.validateEmail,
      'password': this.validatePassword
    })
  }
}

const formState = new UserFormState()

/** use in component */
const UserForm = () => {
  formState.use()
  const model = formState.model
  
  return <div>
    <input
      type={'text'}
      aria-invalid={model.errors.email}
      {...form.makeNativeInputProps(model, 'email', {validate: formState.validateEmail})}
    />
    <input
      type={'text'}
      aria-invalid={model.errors.password}
      placeholder={'firstName'}
      {...form.makeNativeInputProps(model, 'password', {validate: formState.validatePassword})}
    />
    <p>Email: {model.modelData.email}</p>
    <p>Password: {model.modelData.password}</p>
    <button onClick={() => form.isValid() && axios.post('/users', form.model.serialize())} />  {/*{email: 'foo', pasword: 'bar'}*/}
  </div>
}
```
