<template>
    <div id="map" class="map-container"></div>
</template>

<script lang="ts">
import { onMounted, ref, watch, defineComponent } from "vue"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { Map, TileLayer, Marker, Polygon, LatLngTuple } from "leaflet"

export default defineComponent({
props: {
    markers: {
        type: Array as () => LatLngTuple[],
        required: false,
        default: () => [],
    },
    polygons: {
        type: Array as () => LatLngTuple[][],
        required: false,
        default: () => [],
    },
    },
    setup(props) {
        const map:any = ref<Map | null>(null)
        const tileLayer = ref<TileLayer | null>(null)
        const markersRef = ref<Marker[]>([])
        const polygonsRef = ref<Polygon[]>([])

        onMounted(() => {
            const mapElement = document.getElementById("map")
            if (!mapElement) return

            map.value = L.map(mapElement, {
                center: [-1.628950, 103.612344],
                zoom: 13,
                zoomControl: false,
            })

            tileLayer.value = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
            tileLayer.value.addTo(map.value)

            updateMarkers()
            updatePolygons()
        })

        const updateMarkers = () => {
            if (!map.value) return

            markersRef.value.forEach((marker) => map.value!.removeLayer(marker))
            markersRef.value = []

            props.markers.forEach((markerPos) => {
                const marker = L.marker(markerPos).addTo(map.value!)
                markersRef.value.push(marker)
            })
        }

        const updatePolygons = () => {
            if (!map.value) return

            polygonsRef.value.forEach((polygon) => map.value!.removeLayer(polygon))
            polygonsRef.value = []

            props.polygons.forEach((polygonCoords) => {
                const polygon = L.polygon(polygonCoords, { color: "blue" }).addTo(map.value!)
                polygonsRef.value.push(polygon)
            })
        }

        watch(() => props.markers, updateMarkers, { deep: true })
        watch(() => props.polygons, updatePolygons, { deep: true })

        return { map, tileLayer, markersRef, polygonsRef }
    },
})
</script>
  
<style scoped>
    .map-container {
        z-index: 1;
        width: 100vw;
        height: 100vh;
        margin: 0;
        padding: 0;
        overflow: hidden;
        position: fixed;
        top: 0px;
        left: 0px;
    }
</style>
  