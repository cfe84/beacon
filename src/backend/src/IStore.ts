import { Share } from "./Share"
import { Track } from "./Track"
import { TrackPoint } from "./TrackPoint"
import { User } from "./User"

export interface IStore {
  addTrackAsync(userId: string, track: Track): Promise<void>
  addTrackPointAsync(userId: string, trackId: string, trackPoint: TrackPoint, last: boolean): Promise<void>
  getTracksAsync(userId: string): Promise<Track[]>
  getTrack(userId: string, trackId: string): Promise<Track>
  getLastTrackAsync(userId: string): Promise<Track | undefined>
  getSharesAsync(userId: string): Promise<Share[]>
  getUserAsync(userId: string): Promise<User>
}