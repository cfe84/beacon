import { getTrackPointsAsync } from "./apiConnector.js"
import { html } from "./html.js"

function initMap(currentPosition, positionHistory) {
  var map = new atlas.Map('map', {
    center: [-122.94, 49.36],
    zoom: 12,
    language: 'en-US',
    authOptions: {
      authType: 'subscriptionKey',
      subscriptionKey: 'k0Q3jsLEw7LOrCfyPvJprivTmrvQ4TC1Wrqd8kcx12k'
    }
  });
  map.events.add("ready", () => {
    const lineDataSource = new atlas.source.DataSource()
    map.sources.add(lineDataSource)
    lineDataSource.add(new atlas.data.LineString(positionHistory))
    map.layers.add(new atlas.layer.LineLayer(lineDataSource, null, { strokeColor: 'red', strokeWidth: 2 }))

    const positionDataSource = new atlas.source.DataSource()
    map.sources.add(positionDataSource)
    positionDataSource.add([new atlas.data.Point(currentPosition)])
    map.layers.add(new atlas.layer.SymbolLayer(positionDataSource, null, {}))
  })
  return map
}

function pointToMapCoordinates(point) {
  return [point.long, point.lat]
}

function pointToDescription(point) {
  return `Latitude: ${point.lat}<br/>
  Longitude: ${point.long}<br/>
  Time: ${new Date(point.timestamp)}<br/>
  Altitude: ${point.altitude}<br/>
  Speed: ${point.speed}<br/>
  Bearing: ${point.bearing}<br/>
  <a href="https://en.wikipedia.org/wiki/Dilution_of_precision_(navigation)">HDOP</a> (precision): ${point.hdop}<br/>
  `
}

function start() {
  const lastKnownTxt = document.getElementById("last-known-txt")
  getTrackPointsAsync("demo")
    .then((points) => {
      const lastPoint = points[points.length - 1]
      const lastCoordinates = pointToMapCoordinates(lastPoint)
      const mappedPoints = points.map(pointToMapCoordinates)
      initMap(lastCoordinates, mappedPoints)
      lastKnownTxt.innerHTML = pointToDescription(lastPoint)
    })
}

window.onload = start
