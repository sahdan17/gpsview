<template>
    <div id="map" class="map-container"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, defineProps, defineEmits } from "vue"
import L, { icon } from "leaflet"
import "leaflet/dist/leaflet.css"
import { gsap } from "gsap"
import type { Map as LeafletMapType, TileLayer, Marker, Polygon, LatLngTuple } from "leaflet"

const props = defineProps<{
    markers: { id: number;
        position: LatLngTuple;
        record?: {
            timestamp: string;
            lat: string;
            long: string;
            speed: number;
            sat: number;
            dir: number;
            status: string;
            idDevice: number;
            vehicle: {
                id: number;
                nopol: string;
                kode: string;
                cat: string;
            };
        },
        driveSession?: {
            start: string;
            stop: string;
            id: number;
            vehicle_id: number;
            driver_id: number;
            driver: {
                id: number;
                driver_name: string;
                rfid: string;
                no_wa: string;
            }
        } }[]
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

    const newMarkersMap = new Map<number, Marker>()

    props.markers.forEach(({ id, position, record, driveSession }) => {
        console.log(driveSession);
        
        let iconColor = ''

        if (record?.status == 'start') {
            iconColor = 'green'
        } else if (record?.status == 'idle') {
            iconColor = 'yellow'
        } else {
            iconColor = 'red'
        }

        const iconSVG = 
            `<div style="display: flex; align-items: center; justify-content: center; margin-top: 5px;">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" 
                    style="width: 15px; height: 15px; fill: ${iconColor}; margin-right: 5px;">
                    <path d="M0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm320 96c0-15.9-5.8-30.4-15.3-41.6l76.6-147.4c6.1-11.8 1.5-26.3-10.2-32.4s-26.2-1.5-32.4 10.2L262.1 288.3c-2-.2-4-.3-6.1-.3c-35.3 0-64 28.7-64 64s28.7 64 64 64s64-28.7 64-64z"/>
                </svg>
                <span>${record?.speed} km/h</span>
            </div>`

        const tooltipHTML = `
            <div class="custom-tooltip" style="width: 120px; text-align: center;">
                <strong>${record?.vehicle.nopol}</strong> <br>
                ${record?.vehicle.kode} <br>
                ${driveSession?.driver.driver_name} <br>
                ${driveSession?.driver.no_wa} <br>
                ${iconSVG}
            </div>
        `

        if (markersRef.value.has(id)) {
            const existingMarker:any = markersRef.value.get(id)!
            animateMarker(existingMarker, position)
            existingMarker.setIcon(createCustomIcon(record?.dir))
            newMarkersMap.set(id, existingMarker)
        } else {
            const newMarker = L.marker(position, { 
                icon: createCustomIcon(record?.dir),
                draggable: false
            })
                .addTo(map.value!)
                .bindTooltip(tooltipHTML, { permanent: false, direction: "top", offset: [0,-30] }
                )
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
    newMarkers.forEach(({ id, position, record }) => {
        if (markersRef.value.has(id)) {
            const marker:any = markersRef.value.get(id)!
            animateMarker(marker, position)
            marker.setIcon(createCustomIcon(record?.dir || 90))
        }
    })

    if (!userHasMovedMap.value && selectedMarkerId.value !== null && map.value) {
        const selectedMarker = newMarkers.find(m => m.id === selectedMarkerId.value)
        if (selectedMarker) {
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
