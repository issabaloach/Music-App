"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Trash2 } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"

interface Song {
  _id: string
  title: string
  artist: string
  coverImage?: string
  audioUrl: string
  uploadedBy?: string | { _id: string; name: string }
}

interface SongCardProps {
  song: Song
  isPlaying?: boolean
  onPlay?: () => void
  onPause?: () => void
  onDelete?: () => void
  showDelete?: boolean
}

export function SongCard({ song, isPlaying = false, onPlay, onPause, onDelete, showDelete = false }: SongCardProps) {
  const [localIsPlaying, setLocalIsPlaying] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [imageError, setImageError] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  // Initialize audio element if we're handling playback locally
  useEffect(() => {
    if (!onPlay && !onPause && !audioRef.current) {
      audioRef.current = new Audio(song.audioUrl)
      audioRef.current.addEventListener("ended", () => {
        setLocalIsPlaying(false)
      })
    }

    return () => {
      // Clean up audio element if we created one
      if (!onPlay && !onPause && audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
        audioRef.current = null
      }
    }
  }, [song.audioUrl, onPlay, onPause])

  // Use external or local playing state
  const effectiveIsPlaying = onPlay && onPause ? isPlaying : localIsPlaying

  const handlePlayPause = () => {
    if (onPlay && onPause) {
      // Use external play/pause handlers if provided
      if (isPlaying) {
        onPause()
      } else {
        onPlay()
      }
    } else {
      // Otherwise handle playback internally
      if (!audioRef.current) return

      if (localIsPlaying) {
        audioRef.current.pause()
        setLocalIsPlaying(false)
      } else {
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error)
          toast({
            variant: "destructive",
            title: "Playback Error",
            description: "Could not play this song",
          })
        })
        setLocalIsPlaying(true)
      }
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return

    setIsDeleting(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/songs/${song._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        throw new Error("Failed to delete song")
      }

      // Stop audio if playing locally
      if (localIsPlaying && audioRef.current) {
        audioRef.current.pause()
        setLocalIsPlaying(false)
      }

      toast({
        title: "Success",
        description: "Song deleted successfully",
      })

      // Call the callback to refresh the song list
      onDelete()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete song",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="overflow-hidden transition-transform hover:scale-[1.02]">
      <CardContent className="p-0">
        <div className="relative aspect-square">
          <Image
            src={
              imageError
                ? "/placeholder.svg?height=300&width=300"
                : song.coverImage || "/placeholder.svg?height=300&width=300"
            }
            alt={song.title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold truncate">{song.title}</h3>
          <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
          <div className="flex items-center justify-between mt-4">
            <Button variant="secondary" size="icon" onClick={handlePlayPause}>
              {effectiveIsPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            {showDelete && onDelete && (
              <Button variant="destructive" size="icon" onClick={handleDelete} disabled={isDeleting}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

