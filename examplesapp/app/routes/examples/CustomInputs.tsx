import type {
  BaseInputProps,
  ValidationReturn,
  FormModel,
  FormState
} from 'formtastisch'
import { makeFormStateWithModel } from 'formtastisch'
import { validateMinLength } from 'formtastisch'
import * as React from 'react'
import { validateIsRequired } from 'formtastisch'

/**
 * Formtastisch does not care where data comes from and it's not bound to any lib
 * handling custom inputs is super easy - it just needs to give data and recieve it as prop
 */

const formState = makeFormStateWithModel({
  initialData: { firstName: '', lastName: '', coords: '' },
  validations: {
    firstName: (value) => validateMinLength(value, 3),
    lastName: (value) => validateMinLength(value, 3),
    coords: (value) => validateIsRequired(value)
  }
})

export default function CustomInputs() {
  formState.use()

  return (
    <div className="componentSection">
      <AnyInputThatHasValueAndOnChange
        formState={formState}
        model={formState.model}
        property="firstName"
      />
      <MoreCustomization
        formState={formState}
        model={formState.model}
        property="lastName"
      />
      <CrazyAssCustomInput
        formState={formState}
        model={formState.model}
        property="coords"
      />

      <p>{JSON.stringify(formState.getData({ includeErrors: true }))}</p>
      <button
        onClick={() => {
          // instead of validate()
          // you can pick which validations need to run
          // and because not all validations are set as default, we need to manually specify them
          formState.validate({ methods: ['firstName', 'lastName', 'coords'] })
          // if any validation fails, state changes, in order to keep components in sync
          // we call update(), and subscribed components will be updated.
          formState.update()
        }}
      >
        validate all
      </button>
    </div>
  )
}

const AnyInputThatHasValueAndOnChange: React.FC<{
  formState: FormState
  model: FormModel
  property: string
}> = ({ formState, model, property }) => {
  // this will .use() behind scenes so it's wired to state, as well do some optimization when to update
  // and return the controls
  const controls = formState.useForInput(model, property as any)
  const error = controls.getFirstError()

  return (
    <div className="componentSection">
      <label>{property}</label>
      <input
        type="text"
        value={controls.getValue() as any}
        onChange={controls.onChange}
      />
      {error && <p className="inputError">{error}</p>}
      <button className={'btn'} onClick={() => console.log(controls)}>
        log useInput controls
      </button>
    </div>
  )
}

/** if input does not have standard onChange, it does not matter
 * BaseInputProps type is same as above props
 */
const MoreCustomization: React.FC<BaseInputProps> = ({
  formState,
  model,
  property
}) => {
  // this will .use() behind scenes so it's wired to state, as well do some optimization when to update
  // and return the controls
  const controls = formState.useForInput(model, property)
  const error = controls.getFirstError()
  const values = ['foo', 'bar', 'baz']

  return (
    <div className="componentSection">
      <p>click on li to select</p>
      {values.map((value) => {
        return (
          <button
            className={'btn'}
            key={value}
            onClick={() => {
              controls.onValueChange(value)
            }}
          >
            {value} selected: {`${value === model[property]}`}
          </button>
        )
      })}
    </div>
  )
}

/**
 * if you need full control:
 * here we use canvas as input medium, and have full control over updates and validation
 *
 * @remark most of the times this is not required, and controls given from useForInput() are enough for most cases. But if you are hardcore, nothing stops you
 */
const CrazyAssCustomInput: React.FC<BaseInputProps<FormModel & any>> = ({
  formState,
  model,
  property
}) => {
  // optimize via specifing when this component shall be updated so not every formstate change
  // triggers an update
  // note: useForInput does exactly same so it's good default.
  // here you can put anything else
  // if you want that it updates on any other formState.update(), just call use() without deps
  formState.use({
    updateDeps: (state) => [
      model,
      model[property],
      model.validator.getFirstErrorFor(property)
    ]
  })

  // you can control validation, here we have an ad hoc validation
  // that which result we feed to validator and it handles error on model
  const validateCoords = (coords?: { x: number; y: number }) => {
    let result: ValidationReturn = { valid: true }
    if (!coords) {
      result = { valid: false, errors: 'coordsNotClicked' }
    } else if (coords.x > 100) {
      result = { valid: false, errors: 'notOnLeftSide' }
    }
    model.validator.handleValidationResult(property, result)
  }

  const canvas = React.useRef<any>()

  React.useEffect(() => {
    drawDot(canvas.current, model[property])
  }, [model[property]])

  return (
    <div className="componentSection">
      <div
        className="canvasCont"
        onClick={(e: any) => {
          const coords = getClickCoords(e, canvas.current)
          model[property] = coords
          validateCoords(model[property])
          // we control when to update, by calling update
          formState.update()
        }}
      >
        <canvas id="myCanvas" width="200" height="100" ref={canvas} />
      </div>
      <p>coords errors: {model.validator.getFirstErrorFor(property)}</p>
    </div>
  )
}

const getClickCoords = (e: any, canvas: any) => {
  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  return { x, y }
}

const drawDot = (canvas: any, value: any) => {
  const context = canvas.getContext('2d')
  context.clearRect(0, 0, canvas.width, canvas.height)
  if (value) {
    context.fillRect(value.x, value.y, 5, 5)
  }
}
