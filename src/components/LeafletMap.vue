<template>
    <div id="map" class="map-container"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, defineProps, nextTick } from "vue"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { gsap } from "gsap"
import type { Map as LeafletMapType, TileLayer, Marker, Polygon, LatLngTuple } from "leaflet"

const props = defineProps<{
    markers: LatLngTuple[]
    polygons?: LatLngTuple[][]
}>()

const map:any = ref<LeafletMapType | null>(null)
const tileLayer = ref<TileLayer | null>(null)
const markersRef = ref<Map<number, Marker>>(new Map())
const polygonsRef = ref<Polygon[]>([])

onMounted(() => {
    const mapElement = document.getElementById("map")
    if (!mapElement) return

    map.value = L.map(mapElement, {
        center: [-1.628950, 103.612344],
        zoom: 14,
        zoomControl: false
    })

    tileLayer.value = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    tileLayer.value.addTo(map.value)

    updateMarkers()
    updatePolygons()
})

const updateMarkers = () => {
    if (!map.value) return

    const newMarkersMap = new Map<number, Marker>()

    props.markers.forEach((markerPos, index) => {
        if (markersRef.value.has(index)) {
            const existingMarker:any = markersRef.value.get(index)!
            animateMarker(existingMarker, markerPos)
            newMarkersMap.set(index, existingMarker)
        } else {
            const newMarker = L.marker(markerPos, { draggable: false }).addTo(map.value!)
            newMarkersMap.set(index, newMarker)
        }
    })

    markersRef.value.forEach((marker, index) => {
        if (!newMarkersMap.has(index)) {
            map.value!.removeLayer(marker)
        }
    })

    markersRef.value = newMarkersMap
}

const animateMarker = (marker: Marker, newLatLng: LatLngTuple) => {
    const startLatLng = marker.getLatLng()
    gsap.to(startLatLng, {
        lat: newLatLng[0],
        lng: newLatLng[1],
        duration: 0.5,
        ease: "power2.out",
        onUpdate: () => {
            marker.setLatLng([startLatLng.lat, startLatLng.lng])
        }
    })
}

const updatePolygons = () => {
    if (!map.value) return

    polygonsRef.value.forEach((polygon) => map.value!.removeLayer(polygon))
    polygonsRef.value = []

    props.polygons?.forEach((polygonCoords) => {
        const polygon = L.polygon(polygonCoords, { color: "blue" }).addTo(map.value!)
        polygonsRef.value.push(polygon)
    })
}

watch(() => props.markers, updateMarkers, { deep: true })
watch(() => props.polygons, updatePolygons, { deep: true })
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
