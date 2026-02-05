"use server"
import { Client } from '@googlemaps/google-maps-services-js'

const client = new Client()
export const autocomplete = async (query: string) => {
    if (!query) return []

    try {
        const response = await client.placeAutocomplete({
            params: {
                input: query,
                key: process.env.GOOGLE_MAPS_API_KEY!
            }
        })

        return response.data.predictions;
    } catch (error) {
        console.error(error)
    }
}