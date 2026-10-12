
import React, { useEffect, useRef, useState } from "react";
import "./App.css";

const SEGMENTS = 55;
const GAP = 9;

function createPoints(x, y) {
  return Array.from({ length: SEGMENTS }, (_, i) => ({
    x: x - i * GAP,
    y: y + Math.sin(i * 0.15) * 3,
  }));
}

function getAngle(a, b) {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

function DragonWing({ x, y, angle, size = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${size})`}>
      <path
        d="M 0 0 Q -15 -22 -22 -65 L -34 -27 L -48 -88
           L -48 -35 L -72 -65 Q -70 -24 -30 15 L -10 14 Z"
        fill="url(#wing)"
        stroke="#ffb326"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      <path
        d="M -22 -65 L -7 0 M -48 -88 L -22 5
           M -48 -35 L -12 8 M -72 -65 L -27 15"
        fill="none"
        stroke="#fff18a"
        strokeWidth="1.7"
      />

      <path
        d="M 0 0 Q -15 22 -22 65 L -34 27 L -48 88
           L -48 35 L -72 65 Q -70 24 -30 -15 L -10 -14 Z"
        fill="url(#wing)"
        stroke="#ff9d16"
        strokeWidth="1.8"
        opacity=".72"
      />
    </g>
  );
}

function DragonLeg({ x, y, angle }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <path
        d="M 0 -2 L -6 9 L -4 19 L 5 25 L 13 24
           L 19 31 L 13 30 L 9 35 L 7 29 L 1 30
           L -7 23 L -10 13 L -7 3 Z"
        fill="url(#body)"
        stroke="#ffb72f"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      <path
        d="M 13 30 L 19 31 L 16 26 M 8 29 L 9 35 L 13 30"
        fill="none"
        stroke="#fff3a1"
        strokeWidth="1.6"
      />
    </g>
  );
}

function Dragon({ points }) {
  if (points.length < 3) return null;

  const bodyPath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  function bodyAngle(i) {
    const a = points[Math.max(0, i - 1)];
    const b = points[Math.min(points.length - 1, i + 1)];

    return (getAngle(b, a) * 180) / Math.PI;
  }

  return (
    <g>
      <defs>
        <linearGradient id="body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff3100" />
          <stop offset="35%" stopColor="#ff6500" />
          <stop offset="70%" stopColor="#ffb300" />
          <stop offset="100%" stopColor="#fff18b" />
        </linearGradient>

        <linearGradient id="wing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff2600" />
          <stop offset="45%" stopColor="#ff6500" />
          <stop offset="100%" stopColor="#ffdd43" />
        </linearGradient>

        <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>

      {/* Glowing body shadow */}
      <path
        d={bodyPath}
        fill="none"
        stroke="#ff4100"
        strokeWidth="20"
        opacity=".25"
        filter="url(#softGlow)"
      />

      {/* Long segmented body */}
      <path
        d={bodyPath}
        fill="none"
        stroke="url(#body)"
        strokeWidth="12"
        strokeLinecap="round"
        filter="url(#glow)"
      />

      <path
        d={bodyPath}
        fill="none"
        stroke="#ffcf52"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Body armor and glowing joints */}
      {points.map((p, i) => {
        if (i < 2 || i % 2 !== 0) return null;

        const size = Math.max(2.5, 6 - i * 0.055);

        return (
          <g
            key={`armor-${i}`}
            transform={`translate(${p.x} ${p.y}) rotate(${bodyAngle(i)})`}
          >
            <path
              d={`M ${size} 0 L 0 ${-size * 1.6}
                  L ${-size * 1.2} 0 L 0 ${size} Z`}
              fill="url(#body)"
              stroke="#ffad20"
              strokeWidth=".9"
            />

            <circle
              cx="0"
              cy="0"
              r={Math.max(1.2, size * 0.35)}
              fill="#fff6a3"
              filter="url(#glow)"
            />
          </g>
        );
      })}

      {/* Sharp spine scales */}
      {points.map((p, i) => {
        if (i < 4 || i > 43 || i % 3 !== 0) return null;

        const size = 10 + (1 - i / SEGMENTS) * 8;

        return (
          <g
            key={`spine-${i}`}
            transform={`translate(${p.x} ${p.y}) rotate(${bodyAngle(i)})`}
          >
            <path
              d={`M 0 0 L ${-size} ${-size * 1.8}
                  L ${-size * 0.1} ${-size * 0.7}
                  L ${size * 0.7} 0 Z`}
              fill="url(#wing)"
              stroke="#ffd451"
              strokeWidth="1.1"
            />
          </g>
        );
      })}

      {/* Wings */}
      {[4, 18, 32].map((i, index) => (
        <DragonWing
          key={`wing-${i}`}
          x={points[i].x}
          y={points[i].y}
          angle={bodyAngle(i)}
          size={index === 0 ? 1 : index === 1 ? 0.72 : 0.52}
        />
      ))}

      {/* Four legs */}
      {[9, 23].map((i) => (
        <g
          key={`legs-${i}`}
          transform={`translate(${points[i].x} ${points[i].y})`}
        >
          <DragonLeg
            x={0}
            y={0}
            angle={bodyAngle(i) + 10}
          />

          <g transform="scale(1 -1)">
            <DragonLeg
              x={0}
              y={0}
              angle={bodyAngle(i) - 10}
            />
          </g>
        </g>
      ))}

      {/* LONG SHARP CURVED TAIL */}
      {(() => {
        const tail = points[SEGMENTS - 1];
        const previous = points[SEGMENTS - 2];
        const angle = (getAngle(previous, tail) * 180) / Math.PI;

        return (
          <g
            transform={`translate(${tail.x} ${tail.y}) rotate(${angle})`}
            filter="url(#glow)"
          >
            {/* Main pointed tail */}
            <path
              d="
                M 8 0
                Q -10 -2 -25 -5
                L -42 -10
                L -34 -3
                L -57 -5
                L -43 0
                L -57 5
                L -34 3
                L -42 10
                L -25 5
                Q -10 2 8 0
                Z
              "
              fill="url(#wing)"
              stroke="#ffbd32"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Bright tail center */}
            <path
              d="M 0 0 L -43 0"
              stroke="#fff2a0"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Upper tail blade */}
            <path
              d="M -22 -3 L -42 -19 L -34 -5 Z"
              fill="#ff7800"
              stroke="#ffdb48"
              strokeWidth="1.3"
            />

            {/* Lower tail blade */}
            <path
              d="M -22 3 L -42 19 L -34 5 Z"
              fill="#ff7800"
              stroke="#ffdb48"
              strokeWidth="1.3"
            />

            {/* Glowing tip */}
            <circle cx="-48" cy="0" r="3" fill="#fff7bd" />
          </g>
        );
      })()}

      {/* Dragon head */}
      {(() => {
        const head = points[0];
        const neck = points[1];
        const angle = (getAngle(neck, head) * 180) / Math.PI;

        return (
          <g
            transform={`translate(${head.x} ${head.y}) rotate(${angle})`}
            filter="url(#glow)"
          >
            <path
              d="M -14 0 L -24 -9 L -19 0 L -24 9 Z"
              fill="url(#wing)"
            />

            {/* Skull */}
            <path
              d="M -15 -8 L -8 -17 L 3 -14 L 12 -10
                 L 21 -5 L 28 -2 L 22 4 L 10 9
                 L -4 9 L -15 3 Z"
              fill="url(#body)"
              stroke="#ffe36a"
              strokeWidth="1.8"
            />

            {/* Snout */}
            <path
              d="M 9 -8 L 27 -8 L 38 -3 L 29 2 L 12 2 Z"
              fill="url(#wing)"
              stroke="#fff0a0"
              strokeWidth="1.4"
            />

            {/* Lower jaw and mouth */}
            <path
              d="M 10 4 L 30 4 L 24 10 L 9 8 Z"
              fill="#e63b00"
              stroke="#ffbd37"
              strokeWidth="1.3"
            />

            <path
              d="M 15 3 L 29 3 L 24 7 L 15 6 Z"
              fill="#200600"
            />

            <path
              d="M 18 3 L 20 6 L 22 3 M 25 3 L 27 5"
              fill="none"
              stroke="#fffbd3"
              strokeWidth="1.5"
            />

            {/* Horns */}
            <path
              d="M -5 -12 Q -17 -25 -13 -43 Q -6 -28 3 -17 Z"
              fill="url(#wing)"
              stroke="#ffdf57"
              strokeWidth="1.5"
            />

            <path
              d="M 3 -13 Q 2 -28 18 -39 Q 13 -23 12 -12 Z"
              fill="url(#wing)"
              stroke="#ffdf57"
              strokeWidth="1.5"
            />

            {/* Eye */}
            <path
              d="M 2 -8 Q 10 -15 18 -8"
              fill="none"
              stroke="#fff6a3"
              strokeWidth="2.5"
            />

            <ellipse cx="10" cy="-5" rx="4" ry="3" fill="#ffffff" />
            <ellipse cx="11" cy="-5" rx="1.5" ry="2.5" fill="#ff2400" />

            <circle cx="31" cy="-3" r="1.4" fill="#ffffff" />

            {/* Whiskers */}
            <path
              d="M 9 6 Q 22 17 32 11 M 7 7 Q 16 23 25 17"
              fill="none"
              stroke="#ffca43"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        );
      })()}

      {/* Fire particles */}
      {points.map((p, i) => {
        if (i % 3 !== 0) return null;

        const x = p.x + Math.sin(i * 2.2) * 15;
        const y = p.y + Math.cos(i * 1.7) * 16;
        const radius = 1 + (i % 3) * 0.5;

        return (
          <g key={`particle-${i}`}>
            <circle
              cx={x}
              cy={y}
              r={radius * 3}
              fill="#ff5400"
              opacity=".6"
              filter="url(#glow)"
            />

            <circle
              cx={x}
              cy={y}
              r={radius}
              fill="#fff1a0"
            />
          </g>
        );
      })}
    </g>
  );
}

export default function App() {
  const svgRef = useRef(null);
  const pointsRef = useRef([]);
  const targetRef = useRef({ x: 750, y: 300 });
  const draggingRef = useRef(false);

  const [points, setPoints] = useState([]);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    pointsRef.current = createPoints(750, 300);

    setPoints(pointsRef.current.map((p) => ({ ...p })));

    function updateTarget(event) {
      const rect = svg.getBoundingClientRect();

      const x = ((event.clientX - rect.left) / rect.width) * 1200;
      const y = ((event.clientY - rect.top) / rect.height) * 700;

      targetRef.current = {
        x: Math.max(65, Math.min(1135, x)),
        y: Math.max(65, Math.min(635, y)),
      };
    }

    function handleMove(event) {
      if (event.pointerType === "mouse" || draggingRef.current) {
        updateTarget(event);
      }
    }

    function handleDown(event) {
      draggingRef.current = true;
      setDragging(true);
      updateTarget(event);

      try {
        svg.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture is optional.
      }
    }

    function handleUp() {
      draggingRef.current = false;
      setDragging(false);
    }

    let frameId;

    function animate() {
      const current = pointsRef.current;

      if (current.length) {
        const target = targetRef.current;

        current[0].x += (target.x - current[0].x) * 0.12;
        current[0].y += (target.y - current[0].y) * 0.12;

        for (let i = 1; i < current.length; i++) {
          const previous = current[i - 1];
          const point = current[i];

          const dx = point.x - previous.x;
          const dy = point.y - previous.y;
          const distance = Math.hypot(dx, dy) || 1;

          point.x = previous.x + (dx / distance) * GAP;
          point.y = previous.y + (dy / distance) * GAP;
        }

        setPoints(current.map((p) => ({ x: p.x, y: p.y })));
      }

      frameId = requestAnimationFrame(animate);
    }

    svg.addEventListener("pointermove", handleMove);
    svg.addEventListener("pointerdown", handleDown);
    svg.addEventListener("pointerup", handleUp);
    svg.addEventListener("pointercancel", handleUp);
    svg.addEventListener("lostpointercapture", handleUp);

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);

      svg.removeEventListener("pointermove", handleMove);
      svg.removeEventListener("pointerdown", handleDown);
      svg.removeEventListener("pointerup", handleUp);
      svg.removeEventListener("pointercancel", handleUp);
      svg.removeEventListener("lostpointercapture", handleUp);
    };
  }, []);

  return (
    <main className="dragon-page">
      <svg
        ref={svgRef}
        className={`dragon-canvas ${dragging ? "is-dragging" : ""}`}
        viewBox="0 0 1200 700"
        preserveAspectRatio="none"
        aria-label="Orange cyber dragon with a long sharp tail"
      >
        <Dragon points={points} />
      </svg>

      <div className="instructions">
        <h2>{dragging ? "DRAGON MOVING" : "CLICK & DRAG"}</h2>
        <p>Move the dragon with your cursor</p>
      </div>
    </main>
  );
}
