import "./style.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { defaults } from "ol/interaction/defaults";
import { DragPan, MouseWheelZoom } from "ol/interaction";
import XYZ from "ol/source/XYZ";
// import VectorLayer from "ol/layer/Vector";
// import { Vector as VectorSource } from "ol/source";
// import Feature from "ol/Feature";
// import { Style, Icon } from "ol/style";

// import { Point } from "ol/geom";

import OSM from "ol/source/OSM";
import { useGeographic } from "ol/proj.js";

useGeographic();

let isDark = document.documentElement?.classList?.contains("dark") || false;
const crossElement = document.getElementById("crossElement");
let config = {
  center: [0, 0],
  zoom: 10,
  color: "red",
  theme: "dark",
  bgColor: "black",
};

// const getSVG = () => {
//   var svg =
//     '<svg width="1em" height="1em" version="1.1" xmlns="http://www.w3.org/2000/svg">' +
//     // '<circle cx="60" cy="60" r="60"/>' +
//     `<path d="M 8 16.5 Q 7.5 16.5 7.5 16 Q 7.5 14 5 12 Q 2 10 2 6 A 1 1 0 0 1 14 6 Q 14 10 11 12 Q 8.5 14 8.5 16 Q 8.5 16.5 8 16.5 Z Z" fill="${DEFAULT_ICON_BGCOLOR}" />` +
//     `<path d="${DEFAULT_ICON}"  fill="${DEFAULT_ICON_COLOR}" style="" transform="scale(0.5) translate(8.5,5)" />` +
//     "</svg>";
//   return svg;
// };

// const iconFeature = new Feature({
//   geometry: new Point([0, 0]),
//   name: "Center",
//   population: 4000,
//   rainfall: 500,
// });
// const iconStyle = new Style({
//   image: new Icon({
//     // anchor: [0.5, 46],
//     // anchorXUnits: "fraction",
//     // anchorYUnits: "pixels",
//     opacity: 1,
//     scale: SCALE_ICON,
//     anchor: [0.5, 1],
//     anchorXUnits: "fraction",
//     anchorYUnits: "fraction",
//     src: "data:image/svg+xml;utf8," + encodeURIComponent(getSVG()),
//   }),
// });
// iconFeature.setStyle(iconStyle);

// const vectorSource = new VectorSource({
//   features: [iconFeature],
// });
// const vectorLayer = new VectorLayer({
//   source: vectorSource,
// });

let map = null;

const createMap = () => {
  map = new Map({
    target: "map",
    layers: [
      new TileLayer({
        source: new OSM(),
        // new XYZ({
        //   url: "http://mt0.google.com/vt/lyrs=m&hl=ru&x={x}&y={y}&z={z}",
        // }),
        className: "ol_bw",
      }),
      // vectorLayer,
    ],
    interactions: defaults({
      dragPan: false,
      mouseWheelZoom: false,
    }).extend([
      new DragPan({ kinetic: false }),
      new MouseWheelZoom({ duration: 0 }),
    ]),
    view: new View({
      center: config.center,
      zoom: config.zoom,
      constrainRotation: false,
      constrainResolution: true,
      smoothExtentConstraint: false,
    }),
    controls: [],
  });

  map.on("loadend", () => {
    // console.log("window.screen.width=", window.screen.width);
    crossElement.style.left = `${
      document.documentElement.clientWidth / 2 - 25
    }px`;
    crossElement.style.top = `${
      document.documentElement.clientHeight / 2 - 50
    }px`;
  });

  map.on("moveend", (e) => {
    const centerCoords = map.getView().getCenter();
    const [lon, lat] = centerCoords;

    const message = {
      event: "center",
      data: { lat, lon },
    };
    // console.log(message);
    window.ReactNativeWebView?.postMessage(JSON.stringify(message));

    // iconFeature.getGeometry().setCoordinates(centerCoords);
  });
};
var handleMessage = function (e) {
  const data = JSON.parse(e.data);
  // alert(JSON.stringify(e.data));

  if (!data) {
    return;
  }
  try {
    switch (data.msg) {
      case "theme":
        config = { ...config, ...data };
        changeTheme();
        map.render();
        break;
      case "center":
        setCenter(data.center);
        break;
      case "zoom":
        map.getView().animate({
          zoom: data.zoom,
          duration: 200,
        });
        break;
      case "init":
        // if (data.zoom) {
        //   config.zoom = data.zoom;
        // }
        // if (data.center) {
        //   config.center = data.center;
        // }
        config = { ...config, ...data };
        changeTheme();
        createMap();
        break;
      default:
        break;
    }
  } catch (er) {
    alert(`message:err: ${JSON.stringify(er.toString() || er.message)}`);
  }
};

const changeTheme = () => {
  // alert(JSON.stringify(config));
  crossElement.querySelectorAll("path").forEach((el) => {
    el.style.fill = config.color;
  });

  if (config.theme == "dark") {
    isDark = true;
    document.documentElement?.classList.add("dark");
    // document.getElementById("map").style.background = config.bgColor;
  } else {
    isDark = false;
    document.documentElement?.classList.remove("dark");
    // document.getElementById("map").style.background = "#ccc";
  }
  // document.getElementById("map").style.background = config.bgColor;
};

document && document.addEventListener("message", handleMessage);
window.ReactNativeWebView?.postMessage(JSON.stringify({ event: "ready" }));
// map.on("click", (e) => {
//   console.log(`lon: ${e.coordinate[0]}, lat: ${e.coordinate[1]}`);
//   window.ReactNativeWebView?.postMessage(JSON.stringify(e.coordinate));
// });

window.setCenter = (center) => {
  map.getView().animate({
    center: [center.lon, center.lat],
  });
};

// // debug.
createMap();
changeTheme();
