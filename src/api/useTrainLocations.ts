import { useEffect, useRef, useState } from 'react'
import { createMqttClient, type EnrichedTrain } from './client'
import { Message as PahoMessage } from 'paho-mqtt'

export const useTrainLocations = (categoryMap: Record<string, EnrichedTrain['category']>) => {
  const [trains, setTrains] = useState<Record<string, EnrichedTrain>>({})
  const clientRef = useRef<ReturnType<typeof createMqttClient> | null>(null)

  useEffect(() => {
    const client = createMqttClient((msg: PahoMessage) => {
      const payload = JSON.parse(msg.payloadString)
      const key = `${payload.departureDate}#${payload.trainNumber}`
      const category = categoryMap[key] || 'Other'

      setTrains(prev => ({
        ...prev,
        [key]: { geometry: payload.location, properties: payload, category }
      }))
    })

    clientRef.current = client
    return () => client.disconnect()
  }, [categoryMap])

  return trains
}
