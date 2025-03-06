<script setup lang="ts">
import { ref, onMounted, onUnmounted,watch } from "vue"
import { getHistory } from '@/services/apiService'
import { useRoute } from 'vue-router'
import LeafletPolygon from "@/components/LeafletPolygon.vue"

const route = useRoute()
const id = route.query.id

const polygons = ref<any[]>([])

const fetchHistory = async () => {
    try {
        const result = await getHistory({
            idDevice: id,
            date: "2025-03-05"
        })

        if (!result || !Array.isArray(result)) {
            console.error("Data API tidak valid: ", result)
            return
        }

        polygons.value = result.map(item => ({
            lat: parseFloat(item.lat),
            lng: parseFloat(item.long),
            timestamp: item.timestamp,
            speed: item.speed,
            direction: item.dir,
            status: item.status
        }))

        console.log("Data polygons:", polygons.value)
    } catch (e) {
        console.error(e)
    }
}

onMounted(() => {
    fetchHistory()
})
</script>

<template>
    <div class="dashboard-container">
        <LeafletPolygon :polygons="polygons" />
    </div>
</template>

<style scoped>
.dashboard-container {
    text-align: center;
    z-index: -2;
}
</style>