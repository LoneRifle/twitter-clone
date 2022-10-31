import type { Password, User } from '@prisma/client'
import bcrypt from 'bcryptjs'

import { prisma } from '~/db.server'

export type { User } from '@prisma/client'

export async function getUserById(id: User['id']) {
  return prisma.user.findUnique({ where: { id } })
}

export async function getUserByEmail(email: User['email']) {
  return prisma.user.findUnique({ where: { email } })
}

export async function isFollowing(id: User['id'], emailToFollow: User['email']) {
  const follower = await prisma.user.findUnique({ 
    where: { id },
    include: {
      following: true,
    }
  })
  if (!follower) {
    throw new Error(`Cannot find user ${id}`)
  }
  const user = await getUserByEmail(emailToFollow) 
  if (!user) {
    throw new Error(`Cannot find ${emailToFollow}`)
  }
  return follower.following.some(f => f.userId === user.id)
}

export async function followUser(id: User['id'], emailToFollow: User['email']) {
  const user = await getUserByEmail(emailToFollow)
  if (!user) {
    throw new Error(`Cannot follow ${emailToFollow} - not found`)
  }
  return prisma.follower.create({
    data: {
      userId: user.id, followerId: id
    }
  })
}

export async function unfollowUser(id: User['id'], emailToFollow: User['email']) {
  const user = await getUserByEmail(emailToFollow)
  if (!user) {
    throw new Error(`Cannot unfollow ${emailToFollow} - not found`)
  }
  return prisma.follower.deleteMany({
    where: {
      followerId: id,
      userId: user.id,
    }
  })
}

export async function createUser(email: User['email'], password: string) {
  const hashedPassword = await bcrypt.hash(password, 10)

  return prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  })
}

export async function deleteUserByEmail(email: User['email']) {
  return prisma.user.delete({ where: { email } })
}

export async function verifyLogin(
  email: User['email'],
  password: Password['hash'],
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  })

  if (!userWithPassword || !userWithPassword.password) {
    return null
  }

  const isValid = await bcrypt.compare(password, userWithPassword.password.hash)

  if (!isValid) {
    return null
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword

  return userWithoutPassword
}
