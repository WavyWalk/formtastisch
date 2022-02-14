import React from 'react'
import { FormState, InputUseOptions } from '../FormState'
import { BaseModel } from '../../frontmodel'

export function PlainInput<T extends BaseModel>({
  formState,
  model,
  property,
  validateFunc,
  additionallyOnChange
}: {
  formState: FormState
  model: T
  property: Extract<keyof T, string>
} & InputUseOptions) {
  const controls = formState.useForInput(model, property, {
    validateFunc,
    additionallyOnChange
  })

  return (
    <input
      style={{
        borderWidth: 'thin',
        borderColor: controls.getFirstError() ? 'red' : 'black'
      }}
      type="text"
      onChange={controls.onChange}
      value={model.modelData[property] ?? ''}
    />
  )
}
