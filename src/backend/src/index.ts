import * as path from "path"
import * as fs from "fs"
import { BeaconServer } from "./BeaconServer"
import { MemoryStore } from "./MemoryStore"
import { TrackPoint } from "./TrackPoint"

async function loadDemo(tracker: MemoryStore) {
  const content = fs.readFileSync("demo.json").toString()
  const gpx = JSON.parse(content)
  const points: TrackPoint[] = gpx.points.map((point: any) => ({
    lat: point.lat,
    long: point.long,
    altitude: point.altitude,
    hdop: point.hdop,
    timestamp: Date.parse(point.time),
    speed: 0,
    bearing: 0
  }))
  await tracker.addTrackAsync("demo", { "id": "1", points })
}

const staticFolder = process.env["STATIC_CONTENT"] || path.join(__dirname, "..", "..", "frontend")
const demo = process.env["DEMO"] || false
const port = Number.parseInt(process.env["PORT"] || "8080")
const tracker = new MemoryStore

if (demo) {
  loadDemo(tracker).then()
}


new BeaconServer({ port, staticFolder }, { store: tracker })