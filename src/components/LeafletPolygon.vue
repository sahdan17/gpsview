<template>
    <div id="map" class="map-container"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, defineProps, watch, nextTick } from "vue"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { Map as LeafletMapType, TileLayer, Polyline, LatLngTuple, Marker, LayerGroup } from "leaflet"

// Props hanya diterima sekali
const props = defineProps<{
    polygons?: { lat: number; lng: number; timestamp: string; speed: number; direction: number; status: string }[];
}>()

// State peta
const map: any = ref<LeafletMapType | null>(null)
const tileLayer = ref<TileLayer | null>(null)
const polygonLayer = ref<Polyline | null>(null)
const markerLayerGroup: any = ref<LayerGroup | null>(null)

// Fungsi untuk inisialisasi peta
const initMap = () => {
    const mapElement = document.getElementById("map")
    if (!mapElement || !props.polygons || props.polygons.length === 0) return

    // Inisialisasi peta hanya jika belum dibuat
    if (!map.value) {
        map.value = L.map(mapElement, {
            center: [-1.628950, 103.612344], // Default jika tidak ada data
            zoom: 14,
            zoomControl: false
        })

        tileLayer.value = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
        tileLayer.value.addTo(map.value)
    }

    // Ambil koordinat dari props
    const coordinates: LatLngTuple[] = props.polygons.map(item => [item.lat, item.lng] as LatLngTuple)

    // Buat polyline
    if (!polygonLayer.value) {
        polygonLayer.value = L.polyline(coordinates, {
            color: "blue",
            weight: 3,
            opacity: 0.7
        }).addTo(map.value)
    } else {
        polygonLayer.value.setLatLngs(coordinates) // Update jika polyline sudah ada
    }

    // Tambahkan markers
    if (!markerLayerGroup.value) {
        markerLayerGroup.value = L.layerGroup().addTo(map.value)
    } else {
        markerLayerGroup.value.clearLayers()
    }

    // props.polygons.forEach(point => {
    //     L.marker([point.lat, point.lng])
    //         .bindPopup(`
    //             <b>Waktu:</b> ${point.timestamp} <br>
    //             <b>Kecepatan:</b> ${point.speed} km/h <br>
    //             <b>Arah:</b> ${point.direction}° <br>
    //             <b>Status:</b> ${point.status}
    //         `)
    //         .addTo(markerLayerGroup.value!)
    // })

    // Pusatkan peta ke tengah polygon jika belum digeser
    const centerLat = coordinates.reduce((sum, coord) => sum + coord[0], 0) / coordinates.length
    const centerLng = coordinates.reduce((sum, coord) => sum + coord[1], 0) / coordinates.length
    map.value.setView([centerLat, centerLng])
}

// Inisialisasi peta setelah Vue selesai merender dan data tersedia
onMounted(() => {
    nextTick(() => {
        if (props.polygons && props.polygons.length > 0) {
            initMap()
        }
    })
})

// Jalankan `initMap()` saat data `props.polygons` sudah ada
watch(() => props.polygons, (newPolygons) => {
    if (newPolygons && newPolygons.length > 0 && !map.value) {
        nextTick(() => initMap()) // Pastikan Vue sudah merender sebelum inisialisasi
    }
}, { deep: true })
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
