export const valueIsModelArray = (value: any) => {
  if (!Array.isArray(value)) {
    return false
  }

  return 'isFormtastischFormModel' in value[0]
}
