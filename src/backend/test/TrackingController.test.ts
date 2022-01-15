import { IStore } from "../src/IStore"
import { TrackingController } from "../src/TrackingController"
import * as testdouble from "testdouble"
import { describe, Context, it } from "mocha"
import { TrackPoint } from "../src/TrackPoint"
import { Track } from "../src/Track"

const baseDate = new Date()

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

describe("Tracking controller", function () {
  it("Creates the first track for a user", async function () {
    // given
    const userId = "demo"
    const fakeStore = testdouble.object<IStore>()
    const trackpoint = createFakePoint()
    testdouble.when(fakeStore.getLastTrackAsync(userId)).thenResolve(undefined)

    // when
    const controller = new TrackingController({ store: fakeStore })
    await controller.addPointAsync(userId, trackpoint)

    // then
    // Adds track
    let trackId = ""
    testdouble.verify(fakeStore.addTrackAsync(userId, testdouble.matchers.argThat((track: Track) => {
      trackId = track.id
      return track.id && track.points.length === 0
    })), { times: 1 })
    // adds point
    testdouble.verify(fakeStore.addTrackPointAsync(userId, trackId, trackpoint, true))
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
    const fakeStore = testdouble.object<IStore>()
    const trackpoint = createFakePoint()
    testdouble.when(fakeStore.getLastTrackAsync(userId)).thenResolve(track)

    // when
    const controller = new TrackingController({ store: fakeStore })
    await controller.addPointAsync(userId, trackpoint)

    // then
    // Does not add track
    testdouble.verify(fakeStore.addTrackAsync(testdouble.matchers.anything(), testdouble.matchers.anything()), { times: 0 })
    // adds point
    testdouble.verify(fakeStore.addTrackPointAsync(userId, track.id, trackpoint, true))
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
    const fakeStore = testdouble.object<IStore>()
    const trackpoint = createFakePoint()
    testdouble.when(fakeStore.getLastTrackAsync(userId)).thenResolve(fakeTrack)

    // when
    const controller = new TrackingController({ store: fakeStore })
    await controller.addPointAsync(userId, trackpoint)

    // then
    // Does not add track
    let trackId = ""
    testdouble.verify(fakeStore.addTrackAsync(userId, testdouble.matchers.argThat((track: Track) => {
      trackId = track.id
      return track.id && track.id !== fakeTrack.id && track.points.length === 0
    })), { times: 1 })
    // adds point
    testdouble.verify(fakeStore.addTrackPointAsync(userId, trackId, trackpoint, true))
  })
})