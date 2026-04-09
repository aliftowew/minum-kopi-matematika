import { useState, useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

const FONT_URL = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap";

function Latex({ math, display = false }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, { displayMode: display, throwOnError: false });
    } catch { return math; }
  }, [math, display]);
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function CoffeeCalculator() {
  const [T0, setT0] = useState(92);
  const [Truang, setTruang] = useState(27);
  const [Ttarget, setTtarget] = useState(62);
  const [k, setK] = useState(0.03);

  const result = useMemo(() => {
    const diff = Ttarget - Truang;
    const initDiff = T0 - Truang;
    if (initDiff <= 0 || diff <= 0 || diff >= initDiff) return null;
    const ratio = diff / initDiff;
    const t = -Math.log(ratio) / k;
    return t;
  }, [T0, Truang, Ttarget, k]);

  const curvePoints = useMemo(() => {
    const points = [];
    const maxT = 60;
    for (let t = 0; t <= maxT; t += 0.5) {
      const temp = Truang + (T0 - Truang) * Math.exp(-k * t);
      points.push({ t, temp });
    }
    return points;
  }, [T0, Truang, k]);

  const chartW = 560;
  const chartH = 240;
  const padL = 48;
  const padR = 20;
  const padT = 20;
  const padB = 36;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;
  const maxTime = 60;
  const minTemp = Math.min(Truang - 5, 0);
  const maxTemp = Math.max(T0 + 5, 100);

  const toX = (t) => padL + (t / maxTime) * innerW;
  const toY = (temp) => padT + (1 - (temp - minTemp) / (maxTemp - minTemp)) * innerH;

  const pathD = curvePoints
    .map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.t).toFixed(1)},${toY(p.temp).toFixed(1)}`)
    .join(" ");

  const targetY = toY(Ttarget);
  const ruangY = toY(Truang);
  const resultX = result ? toX(result) : null;
  const resultY = result ? toY(Ttarget) : null;

  const yTicks = [];
  const step = maxTemp - minTemp > 80 ? 20 : 10;
  for (let v = Math.ceil(minTemp / step) * step; v <= maxTemp; v += step) {
    yTicks.push(v);
  }
  const xTicks = [0, 10, 20, 30, 40, 50, 60];

  const errorMsg = useMemo(() => {
    if (T0 <= Truang) return "T\u2080 harus lebih tinggi dari T ruangan";
    if (Ttarget <= Truang) return "T target harus lebih tinggi dari T ruangan";
    if (Ttarget >= T0) return "T target harus lebih rendah dari T\u2080";
    return null;
  }, [T0, Truang, Ttarget]);

  const sliders = [
    { label: "T\u2080", sub: "Suhu awal", value: T0, set: setT0, min: 40, max: 100, unit: "\u00b0C", color: "#E85D3A" },
    { label: "T ruang", sub: "Suhu ruangan", value: Truang, set: setTruang, min: 15, max: 40, unit: "\u00b0C", color: "#4AADBB" },
    { label: "T target", sub: "Suhu minum", value: Ttarget, set: setTtarget, min: 30, max: 85, unit: "\u00b0C", color: "#D4A843" },
    { label: "k", sub: "Laju pendinginan", value: k, set: setK, min: 0.005, max: 0.08, step: 0.001, unit: "/menit", color: "#8B6DB0" },
  ];

  const presets = [
    { name: "Keramik tanpa tutup", k: 0.03 },
    { name: "Keramik + tutup", k: 0.018 },
    { name: "Gelas plastik", k: 0.045 },
    { name: "Stainless", k: 0.05 },
  ];

  return (
    <>
      <link href={FONT_URL} rel="stylesheet" />
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #1A1410; }
        .katex { font-size: 1.1em; color: #F5E6D0; }
      `}</style>
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #1A1410 0%, #2A1F18 40%, #1E1915 100%)",
        fontFamily: "'DM Sans', sans-serif",
        color: "#E8DDD0",
        padding: "32px 20px",
      }}>
        <div style={{ maxWidth: 620, margin: "0 auto" }}>

          {/* Header with Tagline */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 1.5,
              marginBottom: 4,
              color: "#D4A843",
            }}>
              {"\uD83D\uDCA1"} Semua Bisa Dihitung
            </div>
            <p style={{ fontSize: 12, color: "#6B5D50", marginBottom: 20, letterSpacing: 0.5 }}>
              by <span style={{ color: "#A08E7A", fontWeight: 600 }}>Alif Towew</span>
            </p>
            <div style={{ fontSize: 42, marginBottom: 4 }}>☕</div>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 28,
              fontWeight: 900,
              color: "#F5E6D0",
              letterSpacing: "-0.5px",
              lineHeight: 1.2,
            }}>
              Newton's Cooling Law
            </h1>
            <p style={{ color: "#A08E7A", fontSize: 14, marginTop: 6 }}>
              Berapa lama nunggu kopi biar pas di lidah?
            </p>
          </div>

          {/* Result */}
          <div style={{
            background: "linear-gradient(135deg, #3A2A1E 0%, #2E2218 100%)",
            borderRadius: 16,
            padding: "24px 20px",
            textAlign: "center",
            marginBottom: 24,
            border: "1px solid #4A382A",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 3,
              background: "linear-gradient(90deg, #E85D3A, #D4A843, #4AADBB)",
            }} />
            {errorMsg ? (
              <p style={{ color: "#E85D3A", fontSize: 14 }}>{errorMsg}</p>
            ) : (
              <>
                <p style={{ fontSize: 12, color: "#A08E7A", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
                  Waktu tunggu optimal
                </p>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 52,
                  fontWeight: 900,
                  color: "#D4A843",
                  lineHeight: 1,
                }}>
                  {result ? result.toFixed(1) : "\u2014"}
                </div>
                <p style={{ fontSize: 16, color: "#C4B49E", marginTop: 4 }}>menit</p>
              </>
            )}
          </div>

          {/* Rumus - KaTeX */}
          <div style={{
            background: "#231C16",
            borderRadius: 12,
            padding: "20px 20px",
            marginBottom: 24,
            border: "1px solid #3A2E24",
            textAlign: "center",
          }}>
            <p style={{ fontSize: 11, color: "#A08E7A", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16 }}>
              Rumus
            </p>
            <div style={{ marginBottom: 16 }}>
              <Latex
                math="T(t) = T_{\text{ruang}} + (T_0 - T_{\text{ruang}}) \cdot e^{-kt}"
                display={true}
              />
            </div>
            <div style={{ borderTop: "1px solid #3A2E24", paddingTop: 14 }}>
              <p style={{ fontSize: 10, color: "#6B5D50", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Mencari waktu</p>
              <Latex
                math="t = \frac{- \ln \!\left( \dfrac{T_{\text{target}} - T_{\text{ruang}}}{T_0 - T_{\text{ruang}}} \right)}{k}"
                display={true}
              />
            </div>
          </div>

          {/* Chart */}
          <div style={{
            background: "#231C16",
            borderRadius: 12,
            padding: "16px 12px 12px",
            marginBottom: 24,
            border: "1px solid #3A2E24",
            overflowX: "auto",
          }}>
            <p style={{ fontSize: 11, color: "#A08E7A", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10, paddingLeft: 8 }}>
              Grafik Pendinginan
            </p>
            <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: "100%", height: "auto" }}>
              {yTicks.map((v) => (
                <g key={v}>
                  <line x1={padL} x2={chartW - padR} y1={toY(v)} y2={toY(v)} stroke="#3A2E24" strokeWidth={0.8} />
                  <text x={padL - 6} y={toY(v) + 4} fill="#6B5D50" fontSize={10} textAnchor="end" fontFamily="DM Sans">{v}°</text>
                </g>
              ))}
              {xTicks.map((v) => (
                <g key={v}>
                  <line x1={toX(v)} x2={toX(v)} y1={padT} y2={chartH - padB} stroke="#3A2E24" strokeWidth={0.8} />
                  <text x={toX(v)} y={chartH - padB + 16} fill="#6B5D50" fontSize={10} textAnchor="middle" fontFamily="DM Sans">{v}m</text>
                </g>
              ))}
              <line x1={padL} x2={chartW - padR} y1={ruangY} y2={ruangY} stroke="#4AADBB" strokeWidth={1} strokeDasharray="6 4" opacity={0.5} />
              <line x1={padL} x2={chartW - padR} y1={targetY} y2={targetY} stroke="#D4A843" strokeWidth={1} strokeDasharray="6 4" opacity={0.5} />
              <path d={pathD} fill="none" stroke="#E85D3A" strokeWidth={2.5} strokeLinecap="round" />
              {result && result <= maxTime && resultX && resultY && (
                <>
                  <line x1={resultX} x2={resultX} y1={resultY} y2={chartH - padB} stroke="#D4A843" strokeWidth={1} strokeDasharray="4 3" opacity={0.6} />
                  <circle cx={resultX} cy={resultY} r={5} fill="#D4A843" stroke="#231C16" strokeWidth={2} />
                  <text x={resultX} y={resultY - 12} fill="#D4A843" fontSize={11} textAnchor="middle" fontWeight={700} fontFamily="DM Sans">
                    {result.toFixed(1)}m
                  </text>
                </>
              )}
            </svg>
          </div>

          {/* Preset k */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, color: "#A08E7A", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>
              Preset Jenis Gelas
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {presets.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setK(p.k)}
                  style={{
                    background: k === p.k ? "#8B6DB0" : "#2E2218",
                    color: k === p.k ? "#fff" : "#C4B49E",
                    border: `1px solid ${k === p.k ? "#8B6DB0" : "#4A382A"}`,
                    borderRadius: 8,
                    padding: "8px 14px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    transition: "all 0.2s",
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div style={{ display: "grid", gap: 16 }}>
            {sliders.map((s) => (
              <div key={s.label} style={{
                background: "#231C16",
                borderRadius: 12,
                padding: "14px 18px",
                border: "1px solid #3A2E24",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 15, color: s.color }}>{s.label}</span>
                    <span style={{ fontSize: 12, color: "#6B5D50", marginLeft: 8 }}>{s.sub}</span>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 18, color: "#F5E6D0", fontFamily: "'Playfair Display', serif" }}>
                    {s.step && s.step < 1 ? s.value.toFixed(3) : s.value}{s.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step || 1}
                  value={s.value}
                  onChange={(e) => s.set(Number(e.target.value))}
                  style={{
                    width: "100%",
                    height: 6,
                    appearance: "none",
                    WebkitAppearance: "none",
                    background: `linear-gradient(to right, ${s.color} 0%, ${s.color} ${((s.value - s.min) / (s.max - s.min)) * 100}%, #3A2E24 ${((s.value - s.min) / (s.max - s.min)) * 100}%, #3A2E24 100%)`,
                    borderRadius: 3,
                    outline: "none",
                    cursor: "pointer",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Penjelasan variabel */}
          <div style={{
            background: "#231C16",
            borderRadius: 12,
            padding: "18px 20px",
            marginTop: 24,
            border: "1px solid #3A2E24",
          }}>
            <p style={{ fontSize: 11, color: "#A08E7A", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 14 }}>
              Penjelasan Variabel
            </p>
            {[
              { sym: "T\u2080", color: "#E85D3A", desc: "Suhu awal kopi saat baru diseduh. Air mendidih 100\u00b0C, tapi biasanya turun ke ~90\u201395\u00b0C saat dituang." },
              { sym: "T ruang", color: "#4AADBB", desc: "Suhu lingkungan sekitar. Di Indonesia tropis sekitar 27\u00b0C. Ruangan ber-AC bisa 20\u201322\u00b0C." },
              { sym: "T target", color: "#D4A843", desc: "Suhu yang kamu mau \u2014 sweet spot minum kopi tanpa kebakar lidah adalah 60\u201365\u00b0C." },
              { sym: "k", color: "#8B6DB0", desc: "Konstanta laju pendinginan \u2014 seberapa cepat panas hilang. Tergantung bahan gelas, ada tutup atau tidak, dan kondisi ruangan (kipas/AC)." },
            ].map((v) => (
              <div key={v.sym} style={{ marginBottom: 12 }}>
                <span style={{ fontWeight: 700, color: v.color, fontSize: 14 }}>{v.sym}</span>
                <p style={{ fontSize: 13, color: "#A08E7A", marginTop: 2, lineHeight: 1.5 }}>{v.desc}</p>
              </div>
            ))}
            <div style={{ marginTop: 14, padding: "12px 14px", background: "#1A1410", borderRadius: 8 }}>
              <p style={{ fontSize: 12, color: "#6B5D50", lineHeight: 1.6 }}>
                <strong style={{ color: "#C4B49E" }}>Cara kerja:</strong> Hukum Pendinginan Newton menyatakan bahwa laju pendinginan suatu benda sebanding dengan selisih suhunya terhadap lingkungan. Semakin panas kopimu relatif terhadap ruangan, semakin cepat ia mendingin. Makanya di awal suhu turun cepat, lalu makin melambat — membentuk kurva eksponensial di grafik atas.
              </p>
            </div>
          </div>

          {/* Footer */}
          <p style={{ textAlign: "center", fontSize: 11, color: "#4A382A", marginTop: 24 }}>
            #SemuaBisaDihitung — Newton's Cooling Law Calculator
          </p>
        </div>
      </div>
    </>
  );
}

export default CoffeeCalculator;
