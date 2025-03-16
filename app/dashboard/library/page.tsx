"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { SongList } from "@/components/music/song-list"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/src/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MusicIcon, Clock } from "lucide-react"

interface Song {
  _id: string
  title: string
  artist: string
  audioUrl: string
  coverImage?: string
  uploadedBy?: string
  createdAt?: string
}

export default function LibraryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
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

  // Filter songs based on search query
  const filteredSongs = searchQuery
    ? songs.filter(
        (song) =>
          song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : songs

  // Get user's uploaded songs
  const userSongs = songs.filter((song) => song.uploadedBy === getUserId())

  // Get recently added songs (last 7 days)
  const recentSongs = songs.filter((song) => {
    if (!song.createdAt) return false
    const songDate = new Date(song.createdAt)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return songDate >= sevenDaysAgo
  })

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Library</h1>
        <p className="text-muted-foreground">Browse and manage your music collection</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search songs by title or artist..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      <Tabs defaultValue="all-songs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-songs" className="flex items-center gap-2">
            <MusicIcon className="h-4 w-4" />
            All Songs
          </TabsTrigger>
          <TabsTrigger value="my-songs" className="flex items-center gap-2">
            <MusicIcon className="h-4 w-4" />
            My Uploads
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recently Added
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all-songs">
          <Card>
            <CardHeader>
              <CardTitle>All Songs</CardTitle>
              <CardDescription>Browse all songs available in the music library</CardDescription>
            </CardHeader>
            <CardContent>
              <SongList songs={filteredSongs} onSongUpdate={fetchSongs} searchQuery={searchQuery} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-songs">
          <Card>
            <CardHeader>
              <CardTitle>My Uploads</CardTitle>
              <CardDescription>Songs you've uploaded to the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <SongList songs={userSongs} onSongUpdate={fetchSongs} searchQuery={searchQuery} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recently Added</CardTitle>
              <CardDescription>Songs added in the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <SongList songs={recentSongs} onSongUpdate={fetchSongs} searchQuery={searchQuery} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

