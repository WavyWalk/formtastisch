/* eslint-disable @typescript-eslint/no-use-before-define */
import { makeFormStateWithModel, validateIsRequired } from "formtastisch";
import { modelToObject } from "formtastisch";
import * as React from "react";

interface UserData {
  firstName: string;
  lastName: string;
  avatar?: File;
}

const formState = makeFormStateWithModel({
  initialData: { firstName: "", lastName: "", file: undefined } as UserData,
  validations: {
    firstName: (value) => validateIsRequired(value),
    lastName: (value) => validateIsRequired(value)
  }
});

export function BasicExample() {
  formState.use();

  return (
    <div className="componentSection">
      <input
        {...formState.makeInputProps("firstName")}
        placeholder="first name"
      />
      <input
        {...formState.makeInputProps("lastName")}
        placeholder="last name"
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
          formState.model.firstName = "Hello there";
          formState.update();
        }}
      >
        set name and update
      </button>
    </div>
  );
}
