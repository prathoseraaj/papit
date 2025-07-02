// types/next.d.ts - Create this file if it doesn't exist
import type { NextApiResponse } from 'next'
import type { Server as NetServer, Socket } from 'net'
import type { Server as SocketIOServer } from 'socket.io'

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer
    }
  }
}