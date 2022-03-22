import * as React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ExamplesRoot } from './examples/ExamplesRoot'
import { BasicExample } from './examples/Basic'
import { AccessingValuesAndErrors } from './examples/AccessingValuesAndErrors'
import { InitializingFormStateWaysToInitialize } from './examples/InitializingFormStateWaysToInitialize'
import { CreatingFormState } from './examples/CreatingFormState'
import { CustomValidations } from './examples/CustomValidations'
import { SharingFormState } from './examples/SharingFormState'
import { CustomInputs } from './examples/CustomInputs'
import { OptimizingPerformance } from './examples/OptimizingPerformance'
import { CustomizingFormState } from './examples/CustomizingFormState'
import { IncludedValidations } from './examples/IncludedValidations'
import { DynamicAndNestedForms } from './examples/DynamicAndNestedForms'
import { CorrectlyTypingFormStateAndData } from './examples/CorrectlyTypingFormStateAndData'
import { CustomModelValidatorAndState } from './examples/CustomModelValidatorAndState'
import { ThousandControlledInputs } from './examples/ThousandControlledInputs'
import { IntegratingWithOtherLibs } from './examples/IntegratingWithOtherLibs'
import { FormStateAsStateManager } from './examples/apiexamples/FormStateAsStateManager'
import { FormStateUse } from './examples/apiexamples/FormState.use'
import { FormStateMakeInputProps } from './examples/apiexamples/FormState.makeInputProps'
import { FormStateApi } from './examples/apiexamples/FormState_MiscApi'
import { FormStateUseForInput } from './examples/apiexamples/FormState.useForInput'
import { Model } from './examples/apiexamples/Model'


export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<ExamplesRoot />}>
          <Route path="basic" element={<BasicExample />} />
          <Route
            path="AccessingValuesAndErrors"
            element={<AccessingValuesAndErrors />}
          />
          <Route path="SharingFormState" element={<SharingFormState />} />
          <Route
            path="InitializingFormStateWaysToInitialize"
            element={<InitializingFormStateWaysToInitialize />}
          />
          <Route path="CreatingFormState" element={<CreatingFormState />} />
          <Route path="CustomValidations" element={<CustomValidations />} />
          <Route path="CustomInputs" element={<CustomInputs />} />
          <Route
            path="OptimizingRerenders"
            element={<OptimizingPerformance />}
          />
          <Route
            path="CustomizingFormState"
            element={<CustomizingFormState />}
          />
          <Route path="IncludedValidations" element={<IncludedValidations />} />
          <Route
            path="DynamicAndNestedForms"
            element={<DynamicAndNestedForms />}
          />
          <Route
            path="CorrectlyTypingFormStateAndData"
            element={<CorrectlyTypingFormStateAndData />}
          />
          <Route
            path="CustomModelValidatorAndState"
            element={<CustomModelValidatorAndState />}
          />
          <Route
            path="ThousandControlledInputs"
            element={<ThousandControlledInputs />}
          />
          <Route
            path="IntegratingWithOtherLibs"
            element={<IntegratingWithOtherLibs />}
          />
          <Route
            path="FormStateAsStateManager"
            element={<FormStateAsStateManager />}
          />
          <Route path="FormStateUse" element={<FormStateUse />} />
          <Route
            path="FormStateMakeInputProps"
            element={<FormStateMakeInputProps />}
          />
          <Route path="FormStateApi" element={<FormStateApi />} />
          <Route
            path="FormStateUseForInput"
            element={<FormStateUseForInput />}
          />
          <Route path="Model" element={<Model />} />
        </Route>
      </Routes>
    </div>
  )
}
