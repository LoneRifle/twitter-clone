import type { ActionArgs, LoaderArgs} from '@remix-run/node';
import { redirect } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, Link, NavLink, Outlet, useLoaderData, useParams } from '@remix-run/react'
import invariant from 'tiny-invariant'

import { getNoteListItemsByEmail } from '~/models/note.server'
import { followUser, isFollowing, unfollowUser } from '~/models/user.server';
import { getUserId, requireUserId } from '~/session.server'

export async function loader({ request, params }: LoaderArgs) {
  invariant(params.email, 'userId not found')
  const email = params.email
  const userId = await getUserId(request)

  const noteListItems = await getNoteListItemsByEmail({ email })
  const following = Boolean(userId && await isFollowing(userId, email))
  return json({ noteListItems, following })
}

export async function action({ request, params }: ActionArgs) {
  const userId = await requireUserId(request, request.url)
  invariant(params.email, 'userId not found')
  const email = params.email
  const following = await isFollowing(userId, email)
  if (following) {
    await unfollowUser(userId, email)
  } else {
    await followUser(userId, email)
  }

  return redirect(request.url)
}


export default function NotesPage() {
  const data = useLoaderData<typeof loader>()
  const params = useParams()

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to=".">Notes from { params.email }</Link>
        </h1>
        <Form method="post" action={`/users/${params.email}`} reloadDocument>
          <button 
            type="submit"
            className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            {data.following ? 'Unfollow' : 'Follow'}
          </button>
        </Form>
      </header>

      <main className="flex h-full bg-white">
        <div className="h-full w-80 border-r bg-gray-50">
          {data.noteListItems.length === 0 ? (
            <p className="p-4">No notes yet</p>
          ) : (
            <ol>
              {data.noteListItems.map((note) => (
                <li key={note.id}>
                  <NavLink
                    className={({ isActive }) =>
                      `block border-b p-4 text-xl ${isActive ? 'bg-white' : ''}`
                    }
                    to={`notes/${note.id}`}
                  >
                    {note.title}
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
