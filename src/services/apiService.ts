import axios from 'axios'

const latestRecord = 'https://apigps.findingoillosses.com/api/latestRecords'
const vehicle = 'https://apigps.findingoillosses.com/api/getVehicle'
const latestRecordById = 'https://apigps.findingoillosses.com/api/getLatestRecordsById'
const vehicleByCat = 'https://apigps.findingoillosses.com/api/getVehicleByCat'

export const getLatestRecord = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await axios.post(latestRecord)
            resolve(response.data)
        } catch (error) {
            console.error('Error fetching latest record:', error)
            reject(error)
        }
    })
}

export const getLatestRecordById = async (request: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await axios.post(latestRecordById, request)
            resolve(response.data)
        } catch (error) {
            console.error('Error fetching latest record:', error)
            reject(error)
        }
    })
}

export const getVehicle = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await axios.post(vehicle)
            resolve(response.data)
        } catch (error) {
            console.error('Error fetching latest record:', error)
            reject(error)
        }
    })
}

export const getVehicleByCat = async (request: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await axios.post(vehicleByCat, request)
            resolve(response.data)
        } catch (error) {
            console.error('Error fetching latest record:', error)
            reject(error)
        }
    })
}
