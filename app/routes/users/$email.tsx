import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link, NavLink, Outlet, useLoaderData, useParams } from '@remix-run/react'
import invariant from 'tiny-invariant'

import { getNoteListItemsByEmail } from '~/models/note.server'

export async function loader({ params }: LoaderArgs) {
  invariant(params.email, 'userId not found')
  const email = params.email

  const noteListItems = await getNoteListItemsByEmail({ email })
  return json({ noteListItems })
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
