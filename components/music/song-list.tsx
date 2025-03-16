"use client"

import { useState } from "react"
import { SongCard } from "./song-card"

interface Song {
  _id: string
  title: string
  artist: string
  audioUrl: string
  coverImage?: string
  uploadedBy?: string | { _id: string; name: string }
  createdAt?: string
}

interface SongListProps {
  songs: Song[] | null | undefined
  onSongUpdate?: () => void
  searchQuery?: string
}

export function SongList({ songs = [], onSongUpdate, searchQuery }: SongListProps) {
  const [isLoading] = useState(false)

  // Ensure songs is an array
  const songsArray = Array.isArray(songs) ? songs : []

  // Filter songs if searchQuery is provided
  const filteredSongs = searchQuery
    ? songsArray.filter(
        (song) =>
          song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : songsArray

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading...</div>
  }

  if (filteredSongs.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        {searchQuery ? "No songs found matching your search." : "No songs available. Upload your first song!"}
      </div>
    )
  }

  // Get user ID from localStorage
  const getUserId = () => {
    try {
      const userStr = localStorage.getItem("user")
      if (userStr) {
        const user = JSON.parse(userStr)
        return user.id
      }
      return null
    } catch (error) {
      console.error("Error parsing user data:", error)
      return null
    }
  }

  const userId = getUserId()

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filteredSongs.map((song) => {
        // Check if uploadedBy is an object or a string
        const uploadedById =
          typeof song.uploadedBy === "object" && song.uploadedBy ? song.uploadedBy._id : song.uploadedBy

        return <SongCard key={song._id} song={song} onDelete={onSongUpdate} showDelete={uploadedById === userId} />
      })}
    </div>
  )
}

