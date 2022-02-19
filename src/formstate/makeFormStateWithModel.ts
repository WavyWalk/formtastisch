import {
  makeFormModel,
  MakeFormModelArgs,
  ValidationMethods
} from '../formmodel/makeFormModel'
import { FormState } from './FormState'

/**
 * instantiates a {@link FormModel}, takes it and instantiates {@link FormState} with it.
 * - Refer to {@link makeFormModel} for detailed docs.
 * - Refer to {@link FormState} for detailed docs.
 *
 * @remarks This is a shortcut for:
 * ```
 * const formModel = makeFormModel(sameArgs)
 * const formState = new FormState(formModel)
 * ```
 * @param options
 */
export const makeFormStateWithModel = <
  DATA_T,
  V_T extends ValidationMethods<DATA_T, DATA_T>,
  TAP_T
>(
  options: MakeFormModelArgs<DATA_T, V_T, TAP_T>
) => {
  const formModel = makeFormModel(options)
  return new FormState(formModel)
}
