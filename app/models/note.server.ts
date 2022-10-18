import type { User, Note } from '@prisma/client'

import { prisma } from '~/db.server'

export type { Note } from '@prisma/client'

export function getNote({
  id,
  userId,
}: Pick<Note, 'id'> & {
  userId?: User['id']
}) {
  return prisma.note.findFirst({
    select: { id: true, body: true, title: true },
    where: userId ? { id, userId } : { id },
  })
}

export function getNoteListItems({ userId }: { userId: User['id'] }) {
  return prisma.note.findMany({
    where: { userId },
    select: { id: true, title: true },
    orderBy: { updatedAt: 'desc' },
  })
}

export function getNoteListItemsByEmail({ email }: { email: User['email'] }) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      notes: true,
    }
  }).then((result) => (result && result.notes) || [])
}

export function createNote({
  body,
  title,
  userId,
}: Pick<Note, 'body' | 'title'> & {
  userId: User['id']
}) {
  return prisma.note.create({
    data: {
      title,
      body,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  })
}

export function deleteNote({
  id,
  userId,
}: Pick<Note, 'id'> & { userId: User['id'] }) {
  return prisma.note.deleteMany({
    where: { id, userId },
  })
}
