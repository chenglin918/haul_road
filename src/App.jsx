import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell } from 'recharts';
import { Settings, RefreshCw, BarChart3, Truck, Layers, Activity, BookOpen, Microscope, Calculator, Download } from 'lucide-react';
import './index.css';

// Material Cap Rolling Resistance Data (from paper scale tests)
const materialsData = [
  { name: 'Oil Sand Base', rr: 11, color: '#f59e0b' },
  { name: 'Sand Cap', rr: 18, color: '#ef4444' },
  { name: 'Pit Run Cap', rr: 9, color: '#3b82f6' },
  { name: 'Limestone Cap', rr: 6, color: '#10b981' },
];

function App() {
  // Simulator State
  const [tireLoad, setTireLoad] = useState(900); // kN
  const [tireStiffness, setTireStiffness] = useState(13); // kN/mm
  const [groundStiffness, setGroundStiffness] = useState(4.5); // MPa

  // Derived Advanced Geometric Boussinesq Calculations
  const phi = 3.84; // Typical tire diameter in meters
  const R = phi / 2; // Radius = 1.92m
  
  // Tire Deflection
  const deltaTireMeters = (tireLoad / tireStiffness) / 1000; 
  const tireDeflection = (deltaTireMeters * 1000); // in mm
  
  // --- METHOD A: Equivalent Linear Interaction Model ---
  const linearGroundDeflectionMm = (tireLoad / groundStiffness) * 0.15;
  const linearComputedRR = 2.0 + (linearGroundDeflectionMm * 0.2) + (tireDeflection * 0.05);

  // --- METHOD B: Complex Boussinesq Rheological Stress Bulb ---
  // Footprint Area
  const footprintArea = 1.35 * deltaTireMeters * phi;
  const footprintPressure = footprintArea > 0 ? tireLoad / footprintArea : 0; // kPa
  
  // Resilient Ground Deflection (Boussinesq rheology abstraction)
  // kp is in MPa (1 MPa = 1000 kPa). So delta_ground = p / (kp * 1000)
  const deltaGroundMeters = (footprintPressure / (groundStiffness * 1000));
  const groundDeflection = (deltaGroundMeters * 1000); // in mm

  // Geometric Intersection Angles (radians)
  const valBeta = (R - deltaTireMeters) / R;
  const beta = Math.acos(Math.max(-1, Math.min(1, valBeta)));
  
  const valAlpha = (R - (deltaTireMeters + deltaGroundMeters)) / R;
  const alphaRadiusCheck = Math.max(-1, Math.min(1, valAlpha));
  const alpha = Math.acos(alphaRadiusCheck);
  
  const psi = Math.max(0, alpha - beta);
  const l_arc = 2 * R * Math.sin(psi / 2);
  const L_chord = 2 * R * Math.sin(beta);
  
  const dynamicFactor = L_chord > 0 ? (l_arc / L_chord) - 1.0 : 0;
  // Convert standard dynamic proportion to % and add base RR (e.g. 2.0%)
  const rollingResistance = 2.0 + (dynamicFactor * 100);

  // Generates dummy GPS trace data for the RR distribution chart
  const [traceData, setTraceData] = useState([]);
  
  useEffect(() => {
    const data = [];
    let currentRRB = rollingResistance;
    let currentRRL = linearComputedRR;
    for(let i=0; i<30; i++) {
      currentRRB += (Math.random() - 0.5) * 1.5;
      currentRRL += (Math.random() - 0.5) * 1.5;
      // Clamp values slightly for visual aesthetics so they don't dip below 1%
      if (currentRRB < 1.0) currentRRB = 1.0;
      if (currentRRL < 1.0) currentRRL = 1.0;
      data.push({
        time: `T+${i}s`,
        rrBoussinesq: parseFloat(currentRRB.toFixed(2)),
        rrLinear: parseFloat(currentRRL.toFixed(2))
      });
    }
    setTraceData(data);
  }, [rollingResistance, linearComputedRR]);

  return (
    <div className="layout">
      <header>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <Truck size={48} color="var(--primary)" />
        </div>
        <h1>Haul Road <span className="text-gradient">Performance Simulator</span></h1>
        <p>
          Operational Methodologies for Rolling Resistance Evaluation.
          Interactive tooling estimating equivalent slope grade (%) based on hauler suspension, tire footprint, and resilient pressure stiffness.
        </p>
      </header>

      <div className="grid">
        {/* Left Column: Interactive Simulator */}
        <div className="glass-panel fade-in-up delay-1 calc-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Settings color="var(--primary)" />
            <h2>Hauler & Surface Parameters</h2>
          </div>

          <div className="slider-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label>Tire Load (F) - kN</label>
              <span className="value-display">{tireLoad} kN</span>
            </div>
            <input 
              type="range" 
              min="500" 
              max="1500" 
              value={tireLoad}
              onChange={(e) => setTireLoad(parseInt(e.target.value))}
            />
          </div>

          <div className="slider-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label>Tire Effective Stiffness (k_tire) - kN/mm</label>
              <span className="value-display">{tireStiffness} kN/mm</span>
            </div>
            <input 
              type="range" 
              min="5" 
              max="25" 
              step="0.5"
              value={tireStiffness}
              onChange={(e) => setTireStiffness(parseFloat(e.target.value))}
            />
          </div>

          <div className="slider-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label>Resilient Ground Stiffness (k_p) - MPa</label>
              <span className="value-display">{groundStiffness} MPa</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="20" 
              step="0.5"
              value={groundStiffness}
              onChange={(e) => setGroundStiffness(parseFloat(e.target.value))}
            />
          </div>

          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
              <div>
                <div className="metric-label">Ground Rut (δ_ground)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center' }}>
                  {groundDeflection.toFixed(1)} mm
                </div>
              </div>
              <div style={{ width: '1px', height: '40px', background: 'var(--glass-border)' }}></div>
              <div>
                <div className="metric-label">Tire Flex (δ_tire)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center' }}>
                  {tireDeflection.toFixed(1)} mm
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Output Metrics & Real Time Chart */}
        <div className="glass-panel fade-in-up delay-2" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Activity color="var(--accent)" />
            <h2>Simulated Rolling Resistance</h2>
          </div>
          
          <div className="metric-big">
            {rollingResistance.toFixed(2)}%
          </div>
          <div className="metric-label">Equivalent Slope Grade</div>

          <div style={{ marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <RefreshCw size={16} color="var(--text-secondary)"/>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Live Vehicle GPS Simulation</h3>
            </div>
            <div className="chart-container" style={{ height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={traceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRR_B" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRR_L" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={12} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}
                  />
                  <Area type="monotone" dataKey="rrBoussinesq" name="Boussinesq Model" stroke="var(--primary)" fillOpacity={0.6} fill="url(#colorRR_B)" />
                  <Area type="monotone" dataKey="rrLinear" name="Linear Model" stroke="var(--secondary)" fillOpacity={0.6} fill="url(#colorRR_L)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Theoretical Framework Panel */}
      <div className="glass-panel fade-in-up delay-3" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <BookOpen color="var(--primary)" />
          <h2>Theoretical Framework</h2>
        </div>
        
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {/* Equation Box */}
          <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Calculator size={20} color="var(--accent)" />
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Key Geometric RR Equation</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Expanding into a dynamic Boussinesq rheological model, the resistive rolling resistance coefficient equates to the geometric ratio between the quadratic chord dirt interaction wave ($l_arc$) and the flat footprint length ($L$).
            </p>
            <div style={{ background: 'var(--bg-accent)', padding: '1rem', borderRadius: '8px', textAlign: 'center', fontFamily: 'monospace', fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '1rem' }}>
              RR% = [ l_arc / L_chord ] - 1.0 (baseline)
            </div>
            
            {/* Dynamic Interactive Sample Calculation injected into HTML UI */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
              {/* Method A */}
              <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                <strong style={{color:'var(--accent)', fontSize:'0.9rem', display:'block', marginBottom:'0.5rem'}}>Method A: Equivalent Linear Model</strong>
                
                <span style={{color:'var(--text-secondary)'}}>// 1. Deflection & Scale</span><br/>
                δ_tire = {tireDeflection.toFixed(1)} mm<br/>
                δ_ground = (F_i / k_p) × 0.15<br/>
                δ_ground = ({tireLoad} / {groundStiffness}) × 0.15 = <strong style={{color:'var(--text-primary)'}}>{linearGroundDeflectionMm.toFixed(1)} mm</strong><br/>
                <br/>
                <span style={{color:'var(--text-secondary)'}}>// 2. Rolling Resistance Baseline map</span><br/>
                RR% = Base(2.0) + (δ_ground×0.2) + (δ_tire×0.05)<br/>
                RR% = 2.0 + {(linearGroundDeflectionMm*0.2).toFixed(2)} + {(tireDeflection*0.05).toFixed(2)}<br/>
                <strong style={{fontSize:'1rem', color:'var(--primary)', marginTop:'0.5rem', display:'block'}}>RR_linear = {linearComputedRR.toFixed(2)}%</strong>
              </div>

              {/* Method B */}
              <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                <strong style={{color:'var(--accent)', fontSize:'0.9rem', display:'block', marginBottom:'0.5rem'}}>Method B: Complex Boussinesq Model</strong>
                
                <span style={{color:'var(--text-secondary)'}}>// 1. Stress Bulb Rutting</span><br/>
                p_contact = {tireLoad} / {footprintArea.toFixed(3)} = {footprintPressure.toFixed(0)} kPa<br/>
                δ_ground = p / k_p = {footprintPressure.toFixed(0)} / {(groundStiffness*1000).toFixed(0)} = <strong style={{color:'var(--text-primary)'}}>{groundDeflection.toFixed(1)} mm</strong><br/>
                <br/>
                <span style={{color:'var(--text-secondary)'}}>// 2. Quadratic Chord Angles</span><br/>
                β = {((beta*180)/Math.PI).toFixed(2)}° | α = {((alpha*180)/Math.PI).toFixed(2)}°<br/>
                ψ (Ground Slope) = α - β = <strong style={{color:'var(--secondary)'}}>{((psi*180)/Math.PI).toFixed(2)}°</strong><br/>
                l_arc (Dirt Wave) = {l_arc.toFixed(3)} m<br/>
                L_chord (Footprint) = {L_chord.toFixed(3)} m<br/>
                <br/>
                <span style={{color:'var(--text-secondary)'}}>// 3. Coefficient mapping</span><br/>
                RR% = [ ( {l_arc.toFixed(3)} / {L_chord.toFixed(3)} ) - 1.0 ] × 100 + 2.0<br/>
                <strong style={{fontSize:'1rem', color:'var(--primary)', marginTop:'0.5rem', display:'block'}}>RR_boussinesq = {rollingResistance.toFixed(2)}%</strong>
              </div>
            </div>
          </div>

          {/* KPI Methods */}
          <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Microscope size={20} color="var(--secondary)" />
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Parameter Determination</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem', fontSize: '0.95rem' }}>Resilient Ground Stiffness (k_p)</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.4', marginBottom: '0.75rem' }}>
                  Determined through an in-field <strong>Cyclic Plate Load Test</strong>. A plate is cyclically loaded directly onto the surface commensurate to a nominal 1g truck pressure until a resilient, constant cyclic deformation establishes an elastic equilibrium.
                </p>
                <a href="/kp_determination_briefing.pdf" download style={{ textDecoration: 'none' }}>
                  <button className="primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', padding: '8px 16px', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--primary)', border: '1px solid var(--primary)', boxShadow: 'none' }}>
                    <Download size={16} />
                    Download PDF Protocol
                  </button>
                </a>
              </div>
              <div style={{ height: '1px', background: 'var(--glass-border)' }}></div>
              <div>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem', fontSize: '0.95rem' }}>Effective Tire Stiffness (k_tire)</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.4', marginBottom: '0.75rem' }}>
                  Determined universally when a fully-loaded hauler rests stationary (1g condition). The inflation is mapped specifically such that each tire deforms by precisely <strong>7% diametral strain</strong> in sync with the nominal inflation specifications.
                </p>
                <a href="/sample_calculation.pdf" download style={{ textDecoration: 'none' }}>
                  <button className="primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', padding: '8px 16px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid #10b981', boxShadow: 'none' }}>
                    <Calculator size={16} />
                    Download Sample Calculation PDF
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel fade-in-up delay-3" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <Layers color="var(--secondary)" />
          <h2>Wearing Course Material Comparison</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '800px' }}>
          Scale rolling resistance laboratory testing reveals that surface capping dramatically impacts haul truck rolling resistance. Sand caps tend to deteriorate and blend, worsening resistance, whereas crushed limestone optimally distributes load.
        </p>
        
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={materialsData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" stroke="var(--text-secondary)" domain={[0, 20]} />
              <YAxis dataKey="name" type="category" stroke="var(--text-primary)" fontSize={13} width={120} />
              <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                contentStyle={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--glass-border)', color: 'var(--text-primary)', borderRadius: '8px' }}
              />
              <Bar dataKey="rr" name="Rolling Resistance (%)" radius={[0, 8, 8, 0]} barSize={40}>
                {materialsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <footer className="footer">
        <p>Built dynamically with Antigravity AI.</p>
        <div style={{ fontSize: '0.85rem', marginTop: '1.5rem', opacity: 0.9, background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)', maxWidth: '600px', margin: '1.5rem auto 0 auto' }}>
          <p style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}>Scientific Reference</p>
          <p style={{ lineHeight: '1.5' }}>
            Joseph, T.G., Curley, M. & Anand, A. <em>Operational Methodologies for Rolling Resistance Evaluation.</em> Geotech Geol Eng 35, 2935–2946 (2017).
          </p>
          <a href="https://doi.org/10.1007/s10706-017-0292-y" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline', display: 'inline-block', marginTop: '0.5rem' }}>
            https://doi.org/10.1007/s10706-017-0292-y
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
