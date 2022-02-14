export class ObjectToQueryStringSerializer {
  static serialize(objectToSerialize?: { [id: string]: any }) {
    if (!objectToSerialize) {
      return null
    }
    return this.serializeLevel(objectToSerialize)
  }

  private static serializeLevel(
    objectToSerialize: { [id: string]: any },
    pathAccumulator: string | null = null
  ): string {
    const result = []
    for (const property in objectToSerialize) {
      // eslint-disable-next-line no-prototype-builtins
      if (objectToSerialize.hasOwnProperty(property)) {
        const propertyPath = pathAccumulator
          ? `${pathAccumulator}[${property}]`
          : property
        const value = objectToSerialize[property]
        result.push(
          value !== null && typeof value === 'object'
            ? this.serializeLevel(value, propertyPath)
            : encodeURIComponent(propertyPath) + '=' + encodeURIComponent(value)
        )
      }
    }
    return result.join('&')
  }
}
