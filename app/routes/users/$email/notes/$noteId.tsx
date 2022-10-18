import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useCatch, useLoaderData } from '@remix-run/react'
import invariant from 'tiny-invariant'

import { getNote } from '~/models/note.server'

export async function loader({ params }: LoaderArgs) {
  invariant(params.noteId, 'noteId not found')

  const note = await getNote({ id: params.noteId })
  if (!note) {
    throw new Response('Not Found', { status: 404 })
  }
  return json({ note })
}

export default function NoteDetailsPage() {
  const data = useLoaderData<typeof loader>()

  return (
    <div>
      <h3 className="text-2xl font-bold">{data.note.title}</h3>
      <p className="py-6">{data.note.body}</p>
    </div>
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
