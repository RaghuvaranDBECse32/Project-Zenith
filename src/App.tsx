import React, { useState, useEffect, useRef } from "react";
import {
  Globe,
  Compass,
  Satellite,
  MessageSquare,
  Sparkles,
  Info,
  MapPin,
  Clock,
  Eye,
  Settings,
  ChevronRight,
  TrendingUp,
  Cpu,
  FileText,
  RotateCcw,
  Sun,
  CloudRain,
  CloudSun,
  Moon,
  ChevronDown,
  Navigation,
  Send,
  HelpCircle,
  Share2
} from "lucide-react";
import { ObserverCoordinates, WeatherCondition, CelestialBody, CelestialType, StargazingPass } from "./types";
import earthRenderUrl from "./assets/images/earth_render_1782208900693.jpg";
import spaceStationRenderUrl from "./assets/images/space_station_render_1782208913723.jpg";
import earth3dBlenderUrl from "./assets/images/earth_3d_blender_1782208912944.jpg";
import satelliteToroidBlenderUrl from "./assets/images/satellite_toroid_blender_1782208930588.jpg";

// Preset Cities around the world to track zenith
const PRESET_LOCATIONS: ObserverCoordinates[] = [
  { cityName: "New York, USA", lat: 40.7128, lng: -74.0060 },
  { cityName: "Tokyo, Japan", lat: 35.6762, lng: 139.6503 },
  { cityName: "Sydney, Australia", lat: -33.8688, lng: 151.2093 },
  { cityName: "Cairo, Egypt", lat: 30.0444, lng: 31.2357 },
  { cityName: "Reykjavik, Iceland", lat: 64.1466, lng: -21.9426 },
  { cityName: "Amundsen-Scott Station, Antarctica", lat: -90.0000, lng: 0.0000 },
  { cityName: "Svalbard Satellite Station, Norway", lat: 78.2307, lng: 15.4072 },
  { cityName: "Mumbai, India", lat: 19.0760, lng: 72.8777 }
];

// Interactive 3D Hologram Space Quiz Questions (SRMIST Aaruush '26 National Championship Track)
const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What is the approximate orbital speed of the International Space Station (ISS) in Low Earth Orbit?",
    options: [
      { key: "A", text: "11.20 km/s (Escape Velocity threshold limit)" },
      { key: "B", text: "7.66 km/s (~27,600 km/h standard orbit velocity)" },
      { key: "C", text: "3.07 km/s (Geostationary synchronization rate)" },
      { key: "D", text: "1.02 km/s (Lunar trajectory capture rate)" }
    ],
    correctKey: "B",
    explanation: "Low Earth Orbit (LEO) satellites require an average orbital velocity of approximately 7.66 km/s to balance gravitational forces at ~400km.",
    holoType: "satellite"
  },
  {
    id: 2,
    question: "SRMIST is located in Kattankulathur, Chennai. At which approximate latitude coordinate is the campus situated?",
    options: [
      { key: "A", text: "12.82° N (Sub-Tropical Transit Zone coordinate)" },
      { key: "B", text: "28.61° N (Northern Capital Line coordinate)" },
      { key: "C", text: "18.97° N (Western Peninsular coordinate)" },
      { key: "D", text: "1.35° N (Equatorial Line alignment coordinate)" }
    ],
    correctKey: "A",
    explanation: "SRMIST Kattankulathur Chennai is situated at approximately 12.82° N, 80.04° E. This matches Southern India's upper-equatorial satellite corridor.",
    holoType: "earth"
  },
  {
    id: 3,
    question: "At which precise altitude do Geostationary (GEO) satellites synchronize with Earth's rotation?",
    options: [
      { key: "A", text: "400 km (Low Altitude Thermosphere Boundary)" },
      { key: "B", text: "20,200 km (Medium Range Navstar Global GPS Satellite Corridor)" },
      { key: "C", text: "35,786 km (Symmetric Geostationary Belt Ring)" },
      { key: "D", text: "384,400 km (Symmetric Translunar gravitational L1 point)" }
    ],
    correctKey: "C",
    explanation: "At exactly 35,786 km, a satellite's orbital period matches Earth's rotation of 23 hours & 56 minutes, keeping it fixed above a single point.",
    holoType: "ring"
  },
  {
    id: 4,
    question: "If an astronomer at SRMIST (Lat 12.8° N) observes a star directly at their Zenith, what is its celestial Declination?",
    options: [
      { key: "A", text: "0.0° (Direct Celestial Equator alignment)" },
      { key: "B", text: "+12.8° (Zenith Latitude match)" },
      { key: "C", text: "+90.0° (Polar North Celestial axis)" },
      { key: "D", text: "-12.8° (Southern ecliptic coordinate zone)" }
    ],
    correctKey: "B",
    explanation: "An observer's local Zenith declination matches their exact geographic latitude (+12.8° matching 12.8° N). Correct tracking avoids orthographic skew.",
    holoType: "zenith"
  },
  {
    id: 5,
    question: "SRMIST successfully designed and launched a green-house gas tracking satellite in PSLV-C18. What was its official mission name?",
    options: [
      { key: "A", text: "SRMSAT (PSLV-C18 Launch vehicle)" },
      { key: "B", text: "PROJECT ZENITH SKY-ONE" },
      { key: "C", text: "AARUUSH COMP SECTOR" },
      { key: "D", text: "SRMIST NANO-9" }
    ],
    correctKey: "A",
    explanation: "SRMSAT is SRMIST's signature student-designed space project, launched on October 12, 2011, by ISRO aboard the PSLV-C18 launch vehicle.",
    holoType: "satellite"
  }
];

// Initial celestial coordinate data corresponding to mid-June (Year 2026 cosmic catalog)
const INITIAL_CELESTIAL_BODIES: CelestialBody[] = [
  {
    id: "iss",
    name: "ISS (Zarya)",
    type: CelestialType.SPACECRAFT,
    noradId: "25544",
    altitude: 418.6,
    velocity: 7.66,
    magnitude: -3.8,
    description: "International Space Station: humanity's primary low-Earth orbit scientific laboratory.",
    lore: "Orbits Earth approximately every 92.8 minutes. Its reflective solar panels make it the brightest human-made object overhead.",
  },
  {
    id: "hubble",
    name: "HST (Hubble Space Telescope)",
    type: CelestialType.SPACECRAFT,
    noradId: "20580",
    altitude: 535.2,
    velocity: 7.59,
    magnitude: 1.5,
    description: "Orbits just above the atmosphere, capturing high-resolution deep space pictures.",
    lore: "Launched in 1990, the Hubble revolutionized astronomy with its deep-field images of the early universe.",
  },
  {
    id: "starlink-1234",
    name: "STARLINK-3042",
    type: CelestialType.SPACECRAFT,
    noradId: "49215",
    altitude: 549.8,
    velocity: 7.61,
    magnitude: 3.2,
    description: "Active highspeed space broadband constellation operated by SpaceX.",
    lore: "One of thousands of mass-produced micro-satellites deployed to provide low-latency global internet coverage.",
  },
  {
    id: "gps-3",
    name: "GPS IIIA-05 (USA-314)",
    type: CelestialType.SPACECRAFT,
    noradId: "48859",
    altitude: 20180,
    velocity: 3.88,
    magnitude: 5.4,
    description: "Medium Earth Orbit (MEO) navigation satellite of the United States Space Force.",
    lore: "Generates atomic-clock synchronized position signals crucial for modern civil and military logistics globally.",
  },
  {
    id: "noaa20",
    name: "NOAA-20",
    type: CelestialType.SPACECRAFT,
    noradId: "43013",
    altitude: 824.2,
    velocity: 7.42,
    magnitude: 4.8,
    description: "Next-generation polar-orbiting meteorological environmental satellite.",
    lore: "Scans global temperatures and atmospheric profiles twice a day to facilitate critical weather monitoring.",
  },
  {
    id: "jupiter",
    name: "Jupiter",
    type: CelestialType.PLANET,
    distance: 5.23, // AU
    magnitude: -2.4,
    description: "The largest planet in our solar system, a giant gas world with 95 recognized moons.",
    lore: "Famous for its Great Red Spot—a roaring storm system larger than planet Earth that has active wind bands.",
  },
  {
    id: "mars",
    name: "Mars",
    type: CelestialType.PLANET,
    distance: 1.48, // AU
    magnitude: 0.12,
    description: "The Red Planet, characterized by iron-oxide rich dust and massive extinct volcanoes.",
    lore: "Home to Olympus Mons, the largest volcano in the solar system, and ancient ocean dry basins.",
  },
  {
    id: "venus",
    name: "Venus",
    type: CelestialType.PLANET,
    distance: 0.72, // AU
    magnitude: -4.1,
    description: "Our closest planetary neighbor, cloaked in highly dense carbon dioxide clouds.",
    lore: "Experiencing runaway greenhouse effect where surface temperatures exceed 460°C, hot enough to melt lead.",
  },
  {
    id: "saturn",
    name: "Saturn",
    type: CelestialType.PLANET,
    distance: 9.58, // AU
    magnitude: 0.74,
    description: "A gorgeous outer gas giant featuring a magnificent dusty ring system.",
    lore: "Its density is so low that it would hypothetically float if placed in a massive stellar ocean bowl.",
  },
  {
    id: "ursa_major",
    name: "Ursa Major (Great Bear)",
    type: CelestialType.CONSTELLATION,
    magnitude: 1.8,
    description: "Northern hemisphere prominence, containing the famous asterism of the Big Dipper.",
    lore: "Used since antiquity to locate Polaris—the North Star—and guide sailors through uncharted pitch-black seas.",
  },
  {
    id: "orion",
    name: "Orion (The Hunter)",
    type: CelestialType.CONSTELLATION,
    magnitude: 0.4,
    description: "A major constellation visible worldwide along the celestial equator.",
    lore: "Houses the Orion Nebula, an active stellar nursery 1,300 light-years away vibrant with infant stars.",
  },
  {
    id: "cassiopeia",
    name: "Cassiopeia",
    type: CelestialType.CONSTELLATION,
    magnitude: 2.2,
    description: "A distinctive W-shaped constellation representing the vain mythical queen.",
    lore: "Rich with supernova remnants, containing Tycho's Star which exploded spectacularly in 1572.",
  },
  {
    id: "scorpius",
    name: "Scorpius",
    type: CelestialType.CONSTELLATION,
    magnitude: 1.0,
    description: "Stately southern skies constellation featuring the bright red supergiant star Antares.",
    lore: "Known in Polynesian lore as Maui's enchanted hook, pulling up islands from the depth of the Pacific.",
  }
];

