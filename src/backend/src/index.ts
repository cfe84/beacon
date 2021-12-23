import { BeaconServer } from "./BeaconServer"


const port = Number.parseInt(process.env["PORT"] || "8080")

new BeaconServer({ port })