import { Link } from '@remix-run/react'

export default function Index() {
  return (
    <div className="">
      <h1>Examples</h1>
      <ul className={'list-disc'}>
        <li>
          <Link to={'/examples/basic'}>basic usage</Link>
        </li>
      </ul>
    </div>
  )
}
