/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  makeFormStateWithModel,
  validateIsRequired,
  FormState
} from "formtastisch";
import * as React from "react";
import { RenderCount } from "../../utilcomponents/RenderCount";

export function FormStateUse() {
  const formState = React.useMemo(
    () =>
      makeFormStateWithModel({
        initialData: { firstName: "", lastName: "", email: "" },
        validations: {
          firstName: (value) => validateIsRequired(value),
          lastName: (value) => validateIsRequired(value),
          email: (value) => validateIsRequired(value)
        }
      }),
    []
  );
  // notice we don't .use() it here so this component is not subscibed and just passes to children.
  // this component will not update on any formState changes

  return (
    <div className="componentSection" style={{ paddingTop: 10 }}>
      <RenderCount />
      <UseAllChanges formState={formState} />
      <UseNoUpdates formState={formState} />
      <UseWithDeps formState={formState} />
    </div>
  );
}

function UseAllChanges({ formState }: { formState: FormState }) {
  formState.use();

  return (
    <div className="componentSection">
      <RenderCount />
      <p>This will update on any changes in state</p>
      <input
        {...formState.makeInputProps("firstName")}
        placeholder="first name"
      />
      <input
        {...formState.makeInputProps("lastName")}
        placeholder="last name"
      />
      <p>{JSON.stringify(formState.model.toObject({ includeErrors: true }))}</p>
    </div>
  );
}

function UseNoUpdates({ formState }: { formState: FormState }) {
  // empty deps means does not update no matter what (unless parent updates)
  formState.use(() => []);

  return (
    <div className="componentSection">
      <RenderCount />
      <p>This will not update on formState changes</p>
      <p>{JSON.stringify(formState.model.toObject({ includeErrors: true }))}</p>
    </div>
  );
}

function UseWithDeps({ formState }: { formState: FormState }) {
  // specify deps on which the component will update
  formState.use((state) => [
    state.model.lastName,
    state.model.errors?.lastName?.[0]
  ]);

  return (
    <div className="componentSection">
      <RenderCount />
      <p>
        This will update only on lastName or lastName error changes in state
      </p>
      <p>firstName: {formState.model.firstName}</p>
      <p>lastName: {formState.model.lastName}</p>
    </div>
  );
}
