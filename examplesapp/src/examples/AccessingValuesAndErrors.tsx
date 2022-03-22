import { makeFormStateWithModel, validateIsRequired } from "formtastisch";
import * as React from "react";

const formState = makeFormStateWithModel({
  initialData: { firstName: "", lastName: "" },
  validations: {
    firstName: (value) => validateIsRequired(value),
    lastName: (value) => validateIsRequired(value)
  }
});

export function AccessingValuesAndErrors() {
  const { model } = formState.use();
  // you can as well formState.model

  return (
    <div>
      <input
        {...formState.makeInputProps("firstName")}
        placeholder="first name"
      />
      <input
        {...formState.makeInputProps("lastName")}
        placeholder="last name"
      />
      {/** remember model is just and object which you can easily access */}
      <p>firstName: {model.firstName}</p>
      <p>lastName: {formState.model.lastName}</p>
      <p>
        errors:
        <br />
        {/* return all errors for property */}
        firstName: {model.errors?.firstName}
        <br />
        {/* same as model.errors?.['lastName'] */}
        lastName: {model.validator.getFirstErrorFor("lastName")}
      </p>
      {/* model holds everything */}
      <pre>
        {JSON.stringify(model.toObject({ includeErrors: true }), null, 2)}
      </pre>
      <button
        onClick={() => {
          console.log(formState.validate());
          console.log(model.errors);
          // getData is basically same as modelToObject(formState.model)
          console.log(formState.getData({ includeErrors: true }));
        }}
      >
        submit
      </button>

      <button
        onClick={() => {
          // we can do anything with model
          model.validator.addError("firstName", "lame");
          // main thing is to update() so it's synced with react world
          formState.update();
        }}
      >
        add firstName error programmatically
      </button>

      {model.validator.getFirstErrorFor("firstName") === "lame" && (
        <button
          onClick={() => {
            // we can do anything with model
            model.validator.removeErrors("firstName");
            // main thing is to update() so it's synced with react world
            formState.update();
          }}
        >
          clear firstName error programmatically
        </button>
      )}

      <button
        onClick={() => {
          model.firstName = "set programmatically";
          // main thing is to update() so it's synced with react world
          formState.update();
        }}
      >
        set firstName programmatically
      </button>
    </div>
  );
}
