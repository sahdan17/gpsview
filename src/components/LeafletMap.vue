<template>
    <div id="map" class="map-container"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, defineProps, defineEmits } from "vue"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { gsap } from "gsap"
import type { Map as LeafletMapType, TileLayer, Marker, Polygon, LatLngTuple } from "leaflet"

const props = defineProps<{
    markers: { id: number; position: LatLngTuple; rotation?: number }[]
    polygons?: LatLngTuple[][]
}>()

const emit = defineEmits(["marker-click"])

const map:any = ref<LeafletMapType | null>(null)
const tileLayer = ref<TileLayer | null>(null)
const markersRef = ref<Map<number, Marker>>(new Map())
const polygonsRef = ref<Polygon[]>([])
const selectedMarkerId = ref<number | null>(null)
const userHasMovedMap = ref(false)
const lastCenter:any = ref<LatLngTuple | null>(null)
const isAutoMoving = ref(false)

const createCustomIcon = (rotation: number = 90) => {
    return L.divIcon({
        className: "rotated-marker",
        html: `<img src='${new URL('@/assets/images/vt.png', import.meta.url).href}' 
                    style='width: 64px; height: 64px; transform: rotate(${rotation}deg);'/>`,
        iconSize: [64, 64],
        iconAnchor: [32, 40],
        popupAnchor: [0, -64]
    })
}

const updateMarkers = () => {
    if (!map.value) return

    console.log("Menjalankan updateMarkers, jumlah marker:", props.markers.length)

    const newMarkersMap = new Map<number, Marker>()

    props.markers.forEach(({ id, position, rotation = 90 }) => {
        if (markersRef.value.has(id)) {
            const existingMarker:any = markersRef.value.get(id)!
            animateMarker(existingMarker, position)
            existingMarker.setIcon(createCustomIcon(rotation))
            newMarkersMap.set(id, existingMarker)
        } else {
            const newMarker = L.marker(position, { 
                icon: createCustomIcon(rotation),
                draggable: false
            })
                .addTo(map.value!)
                .on("click", () => handleMarkerClick(id))
            
            newMarkersMap.set(id, newMarker)
        }
    })

    markersRef.value.forEach((marker, id) => {
        if (!newMarkersMap.has(id)) {
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
        duration: 1,
        ease: "power2.out",
        onUpdate: () => {
            marker.setLatLng([startLatLng.lat, startLatLng.lng])
        }
    })
}

watch(() => props.markers, () => updateMarkers(), { immediate: true, deep: true })

const handleMarkerClick = (id: number) => {
    console.log("Marker diklik, ID:", id)
    selectedMarkerId.value = id
    userHasMovedMap.value = false

    if (map.value && markersRef.value.has(id)) {
        const marker = markersRef.value.get(id)!
        const newLatLng = marker.getLatLng()
        
        isAutoMoving.value = true
        map.value.flyTo([newLatLng.lat, newLatLng.lng], 18, { duration: .5 })
    }

    emit("marker-click", id)
}

watch(() => props.markers, (newMarkers) => {
    console.log("Markers diperbarui:", newMarkers.length)

    newMarkers.forEach(({ id, position, rotation }) => {
        if (markersRef.value.has(id)) {
            const marker:any = markersRef.value.get(id)!
            animateMarker(marker, position)
            marker.setIcon(createCustomIcon(rotation || 90))
        }
    })

    if (!userHasMovedMap.value && selectedMarkerId.value !== null && map.value) {
        const selectedMarker = newMarkers.find(m => m.id === selectedMarkerId.value)
        if (selectedMarker) {
            console.log("Memindahkan peta ke marker ID:", selectedMarkerId.value)
            isAutoMoving.value = true
            map.value!.setView(selectedMarker.position, 18)
        }
    }
}, { deep: true })

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

    lastCenter.value = map.value.getCenter()

    map.value.on("movestart", () => {
        lastCenter.value = map.value!.getCenter()
    })

    map.value.on("moveend", () => {
        if (isAutoMoving.value) {
            isAutoMoving.value = false
            return
        }

        const newCenter = map.value!.getCenter()
        const movedDistance = Math.sqrt(
            Math.pow(newCenter.lat - lastCenter.value!.lat, 2) +
            Math.pow(newCenter.lng - lastCenter.value!.lng, 2)
        )

        if (movedDistance > 0.0001) {
            console.log("User benar-benar menggeser peta, melepas fokus.")
            userHasMovedMap.value = true
            selectedMarkerId.value = null
        }
    })
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
