import {
  makeFormStateWithModel,
  validateIsRequired,
  makeFormModel,
} from 'formtastisch'
import { modelToObject } from 'formtastisch'
import { validateMinLength } from 'formtastisch/dist/validationfunctions/validate'
import * as React from 'react'

const formState = makeFormStateWithModel({
  initialData: {
    firstName: '',
    lastName: '',
    email: '',
    address: makeFormModel({
      initialData: { street: '', streetNumber: '' },
      validations: {
        street: (value) => validateIsRequired(value),
        streetNumber: (value) => validateIsRequired(value),
      },
    }),
  },
  validations: {
    firstName: (value) => validateIsRequired(value),
    lastName: (value) => validateIsRequired(value),
    email: (value) => validateIsRequired(value),
  },
})

const model = formState.model

// whenever model is initialized, it will have a corresponding validator initialized as well
// with the validation methods specified during initialization
const validator = model.validator

// this will validate all properties
// as well as all nested models e.g. address as well
validator.validate()

// will run firstName validation
validator.firstName()

// will run lastName validation
validator.lastName()

// will only validate specified properties
validator.validate('lastName', 'email')

// each property can accept a callback, here e.g. we control how which props on nested shall be validated
validator.validate('lastName', 'email', {
  address: (addressModel) => addressModel.validate('address'),
})

// add programmatcally an error for firstName
validator.addError('firstName', 'bad')

// get first error for first name // same as model.errors?.firstName?.[0]
validator.getFirstErrorFor('firstName')

// get all errors for firstName // same as model.errors?.firstName
validator.getErrorsFor('firstName')

// remove specific error by error message // same as model.errors?.firstName = model.errors?.firstName?.filter(it => it !== mesage)
validator.removeSpecificError('firstName', 'bad')

// removes all errors for proeprty
validator.removeErrors('firstName')

// run one time validation without setting it as default. value will be yielded from model[property]
validator.validateProperty('firstName', (value) => validateMinLength(value, 2))

// sets unsets error depending on result
validator.handleValidationResult('firstName', {
  valid: false,
  errors: 'invalid',
})

validator.handleValidationResult('firstName', {
  valid: true,
})

// false if any property has error OR any nested model property has error.
validator.isValid()

// false if specific property has error
validator.isPropertyValid('firstName')

// removes all errors
validator.resetErrors()

// will set an extra validation or override one during creation.
// this is called "ad hoc" validation.
// if you add it, it will also run during validator.validate()
// this is basically called when you pass useForInput(model, property, {validate: (value) => validateIsRequired(value)})
validator.addRuntimeDefaultValidation('email', (value) =>
  validateIsRequired(value)
)

// If you need to run any validation without adding it to defaults just use validateProperty
validator.validateProperty('firstName', (value) => validateMinLength(value, 2))

// basically same as validate() without args, optional arg bool - if should validate nested or not
// by default nested models will be validated as well
validator.validateDefault()

// basically same as validate() without args
// BUT will not validate nested models
validator.validateDefault(false)
