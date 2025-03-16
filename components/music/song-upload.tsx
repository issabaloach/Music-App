"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface SongUploadProps {
  onSongUploaded?: () => void
}

export function SongUpload({ onSongUploaded }: SongUploadProps) {
  const [title, setTitle] = useState("")
  const [artist, setArtist] = useState("")
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    const token = localStorage.getItem("token")
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!res.ok) {
      throw new Error("Failed to upload file")
    }

    const data = await res.json()
    return data.url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!audioFile) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select an audio file",
      })
      return
    }

    setIsLoading(true)

    try {
      const audioUrl = await uploadFile(audioFile)
      let coverUrl = "/placeholder.svg"

      if (coverImage) {
        coverUrl = await uploadFile(coverImage)
      }

      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("You must be logged in to upload songs")
      }

      const res = await fetch("/api/songs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          artist,
          audioUrl,
          coverImage: coverUrl,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to create song")
      }

      setTitle("")
      setArtist("")
      setAudioFile(null)
      setCoverImage(null)

      toast({
        title: "Success",
        description: "Song uploaded successfully",
      })

      // Call the callback if provided
      if (onSongUploaded) {
        onSongUploaded()
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred while uploading",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Song</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Song Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={isLoading}
          />
          <Input
            placeholder="Artist Name"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            required
            disabled={isLoading}
          />
          <div className="space-y-2">
            <label className="text-sm font-medium">Audio File</label>
            <Input
              type="file"
              accept="audio/*"
              onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Cover Image (Optional)</label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload Song"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

