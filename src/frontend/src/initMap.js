import { getTracksAsync } from "./apiConnector.js"
import { html } from "./html.js"

function initMap(currentPosition, positionHistory) {
  var map = new atlas.Map('map', {
    center: currentPosition,
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

function drawCoordinates(coordinates) {

}

function pointToMapCoordinates(point) {
  return [point.lat, point.long]
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
  const map = L.map('map').setView([49, -115], 13);
  // add the OpenStreetMap tiles
  // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  L.tileLayer('https://b.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
  }).addTo(map);

  // show the scale bar on the lower left corner
  L.control.scale({ imperial: true, metric: true }).addTo(map);
  const lastKnownTxt = document.getElementById("last-known-txt")
  getTracksAsync("demo")
    .then((tracks) => {
      tracks.tracks.forEach((track, i, arr) => {
        const points = track.points
        const mappedPoints = points.map(pointToMapCoordinates)
        // initMap(lastCoordinates, mappedPoints)
        var polyline = L.polyline(mappedPoints, { color: 'red' }).addTo(map);
        if (i === arr.length - 1) {
          const lastPoint = points[points.length - 1]
          const lastCoordinates = pointToMapCoordinates(lastPoint)
          var pos = L.circle(lastCoordinates, {
            color: 'blue',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: lastPoint.hdop
          }).addTo(map);
          var marker = L.marker(lastCoordinates).addTo(map)
          marker.bindPopup(`Position at ${new Date(lastPoint.timestamp)}`)
          // zoom the map to the polyline
          map.fitBounds(polyline.getBounds());
          lastKnownTxt.innerHTML = pointToDescription(lastPoint)
        }
      })
    })
}

window.onload = start
