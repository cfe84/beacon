import exp = require("constants")
import * as Express from "express"
import { MailNotifier } from "./MailNotifier"
import { MemoryStore } from "./MemoryStore"
import { TrackingController } from "./TrackingController"
import { TrackPoint } from "./TrackPoint"

export interface BeaconServerConfig {
  port: number,
  staticFolder: string
}

export interface BeaconServerDeps {
  store: MemoryStore
}

const mapToSuccess = (data?: object) => {
  return {
    result: "success",
    data
  }
}

const mapToError = (error?: object) => {
  return {
    result: "error",
    error
  }
}

export class BeaconServer {
  private trackingController: TrackingController
  constructor(config: BeaconServerConfig, private deps: BeaconServerDeps) {
    const notifier = new MailNotifier()
    this.trackingController = new TrackingController({
      store: deps.store,
      notifier
    })

    const app = Express()
    app.use(Express.static(config.staticFolder))
    app.get("/points/:id", this.addTrackPoint.bind(this))
    app.get("/api/points/:id", this.getTrackPoints.bind(this))
    app.listen(config.port, () => {
      console.log("Listening on " + config.port)
    })
  }

  private async addTrackPoint(req: Express.Request, res: Express.Response) {
    const trackPoint: TrackPoint = {
      lat: Number.parseFloat(`${req.query["lat"]}`),
      long: Number.parseFloat(`${req.query["long"]}`),
      timestamp: Number.parseInt(`${req.query["timestamp"]}`),
      hdop: Number.parseFloat(`${req.query["hdop"]}`),
      altitude: Number.parseFloat(`${req.query["altitude"]}`),
      speed: Number.parseFloat(`${req.query["speed"]}`),
      bearing: Number.parseFloat(`${req.query["bearing"]}`),
    }
    const userId = req.params["id"]
    await this.trackingController.addPointAsync(userId, trackPoint)
    res.json(mapToSuccess())
    res.end()
  }

  private async getTrackPoints(req: Express.Request, res: Express.Response) {
    const userId = req.params["id"]
    try {
      const tracks = await this.deps.store.getTracksAsync(userId)
      res.json(mapToSuccess({ tracks }))
    }
    catch (error: any) {
      res.json(mapToError(error.message))
      res.statusCode = 400
    }
    res.end()
  }
}