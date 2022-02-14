import { BaseModel } from '../BaseModel'

/**
 * summary:
 * assigns on prototype a get and set for decorated property that
 * will get set on the
 * @see BaseModel.modelData
 * instead
 */
export function Property(...args: any): void {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [target, propertyName, descriptor]: [BaseModel, string, any] = args

  const knownProperties = (target.constructor as any).getKnownProperties()
  knownProperties[propertyName] = true

  const getter = function () {
    // @ts-ignore
    return this.modelData[propertyName]
  }

  const setter = function (valueToassign: any) {
    // @ts-ignore
    this.modelData[propertyName] = valueToassign
  }

  return {
    get: getter,
    set: setter
  } as any
}
