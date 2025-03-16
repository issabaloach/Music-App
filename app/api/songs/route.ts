import { connectDB } from "@/lib/db"
import { Song } from "@/models/Song"
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// Get all songs
export async function GET() {
  try {
    await connectDB()

    // First fetch songs without population
    const songs = await Song.find().sort({ createdAt: -1 })

    // Then try to populate if possible
    let populatedSongs = songs
    try {
      populatedSongs = await Song.find().sort({ createdAt: -1 }).populate("uploadedBy", "name")
    } catch (populateError) {
      console.warn("Could not populate uploadedBy field:", populateError)
      // Continue with unpopulated songs
    }

    return NextResponse.json(populatedSongs)
  } catch (error) {
    console.error("Error fetching songs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Create a new song
export async function POST(req: Request) {
  try {
    await connectDB()

    const { title, artist, audioUrl, coverImage } = await req.json()

    // Get user ID from authorization header
    let userId = null
    const authHeader = req.headers.get("authorization")

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
        userId = (decoded as any).userId
      } catch (error) {
        console.error("Token verification error:", error)
      }
    }

    // Also try to get userId from headers (set by middleware)
    if (!userId) {
      userId = req.headers.get("userId")
    }

    // Create song with or without userId
    const songData: any = {
      title,
      artist,
      audioUrl,
      coverImage: coverImage || "/placeholder.svg",
    }

    if (userId) {
      songData.uploadedBy = userId
    }

    const song = await Song.create(songData)

    return NextResponse.json(song, { status: 201 })
  } catch (error) {
    console.error("Error creating song:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

