import * as React from 'react'
import { useRef } from 'react'

export function RenderCount() {
  const count = useRef(0)
  React.useEffect(() => {
    count.current += 1
  })
  return <span className={'renderCount'}>{count.current}</span>
}
