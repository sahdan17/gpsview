import axios from 'axios'

const latestRecord = 'https://apigps.findingoillosses.com/api/latestRecords'

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
