import { useState } from "react";
import type { Composition } from "./client";

export const useTrainComposition = () => {
  const [details, setDetails] = useState<Record<string, Composition>>({});

  const fetchDetails = async (dep: string, num: number) => {
    const key = `${dep}#${num}`;
    if (details[key]) return;

    try {
      const r = await fetch(
        `https://rata.digitraffic.fi/api/v1/compositions/${dep}/${num}`
      );
      const composition = await r.json();
      console.log(composition);

      setDetails((prev) => ({ ...prev, [key]: composition }));
    } catch (err) {
      console.error(err);
    }
  };

  return { details, fetchDetails };
};
