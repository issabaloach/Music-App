"use client"

import { useState } from "react"
import { Input } from "@/src/components/ui/input"
import { SongList } from "@/components/music/song-list"

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">Search</h1>
        <Input
          placeholder="Search songs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>
      <SongList searchQuery={searchQuery} />
    </div>
  )
}