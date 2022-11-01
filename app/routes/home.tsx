import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, Link, NavLink, Outlet, useLoaderData } from '@remix-run/react'

import { getFollowingsByUserId } from '~/models/user.server'
import { requireUserId } from '~/session.server'
import { useUser } from '~/utils'

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request)
  const followings = await getFollowingsByUserId(userId)
  const followingEmails = (followings || []).map(({ user }) => user.email)
  return json({ followingEmails })
}

export default function HomePage() {
  const data = useLoaderData<typeof loader>()
  const user = useUser()

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to=".">Home</Link>
        </h1>
        <p>{user.email}</p>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
      </header>

      <main className="flex h-full bg-white">
        <div className="h-full w-80 border-r bg-gray-50">
          <Link to="/notes" className="block p-4 text-xl text-blue-500">
            My Notes
          </Link>

          <hr />
          <p className="p-4 text-xl">
            Following
          </p>
          {data.followingEmails.length === 0 ? (
            <p className="p-4">Not following anybody!</p>
          ) : (
            <ol>
              {data.followingEmails.map((email) => (
                <li key={email}>
                  <NavLink
                    className={({ isActive }) =>
                      `block border-b p-4 text-l ${isActive ? 'bg-white' : ''}`
                    }
                    to={email}
                  >
                    {email}
                  </NavLink>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
