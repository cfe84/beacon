import { IStore } from "./IStore";
import { TrackPoint } from "./TrackPoint";
import { v4 as uuid } from "uuid"
import { Track } from "./Track";
import { INotifier } from "./INotifier";

const MIN_MS = 1000 * 60
const MAX_AGE_MS = 60 * MIN_MS

export interface TrackingControllerDeps {
  store: IStore
  notifier: INotifier
}

export class TrackingController {
  constructor(private deps: TrackingControllerDeps) { }

  async addPointAsync(userId: string, point: TrackPoint) {
    let lastTrack = await this.deps.store.getLastTrackAsync(userId)
    const user = await this.deps.store.getUserAsync(userId)
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
      const shares = await this.deps.store.getSharesAsync(userId)
      for (let share of shares) {
        await this.deps.notifier.sendNotificationAsync(share,
          `New trip started for ${user.name}`,
          `Hello! \n\n${user.name} started a new trip. See it on XXX.`,
          `Hello! \n\n${user.name} started a new trip. See it on XXX.`)
      }
    }
    await this.deps.store.addTrackPointAsync(userId, lastTrack.id, point, true)
  }
}