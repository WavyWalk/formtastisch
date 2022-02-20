import { Link } from '@remix-run/react'

export default function Index() {
  return (
    <div className="">
      <h1>Examples</h1>
      <ul className={'list-disc'}>
        <li>
          <Link to={'/examples/basic'}>basic usage</Link>
        </li>
        <li>
          <Link to={'/examples/IncludedValidations'}>Included Validations</Link>
        </li>
        <li>
          <Link to={'/examples/CustomValidations'}>CustomValidations</Link>
        </li>
        <li>
          <Link to={'/examples/CustomValidations'}>CustomValidations</Link>
        </li>
        <li>
          <Link to={'/examples/AccessingValuesAndErrors'}>
            Accessing Values And Errors
          </Link>
        </li>
        <li>
          <Link to={'/examples/CorrectlyTypingFormStateAndData'}>
            Correctly Typing Form State And Data
          </Link>
        </li>
        <li>
          <Link to={'/examples/CreatingFormState'}>CreatingFormState</Link>
        </li>
        <li>
          <Link to={'/examples/SharingFormState'}>
            Sharing form state accross components
          </Link>
        </li>
        <li>
          <Link to={'/examples/DynamicAndNestedForms'}>
            Dynamic And Nested Forms
          </Link>
        </li>
        <li>
          <Link to={'/examples/OptimizingRerenders'}>
            Optimizing performance
          </Link>
        </li>
        <li>
          <Link to={'/examples/CustomInputs'}>Custom Inputs</Link>
        </li>
        <li>
          <Link to={'/examples/CustomModelValidatorAndState'}>
            Custom Model, Validator and State
          </Link>
        </li>
        <li>
          <Link to={'/examples/CustomizingFormState'}>
            Customizing Form State
          </Link>
        </li>

        <li>
          <Link to={'/examples/InitializingFormStateWaysToInitialize'}>
            Initializing form state patterns
          </Link>
        </li>

        <li>
          <Link to={'/examples/Test'}>Test</Link>
        </li>
      </ul>
    </div>
  )
}
