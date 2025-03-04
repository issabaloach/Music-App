"use client"

import { Play, Pause, Trash2 } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import Image from "next/image"
import { useState } from "react"

interface Song {
  _id: string
  title: string
  artist: string
  coverImage: string
  audioUrl: string
  uploadedBy?: string
}

interface SongCardProps {
  song: Song
  isPlaying: boolean
  onPlay: () => void
  onPause: () => void
  onDelete?: () => void
  showDelete?: boolean
}

export function SongCard({ song, isPlaying, onPlay, onPause, onDelete, showDelete = false }: SongCardProps) {
  const [imageError, setImageError] = useState(false)

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
            <Button variant="secondary" size="icon" onClick={isPlaying ? onPause : onPlay}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            {showDelete && onDelete && (
              <Button variant="destructive" size="icon" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

