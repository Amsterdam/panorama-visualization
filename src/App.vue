<template>
  <div id="app">
    <div id="map" ref="map">
    </div>
    <div id="list">
      <ol>
        <li v-for="sequence in sequences" :key="sequence.id"
        @mouseover="listOver(sequence)" @mouseout="listOut(sequence)"
        @click="listClick(sequence)" >
          {{ sequence.id }}
        </li>
      </ol>
      <img class="thumbnail" v-if="thumbnail"
        :src="`https://api.data.amsterdam.nl/panorama/thumbnail/${thumbnail.id}/?width=250&heading=${thumbnail.heading}`" />
    </div>
  </div>
</template>

<script>
/* global mapboxgl */

import axios from 'axios'
import bearing from '@turf/bearing'

function makeFeatureCollection (coordinates, properties={}) {
  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties,
      geometry: {
        type: 'Point',
        coordinates: coordinates
      }
    }]
  }
}

export default {
  name: 'app',
  data: function () {
    return {
      sequences: [],
      frames: [],
      sequence: undefined,
      selectedSurface: undefined,
      speed: 150,
      thumbnail: undefined,
      previousPoint: undefined
    }
  },
  methods: {
    listClick: function (sequence) {
      const baseUrl = 'https://amsterdam.github.io/panorama-visualization-data/sequences'
      const path = sequence.capturedAt.slice(0, 10).replace(new RegExp('-', 'g'), '/')

      const url = `${baseUrl}/${path}/${sequence.id}.geojson`

      axios.get(url)
        .then((response) => response.data)
        .then((sequence) => {
          this.sequence = sequence

          const firstTimestamp = new Date(sequence.properties.coordinateProperties.capturedAt[0][0])

          const frames = []

          sequence.geometry.coordinates.forEach((lineString, lineStringIndex) => {
            const firstLineStringTimestamp = new Date(sequence.properties.coordinateProperties.capturedAt[lineStringIndex][0])

            let previousLineStringEndTimestamp = 0
            if (lineStringIndex > 0) {
              const previousLineString = sequence.properties.coordinateProperties.capturedAt[lineStringIndex - 1]
              previousLineStringEndTimestamp = firstLineStringTimestamp - new Date(previousLineString[previousLineString.length - 1])
            }

            lineString.forEach((point, pointIndex) => {
              const timestamp = new Date(sequence.properties
                .coordinateProperties.capturedAt[lineStringIndex][pointIndex])

              frames.push({
                index: [lineStringIndex, pointIndex],
                timestamp: timestamp - firstTimestamp - previousLineStringEndTimestamp
              })
            })
          })

          this.selectedSurface = this.sequence.properties.tags.includes('surface-land') ? 'land' : 'water',

          this.frames = frames
          this.startAnimation()
        })
    },
    listOver: function (sequence) {
      const sequenceIdFilter = ['==', 'id', sequence.id]
      this.map.setFilter('sequences', sequenceIdFilter)
    },
    listOut: function () {
      this.map.setFilter('sequences', null)
    },
    startAnimation: function () {
      const startTime = Date.now()
      this.animate(startTime)
    },
    stopAnimation: function () {

    },
    animate: function (startTime) {
      const currentTime = Date.now()

      const timePassed = currentTime - startTime

      let frame
      for (frame = 0; frame < this.frames.length; frame += 1) {
        const timestamp = this.frames[frame].timestamp
        if (timePassed < timestamp / this.speed) {
          break
        }
      }

      const index = this.frames[frame].index
      const point = makeFeatureCollection(this.sequence.geometry.coordinates[index[0]][index[1]], {
        type: this.selectedSurface
      })

      const imageId = this.sequence.properties.coordinateProperties.imageId[index[0]][index[1]]

      if (!this.thumbnail || currentTime > this.thumbnail.timestamp + 750) {
        let b = 0
        if (this.previousPoint) {
          b = bearing(this.previousPoint.features[0], point.features[0])
        }

        this.thumbnail = {
          id: imageId,
          heading: b,
          timestamp: currentTime,
        }
      }

      this.previousPoint = point

      this.map.getSource('point').setData(point)

      if (startTime + this.frames[this.frames.length - 1].timestamp / this.speed > currentTime) {
        window.requestAnimationFrame(() => {
          this.animate(startTime)
        })
      }
    }
  },
  watch: {
    sequence: function () {

    }
  },
  mounted: function () {
    const map = new mapboxgl.Map({
      container: this.$refs.map,
      hash: true,
      style: {
        version: 8,
        sources: {
        },
        layers: []
      },
      center: [4.922, 52.369],
      // maxBounds: [[4.660288, 52.216390], [5.376239,52.488702]],
      maxBounds: [[4.5, 52.0], [5.54, 52.7]],
      zoom: 10,
      minZoom: 8,
      maxZoom: 19,
      scrollZoom: false // TODO: use URL param
    })

    map.on('load', () => {
      const nav = new mapboxgl.NavigationControl()
      map.addControl(nav, 'top-left')

      map.addLayer({
        id: 'sequences',
        type: 'line',
        // maxzoom: 19,
        source: {
          type: 'vector',
          tiles: ['https://amsterdam.github.io/panorama-visualization-data/sequences/tiles/{z}/{x}/{y}.pbf'],
          maxzoom: 14
        },
        'source-layer': 'sequences',
        layout: {
          "line-cap": "round",
          "line-join": "round"
        },
        paint: {
          'line-opacity': 0.6,
          'line-color': ['case',
            ['==', ['get', 'surface'], 'water'], '#f25030',
            '#ffd400'
          ],
          'line-width': {
            'stops': [[8, 0.1], [17, 3]]
          }
        }
      })

      map.addSource('point', {
        type: 'geojson',
        data: makeFeatureCollection([52.367, 4.915])
      })

      map.addLayer({
        id: 'point',
        source: 'point',
        type: 'circle',
        paint: {
          'circle-radius': 5,
          // 'icon-rotate': ['get', 'bearing'],
          // 'icon-rotation-alignment': 'map',
          'circle-color': '#00ffe1'
        }
      })

      // map.on('mousemove', function (e) {
      //   var features = map.queryRenderedFeatures(e.point)
      //   if (features[0]) {
      //     var id = features[0].properties.id
      //     var capturedAt = features[0].properties.capturedAt

      //     var path = capturedAt.slice(0, 10).replace(new RegExp('-', 'g'), '/')

      //     var url = 'http://localhost:8082/sequences/' + path + '/' + id + '.geojson'
      //     console.log(url)
      //   }
      // })

      this.map = map

      axios.get('https://amsterdam.github.io/panorama-visualization-data/sequences/stats.json')
        .then((response) => response.data)
        .then((data) => {
          this.sequences = data.sequences
        })
    })
  }
}
</script>

<style>
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  margin: 0;
  padding: 0;

  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  background-color: black;
}

#app {
  width: 100%;
  height: 100%;
}

#map {
  position: relative;
  width: 100%;
  height: 100%;
}

#list {
  padding: 1em;
  position: absolute;
  z-index: 1000;
  width: auto;
  right: 10px;
  top: 10px;
  bottom: 10px;
  background-color: #eee;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
}

#list ol {
  margin: 0;
  overflow-y: scroll;
}

#list ol li {
  cursor: pointer;
}

#list ol li:hover,
#list ol li.selected {
  background-color: rgba(255, 255, 255, 0.5);
}

.thumbnail {
  width: 250px;
}
</style>
