import { TrackPoint } from "./TrackPoint";

export class Tracker {
  private trackpoints: { [id: string]: TrackPoint[] } = {}

  async addTrackPointAsync(id: string, trackPoint: TrackPoint) {
    if (!this.trackpoints[id]) {
      this.trackpoints[id] = []
    }
    this.trackpoints[id].push(trackPoint)
  }

  async getTrackPointsAsync(id: string): Promise<TrackPoint[]> {
    return this.trackpoints[id]
  }
}