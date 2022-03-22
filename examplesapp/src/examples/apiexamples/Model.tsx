import {
  makeFormStateWithModel,
  validateIsRequired,
  makeFormModel
} from "formtastisch";
import * as React from "react";

// model will be created along with state
const formState = makeFormStateWithModel({
  initialData: { firstName: "", lastName: "" },
  validations: {
    firstName: (value) => validateIsRequired(value),
    lastName: (value) => validateIsRequired(value)
  }
});

// you can as well create model directly
const onlyModel = makeFormModel({
  initialData: { firstName: "", lastName: "" },
  validations: {}
});

const model = formState.model;

export function Model() {
  formState.use();

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <p>open console. For reference see onClick handlers</p>
      <button
        onClick={() => {
          console.log(model);
        }}
      >
        console.log model
      </button>

      <button
        onClick={() => {
          console.log(model.toObject());
        }}
      >
        console.log model.toObject()
      </button>

      <button
        onClick={() => {
          console.log(model.toObject({ includeErrors: true }));
        }}
      >
        {`console.log model.toObject({includeErrors: true})`}
      </button>

      <button
        onClick={() => {
          // you can manipulate errors directly without validator.
          model.errors = undefined;
          model.errors = {
            firstName: ["invlid"],
            lastName: ["required", "tooShort"]
          };
          console.log(model.validator.getErrorsFor("lastName")); // ['required', 'tooShort']
          formState.update();
        }}
      >
        manipulate errors directly
      </button>
      <button
        onClick={() => {
          // model just an object, you can do whatever you want
          model.firstName = "foo";
          formState.update();
        }}
      >
        manipulate properties
      </button>

      <button
        onClick={() => {
          // toObject() retrieves "pure" data from model, this basically what you will use when you want to get data, and e.g. submit it.
          const data = model.toObject({
            // options are optional
            includeErrors: true, // default false, include or exclude errors to object
            exclude: ["lastName"], // optional: which properties to exclude in result
            include: ["firstName"], // optional: which properties to include in result
            tap: {
              // optional will override with the final result
              lastName: (value) => "ASDASD"
            }
          });
          console.log(data);
        }}
      >
        console.log model.toObject() with options
      </button>

      <button
        onClick={() => {
          // usefull when rendered in lists, you don't need any identifier and can use it as a key
          // so you don't have to assign temporary ids
          model.getUniqueReferenceKey();
          // [model, model].map((user) => {
          //   return <div key={user.getUniqueReferenceKey()}></div>
          // })
          console.log(model.getUniqueReferenceKey());
        }}
      >
        getUniqueReferenceKey()
      </button>

      <button
        onClick={() => {
          model.errors = undefined;
          formState.update();
        }}
      >
        unset errors directly
      </button>

      <pre>
        {JSON.stringify(model.toObject({ includeErrors: true }), null, 2)}
      </pre>
    </div>
  );
}
