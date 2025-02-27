import { connectDB } from '@/lib/db';
import { Song } from '@/models/Song';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    await connectDB();
    
    const userId = req.headers.get('userId');
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const songs = await Song.find({ uploadedBy: userId })
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'username');

    return NextResponse.json(songs);
  } catch (error) {
    console.error('Error fetching user songs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}