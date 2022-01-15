import { IStore } from "../src/IStore"
import { TrackingController, TrackingControllerDeps } from "../src/TrackingController"
import * as testdouble from "testdouble"
import { describe, Context, it } from "mocha"
import { TrackPoint } from "../src/TrackPoint"
import { Track } from "../src/Track"
import { INotifier } from "../src/INotifier"
import { Share } from "../src/Share"
import { User } from "../src/User"

const baseDate = new Date()
const userId = "demo"
const userName = "USER_NAME"
const defaultUser: User = {
  id: userId,
  key: "",
  name: userName
}
const share1: Share = {
  code: "CODE",
  email: "EMAIL",
  phone: "PHONE",
  userId
}

const createTimestamp = (deltaMinutes: number) => {
  const date = new Date()
  date.setMinutes(date.getMinutes() + deltaMinutes)
  return date.getTime()
}

const createFakePoint = (base: Partial<TrackPoint> = {}) => {
  const res: TrackPoint = {
    altitude: base.altitude || 0,
    bearing: base.bearing || 0,
    hdop: base.hdop || 0,
    lat: base.lat || 49.3,
    long: base.long || -123,
    speed: base.speed || 0,
    timestamp: base.timestamp || baseDate.getTime()
  }
  return res
}

const createFakeDeps = (lastTrack: Track | undefined = undefined,
  shares: Share[] = [share1],
  user: User = defaultUser): TrackingControllerDeps => {
  const deps = {
    store: testdouble.object<IStore>(),
    notifier: testdouble.object<INotifier>()
  }
  testdouble.when(deps.store.getLastTrackAsync(userId)).thenResolve(lastTrack)
  testdouble.when(deps.store.getSharesAsync(userId)).thenResolve(shares)
  testdouble.when(deps.store.getUserAsync(user.id)).thenResolve(user)
  return deps
}

describe("Tracking controller", function () {
  it("Creates the first track for a user, and sends notifications", async function () {
    // given
    const fakeDeps = createFakeDeps()
    const trackpoint = createFakePoint()

    // when
    const controller = new TrackingController(fakeDeps)
    await controller.addPointAsync(userId, trackpoint)

    // then
    // Adds track
    let trackId = ""
    testdouble.verify(fakeDeps.store.addTrackAsync(userId, testdouble.matchers.argThat((track: Track) => {
      trackId = track.id
      return track.id && track.points.length === 0
    })), { times: 1 })
    // adds point
    testdouble.verify(fakeDeps.store.addTrackPointAsync(userId, trackId, trackpoint, true))
    // sends notification
    testdouble.verify(
      fakeDeps.notifier.sendNotificationAsync(share1, testdouble.matchers.anything(), testdouble.matchers.anything(), testdouble.matchers.anything())
    )
  })

  it("Reuses a recent track for a user", async function () {
    // given
    const userId = "demo"
    const track = {
      id: "1234",
      points: [
        createFakePoint({ timestamp: createTimestamp(-120) }),
        createFakePoint({ timestamp: createTimestamp(-100) }),
        createFakePoint({ timestamp: createTimestamp(-80) }),
        createFakePoint({ timestamp: createTimestamp(-60) }),
        createFakePoint({ timestamp: createTimestamp(-40) }),
        createFakePoint({ timestamp: createTimestamp(-20) }),
      ]
    }
    // const fakeStore = testdouble.object<IStore>()
    const trackpoint = createFakePoint()
    const fakeDeps = createFakeDeps(track)

    // when
    const controller = new TrackingController(fakeDeps)
    await controller.addPointAsync(userId, trackpoint)

    // then
    // Does not add track
    testdouble.verify(fakeDeps.store.addTrackAsync(testdouble.matchers.anything(), testdouble.matchers.anything()), { times: 0 })
    // adds point
    testdouble.verify(fakeDeps.store.addTrackPointAsync(userId, track.id, trackpoint, true))
    // doesn't send notification
    testdouble.verify(
      fakeDeps.notifier.sendNotificationAsync(testdouble.matchers.anything(), testdouble.matchers.anything(), testdouble.matchers.anything(), testdouble.matchers.anything())
      , { times: 0 })

  })

  it("Create a new track if it's too old", async function () {
    // given
    const userId = "demo"
    const fakeTrack = {
      id: "1234",
      points: [
        createFakePoint({ timestamp: createTimestamp(-120) }),
        createFakePoint({ timestamp: createTimestamp(-100) }),
      ]
    }
    const fakeDeps = createFakeDeps(fakeTrack)
    const trackpoint = createFakePoint()

    // when
    const controller = new TrackingController(fakeDeps)
    await controller.addPointAsync(userId, trackpoint)

    // then
    // Does not add track
    let trackId = ""
    testdouble.verify(fakeDeps.store.addTrackAsync(userId, testdouble.matchers.argThat((track: Track) => {
      trackId = track.id
      return track.id && track.id !== fakeTrack.id && track.points.length === 0
    })), { times: 1 })
    // adds point
    testdouble.verify(fakeDeps.store.addTrackPointAsync(userId, trackId, trackpoint, true))
    // sends notification
    testdouble.verify(
      fakeDeps.notifier.sendNotificationAsync(share1, testdouble.matchers.anything(), testdouble.matchers.anything(), testdouble.matchers.anything())
    )
  })
})