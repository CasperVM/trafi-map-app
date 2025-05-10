import "./App.css";
import { useState, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import { Train, TrainFront, Container } from "lucide-react";
import { TrainMap } from "./components/TrainMap";
import { useEnrichedTrainLocations } from "./api/useEnrichedTrainLocations";

export default function App() {
  const trainsObj = useEnrichedTrainLocations();
  const trains = useMemo(() => Object.values(trainsObj), [trainsObj]);
  const [filter, setFilter] = useState<
    "All" | "Commuter" | "Long-distance" | "Other"
  >("All");

  return (
    <div className="flex h-screen w-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-black p-4 flex flex-col gap-2">
        {(["All", "Commuter", "Long-distance", "Other"] as const).map(
          (type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`flex items-center gap-2 p-2 rounded ${
                filter === type ? "bg-gray-700" : "hover:bg-gray-700"
              }`}
            >
              {type === "Commuter" && (
                <Train className="w-5 h-5 text-blue-400" />
              )}
              {type === "Long-distance" && (
                <TrainFront className="w-5 h-5 text-green-400" />
              )}
              {type === "Other" && (
                <Container className="w-5 h-5 text-yellow-400" />
              )}
              {type === "All" && <Train className="w-5 h-5 text-gray-400" />}
              <span>{type}</span>
            </button>
          )
        )}
      </div>

      {/* Map */}
      <TrainMap trains={trains} filter={filter} />
    </div>
  );
}
