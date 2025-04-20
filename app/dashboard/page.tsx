"use client"

import { useEffect, useState, useRef } from "react"
import { SongCard } from "@/components/music/song-card"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/src/components/ui/input"
import { Search, Loader2, LogOut } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { useRouter } from "next/navigation"

interface Song {
  _id: string
  title: string
  artist: string
  audioUrl: string
  coverImage?: string
  uploadedBy?: string | { _id: string; name: string }
}

interface UserInfo {
  name: string
  email: string
}

export default function Dashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [songs, setSongs] = useState<Song[]>([])
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
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

    // Get user info from the non-httpOnly cookie
    const getUserInfoFromCookie = () => {
      try {
        const userInfoCookie = document.cookie
          .split("; ")
          .find((row) => row.startsWith("user_info="))
          ?.split("=")[1]

        if (userInfoCookie) {
          return JSON.parse(decodeURIComponent(userInfoCookie))
        }
        return null
      } catch (error) {
        console.error("Error parsing user info cookie:", error)
        return null
      }
    }

    const userInfoFromCookie = getUserInfoFromCookie()
    if (userInfoFromCookie) {
      setUserInfo(userInfoFromCookie)
      // Fetch songs if we have user info
      fetchSongs()
    } else {
      // No user info in cookie, check if we're authenticated via API
      checkAuthStatus()
    }

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
    }
  }, [])

  const checkAuthStatus = async () => {
    try {
      const res = await fetch("/api/auth/me")

      if (!res.ok) {
        // Not authenticated, redirect to login
        router.push("/login")
        return
      }

      const userData = await res.json()
      setUserInfo(userData)
      fetchSongs()
    } catch (error) {
      console.error("Auth check failed:", error)
      router.push("/login")
    }
  }

  const fetchSongs = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/songs")

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
    } finally {
      setIsLoading(false)
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
      const res = await fetch(`/api/songs/${songId}`, {
        method: "DELETE",
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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout")
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  // Get user ID from user info
  const getUserId = () => {
    try {
      // This would need to be updated based on your actual user data structure
      return userInfo?.email
    } catch (error) {
      console.error("Error getting user ID:", error)
      return null
    }
  }

  // Filter songs based on search query
  const filteredSongs = searchQuery
    ? songs.filter(
        (song) =>
          song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : songs

  // Show loading state if we're still loading
  if (isLoading && !userInfo) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your music...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Music Library</h1>
        <div className="flex items-center gap-4">
          {userInfo && (
            <div className="text-sm text-muted-foreground">
              Signed in as <span className="font-medium">{userInfo.email}</span>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search songs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">All Songs</h2>
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filteredSongs.length === 0 ? (
          <p className="text-muted-foreground">
            {searchQuery ? "No songs found matching your search." : "No songs found. Upload your first song!"}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSongs.map((song) => {
              // Check if uploadedBy is an object or a string
              const uploadedById =
                typeof song.uploadedBy === "object" && song.uploadedBy ? song.uploadedBy._id : song.uploadedBy

              return (
                <SongCard
                  key={song._id}
                  song={song}
                  isPlaying={isPlaying && currentSong?._id === song._id}
                  onPlay={() => handlePlay(song)}
                  onPause={handlePause}
                  onDelete={() => handleDelete(song._id)}
                  showDelete={uploadedById === getUserId()}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
