import { makeFormStateWithModel, validateIsRequired } from '../src'

describe('formModel', () => {
  test('toObject', () => {
    const formState = makeFormStateWithModel({
      initialData: {
        firstName: 'joe'
      },
      validations: {
        firstName: (value) => validateIsRequired(value)
      }
    })

    const model: { firstName: string } = formState.model.toObject()

    expect(model).toStrictEqual({ firstName: 'joe' })
  })
})
