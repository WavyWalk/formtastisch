import {
  FormModel,
  FormState,
  IsolateInput,
  chainValidations
} from "formtastisch";
import type { BaseInputProps, ValidationReturn } from "formtastisch";
import { makeFormStateWithModel } from "formtastisch";
import { validateMinLength } from "formtastisch";
import * as React from "react";
import { validateIsRequired } from "formtastisch";

/**
 * Formtastisch does not care where data comes from and it's not bound to any lib
 * handling custom inputs is super easy - it just needs to give data and recieve it as prop
 *
 * here we will go from easy dropin implementations and gradually increase customization level
 */

const formState = makeFormStateWithModel({
  initialData: {
    firstName: "",
    lastName: "",
    coords: "",
    nickName: "",
    email: ""
  },
  validations: {
    firstName: (value) => validateMinLength(value, 3),
    lastName: (value) => validateMinLength(value, 3),
    nickName: (value) => validateMinLength(value, 2),
    coords: (value) => validateIsRequired(value),
    email: (value) => validateIsRequired(value)
  }
});

export function CustomInputs() {
  formState.use();

  return (
    <div className="componentSection">
      <IsolateInput
        formState={formState}
        model={formState.model}
        property={"email"}
      >
        {(controls) => (
          <div className="componentSection">
            <label>Email</label>
            <input
              type="text"
              value={controls.getValue() as any}
              onChange={controls.onChange}
            />
            {controls.getFirstError() && (
              <p className="inputError">{controls.getFirstError()}</p>
            )}
            <button onClick={() => console.log(controls)}>
              log useInput controls
            </button>
          </div>
        )}
      </IsolateInput>
      <AnyInputThatHasValueAndOnChange
        formState={formState}
        model={formState.model}
        property="firstName"
      />
      <ExtractingInputWithIsolateInput
        formState={formState}
        model={formState.model}
        property="nickName"
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
      <pre>
        {JSON.stringify(formState.getData({ includeErrors: true }), null, 2)}
      </pre>
      <button
        onClick={() => {
          // instead of validate()
          // you can pick which validations need to run
          formState.validate({ methods: ["firstName", "lastName", "coords"] });
          // if any validation fails, state changes, in order to keep components in sync
          // we call update(), and subscribed components will be updated.
          formState.update();
        }}
      >
        validate all
      </button>
    </div>
  );
}

// This way we can implement any input that accepts value and onChange
// easy drop in solution for the inputs you have in your app
const AnyInputThatHasValueAndOnChange: React.FC<{
  formState: FormState;
  model: FormModel;
  property: string;
}> = ({ formState, model, property }) => {
  // this will .use() behind scenes so it's wired to state, as well do some optimization when to update
  // and return the controls
  const controls = formState.useForInput(model, property as any);
  const error = controls.getFirstError();

  return (
    <div className="componentSection">
      <label>{property}</label>
      <input
        type="text"
        value={controls.getValue() as any}
        onChange={controls.onChange}
      />
      {error && <p className="inputError">{error}</p>}
      <button onClick={() => console.log(controls)}>
        log useInput controls
      </button>
    </div>
  );
};

// basically same as what we did in  AnyInputThatHasValueAndOnChange, but using
// IsolateInput. IsolateInput does nothing else that calling useForInput() and accepting func as child which
// it will call with controls
const ExtractingInputWithIsolateInput: React.FC<BaseInputProps> = ({
  formState,
  model,
  property
}) => {
  return (
    <IsolateInput formState={formState} model={model} property={property}>
      {(controls) => (
        <div className="componentSection">
          <label>{property}</label>
          <input
            type="text"
            value={controls.getValue() as any}
            onChange={controls.onChange}
          />
          {controls.getFirstError() && (
            <p className="inputError">{controls.getFirstError()}</p>
          )}
          <button onClick={() => console.log(controls)}>
            log useInput controls
          </button>
        </div>
      )}
    </IsolateInput>
  );
  /**
   * as well imagine you have a custom input e.g. MuiTextField or something like that.
   * you could just do like in parent that uses it
   * <IsolateInput formState={formState} model={model} property={property}>
   *   {(controls) => <MuiTextField value={contols.value} onChange={controls.onChange} />}}
   * </IsolateInput>
   */
};

/** if input does not have standard onChange, it does not matter
 * note: BaseInputProps type is same as above props
 */
const MoreCustomization: React.FC<BaseInputProps> = ({
  formState,
  model,
  property
}) => {
  // this will .use() behind scenes so it's wired to state, as well do some optimization when to update
  // and return the controls
  const controls = formState.useForInput(model, property);
  const values = ["foo", "bar", "baz"];

  return (
    <div className="componentSection">
      <p>click on button to select</p>
      {values.map((value) => {
        return (
          <button
            key={value}
            onClick={() => {
              controls.onValueChange(value);
            }}
          >
            {value} selected: {`${value === model[property]}`}
          </button>
        );
      })}
    </div>
    // not this could be as well done via IsolateInput as it's controls are same as with useForInput
  );
};

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
  formState.use((state) => [
    model[property],
    model.validator.getFirstErrorFor(property)
  ]);

  // you can control validation, here we have an ad hoc validation
  // that which result we feed to validator and it handles error on model
  const validateCoords = (coords?: { x: number; y: number }) => {
    let result: ValidationReturn = { valid: true };
    if (!coords) {
      result = { valid: false, errors: ["coordsNotClicked"] };
    } else if (coords.x > 100) {
      result = { valid: false, errors: ["notOnLeftSide"] };
    }
    model.validator.handleValidationResult(property, result);
  };

  const canvas = React.useRef<any>();

  React.useEffect(() => {
    drawDot(canvas.current, model[property]);
  }, [model[property]]);

  return (
    <div className="componentSection">
      <div
        className="canvasCont"
        onClick={(e: any) => {
          const coords = getClickCoords(e, canvas.current);
          model[property] = coords;
          validateCoords(model[property]);
          // we control when to update, by calling update
          formState.update();
        }}
      >
        <canvas id="myCanvas" width="200" height="100" ref={canvas} />
      </div>
      <p>coords errors: {model.validator.getFirstErrorFor(property)}</p>
    </div>
  );
};

const getClickCoords = (e: any, canvas: any) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  return { x, y };
};

const drawDot = (canvas: any, value: any) => {
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (value) {
    context.fillRect(value.x, value.y, 5, 5);
  }
};
