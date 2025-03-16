import { connectDB } from "@/lib/db"
import { Song } from "@/models/Song"
import { NextResponse } from "next/server"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const userId = request.headers.get("userId")

    // Find the song
    const song = await Song.findById(params.id)

    if (!song) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 })
    }

    // Check if the user is the owner of the song (if uploadedBy exists)
    if (song.uploadedBy && userId && song.uploadedBy.toString() !== userId) {
      return NextResponse.json({ error: "Not authorized to delete this song" }, { status: 403 })
    }

    // Delete the song
    await Song.findByIdAndDelete(params.id)

    return NextResponse.json({ message: "Song deleted successfully" })
  } catch (error) {
    console.error("Delete song error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

