import {
  makeFormStateWithModel,
  validateIsRequired,
  makeFormModel,
} from 'formtastisch'

// creates an instance of FormState with Model and Validator
const formState = makeFormStateWithModel({
  initialData: { firstName: '', lastName: '' },
  validations: {
    // by convention validations named exactly as properties they validate
    firstName: (value) => validateIsRequired(value),
    lastName: (value) => validateIsRequired(value),
  },
})

// if you don't need validations just pass an empty object (that's needed for typing in TS, JS users may omit it at all)
const formStateNoValidations = makeFormStateWithModel({
  initialData: { firstName: '', lastName: '' },
  validations: {},
})

// For TS type is infered from initial data and that's why it's provided in examples.
// Specifiying values is not important you could just as well.
type UserData = { firstName?: string; lastName?: string }
const initialData: UserData = {}
const formStateWithEmptyData = makeFormStateWithModel({
  initialData,
  validations: {},
})

const formStateTap = makeFormStateWithModel({
  initialData: { firstName: '', lastName: '' },
  validations: {},
  // you can as well pass a function to a 'tap' that returns an object, this would merge/override the data
  // result be formState.model // {firstName: 'hello', lastName: '', email: 'foo@bar.com'}
  tap: (data) => {
    return {
      firstName: data.firstName + 'hello',
      email: 'foo@bar.com',
    }
  },
})

// if you have nested models, initialize it in initial data or in tap
const formStateWithNestedModel = makeFormStateWithModel({
  initialData: {
    firstName: '',
    lastName: '',
    // will be a nested model
    address: makeFormModel({
      initialData: { street: '' },
      validations: {
        street: (value) => validateIsRequired(value),
      },
    }),
    account: { email: 'foo@bar.com' },
  },
  validations: {
    firstName: (value) => validateIsRequired(value),
    lastName: (value) => validateIsRequired(value),
  },
  // or you can initiale it in tap
  tap: (data) => {
    return {
      acccount: makeFormModel({ initialData: data.account, validations: {} }),
    }
  },
})

console.log({
  formState,
  formStateNoValidations,
  formStateTap,
  formStateWithNestedModel,
  formStateWithEmptyData,
})
