<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const id = route.query.id

console.log('ID dari URL:', id)
</script>

<template>
    <div>
        <h1>History Page</h1>
        <p v-if="id">ID: {{ id }}</p>
        <p v-else>ID tidak ditemukan</p>
    </div>
</template>
