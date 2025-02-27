export interface User {
    _id: string
    username: string
    email: string
    password?: string
    googleId?: string
    createdAt: Date
  }
  
  export interface Song {
    _id: string
    title: string
    artist: string
    audioUrl: string
    coverImage?: string
    uploadedBy: string | User
    createdAt: Date
  }