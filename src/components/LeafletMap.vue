<template>
    <div id="map" class="map-container"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, defineProps, defineEmits } from "vue"
import L, { icon } from "leaflet"
import "leaflet/dist/leaflet.css"
import { gsap } from "gsap"
import type { Map as LeafletMapType, TileLayer, Marker, Polygon, LatLngTuple } from "leaflet"
import dayjs from 'dayjs'
import 'dayjs/locale/id'
import { useRouter } from 'vue-router'

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
const lastFocusedPosition = ref<LatLngTuple | null>(null)
const router = useRouter()
dayjs.locale('id')

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

const formatDate = (timestamp: any) => {
    if (!timestamp) return '--'
    return dayjs(timestamp).locale('id').format('DD MMM YYYY')
}

const formatTime = (timestamp: any) => {
    if (!timestamp) return '--'
    return dayjs(timestamp).locale('id').format('HH:mm:ss')
}

const isOn = (status: any) => {
    if (!status) return '--'
    if (status == 'idle' || status == 'start') return 'ON'
    if (status == 'stop') return 'OFF'
}

const updateMarkers = () => {
    if (!map.value) return

    const newMarkersMap = new Map<number, Marker>()

    props.markers.forEach(({ id, position, record, driveSession }) => {
        let iconColor = record?.status === 'start' ? 'green' :
                        record?.status === 'idle' ? 'yellow' : 'red'

        const tooltipHTML = `
            <div>
                <div style="
                    width: 150px; 
                    height: 30px; 
                    text-align: center; 
                    background-color: ${iconColor};
                    margin: 0; 
                    padding: 10px 20px;
                    border-radius: 8px 8px 0px 0px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                ">
                    <div>
                        <strong style="font-size: 12px;">${record?.vehicle.nopol} | ${record?.vehicle.kode}</strong><br>
                        <strong style="font-size: 12px;">${record?.speed} km/h</strong>
                    </div>                    
                </div>
                <div style="display: flex; justify-content: space-between; padding: 5px;">
                    <div style="flex: 1; padding-right: 5px;">
                        <p style="padding: 0; margin: 0; color: grey; font-size: 10px;">Driver Data</p>
                        <p style="padding: 0; margin: 0; font-weight: bold; font-size: 10px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; max-width: 90px;">${driveSession?.driver.driver_name || '--' }</p>
                        <p style="padding: 0; margin: 0; font-weight: bold; font-size: 10px;">${driveSession?.driver.no_wa || '--' }</p>
                    </div>
                    <div style="flex: 1;">
                        <p style="padding: 0; margin: 0; color: grey; font-size: 10px;">Last Update</p>
                        <p style="padding: 0; margin: 0; font-weight: bold; font-size: 10px;">${formatDate(record?.timestamp) || '--'}</p>
                        <p style="padding: 0; margin: 0; font-weight: bold; font-size: 10px;">${formatTime(record?.timestamp) || '--'}</p>
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 5px 10px; border-top: 2px solid #ddd;">
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16">
                            <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 224c0 17.7 14.3 32 32 32s32-14.3 32-32l0-224zM143.5 120.6c13.6-11.3 15.4-31.5 4.1-45.1s-31.5-15.4-45.1-4.1C49.7 115.4 16 181.8 16 256c0 132.5 107.5 240 240 240s240-107.5 240-240c0-74.2-33.8-140.6-86.6-184.6c-13.6-11.3-33.8-9.4-45.1 4.1s-9.4 33.8 4.1 45.1c38.9 32.3 63.5 81 63.5 135.4c0 97.2-78.8 176-176 176s-176-78.8-176-176c0-54.4 24.7-103.1 63.5-135.4z"/>
                        </svg>
                        <p style="padding: 0; margin: 0; font-weight: bold; font-size: 10px;">${isOn(record?.status)}</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16">
                            <path d="M192 32c0-17.7 14.3-32 32-32C383.1 0 512 128.9 512 288c0 17.7-14.3 32-32 32s-32-14.3-32-32C448 164.3 347.7 64 224 64c-17.7 0-32-14.3-32-32zM60.6 220.6L164.7 324.7l28.4-28.4c-.7-2.6-1.1-5.4-1.1-8.3c0-17.7 14.3-32 32-32s32 14.3 32 32s-14.3 32-32 32c-2.9 0-5.6-.4-8.3-1.1l-28.4 28.4L291.4 451.4c14.5 14.5 11.8 38.8-7.3 46.3C260.5 506.9 234.9 512 208 512C93.1 512 0 418.9 0 304c0-26.9 5.1-52.5 14.4-76.1c7.5-19 31.8-21.8 46.3-7.3zM224 96c106 0 192 86 192 192c0 17.7-14.3 32-32 32s-32-14.3-32-32c0-70.7-57.3-128-128-128c-17.7 0-32-14.3-32-32s14.3-32 32-32z"/>
                        </svg>
                        <p style="padding: 0; margin: 0; font-weight: bold; font-size: 10px;">${record?.sat || '--'} Satelit</p>
                    </div>
                    <button style="
                        display: flex; 
                        align-items: center; 
                        gap: 5px; 
                        background-color: #cfd4d1;
                        border: none; 
                        padding: 5px; 
                        font-size: 10px; 
                        font-weight: bold; 
                        border-radius: 20px; 
                        cursor: pointer;
                    " 
                    title="Riwayat Perjalanan"
                    onmouseover="this.style.backgroundColor='#a3a3a3'; this.style.opacity='0.9';"
                    onmouseout="this.style.backgroundColor='#cfd4d1'; this.style.opacity='1';"
                    onclick="handleHistoryClick(${String(id)})">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="14" height="14">
                            <path d="M75 75L41 41C25.9 25.9 0 36.6 0 57.9L0 168c0 13.3 10.7 24 24 24l110.1 0c21.4 0 32.1-25.9 17-41l-30.8-30.8C155 85.5 203 64 256 64c106 0 192 86 192 192s-86 192-192 192c-40.8 0-78.6-12.7-109.7-34.4c-14.5-10.1-34.4-6.6-44.6 7.9s-6.6 34.4 7.9 44.6C151.2 495 201.7 512 256 512c141.4 0 256-114.6 256-256S397.4 0 256 0C185.3 0 121.3 28.7 75 75zm181 53c-13.3 0-24 10.7-24 24l0 104c0 6.4 2.5 12.5 7 17l72 72c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-65-65 0-94.1c0-13.3-10.7-24-24-24z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `

        if (markersRef.value.has(id)) {
            const existingMarker:any = markersRef.value.get(id)!
            animateMarker(existingMarker, position)
            existingMarker.setIcon(createCustomIcon(record?.dir))

            if (existingMarker.isPopupOpen()) {
                existingMarker.setPopupContent(tooltipHTML)
            }

            newMarkersMap.set(id, existingMarker)
        } else {
            const newMarker = L.marker(position, { 
                icon: createCustomIcon(record?.dir),
                draggable: false
            }).addTo(map.value!)
            .bindPopup(tooltipHTML, {offset: [0, 30]})
            .on("click", () => {
                handleMarkerClick(id)
            })
            
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

(window as any).handleHistoryClick = (id: any) => {
    console.log('ID diklik untuk history:', id)
    const url = router.resolve({ name: 'history', query: { id } }).href
    window.open(url, '_blank')
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
            
            const currentLatLng = marker.getLatLng()
            if (currentLatLng.lat !== position[0] || currentLatLng.lng !== position[1]) {
                animateMarker(marker, position)
                marker.setIcon(createCustomIcon(record?.dir || 90));
            }
        }
    })

    if (!userHasMovedMap.value && selectedMarkerId.value !== null && map.value) {
        const selectedMarker = newMarkers.find(m => m.id === selectedMarkerId.value)
        
        if (selectedMarker) {
            const newPosition = selectedMarker.position

            if (!lastFocusedPosition.value || 
                lastFocusedPosition.value[0] !== newPosition[0] || 
                lastFocusedPosition.value[1] !== newPosition[1]) {
                
                isAutoMoving.value = true
                map.value.flyTo(newPosition, 18, { duration: 1 })

                lastFocusedPosition.value = newPosition
            }
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

::v-deep(.leaflet-popup-content-wrapper) {
    background-color: white;
    color: black !important;
    border-radius: 8px !important;
    border: none !important;
    width: 190px;
    height: 130px;
    padding: 0px !important;
    margin: 0px !important;
    display: flex;
    align-items: center;
    justify-content: center;
}

::v-deep(.leaflet-popup-content) {
    margin: 0px !important;
    padding: 0px !important;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}

::v-deep(.leaflet-popup-close-button) {
    display: none;
}
</style>
