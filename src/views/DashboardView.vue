<script setup lang="ts">
import { defineComponent, ref, onMounted, onUnmounted  } from "vue"
import LeafletMap from "@/components/LeafletMap.vue"
import type { LatLngTuple } from "leaflet"
import { getLatestRecord } from '@/services/apiService'

const markers = ref<LatLngTuple[]>([]);

let interval: number | null = null

const fetchLatestRecords = async () => {
    console.log('ambil')
    await getLatestRecord().then((result:any) => {
        const newMarkers: LatLngTuple[] = []
        if (result) {
            result.forEach((item:any) => {
                newMarkers.push([item.lat, item.long])
            });
        }

        markers.value = newMarkers
    }).catch((err:any) => {
        console.log(err)
    })
}

onMounted(() => {
    fetchLatestRecords()

    interval = setInterval(fetchLatestRecords, 5000)
})

onUnmounted(() => {
    if (interval) clearInterval(interval)
})
</script>

<template>
    <div class="dashboard-container">
        <LeafletMap :markers="markers" />
    </div>
</template>