<template>
    <div id="map" class="map-container"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, defineProps, watchEffect } from "vue"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { Map as LeafletMapType, TileLayer, Polyline, LatLngTuple } from "leaflet"

const props = defineProps<{
    polygons?: { lat: number; lng: number; timestamp: string; speed: number; direction: number; status: string }[];
}>()

const map: any = ref<LeafletMapType | null>(null)
const tileLayer = ref<TileLayer | null>(null)
const polygonLayer = ref<Polyline | null>(null)

const updatePolygons = () => {
    if (!map.value || !props.polygons || props.polygons.length === 0) return

    const coordinates: LatLngTuple[] = props.polygons.map(item => [item.lat, item.lng] as LatLngTuple)

    // Hapus jalur lama jika ada
    if (polygonLayer.value instanceof L.Polyline) {
        map.value.removeLayer(polygonLayer.value)
    }

    // Buat jalur baru
    polygonLayer.value = L.polyline(coordinates, {
        color: "blue",
        weight: 3,
        opacity: 0.7
    }).addTo(map.value)

    // Sesuaikan tampilan peta dengan polygon baru
    if (coordinates.length > 0) {
        map.value.fitBounds(polygonLayer.value.getBounds(), { padding: [20, 20] })
    }
}

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
})

// 🔥 Pantau perubahan props.polygons secara otomatis
watchEffect(() => {
    updatePolygons()
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
