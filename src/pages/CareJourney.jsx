import React, { useState, useEffect } from "react";
import { Map, MapPin, Navigation, CheckCircle2, ArrowRight } from "lucide-react";

const rooms = [
  { id: "101", label: "Main Reception", wing: "Entrance", color: "#bfdbfe", x: 300, y: 500, w: 200, h: 80 },
  { id: "102", label: "Triage Lab", wing: "Bottom", color: "#fef08a", x: 240, y: 370, w: 120, h: 80 },
  { id: "103", label: "Consultation A", wing: "Middle", color: "#e0f2fe", x: 120, y: 230, w: 140, h: 80 },
  { id: "104", label: "Consultation B", wing: "Middle", color: "#e0f2fe", x: 440, y: 230, w: 140, h: 80 },
  { id: "105", label: "X-RAY SCAN 1", wing: "Top", color: "#f8fafc", x: 120, y: 70, w: 120, h: 80 },
  { id: "106", label: "X-RAY SCAN 2", wing: "Top", color: "#f8fafc", x: 260, y: 70, w: 100, h: 80 },
  { id: "107", label: "MRI Lab", wing: "Top", color: "#f8fafc", x: 460, y: 70, w: 120, h: 80 },
  { id: "108", label: "Post-Op", wing: "Middle", color: "#fce7f3", x: 600, y: 230, w: 100, h: 140 },
  { id: "109", label: "Pharmacy", wing: "Bottom", color: "#dcfce7", x: 440, y: 370, w: 120, h: 80 },
  { id: "110", label: "Physical Therapy", wing: "Bottom", color: "#fef3c7", x: 80, y: 370, w: 140, h: 80 }
];

const generateWaypoints = (room) => {
  if (!room || room.id === "101") return [];
  const waypoints = [];
  waypoints.push({ x: 400, y: 480, label: "Main Reception" }); // W0

  // Determine corridor intersection
  let targetCorridorY = 470;
  let wingName = "Bottom Wing";
  if (room.wing === "Middle") { targetCorridorY = 330; wingName = "Middle Wing"; }
  else if (room.wing === "Top") { targetCorridorY = 170; wingName = "Top Wing"; }

  // 1. Walk Vertically - Add Intersections passed along the way
  const verticalIntersections = [
    { y: 470, label: "Bottom Wing 4-Way" },
    { y: 330, label: "Middle Wing 4-Way" },
    { y: 170, label: "Top Wing 4-Way" }
  ];

  // We start at Y=480, walking to targetCorridorY.
  // Filter intersections that are between 480 and targetCorridorY (inclusive)
  const passedIntersections = verticalIntersections
    .filter(i => i.y <= 480 && i.y >= targetCorridorY)
    .sort((a, b) => b.y - a.y); // Sort descending since we are walking UP (decreasing Y)

  passedIntersections.forEach(intersection => {
    if (intersection.y === targetCorridorY) {
      waypoints.push({ x: 400, y: intersection.y, label: `Turn at ${wingName} Intersection` });
    } else {
      waypoints.push({ x: 400, y: intersection.y, label: `Pass by ${intersection.label}` });
    }
  });

  // Determine door X
  let doorX = 400;
  let doorY = targetCorridorY;
  switch(room.id) {
    case "105": doorX = 180; doorY = 150; break;
    case "106": doorX = 310; doorY = 150; break;
    case "107": doorX = 520; doorY = 150; break;
    case "103": doorX = 190; doorY = 310; break;
    case "104": doorX = 510; doorY = 310; break;
    case "108": doorX = 600; doorY = 330; break; 
    case "110": doorX = 150; doorY = 450; break;
    case "102": doorX = 300; doorY = 450; break;
    case "109": doorX = 500; doorY = 450; break;
    default: doorX = 400; doorY = targetCorridorY;
  }

  // 2. Walk Horizontally - Add rooms passed along the wing corridor
  const horizontalRooms = {
    170: [ { x: 310, label: "X-RAY SCAN 2" }, { x: 180, label: "X-RAY SCAN 1" }, { x: 520, label: "MRI Lab" } ],
    330: [ { x: 190, label: "Consultation A" }, { x: 510, label: "Consultation B" }, { x: 600, label: "Post-Op" } ],
    470: [ { x: 300, label: "Triage Lab" }, { x: 150, label: "Physical Therapy" }, { x: 500, label: "Pharmacy" } ]
  };

  if (doorX !== 400 && horizontalRooms[targetCorridorY]) {
    const isWalkingLeft = doorX < 400;
    
    // Find rooms between X=400 and doorX (exclusive)
    const passedRooms = horizontalRooms[targetCorridorY]
      .filter(r => isWalkingLeft ? (r.x < 400 && r.x > doorX) : (r.x > 400 && r.x < doorX))
      .sort((a, b) => isWalkingLeft ? b.x - a.x : a.x - b.x); // Sort by order of encountering

    passedRooms.forEach(passedRoom => {
      waypoints.push({ x: passedRoom.x, y: targetCorridorY, label: `Pass by ${passedRoom.label}` });
    });
  }

  // Outside Target Door Checkpoint
  waypoints.push({ x: doorX, y: targetCorridorY, label: `Outside ${room.label}` });

  // Final Inside Checkpoint
  if (doorY !== targetCorridorY) {
    waypoints.push({ x: doorX, y: doorY, label: `Arrived at ${room.label}` });
  } else {
    waypoints[waypoints.length - 1].label = `Arrived at ${room.label}`;
  }

  const cleanWaypoints = waypoints.filter((wp, index, arr) => {
    if (index === 0) return true;
    const prev = arr[index - 1];
    return wp.x !== prev.x || wp.y !== prev.y;
  });
  return cleanWaypoints;
};

