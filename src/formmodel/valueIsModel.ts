export const valueIsModel = (value: any) => {
  if (!value || typeof value !== 'object') {
    return false
  }
  return value && 'isFormtastischFormModel' in value
}
