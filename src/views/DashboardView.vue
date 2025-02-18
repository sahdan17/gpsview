<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"
import LeafletMap from "@/components/LeafletMap.vue"
import type { LatLngTuple } from "leaflet"
import { getLatestRecord } from '@/services/apiService'

const markers = ref<{ id: number; position: LatLngTuple }[]>([]) // Format sesuai LeafletMap.vue
const selectedMarkerId = ref<number | null>(null)

let interval: ReturnType<typeof setInterval> | null = null

const fetchLatestRecords = async () => {
    try {
        const result = await getLatestRecord()

        if (!result || !Array.isArray(result)) {
            console.error("Data API tidak valid:", result)
            return
        }

        const newMarkers: { id: number; position: LatLngTuple }[] = []

        result.forEach((item: any) => {
            if (item.idDevice && item.lat && item.long) {
                newMarkers.push({
                    id: item.idDevice, // Gunakan ID dari API sebagai ID marker
                    position: [parseFloat(item.lat), parseFloat(item.long)] // Konversi lat & long ke number
                })
            }
        })

        markers.value = newMarkers
    } catch (err) {
        console.error("Error fetching latest record:", err)
    }
}

const handleMarkerClick = (id: number) => {
    console.log("Marker dengan ID diklik:", id)
    selectedMarkerId.value = id
}

onMounted(() => {
    fetchLatestRecords()
    interval = setInterval(fetchLatestRecords, 5000) // Update setiap 5 detik
})

onUnmounted(() => {
    if (interval) clearInterval(interval)
})
</script>

<template>
    <div class="dashboard-container">
        <LeafletMap :markers="markers" @marker-click="handleMarkerClick" />
    </div>
</template>

<style scoped>
.dashboard-container {
    padding: 20px;
    text-align: center;
}
</style>
