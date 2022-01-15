import { IStore } from "./IStore";
import { TrackPoint } from "./TrackPoint";
import { v4 as uuid } from "uuid"
import { Track } from "./Track";

const MIN_MS = 1000 * 60
const MAX_AGE_MS = 60 * MIN_MS

export interface TrackingControllerDeps {
  store: IStore
}

export class TrackingController {
  constructor(private deps: TrackingControllerDeps) { }

  async addPointAsync(userId: string, point: TrackPoint) {
    let lastTrack = await this.deps.store.getLastTrackAsync(userId)
    const lastPointIsTooOld = (lastTrack: Track) => {
      if (lastTrack.points.length === 0) {
        return false
      }
      const lastPoint = lastTrack.points[lastTrack.points.length - 1]
      return point.timestamp - lastPoint.timestamp > MAX_AGE_MS
    }
    if (!lastTrack || lastPointIsTooOld(lastTrack)) {
      lastTrack = {
        id: uuid(),
        points: []
      }
      await this.deps.store.addTrackAsync(userId, lastTrack)
    }
    await this.deps.store.addTrackPointAsync(userId, lastTrack.id, point, true)
  }
}