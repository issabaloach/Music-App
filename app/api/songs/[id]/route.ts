import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Song } from "@/models/Song"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const userId = request.headers.get("userId")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const song = await Song.findById(params.id)

    if (!song) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 })
    }

    // Check if the user is the owner of the song
    if (song.uploadedBy.toString() !== userId) {
      return NextResponse.json({ error: "Not authorized to delete this song" }, { status: 403 })
    }

    await Song.findByIdAndDelete(params.id)

    return NextResponse.json({ message: "Song deleted successfully" })
  } catch (error) {
    console.error("Delete song error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

