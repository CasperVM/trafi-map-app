import { Client as PahoClient, Message as PahoMessage } from "paho-mqtt";

export const TODAY = new Date().toISOString().slice(0, 10);
export const MQTT_HOST = "rata.digitraffic.fi";
export const MQTT_PORT = 443;


export type TrainLocation = {
    geometry: { coordinates: [number, number] };
    properties: {
      trainNumber: number;
      departureDate: string;
      timestamp: string;
      speed?: number;
    };
  };
  
  export type EnrichedTrain = TrainLocation & {
    category: "Commuter" | "Long-distance" | "Other";
  };
  
  export type TimeTableRow = {
    stationShortCode: string;
    stationUICCode: number;
    countryCode: string;
    type: "ARRIVAL" | "DEPARTURE";
    scheduledTime: string; // ISO string
  };
  
  export type Locomotive = {
    location: number;
    locomotiveType: string;
    powerType: "Electric" | "Diesel" | string;
  };
  
  export type Wagon = {
    wagonType: string;
    location: number;
    salesNumber: number;
    length: number;
    playground?: boolean;
    video?: boolean;
    disabled?: boolean;
    catering?: boolean;
    pet?: boolean;
  };
  
  export type JourneySection = {
    beginTimeTableRow: TimeTableRow;
    endTimeTableRow: TimeTableRow;
    locomotives: Locomotive[];
    wagons: Wagon[];
    totalLength: number;
    maximumSpeed: number;
  };
  
  export type Composition = {
    trainNumber: number;
    departureDate: string;
    operatorUICCode?: number;
    operatorShortCode?: string;
    trainCategory: string;
    trainType: string;
    version?: number;
    journeySections: JourneySection[];
  };

export const createMqttClient = (onMessage: (msg: PahoMessage) => void) => {
  const client = new PahoClient(
    MQTT_HOST,
    MQTT_PORT,
    `paho_${(Math.random() * 1e4) | 0}`
  );

  client.onConnectionLost = (resp) =>
    console.warn("MQTT LOST", resp.errorMessage);
  client.onMessageArrived = onMessage;

  client.connect({
    useSSL: true,
    onSuccess: () => client.subscribe(`train-locations/${TODAY}/#`, { qos: 0 }),
    onFailure: (err) => console.error("MQTT connect failure", err),
  });

  return client;
};