export default function CareJourney() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [navMode, setNavMode] = useState("step"); // "step" or "direct"

  // When a room is clicked, reset the journey
  const handleRoomClick = (room) => {
    if (!room) return;
    setSelectedRoom(room);
    setWaypoints(generateWaypoints(room));
    setCurrentStep(0);
  };

  const handleNextStep = () => {
    if (currentStep >= waypoints.length - 1) return;
    setCurrentStep(prev => prev + 1);
  };

  // SVG Path Generators
  const getFullPath = () => {
    if (waypoints.length === 0) return "";
    return `M ${waypoints[0].x} ${waypoints[0].y} ` + waypoints.slice(1).map(wp => `L ${wp.x} ${wp.y}`).join(" ");
  };

  const getCompletedPath = () => {
    if (navMode === "direct" || currentStep === 0 || waypoints.length === 0) return "";
    return `M ${waypoints[0].x} ${waypoints[0].y} ` + waypoints.slice(1, currentStep + 1).map(wp => `L ${wp.x} ${wp.y}`).join(" ");
  };

  const getCurrentLegPath = () => {
    if (navMode === "direct") return getFullPath();
    if (currentStep < waypoints.length - 1) {
      const start = waypoints[currentStep];
      const end = waypoints[currentStep + 1];
      return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
    }
    return "";
  };

  const isArrived = navMode === "step" ? (waypoints.length > 0 && currentStep === waypoints.length - 1) : false;

  return (
    <div className="min-h-screen pb-20 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="mb-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <Map className="text-primary w-8 h-8" />
            Step-by-Step Wayfinding
          </h1>
          <p className="text-slate-500 font-medium mt-1">Guided, room-by-room navigation through Building C</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ROOM DIRECTORY */}
        <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[350px] lg:h-[700px]">
          <div className="bg-slate-800 text-white p-4">
            <h2 className="font-bold flex items-center gap-2">
              <MapPin size={18} /> Directory
            </h2>
          </div>
          <div className="overflow-y-auto p-4 space-y-2 flex-1 custom-scrollbar">
            
            {/* Mode Toggle */}
            <div className="bg-slate-50 p-2 rounded-xl mb-4 border border-slate-200 flex text-xs font-bold shadow-inner">
              <button 
                onClick={() => setNavMode("step")}
                className={`flex-1 py-2 rounded-lg transition-all ${navMode === "step" ? "bg-white text-primary shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"}`}
              >
                Step-by-Step
              </button>
              <button 
                onClick={() => setNavMode("direct")}
                className={`flex-1 py-2 rounded-lg transition-all ${navMode === "direct" ? "bg-white text-primary shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"}`}
              >
                Direct Route
              </button>
            </div>

            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => handleRoomClick(room)}
                className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center justify-between ${
                  selectedRoom?.id === room.id 
                    ? "border-primary bg-primary/10 shadow-sm" 
                    : "border-transparent bg-slate-50 hover:bg-slate-100 hover:border-slate-200"
                }`}
              >
                <div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    selectedRoom?.id === room.id ? "bg-primary text-white" : "bg-white text-slate-500 border border-slate-200"
                  }`}>
                    {room.id}
                  </span>
                  <p className={`font-bold mt-1 text-sm ${selectedRoom?.id === room.id ? "text-primary-dark" : "text-slate-700"}`}>
                    {room.label}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* INTERACTIVE MAP & NAVIGATION PANEL */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          
          {/* Navigation Control Panel */}
          {waypoints.length > 0 && (
            <div className={`p-5 rounded-2xl border-2 shadow-sm transition-all flex flex-col md:flex-row items-center justify-between gap-4 ${
              isArrived ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-100"
            }`}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full shrink-0 flex items-center justify-center font-black text-2xl ${
                  isArrived ? "bg-emerald-500 text-white" : "bg-primary/10 text-primary"
                }`}>
                  {isArrived ? <CheckCircle2 size={28} /> : (navMode === "direct" ? <Navigation size={24} /> : currentStep + 1)}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    {isArrived ? "Destination Reached" : (navMode === "direct" ? "Direct Navigation" : `Checkpoint ${currentStep + 1} of ${waypoints.length}`)}
                  </p>
                  <h3 className={`font-extrabold text-xl ${isArrived ? "text-emerald-800" : "text-slate-800"}`}>
                    {navMode === "direct" ? `Navigating to ${waypoints[waypoints.length - 1].label}` : waypoints[currentStep].label}
                  </h3>
                  {!isArrived && (
                    <p className="text-sm font-bold text-sky-600 mt-1 animate-pulse">
                      {navMode === "direct" ? "Follow the full path to your destination." : "Follow the animated guide to the next checkpoint."}
                    </p>
                  )}
                </div>
              </div>

              {!isArrived && navMode === "step" && (
                <button 
                  onClick={handleNextStep}
                  className="px-6 py-4 rounded-xl font-bold text-lg flex items-center gap-2 transition-all bg-primary text-white hover:bg-primary-dark shadow-[0_8px_20px_rgba(13,148,136,0.3)] hover:-translate-y-1 active:translate-y-0"
                >
                  Confirm Arrival & Continue
                </button>
              )}
              {navMode === "direct" && (
                <button 
                  onClick={() => handleRoomClick(null)}
                  className="px-6 py-4 rounded-xl font-bold text-lg flex items-center gap-2 transition-all bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 shadow-sm"
                >
                  End Navigation
                </button>
              )}
            </div>
          )}

          {/* SVG Map */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[500px] lg:h-[700px]">
            <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center">
              <h2 className="font-bold text-slate-700 flex items-center gap-2">Building C Map View</h2>
              <div className="flex gap-3 lg:gap-4">
                <span className="flex items-center gap-1.5 lg:gap-2 text-[10px] lg:text-xs font-bold text-slate-500"><div className="w-3 h-1 lg:w-4 lg:h-1 rounded bg-slate-200"></div> Full Route</span>
                <span className="flex items-center gap-1.5 lg:gap-2 text-[10px] lg:text-xs font-bold text-slate-500"><div className="w-3 h-1 lg:w-4 lg:h-1 rounded bg-[#0ea5e9]"></div> Walking</span>
              </div>
            </div>
            
            <div className="flex-1 bg-white relative p-0 lg:p-4 overflow-x-auto flex justify-start lg:justify-center items-center custom-scrollbar">
              <div className="w-full h-full min-w-[700px] lg:min-w-0 max-w-[800px] max-h-[600px] lg:border-2 border-slate-100 lg:rounded-2xl overflow-hidden bg-slate-50 lg:shadow-inner shrink-0">
                <svg viewBox="0 0 800 600" className="w-full h-full">
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1"/>
                  </pattern>
                  <rect width="800" height="600" fill="url(#grid)" />

                  {/* Main Hallways */}
                  <rect x="380" y="110" width="40" height="390" fill="#e2e8f0" rx="4" /> 
                  <rect x="140" y="150" width="440" height="40" fill="#e2e8f0" rx="4" /> 
                  <rect x="140" y="310" width="540" height="40" fill="#e2e8f0" rx="4" /> 
                  <rect x="100" y="450" width="440" height="40" fill="#e2e8f0" rx="4" /> 

                  {/* Draw Rooms */}
                  {rooms.map(room => {
                    const isSelected = selectedRoom?.id === room.id;
                    return (
                      <g key={room.id} onClick={() => handleRoomClick(room)} className="cursor-pointer group">
                        <rect 
                          x={room.x} y={room.y} width={room.w} height={room.h} 
                          fill={room.color} 
                          stroke={isSelected ? "#0d9488" : "#94a3b8"} 
                          strokeWidth={isSelected ? "4" : "2"} 
                          rx="8" 
                          className="transition-all group-hover:opacity-80" 
                        />
                        {isSelected && (
                          <rect 
                            x={room.x - 4} y={room.y - 4} 
                            width={room.w + 8} height={room.h + 8} 
                            fill="none" 
                            stroke="#0ea5e9" 
                            strokeWidth="2" 
                            strokeDasharray="4 4" 
                            rx="10" 
                          />
                        )}
                        <text x={room.x + room.w/2} y={room.y + 24} fontSize="16" fill={isSelected ? "#0f766e" : "#0f172a"} fontWeight="900" textAnchor="middle">{room.id}</text>
                        <text x={room.x + room.w/2} y={room.y + 45} fontSize="12" fill={isSelected ? "#0f766e" : "#334155"} fontWeight="700" textAnchor="middle">{room.label}</text>
                      </g>
                    );
                  })}

                  {/* PATHRENDERING */}
                  {selectedRoom && selectedRoom.id !== "101" && waypoints.length > 0 && (
                    <>
                      {/* 1. Full Path (Faint background) */}
                      <path d={getFullPath()} fill="none" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                      
                      {/* 2. Completed Path (Solid solid) */}
                      {getCompletedPath() && (
                        <path d={getCompletedPath()} fill="none" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                      )}

                      {/* 3. Current Active Leg (Dashed animated) */}
                      {getCurrentLegPath() && (
                        <path 
                          id="activeLegPath"
                          d={getCurrentLegPath()} 
                          fill="none" 
                          stroke="#0ea5e9" 
                          strokeWidth="6" 
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeDasharray="8 8" 
                          className="animate-[dash_1s_linear_infinite]"
                        />
                      )}

                      {/* Waypoint Markers */}
                      {waypoints.map((wp, i) => {
                        const isVisible = navMode === "step" || i === 0 || i === waypoints.length - 1;
                        if (!isVisible) return null;
                        return (
                          <circle 
                            key={i} 
                            cx={wp.x} 
                            cy={wp.y} 
                            r={navMode === "step" && i === currentStep ? "10" : "6"} 
                            fill={navMode === "step" && i <= currentStep ? "#0d9488" : "#cbd5e1"} 
                            className={navMode === "step" && i === currentStep + 1 ? "animate-pulse" : ""}
                          />
                        );
                      })}

                      {/* Animated Navigator Emoji 🚶 */}
                      {!isArrived ? (
                        <text fontSize="28" fontWeight="bold">
                          <tspan>🚶</tspan>
                          <animateMotion dur={navMode === "direct" ? "6s" : "3s"} repeatCount="indefinite" keyPoints="0;1;0" keyTimes="0;0.5;1" calcMode="linear">
                            <mpath href="#activeLegPath" />
                          </animateMotion>
                        </text>
                      ) : (
                        <text 
                          x={waypoints[currentStep].x - 14} 
                          y={waypoints[currentStep].y - 14} 
                          fontSize="28" 
                          className="animate-bounce"
                        >
                          🧍
                        </text>
                      )}
                    </>
                  )}

                  {/* Default User Indicator (no route selected) */}
                  {(!selectedRoom || selectedRoom.id === "101") && (
                    <text x={385} y={490} fontSize="28" className="animate-bounce">🧍</text>
                  )}
                  
                </svg>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
