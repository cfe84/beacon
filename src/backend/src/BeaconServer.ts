import exp = require("constants")
import * as Express from "express"
import { allowedNodeEnvironmentFlags } from "process"
import { Tracker } from "./Tracker"
import { TrackPoint } from "./TrackPoint"

export interface BeaconServerConfig {
  port: number,
  staticFolder: string
}

export interface BeaconServerDeps {
  tracker: Tracker
}

export class BeaconServer {
  constructor(config: BeaconServerConfig, private deps: BeaconServerDeps) {
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
    const id = req.params["id"]
    await this.deps.tracker.addTrackPointAsync(id, trackPoint)
    res.end()
  }

  private async getTrackPoints(req: Express.Request, res: Express.Response) {
    const id = req.params["id"]
    const points = await this.deps.tracker.getTrackPointsAsync(id)
    res.json(points)
    res.end()
  }
}