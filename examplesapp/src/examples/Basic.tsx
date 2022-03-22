import { makeFormStateWithModel, validateIsRequired } from "formtastisch";
import * as React from "react";

const formState = makeFormStateWithModel({
  initialData: { firstName: "", lastName: "", email: "" },
  validations: {
    firstName: (value) => validateIsRequired(value),
    lastName: (value) => validateIsRequired(value),
    email: (value) => validateIsRequired(value)
  }
});

export function BasicExample() {
  // subscribe to state
  formState.use();

  return (
    <div className="componentSection">
      <input
        {...formState.makeInputProps("firstName")}
        placeholder="first name"
      />
      {/** you can make props and handlers separately */}
      <input
        onChange={formState.makeOnChangeHandler(formState.model, "lastName")}
        value={formState.model.lastName}
        placeholder="last name"
      />
      {/** you can have a full controll on handling, how to set a value, when to validate and when to update state. */}
      <input
        onChange={(e) => {
          formState.model.email = e.target.value;
          formState.model.validator.email();
          formState.update();
          // above is same as formState.onValueChange(e.target.value, formState.model, 'email')
        }}
        value={formState.model.email}
        placeholder="email"
      />
      <pre>
        {JSON.stringify(formState.getData({ includeErrors: true }), null, 2)}
      </pre>
      <button
        onClick={() => {
          console.log(formState.validate());
          console.log(formState.isValid());
          console.log(formState.model);
          console.log(formState.model.toObject());
        }}
      >
        submit
      </button>

      <button
        onClick={() => {
          // we can programmatically set value. this is same as set, validate, update
          formState.onValueChange("joe", formState.model, "firstName");
        }}
      >
        set name and update
      </button>
    </div>
  );
}
