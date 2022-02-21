import { FormState } from './FormState'

export type FormStateValidateArgs<T extends FormState> = {
  validateNested?: true
  update?: boolean
  methods?: Parameters<T['model']['validator']['validate']>[0][]
}
