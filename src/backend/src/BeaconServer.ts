import * as Express from "express"

export interface BeaconServerConfig {
  port: number
}
export class BeaconServer {
  constructor(config: BeaconServerConfig) {
    const app = Express()
    app.get("/", (req, res) => res.end("Hey"))
    app.listen(config.port, () => {
      console.log("Listening on " + config.port)
    })
  }
}