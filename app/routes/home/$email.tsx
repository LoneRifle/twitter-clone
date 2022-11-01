import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useCatch, useLoaderData } from '@remix-run/react'
import invariant from 'tiny-invariant'

import { getNoteListItemsByEmail } from '~/models/note.server'

export async function loader({ params }: LoaderArgs) {
  invariant(params.email, 'email not found')

  const notes = await getNoteListItemsByEmail({ email: params.email })
  return json({ notes })
}

export default function FollowingPage() {
  const data = useLoaderData<typeof loader>()

  return (
    <>
      {data.notes.map((note) => 
        <div key={note.id}>
          <h3 className="text-2xl font-bold">{note.title}</h3>
          <p className="py-6">{note.body}</p>
        </div>
      )}
    </>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)

  return <div>An unexpected error occurred: {error.message}</div>
}

export function CatchBoundary() {
  const caught = useCatch()

  if (caught.status === 404) {
    return <div>Note not found</div>
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`)
}
