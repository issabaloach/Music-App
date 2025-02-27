"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SongUpload } from "@/components/music/song-upload";
import { SongCard } from "@/components/music/song-card";

interface Song {
  _id: string;
  title: string;
  artist: string;
  audioUrl: string;
  uploadedBy: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    } else {
      // Fetch songs
      fetchSongs();
    }
  }, [router]);

  const fetchSongs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/songs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setSongs(data);
    } catch (error) {
      console.error("Failed to fetch songs:", error);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid gap-8 md:grid-cols-[300px_1fr]">
          <div>
            <SongUpload />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {songs.map((song) => (
              <SongCard
                key={song._id}
                song={song}
                isPlaying={false}
                onPlay={() => {}}
                onPause={() => {}}
                onDelete={fetchSongs}
                showDelete={song.uploadedBy === localStorage.getItem("userId")}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}