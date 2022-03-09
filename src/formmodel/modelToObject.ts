import { FormModel } from './FormModel'
import { valueIsModelArray } from './valueIsModelArray'
import { valueIsModel } from './valueIsModel'

export type ModelToObjectOptions<T> = {
  includeErrors?: boolean
  include?: (keyof T)[]
  exclude?: (keyof T)[]
  tap?: {
    [id in keyof T]?: (it: any) => any
  }
}

/**
 * serializes FormModel to an object.
 *
 * @example
 * ```
 * modelToObject(model, {
 *   includeErrors: true // will include errors in result, by default is treated as false.
 *   include: ['name', 'email'] // whitelist properties, everything else will be ignored
 *   exclude: ['baz'] // blacklist, includes everything except these
 *   tap: { // allows to override the values. Helpfull for controlling the nested serialization
 *     name: (it) => it.lowerCase()
 *     account: (it) => modelToObject(account, {include: ['email']})
 *   }
 * })
 * ```
 * @remark any nested models including arrays of models will be serialized as well respecting the initial options.includeErrors
 * if you need to override customize serialization for them, use tap.
 */
export const modelToObject = <T extends FormModel>(
  model: T,
  options?: ModelToObjectOptions<T>
) => {
  const result: Record<string, any> = {}
  let properties = options?.include ?? Object.keys(model)

  const exclude = ['validator', '_uniqueReferenceKey', 'getUniqueReferenceKey', 'toObject']

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
        modelToObject(it, { includeErrors: options?.includeErrors })
      )
      continue
    }
    ;(result as any)[key] = (model as any)[key]
  }

  return result
}
