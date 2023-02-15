import React, { FC } from 'react'
import { FormState } from './FormState'
import { FormModel } from '../formmodel/FormModel'
import { UseForInputReturns } from './UseForInputReturns'
import { InputPropsForModel } from './InputPropsForModel'

/**
 * This component is used for optimising rerenders, so you get the same performance as with uncontrolled components.
 * The wrapped input will only update whenever only value, error are changed
 *
 * @remark it is important that you also "dependize" the parent component so it does not rerender.
 *
 * @example achieve that only isolated inputs get rerendered
 * ```
 * function Form() {
 *   // specify empty dependencies: parent will not update on state changes
 *   formState.use(() => [])
 *
 *   return <>
 *      // on change of firstName only this input gets rerendered, parent stays as is
 *      <IsolateInput formState={formState} property={'firstName'}>
 *       {(controls) => (
 *         <input value={controls.value} onChange={controls.onChange} />
 *       )}
 *       </IsolateInput>
 *       // on change of lastName only this input gets rerendered, parent stays as is
 *       <IsolateInput formState={formState} property={'lastName'}>
 *       {(controls) => (
 *         <input value={controls.value} onChange={controls.onChange} />
 *       )}
 *       </IsolateInput>
 *   <>
 * }
 *
 * ```
 */
export const IsolateInput: FC<{
  children: (
    controls: UseForInputReturns<any> & InputPropsForModel
  ) => React.ReactElement
  formState: FormState
  model?: FormModel
  property: string | any
}> = ({ children, formState, model, property }) => {
  const controls = formState.useForInput(model ?? formState.model, property)
  return children({ ...controls, value: controls.getValue() ?? ('' as any) })
}
