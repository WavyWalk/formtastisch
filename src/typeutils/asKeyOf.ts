export const asKeyOf = <T>(k: keyof T) : keyof T => {
  return k
}

export const nameOf = <T>(key: keyof T) => key
