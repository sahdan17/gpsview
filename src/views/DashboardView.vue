<script setup lang="ts">
import { defineComponent, ref, onMounted  } from "vue"
import LeafletMap from "@/components/LeafletMap.vue"
import type { LatLngTuple } from "leaflet"
import { getLatestRecord } from '@/services/apiService'

onMounted(async ()=>{
    await getLatestRecord().then((result:any) => {
        console.log(result)
    }).catch((err:any) => {
        console.log(err)
    })
})
</script>

<template>
    <div class="dashboard-container">
        <!-- <LeafletMap :markers="useMarkers ? markers : []" /> -->
    </div>
</template>