import mongoose from "mongoose"

// Define the schema
const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
  audioUrl: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String,
    default: "/placeholder.svg",
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Check if the model exists before creating a new one
export const Song = mongoose.models.Song || mongoose.model("Song", songSchema)

