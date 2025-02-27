import { connectDB } from '@/lib/db';
import { Song } from '@/models/Song';
import { NextResponse } from 'next/server';

// Get all songs
export async function GET() {
  try {
    await connectDB();
    const songs = await Song.find()
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'username');
    
    return NextResponse.json(songs);
  } catch (error) {
    console.error('Error fetching songs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create a new song
export async function POST(req: Request) {
  try {
    await connectDB();
    
    const { title, artist, audioUrl, coverImage } = await req.json();
    
    const song = await Song.create({
      title,
      artist,
      audioUrl,
      coverImage,
      uploadedBy: req.headers.get('userId'), // Set from auth middleware
    });

    return NextResponse.json(song, { status: 201 });
  } catch (error) {
    console.error('Error creating song:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}