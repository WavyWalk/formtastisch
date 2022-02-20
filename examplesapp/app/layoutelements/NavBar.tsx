import { FC } from 'react'
import { Link } from '@remix-run/react'

export function NavBar() {
  return (
    <div className="navbar bg-base-100">
      <a
        className="btn btn-ghost normal-case text-xl"
        href="https://github.com/WavyWalk/formtastisch"
      >
        Formtastisch
      </a>
      <Link className="btn btn-ghost normal-case text-xl" to="/">
        Examples home
      </Link>
    </div>
  )
}
