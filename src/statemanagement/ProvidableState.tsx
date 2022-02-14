import * as React from 'react'

type IStateValue<T> = { state: T }

export class ProvidableState {
  context!: React.Context<IStateValue<this>>

  _dispatch!: () => void

  dispatch = () => {
    this._dispatch()
  }

  protected reducer = () => {
    return { state: this } as any
  }

  constructor() {
    this.context = React.createContext(null as any)
  }

  provider = (props: React.PropsWithChildren<any>) => {
    const [{ state }, dispatch] = React.useReducer(this.reducer, {
      state: this
    })
    this._dispatch = dispatch as any
    return (
      // eslint-disable-next-line no-undef
      <this.context.Provider value={{ state }}>
        {props.children}
      </this.context.Provider>
    )
  }

  use() {
    const stateValue = React.useContext(this.context)
    if (!stateValue) {
      console.error("ProvidableState should be child of it's provider")
    }
    return stateValue.state
  }
}
