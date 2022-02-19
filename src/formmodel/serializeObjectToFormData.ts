/**
 * serializes any object to a FormData.
 * Nested form data serialized in "hash notation", which works with most of the frameworks:
 * @example
 * ```
 * const user = {
 *   name: 'joe',
 *   likes: ['food', 'weed'],
 *   account: {
 *     password: '123'
 *   }
 * }
 *
 * serializeObjectToFormData(user)
 *
 * // results in multipart
 * `
 * name = 'joe'
 * likes[0] = 'food'
 * likes[1] = 'weed'
 * account[password] = '123'
 * `
 * ```
 */
export const serializeObjectToFormData = (
  object: any,
  form?: FormData,
  namespace?: string
): FormData => {
  if (!object) {
    return null as any
  }
  const formData = form || new FormData()

  for (const property of Object.keys(object)) {
    const formKey = namespace ? `${namespace}[${property}]` : property
    if (object[property] instanceof Date) {
      formData.append(formKey, object[property].toISOString())
    } else if (
      typeof object[property] === 'object' &&
      !(object[property] instanceof File)
    ) {
      serializeObjectToFormData(object[property], formData, formKey)
    } else {
      formData.append(formKey, object[property])
    }
  }
  return formData
}
