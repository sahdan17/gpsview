<script setup lang="ts">
import { ref, onMounted, onUnmounted,watch } from "vue"
import LeafletMap from "@/components/LeafletMap.vue"
import type { LatLngTuple } from "leaflet"
import { getLatestRecord, getVehicle, getLatestRecordById } from '@/services/apiService'

const markers = ref<{ id: number; position: LatLngTuple }[]>([])
const selectedMarkerId = ref<number | null>(null)
const vehiclesCat = ref<string[]>([])
const vehicles = ref<Record<string, any[]>>({})

let interval: ReturnType<typeof setInterval> | null = null

const selectedVehiclesCat = ref<string[]>([])
const selectedVehicles = ref<string[]>([])

const fetchVehicle = async () => {
    try {
        const result = await getVehicle()

        if (!result || !Array.isArray(result)) {
            console.error("Data API tidak valid: ", result)
            return
        }

        let tempVehicles: Record<string, any[]> = {}
        let categories: string[] = []
        let allVehicleIds: string[] = []

        result.forEach(v => {
            if (!v.cat) {
                console.warn("Data kendaraan tidak memiliki kategori:", v)
                return
            }
            
            if (!tempVehicles[v.cat]) {
                tempVehicles[v.cat] = []
            }
            
            tempVehicles[v.cat].push(v)
            allVehicleIds.push(v.id)
        })

        Object.keys(tempVehicles).forEach(category => {
            categories.push(category)
        })

        vehicles.value = tempVehicles
        selectedVehicles.value = allVehicleIds
        
        vehiclesCat.value = categories
        selectedVehiclesCat.value = categories

        intervalLastRecord()
    } catch (e) {
        console.error(e)
    }
}

const toggleCategory = (category: string) => {
    if (selectedVehiclesCat.value.includes(category)) {
        const vehicleIds = vehicles.value[category]?.map(v => v.id) || [];
        selectedVehicles.value = [...new Set([...selectedVehicles.value, ...vehicleIds])];
    } else {
        selectedVehicles.value = selectedVehicles.value.filter(id => 
            !vehicles.value[category]?.some(v => v.id === id)
        );
    }
};


const intervalLastRecord = () => {
    fetchLatestRecords()
    interval = setInterval(fetchLatestRecords, 3000)
}

const fetchLatestRecords = async () => {
    try {
        const result = await getLatestRecordById({ ids:selectedVehicles.value })

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

watch(selectedVehicles, () => {
    fetchLatestRecords();
}, { deep: true });

onMounted(() => {
    fetchVehicle()
})

onUnmounted(() => {
    if (interval) clearInterval(interval)
})
</script>

<template>
    <div class="dashboard-container">
        <LeafletMap :markers="markers" @marker-click="handleMarkerClick" />
    </div>
    <div class="content">
        <div class="navbar">
            <div class="list">
                <ul>
                    <li v-for="category in vehiclesCat" :key="category">
                        <label>
                            <input type="checkbox" v-model="selectedVehiclesCat" :value="category" @change="toggleCategory(category)" /> {{ category }}
                        </label>
                        <ul class="list2">
                            <li v-for="vehicle in vehicles[category]" :key="vehicle.id">
                                <label>
                                    <input type="checkbox" v-model="selectedVehicles" :value="vehicle.id" /> {{ vehicle.nopol }}
                                </label>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<style scoped>
.dashboard-container {
    text-align: center;
    z-index: -2;
}

.content {
    width: 200px;
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
    padding-bottom: 10px;
}

.navbar ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
}

.navbar li {
    padding: 0;
}

.list {
    padding-top: 10px;
}

.list2 li {
    padding-left: 20px;
}
</style>
