"use client"

import { useEffect, useState, useCallback } from "react"
import { SongCard } from "./song-card"
import { Song } from "@/types/models"
import { useToast } from "@/components/ui/use-toast"
import { title } from "process"

export function SongList() {
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  

  const fetchSongs = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/songs")

      if (!res.ok) {
        throw new Error("Failed to fetch songs")
      }

      const data: Song[] = await res.json()
      if (Array.isArray(data)) {
        setSongs(data)
      } else {
        throw new Error("Invalid data format")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch songs",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchSongs()
  }, [fetchSongs])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {songs.map((song) => (
        <SongCard key={song._id} Song={song} onDelete={fetchSongs} />
      ))}
    </div>
  )
}
