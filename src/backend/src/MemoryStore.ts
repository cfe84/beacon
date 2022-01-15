import { Track } from "./Track";
import { TrackPoint } from "./TrackPoint";

type Dictionary<T> = { [key: string]: T }

export class MemoryStore {
  private tracks: Dictionary<Dictionary<Track>> = {}
  private lastTrackIdByUser: Dictionary<string> = {}

  async addTrackAsync(userId: string, track: Track) {
    if (!this.tracks[userId]) {
      this.tracks[userId] = {}
    }
    this.tracks[userId][track.id] = track
    this.lastTrackIdByUser[userId] = track.id
  }

  async addTrackPointAsync(userId: string, trackId: string, trackPoint: TrackPoint, last: boolean = true) {
    this.tracks[userId][trackId].points.push(trackPoint)
    this.lastTrackIdByUser[userId] = trackId
  }

  async getTracksAsync(userId: string): Promise<Track[]> {
    return Object.values(this.tracks[userId])
  }

  async getTrack(userId: string, trackId: string): Promise<Track> {
    return this.tracks[userId][trackId]
  }

  async getLastTrackAsync(userId: string): Promise<Track | undefined> {
    const trackId = this.lastTrackIdByUser[userId]
    if (trackId) {
      return this.tracks[userId][trackId]
    }
    return undefined
  }
}