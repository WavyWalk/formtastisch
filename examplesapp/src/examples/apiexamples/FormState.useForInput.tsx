import {
  makeFormStateWithModel,
  validateIsRequired,
  makeFormModel,
  FormState,
  FormModel
} from "formtastisch";
import * as React from "react";

const formState = makeFormStateWithModel({
  initialData: {
    firstName: "",
    address: makeFormModel({
      initialData: { street: "" },
      validations: {}
    })
  },
  validations: {
    firstName: (value) => validateIsRequired(value)
  }
});

const MyInput: React.FC<{
  formState: FormState;
  model: FormModel;
  property: any;
}> = ({ formState, model, property }) => {
  // useForInput returns controls for the input and as well subscribes component for depenedencies
  const controls = formState.useForInput(model, property, {
    // optional options are same as makeInputProps/makeInputPropsForModel/makeOnChangeHandler
    // additionallyOnChange: CallableFunction // run anything after onChange is done
    // skipValidationOnChange: bool // do not validate on changes
    // validate: ValidateFunction // ad hoc validation, or validation that overrides default
    // validateOnBlur: bool // only for standart inputs// validates only on blur
  });
  // effectively this is same as
  // formState.use((state) => [model, model[property], model.errors?.[property]?.[0]])
  // const controls = {
  //   onChange: formState.makeOnChangeHandler(model, property),
  //   onValueChange: (value) =>  formState.onValueChange(value, model, property),
  //   getValue: () => model[property],
  //   getFirstError: () => model.validator.getFirstErrorFor(property)
  //   ...
  // }

  const error = controls.getFirstError();

  return (
    <div>
      <input onChange={controls.onChange} value={controls.getValue() as any} />
      {!controls.getIsValid() && error}
      <button
        onClick={() => {
          controls.onValueChange("NEW VALUE");
        }}
      >
        set value through controls
      </button>
      <button
        onClick={() => {
          console.log({ controls });
        }}
      >
        log controls
      </button>
    </div>
  );
};

// utilities included in FormState
export function FormStateUseForInput() {
  // subscribe to state
  formState.use();
  const userModel = formState.model;
  const addressModel = userModel.address;

  return (
    <div className="componentSection">
      <MyInput formState={formState} model={userModel} property={"firstName"} />
      <MyInput formState={formState} model={addressModel} property={"street"} />
      <pre>
        {JSON.stringify(formState.getData({ includeErrors: true }), null, 2)}
      </pre>
    </div>
  );
}
