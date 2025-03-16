"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SongUpload } from "@/components/music/song-upload"
import { SongList } from "@/components/music/song-list"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MusicIcon, UploadIcon } from "lucide-react"

interface Song {
  _id: string
  title: string
  artist: string
  audioUrl: string
  coverImage?: string
  uploadedBy?: string
}

export default function UploadPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("upload")

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
      return
    }

    // Fetch user's uploaded songs
    fetchUserSongs()
  }, [router])

  const fetchUserSongs = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const userId = getUserId()

      if (!userId) {
        throw new Error("User ID not found")
      }

      const res = await fetch("/api/songs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        throw new Error("Failed to fetch songs")
      }

      const allSongs = await res.json()

      // Filter songs uploaded by the current user
      const userSongs = allSongs.filter((song: Song) => song.uploadedBy === userId)
      setSongs(userSongs)
    } catch (error) {
      console.error("Failed to fetch user songs:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your uploaded songs",
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

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Upload Music</h1>
        <p className="text-muted-foreground">Upload and manage your music collection</p>
      </div>

      <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <UploadIcon className="h-4 w-4" />
            Upload New Song
          </TabsTrigger>
          <TabsTrigger value="my-uploads" className="flex items-center gap-2">
            <MusicIcon className="h-4 w-4" />
            My Uploads
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload a New Song</CardTitle>
              <CardDescription>
                Add a new song to your music collection. Supported formats: MP3, WAV, OGG.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SongUpload
                onSongUploaded={() => {
                  fetchUserSongs()
                  setActiveTab("my-uploads")
                  toast({
                    title: "Upload Complete",
                    description: "Your song has been uploaded successfully!",
                  })
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>Use high-quality audio files for the best playback experience</li>
                <li>Add cover art to make your songs stand out</li>
                <li>Make sure you have the rights to upload and share the music</li>
                <li>Provide accurate artist and title information</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-uploads">
          <Card>
            <CardHeader>
              <CardTitle>My Uploaded Songs</CardTitle>
              <CardDescription>Manage the songs you've uploaded to the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center text-muted-foreground">Loading your songs...</div>
              ) : (
                <SongList songs={songs} onSongUpdate={fetchUserSongs} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

