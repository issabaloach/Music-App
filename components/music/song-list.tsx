"use client"

import { useState } from "react"
import { SongCard } from "./song-card"

interface Song {
  _id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverImage?: string;
  uploadedBy: string;
  createdAt: string;
}

interface SongListProps {
  songs: Song[];
  onSongUpdate?: () => void;
  searchQuery?: string;
}

export function SongList({ songs, onSongUpdate, searchQuery }: SongListProps) {
  const [isLoading] = useState(false)

  // Filter songs if searchQuery is provided
  const filteredSongs = searchQuery
    ? songs.filter(song => 
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : songs;

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filteredSongs.map((song) => (
        <SongCard
          key={song._id}
          song={song}
          onDelete={onSongUpdate}
        />
      ))}
    </div>
  )
}