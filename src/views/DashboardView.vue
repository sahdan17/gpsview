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

        const newMarkers: { id: number; position: LatLngTuple; rotation: number }[] = []

        result.forEach((item: any) => {
            if (item.idDevice && item.lat && item.long) {
                newMarkers.push({
                    id: item.idDevice,
                    position: [parseFloat(item.lat), parseFloat(item.long)],
                    rotation: item.dir
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
    interval = setInterval(fetchLatestRecords, 3000)
})

onUnmounted(() => {
    if (interval) clearInterval(interval)
})
</script>

<template>
    <div class="dashboard-container">
        <LeafletMap :markers="markers" @marker-click="handleMarkerClick" />
    </div>
    <!-- <div class="content">
        <div class="navbar">
            <p></p>
        </div>
    </div> -->
</template>

<style scoped>
.dashboard-container {
    text-align: center;
    z-index: -2;
}

.content {
    position: relative;
    z-index: 50;
    margin-right: 20px;
    margin-left: 10px;
    margin-top: 20px;
}

.navbar {
    border: 3px solid rgba(18, 51, 110, .6);
    border-radius: 25px;
    background-color: rgba(18, 51, 115, .8);
    color: white;
    padding-left: 20px;
}
</style>
