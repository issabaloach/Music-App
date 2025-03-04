"use client"

import { useEffect, useState } from "react"
import { SongList } from "@/components/music/song-list";
import { useToast } from "@/components/ui/use-toast"

// Define the Song type
interface Song {
  _id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverImage?: string;
  uploadedBy: string;
  createdAt: string;
}

export default function LibraryPage() {
  const [userSongs, setUserSongs] = useState<Song[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchUserSongs()
  }, [])

  const fetchUserSongs = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/songs/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()
      setUserSongs(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch your songs",
      })
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Your Library</h1>
      <SongList songs={userSongs} onSongUpdate={fetchUserSongs} />
    </div>
  )
}