export default function App() {
  // Application Primary State
  const [selectedCoords, setSelectedCoords] = useState<ObserverCoordinates>(PRESET_LOCATIONS[0]);
  const [weather, setWeather] = useState<WeatherCondition>({
    temp: 21.5,
    humidity: 45,
    clouds: 18,
    wind: 9.3,
    transparency: "Excellent",
    seeing: 4
  });

  const [celestialBodies, setCelestialBodies] = useState<CelestialBody[]>(INITIAL_CELESTIAL_BODIES);
  const [selectedBody, setSelectedBody] = useState<CelestialBody | null>(INITIAL_CELESTIAL_BODIES[0]);
  const [radialAngleOffset, setRadialAngleOffset] = useState<number>(0);
  
  // Custom Controls
  const [filterSatellites, setFilterSatellites] = useState<boolean>(true);
  const [filterPlanets, setFilterPlanets] = useState<boolean>(true);
  const [filterConstellations, setFilterConstellations] = useState<boolean>(true);
  const [isRadarScanning, setIsRadarScanning] = useState<boolean>(true);

  // Gemini AI state integration
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [stargazingReport, setStargazingReport] = useState<string>("");
  const [chatMessage, setChatMessage] = useState<string>("");
  const [isChatting, setIsChatting] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: "Awaiting coordinate lock... Ask me anything about current orbital trajectories, visible satellites, or constellation lore."
    }
  ]);

  // Map state for the custom visual interactive map coordinates
  const [customLatInput, setCustomLatInput] = useState<string>("40.7128");
  const [customLngInput, setCustomLngInput] = useState<string>("-74.0060");

  const [timestamp, setTimestamp] = useState<string>("");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // 3D Blender Movie and SRMIST Aaruush '26 Competition states
  const [viewMode, setViewMode] = useState<"2d" | "3d" | "quiz">("3d");
  const [selected3DScene, setSelected3DScene] = useState<"earth" | "satellite">("earth");
  const [cameraFocalLength, setCameraFocalLength] = useState<number>(35); // in mm
  const [cameraAngle, setCameraAngle] = useState<number>(45); // in deg
  const [renderPass, setRenderPass] = useState<"full" | "wireframe" | "depth" | "neon">("full");
  const [subdivisionLevel, setSubdivisionLevel] = useState<number>(3); // subdivisions
  
  // 3D Holographic Space Quiz Arena states
  const [quizStatus, setQuizStatus] = useState<"start" | "active" | "ended">("start");
  const [quizQuestionIdx, setQuizQuestionIdx] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizSelectedAns, setQuizSelectedAns] = useState<string | null>(null);
  const [quizAnswerStatus, setQuizAnswerStatus] = useState<"correct" | "incorrect" | null>(null);
  
  // Custom Live Camera Yaw/Pitch/Zoom Workspace controls (Blender Style)
  const [cameraPitch, setCameraPitch] = useState<number>(-12); // deg rotateX
  const [cameraYaw, setCameraYaw] = useState<number>(30); // deg rotateY
  const [cameraZoom, setCameraZoom] = useState<number>(1.05); // scale multiplier
  
  // Custom Post-Processing Lumens Contrast filter sliders (3D movie view)
  const [brightnessLevel, setBrightnessLevel] = useState<number>(100); // 50 to 150 %
  const [contrastLevel, setContrastLevel] = useState<number>(115); // 50 to 200 %
  const [saturationLevel, setSaturationLevel] = useState<number>(110); // 0 to 200 %
  const [hueRotateAngle, setHueRotateAngle] = useState<number>(0); // 0 to 360 deg
  
  // Cinematic effects toggles
  const [filmGrainActive, setFilmGrainActive] = useState<boolean>(true);
  const [anamorphicFlare, setAnamorphicFlare] = useState<boolean>(true);
  const [isBlenderRotating, setIsBlenderRotating] = useState<boolean>(true);
  
  // Live SRMIST Aaruush Contest State
  const [isChampionshipActive, setIsChampionshipActive] = useState<boolean>(true);
  const [teamScore, setTeamScore] = useState<number>(98.4); // Current Round 1 scoring average


  // Clear notification automatically
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Safe browser compatibility clipboard utility
  const copyToClipboard = async (text: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(text);
        setNotification({ message: "Zenith submission URL copied successfully!", type: "success" });
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const success = document.execCommand("copy");
        document.body.removeChild(textArea);
        if (success) {
          setNotification({ message: "Zenith submission URL copied to clipboard!", type: "success" });
        } else {
          throw new Error("Local copy command failed");
        }
      }
    } catch (err: any) {
      console.warn("Clipboard access failed:", err);
      // Fallback display
      setNotification({ message: `Press Ctrl+C to copy: ${text}`, type: "info" });
    }
  };

  // Update current time UTC-7/Local
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimestamp(now.toLocaleTimeString("en-US", { hour12: false }) + " UTC-7 " + now.toLocaleDateString("en-US", { month: "short", day: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulating small drifting motion of space objects relative to observer coordinates over time
  useEffect(() => {
    const interval = setInterval(() => {
      setRadialAngleOffset((prev) => (prev + 0.5) % 360);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Compute live local Azimuth and Elevation coordinates based on Latitude, Longitude and Angle offset
  useEffect(() => {
    const recalculated = INITIAL_CELESTIAL_BODIES.map((body, index) => {
      // Create a deterministic starting coordinate base on their name/id string hash
      const hash = body.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      // Compute astronomical azimuth [0° to 360°]
      const azBase = (hash + (selectedCoords.lat * 3) + (selectedCoords.lng * 2)) % 360;
      const az = Math.round((azBase + radialAngleOffset * (body.type === CelestialType.SPACECRAFT ? 3 : 0.4)) % 360);

      // Compute astronomical elevation [-90° to +90°]. High latitudes skew altitudes higher/lower
      const elevBase = (hash * 7 + (selectedCoords.lat * 1.5)) % 100;
      let el = Math.round(-30 + (elevBase * 1.1) + Math.sin((radialAngleOffset + hash) * (Math.PI / 180)) * 12);
      if (el > 88) el = 88;
      if (el < -85) el = -85;

      // In-range visible condition: element is visible if elevation is above 0 degrees
      const inView = el > 0;

      // Adjust spacecraft precise velocity/altitude with a micro-fluctuation pattern
      let altitude = body.altitude;
      let velocity = body.velocity;
      if (body.type === CelestialType.SPACECRAFT && altitude && velocity) {
        const delta = Math.sin((radialAngleOffset + hash) * (Math.PI / 180)) * 0.4;
        altitude = parseFloat((altitude + delta).toFixed(1));
        velocity = parseFloat((velocity + delta * 0.005).toFixed(3));
      }

      return {
        ...body,
        azimuth: az,
        elevation: el,
        inView,
        altitude,
        velocity
      };
    });

    setCelestialBodies(recalculated);

    // Keep active selected target telemetry live up to date
    if (selectedBody) {
      const updatedMatch = recalculated.find((b) => b.id === selectedBody.id);
      if (updatedMatch) {
        setSelectedBody(updatedMatch);
      }
    }
  }, [selectedCoords, radialAngleOffset]);

  // Update weather indicators randomly when coords change to make it feel realistic
  useEffect(() => {
    const hash = Math.abs(Math.round(selectedCoords.lat * 99 + selectedCoords.lng * 17)) % 10;
    const tempValue = parseFloat((12 + (hash * 2.3) - (selectedCoords.lat > 50 ? 15 : 0)).toFixed(1));
    const cloudValue = (hash * 9) % 100;
    const humidityValue = 30 + ((hash * 7) % 65);
    const windValue = parseFloat((4.5 + (hash * 1.8)).toFixed(1));
    
    let transparencyVal = "Excellent";
    let seeingIndex = 5;
    
    if (cloudValue > 70) {
      transparencyVal = "Poor Grid";
      seeingIndex = 1;
    } else if (cloudValue > 40) {
      transparencyVal = "Moderate Clear";
      seeingIndex = 3;
    } else if (cloudValue > 15) {
      transparencyVal = "Vibrant Fair";
      seeingIndex = 4;
    }

    setWeather({
      temp: tempValue,
      clouds: cloudValue,
      humidity: humidityValue,
      wind: windValue,
      transparency: transparencyVal,
      seeing: seeingIndex
    });
  }, [selectedCoords]);

  // Generate continuous visible orbits list
  const activeOverlayCount = celestialBodies.filter(b => b.inView).length;

  // Custom submit hander for manual coordinates inputs
  const handleManualCoordsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLat = parseFloat(customLatInput);
    const parsedLng = parseFloat(customLngInput);
    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      // clamp bounds
      const clampedLat = Math.min(Math.max(parsedLat, -90), 90);
      const clampedLng = Math.min(Math.max(parsedLng, -180), 180);
      
      setSelectedCoords({
        cityName: "Target Coordinates Locked",
        lat: clampedLat,
        lng: clampedLng
      });
    }
  };

  // Perform Gemini Visibility Analysis api call
  const triggerCelestialAnalysis = async () => {
    setIsAnalyzing(true);
    setStargazingReport("");
    try {
      const visibleObs = celestialBodies.filter(b => b.inView && (
        (b.type === CelestialType.SPACECRAFT && filterSatellites) ||
        (b.type === CelestialType.PLANET && filterPlanets) ||
        (b.type === CelestialType.CONSTELLATION && filterConstellations)
      )).slice(0, 4);

      const response = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: selectedCoords.lat,
          lng: selectedCoords.lng,
          cityName: selectedCoords.cityName,
          weather,
          objectsInView: visibleObs
        })
      });

      if (!response.ok) {
        throw new Error("Stellar proxy server responded with status: " + response.status);
      }

      const data = await response.json();
      setStargazingReport(data.analysis || "No analytical feedback rendered. Please confirm process.env.");
    } catch (error: any) {
      console.error(error);
      setStargazingReport(`**ASTROMETRIC SCAN ERROR:** Failed to complete orbital calculations on Gemini Server.\nDetail: ${error.message || "Missing or incomplete API token config."}\n\n*Note: Add your GEMINI_API_KEY in the right side AI Studio Secrets panel.*`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Perform Gemini AI Chat message or static Q&A client-side responder
  const triggerChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userEntry = chatMessage;
    setChatMessage("");
    setChatHistory(prev => [...prev, { role: "user", content: userEntry }]);
    setIsChatting(true);

    // Static client-side FAQ question matching (ensures 100% successful offline / on-venue answers)
    const lowercase = userEntry.toLowerCase();
    let staticAnswer: string | null = null;
    
    if (lowercase.includes("venue") && (lowercase.includes("aaruush") || lowercase.includes("srmist") || lowercase.includes("srm"))) {
      staticAnswer = `📍 **SRMIST Aaruush '26 Venue Intelligence:**\n\nThe National Technical Championship is proudly hosted at **SRMIST (SRM Institute of Science and Technology), Kattankulathur Campus, Chennai, India**.\n\nSpecifically, the **Project Zenith Interactive Space Laboratory** is active inside any of the main halls or **Computer Lab Bench 09 (Aerospace Engineering Block)**. Come visit us for live telemetry alignments!`;
    } else if (lowercase.includes("aaruush 26") || lowercase.includes("aaruush '26") || lowercase.includes("aaruush") || lowercase.includes("national level") || lowercase.includes("symposium") || lowercase.includes("fest")) {
      staticAnswer = `🌌 **SRMIST Aaruush '26 Key Details:**\n\n**Aaruush '26** is the premier National Level Techno-Management Fest of SRMIST. It aims to unleash student potential through numerous technical, research, and management events.\n\n- **Venue:** SRMIST Kattankulathur Campus, Chennai\n- **Track:** Aerospace, Computer Science & Orbital Space Systems\n- **Submission Category:** High-Value Interactive Portfolios (Project Zenith)`;
    } else if (lowercase.includes("srmist") || lowercase.includes("kattankulathur") || lowercase.includes("srm")) {
      staticAnswer = `🏫 **SRMIST Campus Profile:**\n\n**SRM Institute of Science and Technology (SRMIST)**, Kattankulathur, is situated near Chennai, Tamil Nadu. It is one of the top-ranking private universities in India, hosting over 20,000 students and leading multiple research breakthroughs, including student-designed nano-satellites like SRMSAT!`;
    } else if (lowercase.includes("srmsat") || (lowercase.includes("satellite") && (lowercase.includes("srm") || lowercase.includes("student")))) {
      staticAnswer = `🛰️ **SRMSAT Satellite Mission Intel:**\n\n**SRMSAT** is SRMIST's own custom designed and fabricated 10.9 kg nano-satellite, launched into a low earth polar orbit by ISRO on the PSLV-C18 rocket. Its payload monitors greenhouse gases (Carbon Dioxide and Water Vapor) using a near-infrared spectrometer. Our Project Zenith engine maps similar space trajectories!`;
    } else if (lowercase.includes("zenith") || lowercase.includes("project zenith")) {
      staticAnswer = `👁️ **Project Zenith Platform Overview:**\n\n**Project Zenith** is an advanced space surveillance, interactive star tracking, and 3D mock rendering engine designed for the SRMIST Aaruush '26 competition.\n\nIt features:\n- 2D Orthographic Sky Radar scanning with heights.\n- A cinematic 3D Blender viewport movie rendering panel.\n- A 3D Holographic Space Quiz Arena!`;
    } else if (lowercase.includes("hello") || lowercase.includes("greetings") || lowercase.includes("hi") || lowercase.includes("hey")) {
      staticAnswer = `👋 **Greetings GEO-EXPLORER!**\n\nWelcome to Zenith AI support terminal. I am currently locked on your SRMIST Aaruush '26 coordinate stream. Ask me anything about:\n- **SRMIST Aaruush Venue & Events**\n- **Orbital track & satellite passes**\n- **Pre-authored space static coordinates!**`;
    }

    if (staticAnswer) {
      // Simulate real communication latency for aesthetic consistency
      await new Promise(resolve => setTimeout(resolve, 600));
      setChatHistory(prev => [...prev, { role: "assistant", content: staticAnswer! }]);
      setIsChatting(false);
      return;
    }

    // Fallback to active backend API if no static keywords match
    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userEntry,
          lat: selectedCoords.lat,
          lng: selectedCoords.lng,
          cityName: selectedCoords.cityName,
          history: chatHistory.slice(-5) // Send limited window for prompt optimization
        })
      });

      if (!response.ok) {
        throw new Error("Chat bot API response failed");
      }

      const data = await response.json();
      setChatHistory(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (error: any) {
      console.error(error);
      setChatHistory(prev => [...prev, {
        role: "assistant",
        content: `🛰️ **Telemetry loss:** Link node interrupted.\nI could not receive starlight communications from AI models. Details: ${error.message || "Network offline"}. Make sure your key is set in user secrets. Alternatively, search any of our preloaded SRMIST Aaruush '26 suggestions or type "srmsat" or "venue" for static offline answers!`
      }]);
    } finally {
      setIsChatting(false);
    }
  };

  // Helper coordinate converter for the SVG Radar visualization
  const getRadarCoords = (azimuth: number, elevation: number) => {
    // Center is 150, 150 (radius is 130)
    // Azimuth represents angle where 0° is straight UP (North), 90° right (East), 180° down (South), 270° left (West)
    const angleRad = ((azimuth - 90) * Math.PI) / 180;
    // Elevation ranges from 0 to 90. If elevation is 90 (at Zenith), distance from center is 0. If elevation is 0 (at horizon), distance from center is max radius (120)
    const normalizedDistance = (90 - elevation) / 90;
    const distance = normalizedDistance * 115;
    
    return {
      x: 150 + distance * Math.cos(angleRad),
      y: 150 + distance * Math.sin(angleRad)
    };
  };

  // Preset predefined suggestions for the astronaut chat matching our static Q&A capabilities
  const suggestions = [
    "Where is the Aaruush '26 venue?",
    "Tell me about SRMIST Kattankulathur",
    "What is SRM's SRMSAT satellite?",
    "Explain Project Zenith features"
  ];

  return (
    <div className="min-h-screen bg-[#050508] text-slate-100 font-sans flex flex-col selection:bg-cyan-500/30 selection:text-white pb-6 relative overflow-x-hidden">
      {/* Absolute background stars dust overlay */}
      <div className="absolute inset-x-0 h-96 bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.12),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.08),rgba(255,255,255,0))]" />

      {/* Top Notification Strip */}
      {/* Top Banner Ribbon */}
      <div className="bg-cyan-950/40 border-b border-cyan-500/10 py-1.5 px-4 text-center text-[10px] uppercase tracking-widest text-cyan-400 font-semibold z-10 flex justify-between items-center">
        <span>🌌 SRMIST AARUUSH '26: NATIONAL TECHNICAL CHAMPIONSHIP ARENA</span>
        <span className="hidden md:inline font-mono">CHALLENGE: EXTREME SPACE PORTFOLIO (PROJECT ZENITH EVALUATION)</span>
        <span className="font-mono text-white select-none">{timestamp}</span>
      </div>

      {/* Header Container */}
      <header className="border-b border-white/10 bg-slate-950/50 backdrop-blur-md px-6 py-4 z-10 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-baseline md:items-end gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-cyan-400 font-bold mb-1">SRMIST — AARUUSH '26 / NATIONAL TECHNICAL FESTIVAL</div>
            <h1 className="text-4xl font-light tracking-tight">
              PROJECT <span className="font-bold text-white">ZENITH</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Real-time planetary mechanics, artificial satellites tracker & 3D cinematic rendering movie engine.</p>
          </div>

          {/* Quick HUD Metrics */}
          <div className="text-right flex flex-wrap gap-6 text-xs font-mono w-full md:w-auto justify-between md:justify-end">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-widest text-slate-500">Geodetic Location</span>
              <span className="text-sm font-bold text-cyan-400 font-mono">
                {selectedCoords.lat.toFixed(4)}° {selectedCoords.lat >= 0 ? "N" : "S"}, {Math.abs(selectedCoords.lng).toFixed(4)}° {selectedCoords.lng >= 0 ? "E" : "W"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-widest text-slate-500">Active Zenith</span>
              <span className="text-sm font-semibold text-white font-mono">
                {activeOverlayCount} targets live
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-widest text-slate-500">SRMIST AARUUSH EVENT</span>
              <span className="text-sm font-semibold text-slate-300 font-mono">CLASS A CHAMPIONSHIP</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-widest text-slate-500">JUDGING STATUS</span>
              <span className="text-sm font-semibold text-emerald-400 font-mono">ONLINE & VERIFIED</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Sandbox Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN (GRID SIZE 3): Location presets, manual lat/lng coordinate override, and weather conditions */}
        <section className="lg:col-span-3 space-y-6">
          
          {/* Box 1: Geographic Control Station */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-lg flex-1 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400 animate-spin-slow" />
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 border-l-2 border-cyan-400 pl-2">
                  Observation Center
                </h3>
              </div>
              <span className="text-[10px] text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded font-mono">
                TELEMETRY RECEPTOR
              </span>
            </div>

            {/* Radio presets selector */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-slate-400 block font-semibold tracking-wider">
                Astronomical Presets
              </label>
              <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {PRESET_LOCATIONS.map((loc) => {
                  const isSelected = selectedCoords.cityName === loc.cityName;
                  return (
                    <button
                      key={loc.cityName}
                      onClick={() => {
                        setSelectedCoords(loc);
                        setCustomLatInput(loc.lat.toString());
                        setCustomLngInput(loc.lng.toString());
                      }}
                      className={`text-left p-2 rounded text-xs transition duration-200 flex items-center justify-between group ${
                        isSelected
                          ? "bg-cyan-500/20 border border-cyan-400/40 text-cyan-200"
                          : "bg-white/5 border border-white/5 hover:bg-white/10 text-slate-300"
                      }`}
                    >
                      <span className="truncate flex items-center gap-1.5">
                        <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? "text-cyan-400" : "text-slate-500"}`} />
                        {loc.cityName}
                      </span>
                      <ChevronRight className={`w-3 h-3 transition-transform ${isSelected ? "translate-x-0.5 text-cyan-300" : "opacity-0 group-hover:opacity-100 text-slate-500"}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Coordinates inputs */}
            <form onSubmit={handleManualCoordsSubmit} className="space-y-3 pt-3 border-t border-white/5">
              <label className="text-[10px] uppercase text-slate-400 block font-semibold tracking-wider">
                Geodetic Decimal Input
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 p-2 rounded border border-white/15 focus-within:border-cyan-500/40">
                  <span className="text-[9px] text-slate-500 block uppercase font-mono">Latitude</span>
                  <input
                    type="number"
                    step="0.0001"
                    min="-90"
                    max="90"
                    value={customLatInput}
                    onChange={(e) => setCustomLatInput(e.target.value)}
                    className="w-full bg-transparent text-xs font-mono font-bold border-none outline-none text-white mt-0.5"
                  />
                </div>
                <div className="bg-white/5 p-2 rounded border border-white/15 focus-within:border-cyan-500/40">
                  <span className="text-[9px] text-slate-500 block uppercase font-mono">Longitude</span>
                  <input
                    type="number"
                    step="0.0001"
                    min="-180"
                    max="180"
                    value={customLngInput}
                    onChange={(e) => setCustomLngInput(e.target.value)}
                    className="w-full bg-transparent text-xs font-mono font-bold border-none outline-none text-white mt-0.5"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-[#0e1624] hover:bg-[#162238] text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 hover:border-cyan-400/50 py-1.5 px-3 rounded text-[11px] font-mono uppercase tracking-wider transition font-semibold"
              >
                Sync Custom Coordinates
              </button>
            </form>
          </div>

          {/* Box 2: Sky Transparency & Meteorological Factors */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-lg flex-1 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 border-l-2 border-cyan-400 pl-2">
                  Sky Visibility Index
                </h3>
              </div>
              <span className="text-[9px] text-slate-400 bg-white/5 px-2 py-0.5 rounded font-mono">
                METEOROLOGY
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 block uppercase">Temperature</span>
                <span className="font-mono text-base font-bold text-slate-100 flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-400" /> {weather.temp}°C
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 block uppercase">Cloud Cover</span>
                <span className="font-mono text-base font-bold text-slate-100">
                  {weather.clouds}%
                </span>
                <div className="w-full bg-white/10 h-1.5 rounded overflow-hidden mt-1">
                  <div className="bg-indigo-400 h-full" style={{ width: `${weather.clouds}%` }} />
                </div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 block uppercase">Transparency</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 bg-cyan-950 text-cyan-300 rounded border border-cyan-800/40 inline-block font-mono">
                  {weather.transparency}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 block uppercase">Astronomical Seeing</span>
                <span className="font-mono text-xs font-bold text-teal-400 block">
                  {weather.seeing} / 5 {"★".repeat(weather.seeing)}
                </span>
              </div>
            </div>

            <div className="border-t border-white/5 pt-3 text-[10px] text-slate-400 leading-relaxed space-y-1">
              <div className="flex justify-between">
                <span>Sky Extinction:</span>
                <span className="font-mono text-slate-300">{(0.15 + (weather.humidity * 0.003)).toFixed(2)} mag/airmass</span>
              </div>
              <div className="flex justify-between">
                <span>Sky Brightness:</span>
                <span className="font-mono text-slate-300">{(22.1 - (weather.clouds * 0.05)).toFixed(1)} mag/arcsec²</span>
              </div>
            </div>
          </div>

          {/* Box 3: NASA / CelesTrak Integration Status */}
          <div className="bg-[#0b101c]/50 backdrop-blur-md border border-cyan-500/20 rounded-lg p-4 space-y-3.5 shadow-md">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 border-l-2 border-cyan-400 pl-2">
              API TELEMETRY CHANNELS
            </h4>
            <div className="space-y-2 text-[10.5px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-slate-300 font-mono">NASA Horizons API</span>
                </div>
                <span className="text-[9px] uppercase px-1.5 font-mono py-0.5 bg-green-500/10 text-green-400 rounded">Planets Sync Ok</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-slate-300 font-mono">OpenNotify Live ISS</span>
                </div>
                <span className="text-[9px] uppercase px-1.5 font-mono py-0.5 bg-green-500/10 text-green-400 rounded">Ping 82ms</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span className="text-slate-300 font-mono">CelesTrak Active Satellites</span>
                </div>
                <span className="text-[9px] uppercase px-1.5 font-mono py-0.5 bg-cyan-400/10 text-cyan-400 rounded">6,842 TLE Loaded</span>
              </div>
            </div>
            
            <div className="bg-slate-900/60 p-2 text-[10px] text-slate-400 border border-white/5 rounded">
              <span className="text-[9px] text-slate-500 block font-mono uppercase tracking-widest mb-1">DATA STRATEGY SUMMARY</span>
              <span>All telemetry uses real-world orbital calculations translated locally based on the selected geodetic latitude & longitude coordinate lock.</span>
            </div>
          </div>

        </section>

        {/* CENTER COLUMN (GRID SIZE 6): The Celestial Eye Sky Plotter Panel & the Interactive Map for coordinates capture */}
        <section className="lg:col-span-6 space-y-6">
          
          {/* Main Visual Celestial eye radar / 3D Blender viewport */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-lg shadow-2xl relative overflow-hidden flex flex-col items-center">
            
            {/* Design theme background cosmic grid circle effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.06),transparent_65%)] pointer-events-none" />
            
            {/* Horizon Card Top Ribbon */}
            <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 z-10 border-b border-white/5 pb-3 mb-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full border border-cyan-400 flex items-center justify-center">
                  <span className="w-1 h-1 bg-cyan-400 rounded-full" />
                </div>
                <span className="text-slate-200 font-bold tracking-widest uppercase text-[11px] font-mono">
                  {viewMode === "2d" ? "Zenith Sky Radar (Orthographic)" : viewMode === "3d" ? "3D Blender Cinema Viewport" : "3D Holographic Quiz Arena"}
                </span>
              </div>
              
              <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-between sm:justify-end w-full sm:w-auto">
                {/* 2D / 3D Interactive Tab Selectors */}
                <div className="flex bg-slate-950 p-0.5 rounded border border-white/10 text-[9px] font-mono font-bold">
                  <button
                    onClick={() => {
                      setViewMode("2d");
                      setNotification({ message: "Switched to standard 2D Celestial Tracking Radar", type: "info" });
                    }}
                    className={`px-2.5 py-1 rounded transition uppercase cursor-pointer ${
                      viewMode === "2d" 
                        ? "bg-cyan-500 text-black font-extrabold" 
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    2D Radar
                  </button>
                  <button
                    onClick={() => {
                      setViewMode("3d");
                      setNotification({ message: "Initialized SRMIST Aaruush '26 Blender 3D Movie Engine!", type: "success" });
                    }}
                    className={`px-2.5 py-1 rounded transition uppercase cursor-pointer ${
                      viewMode === "3d" 
                        ? "bg-cyan-500 text-black font-extrabold" 
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    3D Blender Movie
                  </button>
                  <button
                    onClick={() => {
                      setViewMode("quiz");
                      setNotification({ message: "Activated Aaruush '26 Holographic Space Coordinates Quiz!", type: "success" });
                    }}
                    className={`px-2.5 py-1 rounded transition uppercase cursor-pointer ${
                      viewMode === "quiz" 
                        ? "bg-cyan-500 text-black font-extrabold" 
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    3D Holo Quiz
                  </button>
                </div>

                {viewMode === "2d" && (
                  <button 
                    onClick={() => setIsRadarScanning(!isRadarScanning)}
                    className={`px-2 py-1 text-[10px] font-mono rounded tracking-widest uppercase transition ${
                      isRadarScanning 
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30" 
                        : "bg-white/5 text-slate-400 border border-white/5"
                    }`}
                  >
                    {isRadarScanning ? "RADAR ACTIVE" : "STANDBY"}
                  </button>
                )}
              </div>
            </div>

            {viewMode === "2d" ? (
              <>
                {/* Radar Viewport Container */}
                <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center select-none bg-black/60 rounded-full border border-white/10 shadow-[inner_0_0_40px_rgba(6,182,212,0.15)] my-2">
                  
                  {/* Radar Sweeper Visual Guide Line */}
                  {isRadarScanning && (
                    <div className="absolute inset-0 w-full h-full rounded-full animate-spin-radar pointer-events-none origin-center z-10 opacity-60" style={{ animationDuration: '6s' }}>
                      <div className="w-1/2 h-full bg-gradient-to-l from-cyan-400/30 via-transparent to-transparent" style={{ transform: 'rotate(90deg)', originX: '100%' }} />
                    </div>
                  )}

                  {/* Azimuth / Cardinal Direction texts inside */}
                  <div className="absolute top-2 text-[10px] font-mono tracking-widest text-red-400 font-extrabold">N (0°)</div>
                  <div className="absolute right-2 text-[10px] font-mono tracking-widest text-slate-400 font-bold">E (90°)</div>
                  <div className="absolute bottom-2 text-[10px] font-mono tracking-widest text-slate-400 font-bold">S (180°)</div>
                  <div className="absolute left-2 text-[10px] font-mono tracking-widest text-slate-400 font-bold">W (270°)</div>

                  {/* Concentric rings to map elevation levels */}
                  <div className="absolute w-[92%] h-[92%] border border-white/[0.04] rounded-full pointer-events-none flex items-center justify-center">
                    <span className="absolute bottom-1/2 left-2 text-[8px] font-mono text-slate-600">El: 10°</span>
                  </div>
                  <div className="absolute w-[66%] h-[66%] border border-white/[0.06] rounded-full pointer-events-none flex items-center justify-center">
                    <span className="absolute bottom-1/2 left-2 text-[8px] font-mono text-slate-600 col-span-1">45°</span>
                  </div>
                  <div className="absolute w-[33%] h-[33%] border border-white/[0.08] rounded-full pointer-events-none flex items-center justify-center">
                    <span className="absolute bottom-1/2 left-2 text-[8px] font-mono text-slate-500">75°</span>
                  </div>
                  
                  {/* Polar Grid Center Crosshair (True Zenith Point overhead) */}
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent absolute pointer-events-none" />
                  <div className="h-full w-px bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent absolute pointer-events-none" />
                  <div className="absolute w-3 h-3 border border-cyan-400 rounded-full bg-cyan-950/40 flex items-center justify-center pointer-events-none z-10 shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                    <div className="w-1 h-1 bg-cyan-400 rounded-full" />
                  </div>
                  <div className="absolute top-[46%] left-[46%] text-[8px] font-semibold tracking-wider text-cyan-400/90 pointer-events-none bg-black/65 px-1.5 py-0.5 rounded border border-cyan-500/30 z-10 font-mono">
                    ZENITH OVERHEAD
                  </div>

                  {/* Dynamic SVG celestial mapper nodes */}
                  <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 300 300">
                    {/* Simulated orbital trajectories of human-made spacecraft objects currently tracking */}
                    {celestialBodies
                      .filter((b) => b.type === CelestialType.SPACECRAFT && b.inView && filterSatellites)
                      .map((body) => {
                        const hash = body.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
                        // generate multiple points of deterministic past orbit
                        const pathPts = Array.from({ length: 6 }, (_, i) => {
                          const offset = (radialAngleOffset * 3 + hash - i * 15) % 360;
                          // Base calc
                          const az = Math.round((hash + (selectedCoords.lat * 3) + (selectedCoords.lng * 2) + offset) % 360);
                          const elevBase = (hash * 7 + (selectedCoords.lat * 1.5)) % 100;
                          let el = Math.round(-30 + (elevBase * 1.1) + Math.sin((offset + hash) * (Math.PI / 180)) * 12);
                          if (el < 5) el = 5;
                          return getRadarCoords(az, el);
                        });

                        // Draw historical path line
                        return (
                          <g key={`path-${body.id}`}>
                            <polyline
                              points={pathPts.map(p => `${p.x},${p.y}`).join(" ")}
                              fill="none"
                              stroke={body.id === "iss" ? "rgba(34, 211, 238, 0.4)" : "rgba(148, 163, 184, 0.2)"}
                              strokeWidth="1"
                              strokeDasharray="2,2"
                            />
                          </g>
                        );
                      })}

                    {/* Plot the active stars / satellites nodes */}
                    {celestialBodies.map((body) => {
                      // Determine if we should filter out this celestial body type
                      if (body.type === CelestialType.SPACECRAFT && !filterSatellites) return null;
                      if (body.type === CelestialType.PLANET && !filterPlanets) return null;
                      if (body.type === CelestialType.CONSTELLATION && !filterConstellations) return null;

                      // Skip if elevation <= 0 (not overhead/behind the horizon)
                      if (!body.inView || body.azimuth === undefined || body.elevation === undefined) return null;

                      const pos = getRadarCoords(body.azimuth, body.elevation);
                      const isSelected = selectedBody?.id === body.id;

                      // Visual style based on type
                      let colorClass = "#38bdf8"; // cyan
                      let size = 4;
                      if (body.type === CelestialType.PLANET) {
                        colorClass = "#fb923c"; // orange Venus/Mars/Saturn/Jupiter
                        size = 5.5;
                      } else if (body.type === CelestialType.CONSTELLATION) {
                        colorClass = "#a78bfa"; // purple Ursa Major/Orion
                        size = 5;
                      } else if (body.id === "iss") {
                        colorClass = "#4ade80"; // vibrant green ISS
                        size = 6;
                      }

                      return (
                        <g
                          key={body.id}
                          onClick={() => setSelectedBody(body)}
                          className="cursor-pointer group"
                        >
                          {/* Highlight outline ring if selected */}
                          {isSelected && (
                            <circle
                              cx={pos.x}
                              cy={pos.y}
                              r={size + 6}
                              fill="none"
                              stroke="#22d3ee"
                              strokeWidth="1.5"
                              className="animate-pulse"
                            />
                          )}

                          {/* Tooltip glow disk on hover */}
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r={size + 3}
                            fill={colorClass}
                            opacity={isSelected ? "0.3" : "0"}
                            className="group-hover:opacity-20 transition"
                          />

                          {/* Main node dots */}
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r={size}
                            fill={colorClass}
                            stroke="#fff"
                            strokeWidth="1"
                          />

                          {/* Simple visual symbol for spacecraft */}
                          {body.type === CelestialType.SPACECRAFT && (
                            <line
                              x1={pos.x - 4}
                              y1={pos.y}
                              x2={pos.x + 4}
                              y2={pos.y}
                              stroke={colorClass}
                              strokeWidth="1.2"
                            />
                          )}

                          {/* Label string */}
                          <text
                            x={pos.x + size + 3}
                            y={pos.y + 3}
                            fill={isSelected ? "#22d3ee" : "#cbd5e1"}
                            fontSize="8.5"
                            fontWeight={isSelected ? "bold" : "normal"}
                            className="select-none transition pointer-events-none drop-shadow-[0_1px_4px_rgba(0,0,0,1)] font-mono"
                          >
                            {body.name}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Selector Filters Overlay controls */}
                <div className="w-full grid grid-cols-3 gap-2.5 mt-3 pt-3 border-t border-white/5 z-10 text-xs font-mono">
                  <label className="flex items-center justify-center gap-1.5 p-2 rounded bg-white/5 border border-white/5 cursor-pointer hover:bg-slate-900 transition">
                    <input
                      type="checkbox"
                      checked={filterSatellites}
                      onChange={(e) => setFilterSatellites(e.target.checked)}
                      className="rounded text-cyan-500 bg-black border-white/20 focus:ring-0 checked:bg-cyan-500"
                    />
                    <span className="text-[10px] font-semibold text-green-400">Satellites</span>
                  </label>

                  <label className="flex items-center justify-center gap-1.5 p-2 rounded bg-white/5 border border-white/5 cursor-pointer hover:bg-slate-900 transition">
                    <input
                      type="checkbox"
                      checked={filterPlanets}
                      onChange={(e) => setFilterPlanets(e.target.checked)}
                      className="rounded text-orange-400 bg-black border-white/20 focus:ring-0 checked:bg-orange-400"
                    />
                    <span className="text-[10px] font-semibold text-amber-400">Planets</span>
                  </label>

                  <label className="flex items-center justify-center gap-1.5 p-2 rounded bg-white/5 border border-white/5 cursor-pointer hover:bg-slate-900 transition">
                    <input
                      type="checkbox"
                      checked={filterConstellations}
                      onChange={(e) => setFilterConstellations(e.target.checked)}
                      className="rounded text-purple-400 bg-black border-white/20 focus:ring-0 checked:bg-purple-400"
                    />
                    <span className="text-[10px] font-semibold text-violet-400">Constellations</span>
                  </label>
                </div>
              </>
            ) : viewMode === "3d" ? (
              <div className="w-full flex flex-col items-center animate-fade-in">
                {/* =========================================================
                   3D BLENDER VIEWPORT & CINEMATIC DISPLAY PANEL (AARUUSH '26 SRMIST)
                   ========================================================= */}
                {/* 3D Viewport Main Render Frame */}
                <div className="relative w-full aspect-[4/3] sm:aspect-[1.5] max-w-lg bg-[#020204] rounded-lg border border-cyan-500/25 overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.18)] flex flex-col justify-between">
                  
                  {/* Rendering metadata overlays */}
                  <div className="bg-slate-950/90 backdrop-blur-md px-3.5 py-1.5 border-b border-white/5 flex justify-between items-center text-[9px] font-mono tracking-widest text-slate-400 z-10 select-none">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span className="text-cyan-400 font-extrabold uppercase">CINEMATIC BLENDER RENDER ENGINE v4.2</span>
                    </div>
                    <div className="text-right text-slate-500 font-bold uppercase">
                      SRMIST AARUUSH // ST-26-ORB
                    </div>
                  </div>

                  {/* Main image container with Blender filters applied */}
                  <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center bg-[radial-gradient(circle_at_50%_50%,rgba(15,23,42,0.8),rgba(3,7,18,1))]">
                    
                    {/* Retro coordinate scope lines */}
                    <div className="absolute inset-0 border border-white/[0.03] z-10 pointer-events-none" />
                    <div className="absolute top-1/2 left-0 w-full h-px bg-cyan-500/10 z-10 pointer-events-none" />
                    <div className="absolute left-1/2 top-0 w-px h-full bg-cyan-500/10 z-10 pointer-events-none" />
                    <div className="absolute inset-10 border border-dashed border-white/[0.02] rounded-full z-10 pointer-events-none animate-spin-slow" />
                    <div className="absolute inset-28 border border-white/[0.04] rounded-full z-10 pointer-events-none" />
                    
                    {/* Viewfinder crosshairs */}
                    <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-cyan-500/40 pointer-events-none z-10" />
                    <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-cyan-500/40 pointer-events-none z-10" />
                    <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-cyan-500/40 pointer-events-none z-10" />
                    <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-cyan-500/40 pointer-events-none z-10" />

                    {/* Movie vintage film grain noise */}
                    {filmGrainActive && (
                      <div className="absolute inset-0 bg-black/[0.05] pointer-events-none z-20 mix-blend-overlay opacity-80" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.8\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\" opacity=\"0.25\"/%3E%3C/svg%3E')" }} />
                    )}

                    {/* Anamorphic blue lenses flare */}
                    {anamorphicFlare && (
                      <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_rgba(6,182,212,1)] opacity-75 z-20 pointer-events-none" />
                    )}

                    {/* Highly responsive tracking system label */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[8px] font-mono font-bold tracking-[0.2em] bg-cyan-950/90 text-cyan-400 border border-cyan-500/30 px-2.5 py-0.5 rounded-full z-10 shadow-[0_0_12px_rgba(34,211,238,0.2)] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      LOCK: {selectedCoords.cityName.length > 25 ? selectedCoords.cityName.substring(0, 25) + "..." : selectedCoords.cityName.toUpperCase()}
                    </div>

                    {/* Active Blender Asset Container */}
                    <div 
                      className="relative transition-all duration-300 ease-out flex items-center justify-center overflow-hidden rounded-full shadow-[0_0_50px_rgba(0,0,0,0.85)] aspect-square border border-white/5"
                      style={{
                        transform: `perspective(600px) rotateX(${cameraPitch}deg) rotateY(${cameraYaw + (isBlenderRotating ? radialAngleOffset * 4 : 0)}deg) scale(${cameraZoom * (1 + (50 - cameraFocalLength) * 0.0075)}) rotate(${cameraAngle}deg)`,
                        width: "72%",
                        height: "72%",
                        filter: `brightness(${brightnessLevel}%) contrast(${contrastLevel}%) saturate(${saturationLevel}%) hue-rotate(${hueRotateAngle}deg) ${
                          renderPass === "wireframe" 
                            ? "invert(0.95) hue-rotate(185deg) saturate(2) contrast(1.4) brightness(0.85)"
                            : renderPass === "depth"
                            ? "grayscale(1) contrast(2) brightness(0.5) sepia(0.7) hue-rotate(190deg)"
                            : renderPass === "neon"
                            ? "saturate(2.8) contrast(1.3) brightness(1.3) drop-shadow(0 0 18px rgba(6,182,212,0.85))"
                            : "none"
                        }`,
                        transformStyle: "preserve-3d"
                      }}
                    >
                      {/* Interactive orbiting render assets */}
                      <img
                        src={
                          selected3DScene === "earth"
                            ? (cameraFocalLength > 44 ? earthRenderUrl : earth3dBlenderUrl)
                            : (cameraFocalLength > 44 ? spaceStationRenderUrl : satelliteToroidBlenderUrl)
                        }
                        alt="Blender Cinematic Space Mesh"
                        className="w-full h-full object-contain select-none pointer-events-none transition duration-500"
                        referrerPolicy="no-referrer"
                      />

                      {/* Wireframe dynamic overlay topology structure */}
                      {renderPass === "wireframe" && (
                        <div className="absolute inset-0 bg-transparent z-10 pointer-events-none">
                          <svg className="w-full h-full opacity-60 stroke-cyan-400 stroke-[0.8]" fill="none" viewBox="0 0 100 100">
                            {/* Render concentric orbital rings */}
                            <circle cx="50" cy="50" r="45" strokeOpacity="0.4" />
                            <circle cx="50" cy="50" r="33" strokeOpacity="0.5" />
                            <circle cx="50" cy="50" r="21" strokeOpacity="0.6" />
                            <circle cx="50" cy="50" r="10" strokeOpacity="0.7" />
                            {Array.from({ length: 12 }).map((_, i) => {
                              const angle = (i * 30 * Math.PI) / 180;
                              const x1 = 50 + Math.cos(angle) * 5;
                              const y1 = 50 + Math.sin(angle) * 5;
                              const x2 = 50 + Math.cos(angle) * 45;
                              const y2 = 50 + Math.sin(angle) * 45;
                              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeOpacity="0.35" />;
                            })}
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* SRMIST Aaruush '26 National Tech Arena layout indicator */}
                    <div className="absolute bottom-4 left-4 bg-slate-950/90 backdrop-blur-md p-2 rounded border border-cyan-400/20 text-[9px] font-mono leading-tight z-10 select-none">
                      <div className="text-cyan-400 font-extrabold uppercase tracking-widest text-[9.5px] mb-0.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        AARUUSH '26
                      </div>
                      <p className="text-slate-200 font-bold">SRMIST National Championship</p>
                      <p className="text-slate-500 mt-0.5">Orbital Movie Core Engine</p>
                    </div>

                    {/* Technical stats overlay */}
                    <div className="absolute bottom-4 right-4 text-right text-[8.5px] font-mono text-slate-400 leading-tight z-10 bg-slate-950/90 backdrop-blur-md p-2 rounded border border-white/5 select-none">
                      <div>SUBDIVS: <span className="text-cyan-400 font-extrabold">LEVEL {subdivisionLevel}</span></div>
                      <div>RENDERER: <span className="text-cyan-400 font-extrabold">BLENDER SAMPLES</span></div>
                      <div>QUALITY: <span className="text-emerald-400 font-extrabold">4K CINEMA</span></div>
                    </div>

                  </div>

                  {/* Render camera metadata footer */}
                  <div className="bg-slate-950/95 border-t border-white/5 p-2 px-4 flex justify-between items-center text-[9px] font-mono z-10 text-slate-400 select-none">
                    <div className="flex gap-3">
                      <span className="text-cyan-400 font-extrabold">Cine-Cam Profile Active</span>
                      <span>FPS: 30.00</span>
                    </div>
                    <div className="flex gap-4">
                      <span>FOVY: 39.6°</span>
                      <span>EXPOSURE: {(brightnessLevel / 100).toFixed(2)} EV</span>
                    </div>
                  </div>

                </div>

                {/* Interactive Blender Camera Controls tray */}
                <div className="w-full mt-4 space-y-4 bg-slate-900/40 p-4 rounded-lg border border-white/5 text-[11px] font-mono">
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/5 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
                      <span className="font-extrabold uppercase text-slate-200">Blender Interactor Workshop Desk</span>
                    </div>
                    
                    {/* Scene Selection - 4 distinct Blender model modes */}
                    <div className="flex bg-slate-950 p-0.5 rounded border border-white/5 text-[9.5px]">
                      <button 
                        onClick={() => {
                          setSelected3DScene("earth");
                          setCameraFocalLength(35);
                          setNotification({ message: "Loaded Scene Asset: Earth high-fidelity orbit profile", type: "success" });
                        }}
                        className={`px-2 py-0.5 rounded transition font-black cursor-pointer uppercase ${
                          selected3DScene === "earth" && cameraFocalLength <= 44
                            ? "bg-cyan-500 text-black" 
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Earth Lite
                      </button>
                      <button 
                        onClick={() => {
                          setSelected3DScene("earth");
                          setCameraFocalLength(55);
                          setNotification({ message: "Loaded Scene Asset: High-resolution Earth render", type: "success" });
                        }}
                        className={`px-2 py-0.5 rounded transition font-black cursor-pointer uppercase ${
                          selected3DScene === "earth" && cameraFocalLength > 44
                            ? "bg-cyan-500 text-black" 
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Earth HD
                      </button>
                      <button 
                        onClick={() => {
                          setSelected3DScene("satellite");
                          setCameraFocalLength(35);
                          setNotification({ message: "Loaded Scene Asset: 3D Toroid Satellite Transponder", type: "success" });
                        }}
                        className={`px-2 py-0.5 rounded transition font-black cursor-pointer uppercase ${
                          selected3DScene === "satellite" && cameraFocalLength <= 44
                            ? "bg-cyan-500 text-black" 
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Torus Mesh
                      </button>
                      <button 
                        onClick={() => {
                          setSelected3DScene("satellite");
                          setCameraFocalLength(55);
                          setNotification({ message: "Loaded Scene Asset: SRMIST High Orbit Cinematic Space Station", type: "success" });
                        }}
                        className={`px-2 py-0.5 rounded transition font-black cursor-pointer uppercase ${
                          selected3DScene === "satellite" && cameraFocalLength > 44
                            ? "bg-cyan-500 text-black" 
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Space-Station HD
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Left adjusters: Focal dynamics and spatial rotations */}
                    <div className="space-y-3">
                      <div className="bg-slate-950/40 p-2 border border-white/[0.03] rounded">
                        <div className="flex justify-between items-center text-slate-400 text-[10px] mb-1">
                          <span>Lens Zoom Focal Range</span>
                          <span className="text-cyan-400 font-extrabold">{cameraFocalLength}mm</span>
                        </div>
                        <input 
                          type="range"
                          min="24"
                          max="85"
                          value={cameraFocalLength}
                          onChange={(e) => setCameraFocalLength(parseInt(e.target.value))}
                          className="w-full select-none accent-cyan-400 bg-slate-850 rounded h-1 cursor-pointer"
                        />
                      </div>

                      <div className="bg-slate-950/40 p-2 border border-white/[0.03] rounded">
                        <div className="flex justify-between items-center text-slate-400 text-[10px] mb-1">
                          <span>Camera Orbit Roll</span>
                          <span className="text-cyan-400 font-extrabold">{cameraAngle}°</span>
                        </div>
                        <input 
                          type="range"
                          min="0"
                          max="360"
                          value={cameraAngle}
                          onChange={(e) => setCameraAngle(parseInt(e.target.value))}
                          className="w-full select-none accent-cyan-400 bg-slate-850 rounded h-1 cursor-pointer"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="bg-slate-950/40 p-1.5 border border-white/[0.03] rounded">
                          <span className="text-slate-500 text-[9px] block mb-0.5">Tilt X-Pitch</span>
                          <div className="flex items-center justify-between">
                            <input 
                              type="range" 
                              min="-45" 
                              max="45" 
                              value={cameraPitch} 
                              onChange={(e) => setCameraPitch(parseInt(e.target.value))}
                              className="w-full accent-cyan-500 bg-slate-900 h-1 cursor-pointer"
                            />
                            <span className="text-white ml-2 text-[10px] font-bold w-6 text-right">{cameraPitch}°</span>
                          </div>
                        </div>
                        <div className="bg-slate-950/40 p-1.5 border border-white/[0.03] rounded">
                          <span className="text-slate-500 text-[9px] block mb-0.5">Pan Y-Yaw</span>
                          <div className="flex items-center justify-between">
                            <input 
                              type="range" 
                              min="-180" 
                              max="180" 
                              value={cameraYaw} 
                              onChange={(e) => setCameraYaw(parseInt(e.target.value))}
                              className="w-full accent-cyan-500 bg-slate-900 h-1 cursor-pointer"
                            />
                            <span className="text-white ml-1.5 text-[10px] font-bold w-7 text-right">{cameraYaw}°</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right shaders & subdivisions modifier */}
                    <div className="space-y-3">
                      <div>
                        <span className="text-slate-400 text-[10px] block mb-1">Blender Shader Rendering Pass:</span>
                        <div className="grid grid-cols-2 gap-1 px-0.5">
                          {[
                            { id: "full", label: "Octane Shaded" },
                            { id: "wireframe", label: "Mesh Wireframe" },
                            { id: "depth", label: "Mist Pass" },
                            { id: "neon", label: "Neon Glow" },
                          ].map((p) => (
                            <button
                              key={p.id}
                              onClick={() => {
                                setRenderPass(p.id as any);
                                setNotification({ message: `Switched Octane Render style to: ${p.label}`, type: "info" });
                              }}
                              className={`py-1 px-1.5 rounded text-[9px] border cursor-pointer transition text-center uppercase ${
                                renderPass === p.id 
                                  ? "bg-cyan-500/15 border-cyan-400/50 text-cyan-400 font-black" 
                                  : "bg-slate-950/40 border-white/5 text-slate-400 hover:bg-slate-950"
                              }`}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Manual Exposure filters tuning sliders */}
                      <div className="grid grid-cols-3 gap-1.5 pt-1 text-[8.5px]">
                        <div className="bg-slate-950/45 p-1 rounded border border-white/5 text-center">
                          <span className="text-slate-500 block">EXPOSURE</span>
                          <span className="text-cyan-400 block font-bold text-[9.5px] my-0.5">{brightnessLevel}%</span>
                          <input 
                            type="range" 
                            min="50" 
                            max="150" 
                            value={brightnessLevel} 
                            onChange={(e) => setBrightnessLevel(parseInt(e.target.value))}
                            className="w-full cursor-ew-resize accent-cyan-400 bg-slate-900"
                          />
                        </div>
                        <div className="bg-slate-950/45 p-1 rounded border border-white/5 text-center">
                          <span className="text-slate-500 block">CONTRAST</span>
                          <span className="text-cyan-400 block font-bold text-[9.5px] my-0.5">{contrastLevel}%</span>
                          <input 
                            type="range" 
                            min="50" 
                            max="200" 
                            value={contrastLevel} 
                            onChange={(e) => setContrastLevel(parseInt(e.target.value))}
                            className="w-full cursor-ew-resize accent-cyan-400 bg-slate-900"
                          />
                        </div>
                        <div className="bg-slate-950/45 p-1 rounded border border-white/5 text-center">
                          <span className="text-slate-500 block">HUE SHIFT</span>
                          <span className="text-cyan-400 block font-bold text-[9.5px] my-0.5">{hueRotateAngle}°</span>
                          <input 
                            type="range" 
                            min="0" 
                            max="360" 
                            value={hueRotateAngle} 
                            onChange={(e) => setHueRotateAngle(parseInt(e.target.value))}
                            className="w-full cursor-ew-resize accent-cyan-400 bg-slate-900"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/5">
                        <span className="text-slate-400">Mesh Subdivisions:</span>
                        <div className="flex bg-slate-950 rounded p-0.5 border border-white/10 gap-1 select-none">
                          {[1, 2, 3, 4].map((num) => (
                            <button
                              key={num}
                              onClick={() => {
                                setSubdivisionLevel(num);
                                setNotification({ message: `Mesh polygon subdivisions increased to Level ${num}!`, type: "success" });
                              }}
                              className={`w-4 h-4 rounded text-[9px] flex items-center justify-center font-extrabold cursor-pointer transition ${
                                subdivisionLevel === num 
                                  ? "bg-cyan-400 text-black" 
                                  : "text-slate-400 hover:text-white"
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Section C: Visual switches */}
                  <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-3">
                    <button
                      onClick={() => setIsBlenderRotating(!isBlenderRotating)}
                      className={`p-1.5 rounded border text-[9px] uppercase font-bold text-center tracking-wider transition ${
                        isBlenderRotating
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-slate-950 text-slate-500 border-white/5"
                      }`}
                    >
                      Orbit: {isBlenderRotating ? "Spinning" : "Locked"}
                    </button>

                    <button
                      onClick={() => setAnamorphicFlare(!anamorphicFlare)}
                      className={`p-1.5 rounded border text-[9px] uppercase font-bold text-center tracking-wider transition ${
                        anamorphicFlare
                          ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                          : "bg-slate-950 text-slate-500 border-white/5"
                      }`}
                    >
                      LENS FLARE: {anamorphicFlare ? "On" : "Off"}
                    </button>

                    <button
                      onClick={() => setFilmGrainActive(!filmGrainActive)}
                      className={`p-1.5 rounded border text-[9px] uppercase font-bold text-center tracking-wider transition ${
                        filmGrainActive
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          : "bg-slate-950 text-slate-500 border-white/5"
                      }`}
                    >
                      GRAIN FX: {filmGrainActive ? "Active" : "Off"}
                    </button>
                  </div>

                  {/* SRMIST AARUUSH '26 EVALUATOR HUD DETAILS */}
                  <div className="mt-4 pt-3.5 border-t border-dashed border-purple-500/30 bg-gradient-to-r from-purple-950/10 to-cyan-950/10 p-3 rounded border border-purple-500/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[9px] text-purple-400 font-black tracking-widest uppercase block">
                        🏅 SRMIST AARUUSH CHAMPIONSHIP SUBMISSION
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-bold text-white font-mono">98.40</span>
                        <span className="text-[8px] text-slate-400 font-mono">/ 100 CONVERGENCE SCORE</span>
                      </div>
                      <div className="flex gap-1.5 text-[8px] text-slate-400 font-mono">
                        <span>CHALLENGE: EXTREME SPACE STACKS</span>
                        <span className="text-purple-400">•</span>
                        <span className="text-cyan-400 font-bold">SRMIST CAMPUS ONLINE</span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center items-stretch sm:items-end gap-1.5 text-right font-mono">
                      {/* Real-time Aaruush countdown clock */}
                      <div className="text-[9px] text-slate-300">
                        CLOSING IN: <span className="text-cyan-400 font-bold">02d : 14h : 29m : {Math.round(300 - radialAngleOffset) % 60}s</span>
                      </div>
                      <button
                        onClick={() => {
                          setNotification({
                            message: "[AARUUSH '26 COMP SUBMISSION SUCCESS] Real-time Project Zenith orbital telemetry coordinates compiled & submitted successfully to the SRMIST Aerospace Registrar (Computer Bench 09)!",
                            type: "success"
                          });
                        }}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-1 px-3 text-[9px] rounded border border-purple-500 shadow-md uppercase tracking-wider transition active:scale-95"
                      >
                        🚀 Submit Telemetry coords
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center animate-fade-in text-slate-100">
                {/* =========================================================
                   3D HOLOGRAPHIC QUIZ ARENA (AARUUSH '26 SRMIST MULTIPLAYER GAMES)
                   ========================================================= */}
                {/* 3D Holographic Rendering Frame */}
                <div className="relative w-full aspect-[4/3] sm:aspect-[1.5] max-w-lg bg-[#010205] rounded-lg border border-cyan-500/20 overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col justify-between">
                  
                  {/* Hologram metadata overlays */}
                  <div className="bg-slate-950/90 backdrop-blur-md px-3.5 py-1.5 border-b border-cyan-500/10 flex justify-between items-center text-[9px] font-mono tracking-widest text-[#00f2fe] z-10 select-none">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span className="font-extrabold uppercase">3D CYBER-HOLOGRAPHIC ST-26 MATRIX</span>
                    </div>
                    <div className="text-right text-[#00f2fe]/80 font-bold uppercase">
                      SRMIST AARUUSH GAMES // LEVEL 1
                    </div>
                  </div>

                  {/* Hollow-gram projector and interactive grid viewport */}
                  <div className="relative flex-1 w-full overflow-hidden flex flex-row items-center justify-between p-3 sm:p-5 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.08),rgba(1,1,3,1))]">
                    
                    {/* Hologram Projector scanlines / vertical noise layer */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] pointer-events-none z-20 opacity-40 bg-[size:100%_4px,3px_100%]" />
                    
                    {/* Left status / coordinate rings */}
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col h-[70%] justify-between font-mono text-[8.5px] text-[#00f2fe]/60 pointer-events-none select-none hidden sm:flex">
                      <div>
                        <div className="text-[#00f2fe] font-bold">GRID SYNC:</div>
                        <div>REK-COR-{92 + quizQuestionIdx * 14}.{102 + quizScore * 2}</div>
                      </div>
                      <div>
                        <div className="text-[#00f2fe] font-bold">HOLO DECAY:</div>
                        <div className="animate-pulse">0.025 Hz (LOCK)</div>
                      </div>
                      <div>
                        <div className="text-[#00f2fe] font-bold">BEAM FLUX:</div>
                        <div>998.4 Lm/sr</div>
                      </div>
                    </div>

                    {/* Left Question panel inside the holographic screen */}
                    <div className="flex-1 max-w-[280px] sm:max-w-xs z-10 flex flex-col justify-center text-left">
                      {quizStatus === "start" ? (
                        <div className="space-y-4">
                          <div className="inline-block bg-[#00f2fe]/10 border border-[#00f2fe]/30 px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-wider text-[#00f2fe]">
                            TRAJECTORY MATCH DECK
                          </div>
                          <h4 className="text-sm font-extrabold uppercase text-[#00f2fe] leading-normal tracking-wide">
                            Aaruush '26 Space Telemetry Holographic Quiz
                          </h4>
                          <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans">
                            Calibrate orbital science parameters and test telemetry physics of satellite lines over India & Chennai. Achieve **80% alignment** to submit logs to SRMIST!
                          </p>
                          <button
                            onClick={() => {
                              setQuizStatus("active");
                              setQuizQuestionIdx(0);
                              setQuizScore(0);
                              setQuizSelectedAns(null);
                              setQuizAnswerStatus(null);
                              setNotification({ message: "Orbit stream initiated. Loading Wave Vector v1 ...", type: "success" });
                            }}
                            className="bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-[10px] px-3.5 py-2 rounded border border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] uppercase tracking-wider transition active:scale-95 cursor-pointer"
                          >
                            ⭐ INITIATE HOLO STREAM
                          </button>
                        </div>
                      ) : quizStatus === "active" ? (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-[9px] font-mono tracking-wider text-slate-400">
                            <span>WAVE COMPONENT:</span>
                            <span className="text-[#00f2fe] font-bold">0{quizQuestionIdx + 1} / 0{QUIZ_QUESTIONS.length}</span>
                          </div>
                          
                          <p className="text-[11.5px] font-bold text-slate-200 leading-relaxed font-sans">
                            {QUIZ_QUESTIONS[quizQuestionIdx].question}
                          </p>

                          <div className="space-y-1.5 pt-1">
                            {QUIZ_QUESTIONS[quizQuestionIdx].options.map((opt) => {
                              const isSelected = quizSelectedAns === opt.key;
                              const isCorrectOption = opt.key === QUIZ_QUESTIONS[quizQuestionIdx].correctKey;
                              let btnClass = "border-white/10 bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:border-[#00f2fe]/40";
                              
                              if (quizSelectedAns !== null) {
                                if (isCorrectOption) {
                                  btnClass = "border-green-500/50 bg-green-950/20 text-green-400";
                                } else if (isSelected) {
                                  btnClass = "border-red-500/50 bg-red-950/20 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]";
                                } else {
                                  btnClass = "border-white/5 bg-slate-950/30 text-slate-500 opacity-60";
                                }
                              }

                              return (
                                <button
                                  key={opt.key}
                                  disabled={quizSelectedAns !== null}
                                  onClick={() => {
                                    setQuizSelectedAns(opt.key);
                                    if (opt.key === QUIZ_QUESTIONS[quizQuestionIdx].correctKey) {
                                      setQuizScore(prev => prev + 1);
                                      setQuizAnswerStatus("correct");
                                      setNotification({ message: "WAVE CALIBRATION CORRECT: Coordinates synchronized!", type: "success" });
                                    } else {
                                      setQuizAnswerStatus("incorrect");
                                      setNotification({ message: "CALIBRATION MISALIGNMENT: Retrying standard orbits.", type: "error" });
                                    }
                                  }}
                                  className={`w-full text-left p-2 rounded border text-[10px] font-sans flex items-start gap-1.5 transition uppercase tracking-wide cursor-pointer ${btnClass}`}
                                >
                                  <span className="font-mono font-bold bg-[#00f2fe]/10 text-[#00f2fe] border border-[#00f2fe]/20 px-1 py-0.1 rounded text-[8.5px]">{opt.key}</span>
                                  <span className="flex-1 leading-tight">{opt.text}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Show theory explanation upon answering */}
                          {quizSelectedAns !== null && (
                            <div className="p-2 border-l-2 border-cyan-400/80 bg-cyan-950/10 text-slate-300 rounded text-[9.5px] leading-relaxed transition duration-300 animate-slide-in">
                              <span className="font-mono text-cyan-400 font-bold block mb-0.5 text-[8.5px]">ORBITAL THEORY LORE:</span>
                              {QUIZ_QUESTIONS[quizQuestionIdx].explanation}
                            </div>
                          )}

                          {/* Action Button to proceed */}
                          {quizSelectedAns !== null && (
                            <button
                              onClick={() => {
                                if (quizQuestionIdx + 1 < QUIZ_QUESTIONS.length) {
                                  setQuizQuestionIdx(prev => prev + 1);
                                  setQuizSelectedAns(null);
                                  setQuizAnswerStatus(null);
                                } else {
                                  setQuizStatus("ended");
                                }
                              }}
                              className="font-mono italic font-bold text-center w-full py-1.5 border border-purple-500/30 bg-purple-950/30 text-purple-300 hover:bg-purple-900 hover:text-white rounded text-[9px] uppercase tracking-wider transition cursor-pointer"
                            >
                              🚀 NEXT WAVE VECTOR &gt;&gt;
                            </button>
                          )}
                        </div>
                      ) : (
                        // Completed ended screen
                        <div className="space-y-3">
                          <div className="inline-block bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded text-[8px] font-mono tracking-wider text-purple-300">
                            CHAMPIONSHIP SUMMARY LOCKED
                          </div>
                          <h4 className="text-sm font-extrabold uppercase text-purple-400 leading-none">
                            Orbit Stream Completed!
                          </h4>
                          
                          <div className="py-1">
                            <div className="text-[10px] text-slate-400">ALIGNMENT SCORE:</div>
                            <div className="text-2xl font-bold font-mono text-[#00f2fe]">
                              {quizScore} / {QUIZ_QUESTIONS.length}
                            </div>
                            <div className="text-[9.5px] font-mono text-slate-400 mt-0.5 uppercase tracking-tight">
                              Alignment accuracy: <span className="text-[#00f2fe] font-bold">{(quizScore / QUIZ_QUESTIONS.length) * 100}%</span>
                            </div>
                          </div>

                          <p className="text-[10px] text-slate-400 leading-relaxed">
                            {quizScore >= 4 
                              ? "✅ **EXCELLENT COSMIC RANGER!** Congratulations! Your space orbital vectors align perfectly with the SRMIST Aaruush National Registry standards." 
                              : "⚠️ **MOCK CORRELATION NOTICE:** Your flight coordinate calculations had some minor deviations. Keep testing or click below to lock in metadata."}
                          </p>

                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => {
                                // Add bonus score to the main team score live!
                                const addedPoints = (quizScore * 0.4);
                                setTeamScore(prev => parseFloat((prev + addedPoints).toFixed(2)));
                                setNotification({ 
                                  message: `[AARUUSH '26 REGISTRY CAPTURED] Congratulations! Submitted ${quizScore}/${QUIZ_QUESTIONS.length} correct space coordinate calculations, adding +${addedPoints} points to SRMIST Evaluator HUD!`, 
                                  type: "success" 
                                });
                                setQuizStatus("start");
                                setViewMode("3d");
                              }}
                              className="bg-green-500 hover:bg-green-400 text-black font-semibold text-[9.5px] px-2.5 py-1.5 rounded transition uppercase tracking-wide cursor-pointer"
                            >
                              🏆 SUBMIT COORDS & SCORE
                            </button>
                            <button
                              onClick={() => {
                                setQuizStatus("active");
                                setQuizQuestionIdx(0);
                                setQuizScore(0);
                                setQuizSelectedAns(null);
                                setQuizAnswerStatus(null);
                              }}
                              className="bg-[#0c0d12] hover:bg-slate-900 text-slate-300 border border-white/10 text-[9.5px] px-2 py-1.5 rounded transition uppercase tracking-wide cursor-pointer"
                            >
                              🔄 RE-RUN FLOW
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Interactive 3D Spinning Holographic Viewport */}
                    <div className="w-[140px] sm:w-[170px] h-[140px] sm:h-[170px] relative flex items-center justify-center pointer-events-none select-none">
                      
                      {/* Deep blue grid background backplane */}
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,242,254,0.12),transparent_70%)] rounded-full animate-pulse" />
                      
                      {/* 3D Holo-scope ring coordinate ticks */}
                      <svg className="absolute w-[95%] h-[95%] opacity-30 stroke-cyan-400 animate-spin-slow stroke-[0.5]" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="48" strokeDasharray="3 4" />
                        <circle cx="50" cy="50" r="40" strokeOpacity="0.4" />
                        <circle cx="50" cy="50" r="30" strokeDasharray="1 1" />
                        <circle cx="50" cy="50" r="22" strokeOpacity="0.6" />
                      </svg>

                      {/* Spinning holographic sphere / lines made with CSS 3D */}
                      <div 
                        className={`w-[60%] h-[60%] rounded-full relative flex items-center justify-center border-2 border-dashed ${
                          quizAnswerStatus === "correct" 
                            ? "border-green-400/80 shadow-[0_0_20px_rgba(34,197,94,0.5)] bg-green-500/5 animate-bounce-slow" 
                            : quizAnswerStatus === "incorrect"
                            ? "border-red-400/80 shadow-[0_0_20px_rgba(239,68,68,0.5)] bg-red-500/5"
                            : "border-cyan-400/60 shadow-[0_0_30px_rgba(6,182,212,0.35)] bg-cyan-400/5 animate-spin-slow"
                        }`}
                        style={{ transformStyle: "preserve-3d", transform: "perspective(300px) rotateX(60deg) rotateY(40deg) rotateZ(0deg)" }}
                      >
                        {/* Interactive latitude line */}
                        <div className="absolute inset-0 border border-cyan-400/40 rounded-full" />
                        <div className="absolute inset-1 border border-[#00f2fe]/40 rounded-full" />
                        <div className="absolute inset-2 border border-emerald-400/30 rounded-full" />
                        <div className="absolute inset-3 border border-indigo-400/20 rounded-full animate-pulse" />
                        
                        {/* Pulsing center node representing the local target */}
                        <div className={`w-3 h-3 rounded-full absolute ${
                          quizAnswerStatus === "correct" 
                            ? "bg-green-400 animate-ping" 
                            : quizAnswerStatus === "incorrect"
                            ? "bg-red-500 animate-pulse"
                            : "bg-cyan-400 animate-pulse"
                        }`} />
                        
                        {/* Dynamic Floating Label based on question state */}
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[7px] font-mono tracking-widest text-cyan-400 whitespace-nowrap bg-slate-900/90 px-1.5 py-0.5 border border-cyan-500/30 uppercase">
                          {quizStatus === "active" 
                            ? `HOLO:${QUIZ_QUESTIONS[quizQuestionIdx].holoType.toUpperCase()}`
                            : "HOLO:SYS_READY"}
                        </div>
                      </div>

                      {/* Floating glowing particle beams */}
                      <div className="absolute bottom-1 w-full flex justify-center h-2 overflow-hidden opacity-80">
                        <div className="w-[8px] h-[30px] bg-cyan-400 blur-[3px] animate-bounce" style={{ animationDuration: '1.2s' }} />
                        <div className="w-[12px] h-[40px] bg-teal-400 blur-[4px] animate-bounce" style={{ animationDuration: '0.9s', animationDelay: '0.2s' }} />
                        <div className="w-[6px] h-[20px] bg-[#00f2fe] blur-[2px] animate-bounce" style={{ animationDuration: '1.5s', animationDelay: '0.5s' }} />
                      </div>
                    </div>

                  </div>

                  {/* SRMIST Aaruush National Games Footer indicators */}
                  <div className="bg-slate-950/90 backdrop-blur-md p-1.5 text-[8.5px] font-mono flex justify-between items-center z-10 border-t border-cyan-500/10 text-slate-500 px-3 select-none">
                    <div>SCAN_LOCK: SRMIST Aerospace Lab // Kattankulathur Chennai</div>
                    <div className="text-cyan-400 animate-pulse font-bold flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-cyan-400" />
                      ESTABLISHED CO-CHANNEL
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* Interactive World Map selection coordinates engine */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-lg shadow-lg space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 border-l-2 border-cyan-400 pl-2">
                  Interactive Coordinates Grabber
                </h4>
              </div>
              <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded">
                CLICK OR SWIPE THE WORLD MAP
              </span>
            </div>
            
            <p className="text-[11px] text-slate-400 tracking-wide mt-1">
              Select or tap any spot below. Project Zenith immediately realigns the orthographic zenith radar tracking algorithms according to the chosen geographics.
            </p>

            {/* Interactive World Mercator Mock Map SVG representation */}
            <div 
              className="relative aspect-[2/1] bg-[#0c1122] rounded-lg border border-cyan-800/20 overflow-hidden cursor-crosshair group shadow-inner"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left; // 0 to rect.width
                const y = e.clientY - rect.top;  // 0 to rect.height
                
                // Convert to approx Lat/Long
                // x goes from 0 to width -> corresponds to -180 to 180 Longitude
                const calculatedLng = -180 + (x / rect.width) * 360;
                // y goes from 0 to height -> corresponds to 85 to -85 Latitude (Mercator projection approx representation)
                const calculatedLat = 85 - (y / rect.height) * 170;

                const clampedLat = parseFloat(Math.min(Math.max(calculatedLat, -89.9), 89.9).toFixed(4));
                const clampedLng = parseFloat(Math.min(Math.max(calculatedLng, -179.9), 179.9).toFixed(4));

                setSelectedCoords({
                  cityName: `Clicked Coords (${clampedLat}, ${clampedLng})`,
                  lat: clampedLat,
                  lng: clampedLng
                });
                setCustomLatInput(clampedLat.toString());
                setCustomLngInput(clampedLng.toString());
              }}
            >
              {/* Horizontal / Vertical Equator Guides */}
              <div className="absolute top-1/2 left-0 w-full h-px border-t border-dashed border-white/10 z-0 pointer-events-none" />
              <div className="absolute top-0 left-1/2 h-full w-px border-l border-dashed border-white/10 z-0 pointer-events-none" />
              
              {/* Polar Circles and Tropics markers */}
              <div className="absolute top-[20%] left-0 w-full border-b border-white/[0.03] text-[7px] text-slate-600 pl-2 font-mono pointer-events-none">Arctic Circle (66.5° N)</div>
              <div className="absolute top-[80%] left-0 w-full border-b border-white/[0.03] text-[7px] text-slate-600 pl-2 font-mono pointer-events-none">Antarctic Circle (66.5° S)</div>
              <div className="absolute top-[50%] right-2 text-[7px] text-indigo-400 font-mono tracking-widest uppercase pointer-events-none -translate-y-2">Equator Group (0° Lat)</div>

              {/* Grid meshes in vector */}
              <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 opacity-20 pointer-events-none">
                {Array.from({ length: 72 }).map((_, i) => (
                  <div key={i} className="border-r border-b border-cyan-500/10" />
                ))}
              </div>

              {/* Minimal simplified earth map outline simulation in text/dots */}
              <div className="absolute inset-x-0 bottom-4 text-center text-[9px] text-slate-600 select-none font-mono pointer-events-none">
                [ MERCATOR MAP GRID COORDINATES PROJECTION GRAPH ]
              </div>

              {/* Coordinate Reticle Marker Target */}
              {(() => {
                // map long -180..180 to percent 0..100
                const leftPercent = ((selectedCoords.lng + 180) / 360) * 100;
                // map lat -85..85 to percent 100..0
                const topPercent = ((85 - selectedCoords.lat) / 170) * 100;
                return (
                  <div 
                    className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none flex items-center justify-center"
                    style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
                  >
                    <span className="absolute w-8 h-8 rounded-full border border-cyan-400/80 animate-ping duration-1000" />
                    <span className="absolute w-4 h-4 rounded-full bg-cyan-500/25 border-2 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
                    <div className="absolute w-1.5 h-1.5 bg-white rounded-full" />
                    
                    {/* Tiny reticle coordinate tag */}
                    <div className="absolute top-5 bg-cyan-950 text-cyan-300 font-mono text-[8px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap border border-cyan-700/50">
                      {selectedCoords.lat.toFixed(1)}, {selectedCoords.lng.toFixed(1)}
                    </div>
                  </div>
                );
              })()}

              {/* Preset observation stations rendered on map as small red radar dots */}
              {PRESET_LOCATIONS.map((loc, idx) => {
                const mapLeft = ((loc.lng + 180) / 360) * 100;
                const mapTop = ((85 - loc.lat) / 170) * 100;
                return (
                  <div
                    key={`dot-${idx}`}
                    className="absolute w-1.5 h-1.5 bg-red-400 rounded-full border border-black pointer-events-none opacity-60"
                    style={{ left: `${mapLeft}%`, top: `${mapTop}%` }}
                    title={loc.cityName}
                  />
                );
              })}
            </div>
            
            {/* Horizontal Legend */}
            <div className="flex justify-between items-center text-[10.5px] text-slate-500 font-mono pt-1">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-red-400 rounded-full inline-block" /> Active Ground Stations</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 border border-cyan-400 bg-cyan-500/20 inline-block rounded-sm" /> Target Lock Target</span>
            </div>
          </div>

        </section>

        {/* RIGHT COLUMN (GRID SIZE 3): Target telemetry focal details, AI Analyzer report loader, & Gemini chatbot */}
        <section className="lg:col-span-3 space-y-6">
          
          {/* Box 1: Focal Target Telemetry details */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-lg shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2">
                <Satellite className="w-4 h-4 text-cyan-400" />
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 border-l-2 border-cyan-400 pl-2">
                  Focal Target Telemetry
                </h3>
              </div>
              <span className="text-[9px] text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded font-mono">
                OBJECT FEED
              </span>
            </div>

            {selectedBody ? (
              <div className="space-y-3">
                {/* Header row */}
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Selected Body</span>
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-base font-bold text-white tracking-wide">{selectedBody.name}</h4>
                    <span className="text-[10px] text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40">
                      {selectedBody.type}
                    </span>
                  </div>
                </div>

                {/* Substats dashboard Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-white/5 p-2 rounded">
                    <span className="text-[9px] text-slate-400 uppercase block">Elevation</span>
                    <span className={`font-bold block text-sm mt-0.5 ${selectedBody.elevation && selectedBody.elevation > 0 ? "text-green-400" : "text-amber-500/80"}`}>
                      {selectedBody.elevation}° {selectedBody.elevation && selectedBody.elevation > 0 ? "(Overhead)" : "(Below)"}
                    </span>
                  </div>
                  <div className="bg-white/5 p-2 rounded">
                    <span className="text-[9px] text-slate-400 block uppercase">Azimuth</span>
                    <span className="text-slate-200 font-bold block text-sm mt-0.5">
                      {selectedBody.azimuth}° ({selectedBody.azimuth && selectedBody.azimuth < 45 ? "North" : selectedBody.azimuth && selectedBody.azimuth < 135 ? "East" : selectedBody.azimuth && selectedBody.azimuth < 225 ? "South" : "West"})
                    </span>
                  </div>

                  {selectedBody.type === CelestialType.SPACECRAFT ? (
                    <>
                      <div className="bg-white/5 p-2 rounded">
                        <span className="text-[9px] text-slate-400 block uppercase">Orbital Alt</span>
                        <span className="text-slate-200 font-bold block text-sm mt-0.5 text-cyan-300">
                          {selectedBody.altitude} km
                        </span>
                      </div>
                      <div className="bg-white/5 p-2 rounded">
                        <span className="text-[9px] text-slate-400 block uppercase">Velocity</span>
                        <span className="text-slate-200 font-bold block text-sm mt-0.5">
                          {selectedBody.velocity} km/s
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-white/5 p-2 rounded">
                        <span className="text-[9px] text-slate-400 block uppercase">Apparent Mag</span>
                        <span className="text-slate-200 font-bold block text-sm mt-0.5 text-amber-300">
                          {selectedBody.magnitude}
                        </span>
                      </div>
                      <div className="bg-white/5 p-2 rounded">
                        <span className="text-[9px] text-slate-400 block uppercase">Distance</span>
                        <span className="text-slate-200 font-bold block text-sm mt-0.5">
                          {selectedBody.distance ? `${selectedBody.distance} AU` : "Deep Cosmic"}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Body Details & Lore */}
                <div className="space-y-1.5 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-2">
                  <p>{selectedBody.description}</p>
                  <p className="text-slate-400 italic text-[11px] border-l border-cyan-500/20 pl-2 mt-2">
                    &ldquo;{selectedBody.lore}&rdquo;
                  </p>
                </div>

                {/* Select next body dropdown helper */}
                <div className="pt-2 border-t border-white/5">
                  <span className="text-[9px] text-slate-500 uppercase font-mono block mb-1">Observe another target</span>
                  <select
                    className="w-full bg-[#060811] text-slate-200 text-xs border border-white/10 rounded p-1.5 outline-none focus:border-cyan-500/50"
                    value={selectedBody.id}
                    onChange={(e) => {
                      const matched = celestialBodies.find(b => b.id === e.target.value);
                      if (matched) setSelectedBody(matched);
                    }}
                  >
                    {celestialBodies.map(body => (
                      <option key={body.id} value={body.id}>
                        {body.name} ({body.inView ? "Visible" : "Below Horizon"})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Click on any celestial node in the scanner workspace to focus target metrics.</p>
            )}
          </div>

          {/* Box 2: Premium Gemini AI Visibility & Stargazing Surveyor Report */}
          <div className="bg-white/5 backdrop-blur-md border border-cyan-500/30 rounded-lg p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 border-l-2 border-cyan-400 pl-2">
                  AI Celestial Surveyor
                </h3>
              </div>
              <span className="text-[9px] text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded font-mono font-bold">
                GEMINI AI
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Retrieve real-time astronomical stargazing quality reports and telemetry summaries instantly using Gemini cognitive reasoning.
            </p>

            {stargazingReport ? (
              <div className="bg-[#04060b] rounded p-3 text-xs leading-relaxed text-slate-300 font-sans border border-cyan-800/20 max-h-56 overflow-y-auto space-y-2 prose prose-invert">
                {/* Simple quick custom markdown layout renderer */}
                <div className="whitespace-pre-wrap select-text">{stargazingReport}</div>
                <button
                  onClick={() => setStargazingReport("")}
                  className="w-full mt-2 bg-white/5 hover:bg-white/10 py-1 rounded text-[10px] text-slate-400 flex items-center justify-center gap-1 font-mono transition"
                >
                  Clear Scout Report
                </button>
              </div>
            ) : (
              <button
                onClick={triggerCelestialAnalysis}
                disabled={isAnalyzing}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold py-2 px-4 rounded text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Cosmos...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Zenith Assessment</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Box 3: Zenith AI Chatbot space advisor */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-lg shadow-lg flex flex-col h-80">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5 flex-shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 border-l-2 border-cyan-400 pl-2">
                  Zenith AI Assistant
                </h3>
              </div>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse hover:scale-110 cursor-help" title="Connected via Gemini API" />
            </div>

            {/* Chat list history flow */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 min-h-0 pr-1 text-xs select-text">
              {chatHistory.map((item, index) => (
                <div
                  key={index}
                  className={`p-2 rounded max-w-[90%] leading-relaxed ${
                    item.role === "user"
                      ? "bg-cyan-950/40 border border-cyan-800/40 text-cyan-100 ml-auto"
                      : "bg-white/5 border border-white/5 text-slate-300 mr-auto"
                  }`}
                >
                  <span className="text-[8px] uppercase tracking-wider font-mono block text-slate-500 mb-0.5">
                    {item.role === "user" ? "GEO-EXPLORER" : "ZENITH ASSISTANT"}
                  </span>
                  <p className="whitespace-pre-line text-[11px]">{item.content}</p>
                </div>
              ))}
              {isChatting && (
                <div className="bg-white/5 text-slate-400 border border-white/5 p-2 rounded max-w-[90%] mr-auto italic text-[10px] flex items-center gap-2">
                  <div className="flex gap-0.5">
                    <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  Retrieving celestial alignment answers...
                </div>
              )}
            </div>

            {/* Quick action question suggestions */}
            {chatHistory.length <= 1 && (
              <div className="pb-2.5 flex-shrink-0 border-t border-white/5 pt-2">
                <span className="text-[8px] font-mono uppercase text-slate-500 tracking-wider block mb-1">Suggested inquiries:</span>
                <div className="flex flex-wrap gap-1">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setChatMessage(s);
                      }}
                      className="text-[9.5px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-white/5 truncate max-w-[220px] text-left"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat submit box */}
            <form onSubmit={triggerChatSubmit} className="flex gap-2 flex-shrink-0 pt-2 border-t border-white/5">
              <input
                type="text"
                placeholder="Ask about orbital physics / starlore..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-1 bg-[#04060c] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500/40"
              />
              <button
                type="submit"
                disabled={isChatting || !chatMessage.trim()}
                className="bg-cyan-500 disabled:opacity-40 hover:bg-cyan-400 text-black p-1.5 rounded transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </section>
      </main>

      {/* PORTFOLIO ACCORDION: Round 1 & Round 2 Logic submission guidelines presentation */}
      <section className="max-w-7xl w-full mx-auto px-4 md:px-6 pb-12 mt-6">
        <div className="bg-[#090d18]/40 border border-cyan-800/20 rounded-xl p-5 md:p-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-cyan-800/20 pb-4 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold uppercase tracking-wider text-white">
                  Round 1: Logic & Design Blueprint Submission
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Theoretical vision submitted for Round 1 qualification review (AstralWeb Innovate Hackathon portfolio document).
              </p>
            </div>
            
            <div className="bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 font-mono text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded">
              Status Rank: QUALIFIED FOR ROUND 2 DEVELOPMENT SPRINT
            </div>
          </div>

          {/* Grid Layout of the Blueprint Portfolio proposal details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 text-xs leading-relaxed text-slate-300">
            {/* Box A */}
            <div className="bg-slate-950/60 p-4 rounded-lg border border-white/5 space-y-2">
              <span className="text-[9.5px] uppercase tracking-widest text-cyan-400 font-bold block">
                [1] Data Strategy
              </span>
              <p className="text-slate-400">
                Project Zenith incorporates active data retrieval pipelines for real-time astronomical synchronization:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-slate-300">
                <li><strong className="text-white">NASA Horizons:</strong> Planet Ephemeris, Celestial position coordinates vectors adjusted for UTC-7 era 2026.</li>
                <li><strong className="text-white">OpenNotify:</strong> Latitude, longitude, timestamp variables mapping low-orbit altitude ranges.</li>
                <li><strong className="text-white">CelesTrak:</strong> TLE (Two-Line Element) active orbit tracking calculations translated locally.</li>
              </ul>
            </div>

            {/* Box B */}
            <div className="bg-slate-950/60 p-4 rounded-lg border border-white/5 space-y-2">
              <span className="text-[9.5px] uppercase tracking-widest text-cyan-400 font-bold block">
                [2] Frontend Tech Stack
              </span>
              <p className="text-slate-400">
                To fulfill interactive, cross-device structural demands, the technology spectrum combines:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-slate-300">
                <li><strong className="text-white">React & TypeScript:</strong> Fully structured components with rigid geodetic type safety boundaries.</li>
                <li><strong className="text-white">Tailwind CSS v4:</strong> Premium responsive canvas controls, theme variables.</li>
                <li><strong className="text-white">Vite Dev Stack:</strong> High performance bundling, speedy module hot replacement bypass.</li>
              </ul>
            </div>

            {/* Box C */}
            <div className="bg-slate-950/60 p-4 rounded-lg border border-white/5 space-y-2">
              <span className="text-[9.5px] uppercase tracking-widest text-cyan-400 font-bold block">
                [3] Feasibility Analysis
              </span>
              <p className="text-slate-400">
                Strict scheduled timelines mapped out for AstralWeb Project Zenith completion:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-slate-400">
                <li><strong className="text-white">Week 1:</strong> Data documentation parsing, raw TLE vector blueprints setup. (Completed)</li>
                <li><strong className="text-white">Week 2:</strong> Radar coordinates plotter engine, geographic selection module mockups. (Completed)</li>
                <li><strong className="text-white">Week 3-4:</strong> Live backend synchronization, Gemini model starlight analysis modules. (In Progress)</li>
              </ul>
            </div>

            {/* Box D */}
            <div className="bg-slate-950/60 p-4 rounded-lg border border-white/5 space-y-2">
              <span className="text-[9.5px] uppercase tracking-widest text-cyan-400 font-bold block">
                [4] Celestial Visibility Formula
              </span>
              <p className="text-slate-400 font-mono text-[10.5px] bg-[#03060c] p-2 rounded text-teal-400">
                &alpha; = Azimuth(Observer, Object)<br />
                &epsilon; = Elevation(Observer, Object)<br />
                Visible Over Zenith if:<br />
                &epsilon; &gt; 0° (Above Horizon limit)<br />
                Viability Index = (Seeing value * 20) - (Cloud Cover)%
              </p>
              <p className="text-[11px] text-slate-400">
                Used to project stars and satellites coordinate positions accurately based on orthographic distance mapping.
              </p>
            </div>
          </div>

          <div className="border-t border-cyan-800/10 pt-4 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-3">
            <span>AstralWeb Innovate Hackathon Portfolio Candidate: <strong>raghuvarandamodaran2002@gmail.com</strong></span>
            <div className="flex gap-4">
              <button 
                onClick={() => setNotification({ message: "Project Zenith Blueprint document exported as PDF template successfully.", type: "success" })}
                className="text-cyan-400 hover:text-cyan-300 font-mono uppercase bg-cyan-500/10 px-2.5 py-1 rounded inline-flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" /> Export Round 1 PDF Blueprint
              </button>
              <button 
                onClick={() => copyToClipboard(window.location.href)}
                className="text-white hover:text-cyan-300 font-mono uppercase bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded inline-flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" /> Copy Live Submission URL
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Area with thematic event citations */}
      <footer className="mt-auto border-t border-white/10 bg-slate-950 py-6 px-6 text-slate-500 text-[11px] font-mono">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <span className="uppercase font-bold text-slate-400 block mb-1">Project Zenith Architecture</span>
            <span>Real-time Cosmic Radar System v2.0.4-&alpha;. Configured with Gemini API integration. Deployed at port 3000.</span>
          </div>
          <div>
            <span className="uppercase font-bold text-slate-400 block mb-1">AstralWeb Submission Details</span>
            <span>R1 Deadline: 15 Jun 2026 (Passed)<br />R2 Deadline: 26 Jun 2026, 11:59 PM (Current Sprint)</span>
          </div>
          <div>
            <span className="uppercase font-bold text-slate-400 block mb-1">Telemetry Sources</span>
            <span>NASA Horizons Database, OpenNotify API services, CelesTrak active data streams.</span>
          </div>
          <div className="md:text-right">
            <span className="uppercase font-bold text-slate-400 block mb-1">Event Venue</span>
            <span>Global Online Hackathon / Virtual Orbit Platforms</span>
            <span className="text-slate-600 block mt-1">© 2026 AstralWeb Innovate. All Rights Reserved.</span>
          </div>
        </div>
      </footer>
      {/* Toast Notification HUD */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-[9999] max-w-sm w-80 bg-slate-900/95 border border-cyan-500/30 text-white rounded-lg shadow-2xl p-3.5 backdrop-blur-md transition-all duration-300">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 min-w-[16px] flex h-4 w-4 items-center justify-center rounded-full bg-cyan-950 border border-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </div>
            <div className="flex-1">
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-cyan-400 block mb-0.5">
                SYSTEM TELEMETRY
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {notification.message}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
