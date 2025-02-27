"use client";

import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Play, Pause, Trash2 } from "lucide-react";

interface SongCardProps {
   song:  {
    _id: string;
    title: string;
    artist: string;
    audioUrl: string;
    uploadedBy: string;
  };
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onDelete: () => void;
  showDelete: boolean;
}

export function SongCard({
  song,
  isPlaying,
  onPlay,
  onPause,
  onDelete,
  showDelete,
}: SongCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <h3 className="font-semibold">{song.title}</h3>
          <p className="text-sm text-muted-foreground">{song.artist}</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={isPlaying ? onPause : onPlay}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          {showDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-1 bg-secondary rounded-full">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: isPlaying ? "100%" : "0%" }}
          />
        </div>
      </CardContent>
    </Card>
  );
}