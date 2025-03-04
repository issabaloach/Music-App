"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { SongUpload } from "@/components/music/song-upload"
import { SongCard } from "@/components/music/song-card"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/src/components/ui/button"

interface Song {
  _id: string
  title: string
  artist: string
  audioUrl: string
  coverImage: string
  uploadedBy: string
}

export default function Dashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [songs, setSongs] = useState<Song[]>([])
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Initialize audio element
    if (!audioRef.current) {
      audioRef.current = new Audio()

      // Add event listeners
      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false)
      })
    }

    // Check if user is authenticated
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
    } else {
      // Fetch songs
      fetchSongs()
    }

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
    }
  }, [router])

  const fetchSongs = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/songs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        throw new Error("Failed to fetch songs")
      }

      const data = await res.json()
      setSongs(data)
    } catch (error) {
      console.error("Failed to fetch songs:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load songs",
      })
    }
  }

  const handlePlay = (song: Song) => {
    if (!audioRef.current) return

    if (currentSong?._id === song._id) {
      // Resume current song
      audioRef.current.play()
      setIsPlaying(true)
    } else {
      // Play new song
      audioRef.current.src = song.audioUrl
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error)
        toast({
          variant: "destructive",
          title: "Playback Error",
          description: "Could not play this song",
        })
      })
      setCurrentSong(song)
      setIsPlaying(true)
    }
  }

  const handlePause = () => {
    if (!audioRef.current) return
    audioRef.current.pause()
    setIsPlaying(false)
  }

  const handleDelete = async (songId: string) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/songs/${songId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        throw new Error("Failed to delete song")
      }

      // If the deleted song is currently playing, stop it
      if (currentSong?._id === songId) {
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current.src = ""
        }
        setCurrentSong(null)
        setIsPlaying(false)
      }

      // Refresh the songs list
      fetchSongs()

      toast({
        title: "Success",
        description: "Song deleted successfully",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete song",
      })
    }
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

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Your Music Library</h1>

      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        <div className="space-y-6">
          <SongUpload onSongUploaded={fetchSongs} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">All Songs</h2>
          {songs.length === 0 ? (
            <p className="text-muted-foreground">No songs found. Upload your first song!</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {songs.map((song) => (
                <SongCard
                  key={song._id}
                  song={song}
                  isPlaying={isPlaying && currentSong?._id === song._id}
                  onPlay={() => handlePlay(song)}
                  onPause={handlePause}
                  onDelete={() => handleDelete(song._id)}
                  showDelete={song.uploadedBy === getUserId()}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

