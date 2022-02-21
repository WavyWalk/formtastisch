import { ChangeEvent } from 'react'

export type InputPropsForModel = {
  onChange: (e: ChangeEvent<any>) => void
  onBlur: () => void
  value: string
}
