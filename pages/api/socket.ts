import { Server as IOServer } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";

// Types
type Message = { content: string; userId: string };
type CursorUpdate = { userId: string; cursor: { from: number; to: number } };
type User = { id: string; name: string; color: string; cursor?: { from: number; to: number } };

// In-memory state
const roomDocs: Record<string, string> = {};
const roomUsers: Record<string, User[]> = {};

const getDefaultContent = () => `<h2>Getting Started</h2>
<p>Welcome to <strong>VIND Collaborative Editor</strong>, an opensource rich text editor with real-time collaboration! All extensions are licensed under <strong>MIT</strong>.</p>
<p>Integrate it by following the <a href="https://vind-docs.example.com" target="_blank">Vind_docs</a> or using our CLI tool.</p>
<h2>Collaborative Features</h2>
<p>A fully responsive rich text editor with built-in support for <strong>real-time collaboration</strong>. Multiple users can edit simultaneously with live cursors and instant synchronization. 🪄</p>
<p>Add images, customize alignment, and apply advanced formatting while working together with your team in real-time.</p>
<ul>
  <li><strong>Real-time collaboration</strong> with up to 5 team members.</li>
  <li><strong>Live cursors</strong> to see where others are working.</li>
  <li><strong>Instant synchronization</strong> of all changes across devices.</li>
  <li><strong>User presence indicators</strong> to see who's online.</li>
</ul>`;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(res.socket as any).server.io) {
    const io = new IOServer((res.socket as any).server, {
      path: "/api/socket",
      cors: { origin: "*", methods: ["GET", "POST"] },
    });

    io.on("connection", (socket) => {
      const room = (socket.handshake.query.room as string) || "default";
      let user: User;
      try {
        user = JSON.parse(socket.handshake.query.user as string);
      } catch (e) {
        user = {
          id: Math.random().toString(36).substr(2, 9),
          name: "Anonymous",
          color: "#888",
        };
        console.log(e);
      }

      socket.join(room);

      // Add user to room (avoid duplicates)
      if (!roomUsers[room]) roomUsers[room] = [];
      if (!roomUsers[room].find(u => u.id === user.id)) {
        roomUsers[room].push(user);
      }

      // Send current doc content
      if (!roomDocs[room]) roomDocs[room] = getDefaultContent();
      socket.emit("init-content", roomDocs[room]);

      // Notify all users in room
      io.in(room).emit("users-updated", roomUsers[room]);

      // Handle content changes
      socket.on("content-changed", (data: Message) => {
        roomDocs[room] = data.content;
        socket.to(room).emit("content-changed", data);
      });

      // Handle cursor changes
      socket.on("cursor-changed", (data: CursorUpdate) => {
        roomUsers[room] = roomUsers[room].map((u) =>
          u.id === data.userId ? { ...u, cursor: data.cursor } : u
        );
        socket.to(room).emit("cursor-changed", data);
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        roomUsers[room] = (roomUsers[room] || []).filter((u) => u.id !== user.id);
        io.in(room).emit("users-updated", roomUsers[room]);
      });
    });

    (res.socket as any).server.io = io;
  }
  res.end();
}