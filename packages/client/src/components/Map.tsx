import { useScript } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";
import { MazemapMap } from "../../typings";

const config = {
  bearing: 0,
  pitch: 0,
  zoom: 6,
  maxZoom: 20,
  container: "mazemap-container",
  campus: 0,
  campuses: "unimelb",
  center: {
    lng: 144.95,
    lat: -37.4,
  },
  zLevel: 0,
  interactive: true,
  zLevelUpdater: true,
  zLevelControl: false,
  enable3d: false,
  autoSetRTLTextPlugin:
    "https://1334400846607155301.discordsays.com/.proxy/mapbox/api/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.0/mapbox-gl-rtl-text.js",
};

const MazeMap = () => {
  const status = useScript(
    "https://1334400846607155301.discordsays.com/.proxy/mazemap/api/js/v2.2.1/mazemap.min.js",
    {
      removeOnUnmount: false,
    }
  );

  const [map, setMap] = useState<MazemapMap>();

  useEffect(() => {
    if (window.Mazemap && typeof window.Mazemap != "undefined") {
      const m = new window.Mazemap.Map(config);
      console.log(m);
      setMap(m);
    }
  }, [status]);

  return (
    <>
      <div
        id="mazemap-container"
        style={{ width: "100%", height: "100vh" }}
      ></div>
    </>
  );
};

export default MazeMap;
