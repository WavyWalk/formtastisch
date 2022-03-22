/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  FormModel,
  FormState,
  makeFormStateWithModel,
  validateMinLength,
  IsolateInput
} from "formtastisch";
import type { BaseInputProps } from "formtastisch";
import * as React from "react";
import { RenderCount } from "../utilcomponents/RenderCount";

/**
 * Actually strength of formtastisch is its straitforward state management capability
 * You just specify the data, on which components rely, and thus you dont get unnecessary rerenders.
 * as well you don't need any context, so update do not affect children.
 *
 * here each component as well will show the render count, so you can see what gets updated
 */

const initialData = { firstName: "", lastName: "" };
const formState = makeFormStateWithModel({
  initialData,
  validations: {
    firstName: (value) => validateMinLength(value, 3),
    lastName: (value) => validateMinLength(value, 3)
  }
});

export function OptimizingPerformance() {
  // controlling on which data from state components depend on is easy,
  // just provide them as an arg to use(), empty [] means that component will NOT render on state changes
  // but you can put anything from the state that will be passed to callback
  // here we state that component holding a form does not update at all, delegating decision to child components
  formState.use(() => []);
  // above is same to formState.use({deps: () => []})
  // to set dependencies specific dependecies you could formState.use((state) => [state.model.whenThisChanges, state.whenValid]) etc.

  return (
    <div className="componentSection" style={{ paddingTop: "10px" }}>
      <RenderCount />
      {/* here we use an IsolateInput utility component, that uses dependencies and updates only on changes that are relevant to the property and rererenders wrapped component (or actually anything that is wrapped) */}
      <IsolateInput formState={formState} property={"firstName"}>
        {(controls) => (
          <div className="componentSection">
            <RenderCount />
            <label>{"first name"}</label>
            <input
              type="text"
              value={controls.value}
              onChange={controls.onChange}
            />
            {controls.getFirstError() && (
              <p className="inputError">{controls.getFirstError()}</p>
            )}
          </div>
        )}
      </IsolateInput>
      {/* same can be achieved by extracting your inputs. You anyway do it probably. */}
      <CustomInput
        formState={formState}
        model={formState.model}
        property="lastName"
      />
      <SubmitGroup formState={formState} />
    </div>
  );
}

/**
 * You can as well extract inputs to separate components.
 * This way you can handle any e.g. ui lib or custom inputs
 *
 * note: generic needed just for typing, it can be omitted
 */
function CustomInput<T extends FormModel>({
  formState,
  model,
  property
}: BaseInputProps<T>) {
  // use for input will use use() behind the scenes and will dep the model, property and errors for property
  // something like use(()=>[model.property, model.errors[property]?.[0]]).
  // As well this is effectively same what's done in IsolateInput. Here we could as well just return wrapped in a IsolateInput
  const controls = formState.useForInput(model, property as any);
  const error = controls.getFirstError();

  return (
    <div className="componentSection">
      <RenderCount />
      <label>{property}</label>
      <input
        type="text"
        value={controls.getValue() as any}
        onChange={controls.onChange}
      />
      {error && <p className="inputError">{error}</p>}
    </div>
  );
}

/**
 * as a good practice we'll extract something that can be moved from forms component that is a parent and so the things are updated independently and only on changes that are relevant for them
 */
function SubmitGroup({ formState }: { formState: FormState }) {
  // as you see this component depends and will be updated only when form isValid value changes
  formState.use((state) => [state.isValid({ validate: false })]);

  const active = formState.touched
    ? // we call {validate: false} because we don't want the whole validation to run
      // just isValid() will as well validate and call update and than return the isValid for that
      formState.isValid({ validate: false })
      ? "can submit"
      : "can not submit"
    : "can not submit";

  return (
    <div className="componentSection">
      <RenderCount />
      <button>button. {active}</button>
    </div>
  );
}
