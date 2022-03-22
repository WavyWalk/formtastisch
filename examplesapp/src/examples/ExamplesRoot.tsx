import * as React from 'react'
import { Outlet } from 'react-router'
import { Link } from 'react-router-dom'

export function ExamplesRoot() {
  return (
    <div>
      <Outlet />
      <h1>-------Examples-------</h1>
      you will find source code in src/examples
      <ul className="examplesList">
        <li>
          <Link to="/basic">Basic</Link>
        </li>
        <li>
          <Link to="/IncludedValidations">Included validations</Link>
        </li>
        <li>
          <Link to="/CustomValidations">Custom validations</Link>
        </li>
        <li>
          <Link to="/AccessingValuesAndErrors">
            Accessing errors and values
          </Link>
        </li>
        <li>
          <Link to="/IntegratingWithOtherLibs">
            Integrating with other libs
          </Link>
        </li>
        <li>
          <Link to="/OptimizingRerenders">Optimizing performance</Link>
        </li>
        <li>
          <Link to="/CorrectlyTypingFormStateAndData">
            Correctly Typing form state and data
          </Link>
        </li>
        <li>
          <Link to="/CreatingFormState">Creating form state and options</Link>
        </li>
        <li>
          <Link to="/SharingFormState">Sharing state across components</Link>
        </li>
        <li>
          <Link to="/DynamicAndNestedForms">Dynamic and nested forms</Link>
        </li>
        <li>
          <Link to="/CustomInputs">Creating custom inputs</Link>
        </li>
        <li>
          <Link to="/CustomModelValidatorAndState">
            Custom FormModel ModelValidator and FormState basics
          </Link>
        </li>
        <li>
          <Link to="/InitializingFormStateWaysToInitialize">
            Initializing form state, instantiation ways
          </Link>
        </li>
        <li>
          <Link to="/CustomizingFormState">
            Customizing form state, complex example
          </Link>
        </li>
        <li>
          <Link to="/ThousandControlledInputs">
            Thousand controlled inputs, performance pitch
          </Link>
        </li>
      </ul>
      <h2>Library api examples</h2>
      <ul className="examplesList">
        <li>
          makeFormStateWithModel (see file apiExamples/MakeFormStateWithModel)
        </li>
        <li>
          <Link to="/Model"> Model (see file apiExamples/Model) </Link>
        </li>
        <li>Validator (see file apiExamples/Validator)</li>
        <li>
          <Link to="/FormStateUse">FormState#use()</Link>
        </li>
        <li>
          <Link to="/FormStateMakeInputProps">
            FormState#makeInputProps() | makeInputPropsForModel()
          </Link>
        </li>
        <li>
          <Link to="/FormStateApi">FormState general API</Link>
        </li>
        <li>
          <Link to="/FormStateUseForInput">FormState#useForInput()</Link>
        </li>
        <li>
          <Link to="/FormStateAsStateManager">
            FormState as state manager - smallest ToDo app in the world
          </Link>
        </li>
      </ul>
    </div>
  )
}
