import {
  makeFormStateWithModel,
  validateIsRequired,
  makeFormModel
} from "formtastisch";
import * as React from "react";

const formState = makeFormStateWithModel({
  initialData: {
    firstName: "",
    lastName: "",
    email: "",
    // make a nested model
    address: makeFormModel({
      initialData: { street: "" },
      validations: {}
    })
  },
  validations: {
    firstName: (value) => validateIsRequired(value),
    lastName: (value) => validateIsRequired(value),
    email: (value) => validateIsRequired(value)
  }
});

// utilities included in FormState
export function FormStateApi() {
  // subscribe to state
  formState.use();

  return (
    <div className="componentSection">
      {/** make on change and value,
       * effectively same as formState.makeInputPropsForModel(formState.model, 'firstName')  */}
      <input
        {...formState.makeInputProps("firstName")}
        placeholder="first name"
      />

      {/** you can make props and handlers separately, but you need to specify the model as well */}
      <input
        onChange={formState.makeOnChangeHandler(formState.model, "lastName", {
          // accepts same options as make input props
          // validate: () => yourValidateFunc
          // additionallyOnChange: () => will run additionally on change
          // skipValidationOnChange: bool
        })}
        value={formState.model.lastName}
        placeholder="last name"
      />

      {/** input props for specific model, accepts same options as makeInputProps, makeOnChangeHandler */}
      <input
        {...formState.makeInputPropsForModel(formState.model.address, "street")}
        placeholder="street"
      />

      {/** you can have a full controll on handling, how to set a value, when to validate and when to update state. */}
      <input
        onChange={(e) => {
          formState.model.email = e.target.value;
          formState.model.validator.email();
          // REMEMBER: to trigger render of subscribed/"using" components you need to call formState.update() explicitly
          formState.update();
          // all above is same as formState.onValueChange(e.target.value, formState.model, 'email')
        }}
        value={formState.model.email}
        placeholder="email"
      />

      <pre>
        {JSON.stringify(formState.getData({ includeErrors: true }), null, 2)}
      </pre>

      <button
        onClick={() => {
          formState.model.validator.addError("firstName", "manuallySetError");
          formState.update();
        }}
      >
        add error programmatically
      </button>

      <button
        onClick={() => {
          // we can programmatically set value. this is same as set, validate, update
          formState.onValueChange("joe", formState.model, "firstName");
          // same as:
          // model.firstName = 'joe'
          // model.validator.firstName()
          // update()
        }}
      >
        set name and update
      </button>

      <button
        onClick={() => {
          formState.validate();
        }}
      >
        validate all
      </button>

      <button
        onClick={() => {
          formState.validate({ update: false });
        }}
      >
        validate without updating componentes
      </button>

      <button
        onClick={() => {
          console.log("isValid()", formState.isValid());
        }}
      >
        log is valid
      </button>

      <button
        onClick={() => {
          console.log("isValid()", formState.isValid({ validate: true }));
        }}
      >
        log is valid with validate and update
      </button>

      <button
        onClick={() => {
          console.log("formState.getData", formState.getData());
          console.log(
            "formState.getData({includeErrors: true})",
            formState.getData({ includeErrors: true })
          );
          // this is same as
          // formState.model.toObject()
          // formState.model.toObject({includeErrors: true})
        }}
      >
        log data
      </button>
    </div>
  );
}
