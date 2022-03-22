// import TextField from '@mui/material/TextField'
/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  IsolateInput,
  makeFormStateWithModel,
  validateIsRequired
} from "formtastisch";
import type { BaseInputProps } from "formtastisch";
import * as React from "react";
import { validateMinLength } from "formtastisch";
import Select from "react-select";
import type { OptionsOrGroups } from "react-select/dist/declarations/src/types";
import TextField from "@mui/material/TextField/TextField";

/**
 * integrating with other libriaries (e.g. materialUi, or libraries for inputs) is super easy.
 * Same goes to existing input components in your apps.
 * most of the cases they accept value in some way and have sort of an onChange event, for them it's super straightforward. Others require minor work.
 *
 */

const formState = makeFormStateWithModel({
  initialData: {
    name: "",
    lastName: "",
    email: "",
    food: undefined
  },
  // you always have to provide a validation option, even if there's nothing there,
  // for js it's unimportant but for ts it's needed for typing reasons.
  validations: {
    name: (value) => validateMinLength(value, 3),
    lastName: (value) => validateMinLength(value, 3),
    email: (value) => validateMinLength(value, 3)
  }
});

export function IntegratingWithOtherLibs() {
  formState.use();
  const { model } = formState;

  return (
    <div>
      {/* inplace material ui input */}
      <TextField
        value={model.name}
        onChange={formState.makeOnChangeHandler(model, "name")}
        error={!!model.validator.getFirstErrorFor("name")}
        helperText={model.validator.getFirstErrorFor("name")}
        label={"first name"}
      />
      {/* extracted material ui input */}
      <MaterialUiExtracted
        formState={formState}
        model={formState.model}
        property={"lastName"}
        label={"last name"}
      />
      {/* in place IsolatedInput if you optimize for rerenders */}
      <IsolateInput formState={formState} model={model} property={"email"}>
        {(controls) => (
          <TextField
            value={model.email}
            onChange={formState.makeOnChangeHandler(model, "email")}
            error={!!model.validator.getFirstErrorFor("email")}
            helperText={model.validator.getFirstErrorFor("email")}
            label={"email"}
          />
        )}
      </IsolateInput>
      {/* googled and found this as first one never used before */}
      <InputLibReactSelectIntegration
        formState={formState}
        model={model}
        property={"food"}
        options={[
          { value: "chocolate", label: "Chocolate" },
          { value: "strawberry", label: "Strawberry" },
          { value: "vanilla", label: "Vanilla" }
        ]}
      />
      <pre>{JSON.stringify(formState.model.toObject(), null, 2)}</pre>
    </div>
  );
}

function MaterialUiExtracted({
  formState,
  model,
  property,
  label
}: BaseInputProps & { label?: string }) {
  const controls = formState.useForInput(model, property);
  const error = controls.getFirstError();

  return (
    <div>
      <TextField
        value={controls.getValue()}
        onChange={controls.onChange}
        error={!!error}
        helperText={error}
        label={label}
      />
    </div>
  );
}

function InputLibReactSelectIntegration({
  formState,
  model,
  property,
  options
}: BaseInputProps & { options: OptionsOrGroups<any, any> }) {
  const controls = formState.useForInput(model, property);
  const error = model.validator.getFirstErrorFor(property);

  return (
    <Select
      options={options}
      value={options.find((it: any) => it.value === model[property])}
      onChange={(option: any) => {
        controls.onValueChange(option.value);
      }}
    />
  );
}
