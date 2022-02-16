import { FormModel } from './FormModel'
import { valueIsModelArray } from './valueIsModelArray'
import { valueIsModel } from './valueIsModel'

export const modelToObject = <T extends FormModel>(
  model: T,
  options?: {
    includeErrors?: boolean
    include?: (keyof T)[]
    exclude?: (keyof T)[]
    tap?: {
      [id in keyof T]?: (it: any) => any
    }
  }
) => {
  const result: Record<string, any> = {}
  let properties = options?.include ?? Object.keys(model)

  const exclude = ['validator']
  if (!options?.includeErrors) {
    exclude.push('errors')
  }
  if (options?.exclude) {
    for (let i = 0; i < options.exclude.length; i++) {
      exclude.push((options.exclude as any)[i])
    }
  }

  for (let i = 0; i < exclude.length; i++) {
    const indexToRemove = properties.indexOf((exclude as any)[i])
    if (indexToRemove !== -1) {
      properties.splice(indexToRemove, 1)
    }
  }

  if (options?.tap) {
    const tapKeys = Object.keys(options.tap)
    for (let i = 0; i < tapKeys.length; i++) {
      result[tapKeys[i]] = (options.tap as any)[tapKeys[i]](
        (model as any)[tapKeys[i]]
      )
    }
    properties = (properties as any).filter((it: any) => tapKeys!.includes(it))
  }

  for (let i = 0; i < properties.length; i++) {
    const key = properties[i]
    const value = (model as any)[key]
    if (valueIsModel(value)) {
      ;(result as any)[key] = modelToObject(value, {
        includeErrors: options?.includeErrors
      })
      continue
    }
    if (valueIsModelArray(value)) {
      ;(result as any)[key] = value.map((it: any) =>
        modelToObject(it, { includeErrors: options?.includeErrors ?? true })
      )
      continue
    }
    ;(result as any)[key] = (model as any)[key]
  }

  return result
}
