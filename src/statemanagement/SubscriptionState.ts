import { useEffect, useMemo, useState } from 'react'

export type ISubscribeOptions<THIS_T> = {
  updateDeps?: (state: THIS_T) => any
  onUnsubscribed?: () => any
}

type IUpdateStateFunc = (...args: any) => any

interface ISubscribedEntry extends ISubscribeOptions<any> {
  updateState: IUpdateStateFunc
  snapshot?: any
  lastVersion: number
}

/**
 * subscribes components calling use() on instance of it,
 * anytime update is called will rerender each subscribed component.
 * on component unmount, the component will automatically be unsubscribed.
 *
 * @see use
 */
export class SubscriptionState {
  /**
   * state version be incremented on each update
   * each time component renders, it's entry be updated with the version of this state.
   * when it comes to decision if component should be updated,
   * the version of update be compared to last rendered version,
   * if they're same, or rendered version is bigger than state version it will be skipped.
   * effectively this insures that component be updated exactly once for each version, preventing
   * rerendering for e.g. nested components subscribed for same state.
   */
  protected version = 0

  /**
   * tracks last subscribed component key reference,
   * each time component subscribes value be incremented, and such incremented value be used
   * as key under which component will be subscribed
   */
  protected lastSubscribedComponentKey = 0

  /**
   * will use {@see lastSubscribedComponentKey} and put under it {@see ISubscribedEntry}
   */
  protected subscribedEntries: { [key: number]: ISubscribedEntry } = {}

  /**
   * subscribes component to this state represented by extending instance,
   * behind the scenes will call useState using someNumber as it's initial state.
   * the updateState from called useState and supplied options,
   * will be stored under generated key on subscribed entries (simple object on this instance),
   * any time update is called, all entries be traversed and corresponding
   * update func be called, leading to update.
   * on unmount entry will be deleted by the key it was subscribed under.
   *
   * as options may be passed:
   *
   * updateDeps?: a function that returns an array of dependencies. Before the next update, same func be called, and
   * it's contents compared against the result of previous call. If both are same, update will be ignored
   * onUnsubscribed?: any cleanup function on component's unmount.
   * options are optional
   *
   * @example
   * ```
   * someState.use() // on update call will trigger update for this component
   * someState.use({
   *     updateDeps: (state) => [state.foo, state.bar]
   * }) // will only update if return func of updateDeps is different since last update
   * // comparison will happen shallowly and strict.
   *
   *
   * //---------------------
   *
   * // how it basically works:
   * class SomeState extends SubscriptionState {
   *   counter = 1
   *
   *   updateCounter = () => {
   *      this.counter += 1
   *      this.update()
   *   }
   * }
   *
   * SomeComponent
   *   someState.use()
   *
   * // someState.subScribedEntries // {1: {updateState, ...}}
   *
   * OtherComponent
   *   someState.use()
   *
   * // someState.subScribedEntries // {2: {updateState, ...}}
   * // someState.update() // will just iterate over subscribed components and call update function so they're rerendered
   * // that's it.
   * ```
   */
  public use(options?: ISubscribeOptions<this>): this {
    /**
     * number is put as initial state, has no other meaning as to just trigger an update when it will be incremented.
     * e.g. if we would pass any other value, react does check by strict comparison, but incrementing a number always
     * trigger an update.
     * */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, updateState] = useState(1)

    const id = useMemo(() => {
      /** increment internal last id and return it */
      const id = this.getNextSubscribedComponentId()
      /** will write entry with updateState func under generated key */
      this.subscribe(id, updateState, options)
      return id
    }, [this])

    /**
     * because use runs on each render, the entry of this object on state be updated with the version of state
     * existing at the moment of render, later that version be used to prevent unnecessary rerenders
     * (e.g. if parent already cascaded an update for this comp).
     * */
    this.subscribedEntries[id].lastVersion = this.version

    useEffect(() => {
      return () => {
        /** removes entry under the key */
        this.unsubscribe(id)
        /** your cleanup func if provided */
        options?.onUnsubscribed?.()
      }
    }, [])
    return this
  }

  /** and puts {@link ISubscribedEntry} under subscriber's id it in {@link subscribedEntries} */
  private subscribe = (
    id: number,
    updateState: (...args: any) => any,
    options?: ISubscribeOptions<this>
  ) => {
    this.subscribedEntries[id] = {
      updateState,
      lastVersion: this.version,
      snapshot: options?.updateDeps?.(this),
      ...options
    }
  }

  /** returns next id for subscriber. Internal id is incremented */
  protected getNextSubscribedComponentId() {
    return (this.lastSubscribedComponentKey += 1)
  }

  protected unsubscribe(id: number) {
    delete this.subscribedEntries[id]
  }

  /** each update increments the version. this can be used for e.g. preventing unnecessary rerenders */
  private incrementVersion() {
    this.version += 1
    return this.version
  }

  /**
   * exists for cases when you need to override it.
   * @example
   * ```
   * class FooState extends SubscriptionState {
   *   update = () => {
   *     doSomeLogic
   *     this._update()
   *   }
   * }
   * ```
   */
  update = () => {
    this._update()
  }

  protected _update() {
    /** increment the version, the value be used for should update logic */
    this.incrementVersion()
    for (const id of Object.keys(this.subscribedEntries)) {
      const subscribedEntry = this.subscribedEntries[id as any]

      /** if component was already rendered with this version - ignore (e.g. was rendered as child of parent which
       * subscribed to same state) */
      if (subscribedEntry.lastVersion >= this.version) {
        continue
      }

      /** if use() was supplied with deps, check if they are different from previous one */
      if (subscribedEntry.updateDeps) {
        const newSnapshot = subscribedEntry.updateDeps(this)
        const oldSnapshot = subscribedEntry.snapshot
        if (newSnapshot.length === 0 && oldSnapshot.length === 0) {
          continue
        }
        let hasDif = false
        for (let i = 0; i < newSnapshot.length; i++) {
          if (newSnapshot[i] !== oldSnapshot[i]) {
            hasDif = true
            break
          }
        }
        if (!hasDif) {
          continue
        }
        /**
         * make user defined snapshot of current state for later comparison in should update
         * and store it on entry
         * */
        subscribedEntry.snapshot = newSnapshot
      }

      subscribedEntry.updateState((it: number) => it + 1)
    }
  }
}
