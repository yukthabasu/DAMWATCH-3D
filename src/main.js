import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const $ = (selector) => document.querySelector(selector);

$('#app').innerHTML = `
<div class="app-shell">
  <header class="topbar">
    <div class="brand-mark">DW</div>
    <div class="brand-copy">
      <h1>DAMWATCH <span>3D</span></h1>
      <p>ADVANCED RESERVOIR DIGITAL TWIN</p>
    </div>
    <div class="live"><i></i> SIMULATION ONLINE</div>
    <div class="clock" id="clock"></div>
  </header>

  <main class="dashboard">
    <aside class="panel controls-panel">
      <div class="eyebrow">01 / CONTROL CENTRE</div>
      <h2>Reservoir Operations</h2>
      <p class="subtle">Interactive engineering simulation</p>

      <div class="level-card">
        <div class="mini-label">RESERVOIR CAPACITY</div>
        <div class="big-number"><span id="levelNum">72</span><small>%</small></div>
        <div class="meter"><div id="levelMeter"></div></div>
        <div class="meter-label"><span>LOW</span><span>MAXIMUM</span></div>
      </div>

      <div class="stats">
        <div><span>WATER ELEVATION</span><b id="elevation">142.5 m</b></div>
        <div><span>GATE OPENING</span><b id="gateStat">35%</b></div>
        <div><span>INFLOW</span><b id="inflowStat">420 m³/s</b></div>
        <div><span>OUTFLOW</span><b id="outflowStat">323 m³/s</b></div>
      </div>

      <div class="separator"></div>
      <div class="eyebrow">02 / SCENARIO INPUTS</div>

      <label>Reservoir level <b id="levelLabel">72%</b></label>
      <input id="levelSlider" type="range" min="10" max="95" value="72">

      <label>Spillway gate opening <b id="gateLabel">35%</b></label>
      <input id="gateSlider" type="range" min="0" max="100" value="35">

      <label>Incoming water flow <b id="flowLabel">420 m³/s</b></label>
      <input id="flowSlider" type="range" min="100" max="900" step="10" value="420">

      <label>Operating scenario</label>
      <select id="scenario">
        <option value="custom">Custom operation</option>
        <option value="normal">Normal inflow</option>
        <option value="monsoon">Monsoon inflow</option>
        <option value="drought">Low inflow</option>
        <option value="release">High discharge test</option>
      </select>

      <div class="advanced-controls">
        <div class="separator"></div>
        <div class="eyebrow">02B / ADVANCED CONTROL TUNING</div>
        <label>Simulation speed <b id="speedLabel">1.0×</b></label>
        <input id="speedSlider" type="range" min="0.25" max="2.5" step="0.25" value="1">
        <label>Camera smoothing <b id="smoothLabel">0.08</b></label>
        <input id="smoothSlider" type="range" min="0.02" max="0.18" step="0.01" value="0.08">
        <label>Water ripple strength <b id="rippleLabel">100%</b></label>
        <input id="rippleSlider" type="range" min="0" max="200" step="10" value="100">
        <label class="toggle"><span>Auto-flow variation</span><input id="autoFlowToggle" type="checkbox"></label>
        <label class="toggle"><span>Auto camera drift</span><input id="autoCameraToggle" type="checkbox"></label>
      </div>

      <div class="button-group">
        <button id="pauseBtn" class="primary">Ⅱ Pause</button>
        <button id="resetBtn" class="secondary">↺ Reset</button>
      </div>

      <div class="separator"></div>
      <div class="eyebrow">03 / SYSTEM STATUS</div>
      <div class="status-line"><i class="status-dot" id="statusDot"></i><span id="statusTitle">OPERATING NORMALLY</span></div>
      <p class="alert-text" id="alertText">Simulation operating normally.</p>
      <p class="disclaimer">Educational visualization only. Not intended for real dam operations or safety decisions.</p>
    </aside>

    <section class="viewport panel">
      <div class="viewport-top">
        <div>
          <div class="eyebrow">04 / THREE-DIMENSIONAL ENVIRONMENT</div>
          <h2>Dam & Reservoir Complex</h2>
        </div>
        <div class="viewport-actions">
          <select id="cameraPreset" aria-label="Camera preset">
            <option value="hero">Hero view</option>
            <option value="front">Front view</option>
            <option value="upstream">Reservoir view</option>
            <option value="top">Top view</option>
          </select>
          <button id="resetCamera">Reset</button>
          <button id="fullscreenBtn">Fullscreen</button>
        </div>
      </div>

      <div id="scene">
        <div class="scene-chip chip-water">UPSTREAM RESERVOIR</div>
        <div class="scene-chip chip-dam">CONCRETE DAM</div>
        <div class="scene-chip chip-gates">SPILLWAY GATES</div>
        <div class="scene-chip chip-river">DOWNSTREAM CHANNEL</div>
        <div class="scene-hint">DRAG TO ORBIT · SCROLL TO ZOOM</div>
        <div class="scene-coords">3D WORLD SPACE</div>
        <div class="cinematic-tools" aria-label="Environment visual controls">
          <button id="cinematicModeBtn" type="button">✦ Cinematic</button>
          <button id="cloudsModeBtn" type="button">☁ Clouds</button>
          <button id="forestModeBtn" type="button">♧ Valley</button>
          <button id="waterFxBtn" type="button">≈ Water FX</button>
        </div>
      </div>

      <div class="scene-legend">
        <span><i class="swatch sw-water"></i> WATER</span>
        <span><i class="swatch sw-concrete"></i> CONCRETE</span>
        <span><i class="swatch sw-rock"></i> TERRAIN</span>
        <span id="animationState">ANIMATION RUNNING</span>
      </div>
    </section>

    <aside class="panel telemetry-panel">
      <div class="eyebrow">05 / LIVE TELEMETRY</div>
      <h2>System Measurements</h2>

      <div class="telemetry"><span>Hydrostatic index</span><b id="pressure">0.71 MPa</b></div>
      <div class="telemetry"><span>Estimated discharge</span><b id="discharge">323 m³/s</b></div>
      <div class="telemetry"><span>Gate actuator</span><b id="actuator">35%</b></div>
      <div class="telemetry"><span>Inflow / outflow</span><b id="balance">+97 m³/s</b></div>

      <div class="separator"></div>
      <div class="eyebrow">06 / LIVE PERFORMANCE GRAPHS</div>
      <div class="charts-grid">
        <div class="metric-chart-card">
          <div class="chart-title">Flow trend <span>LIVE</span></div>
          <canvas id="chart" class="mini-chart"></canvas>
          <div class="chart-axis"><span>−60 SEC</span><span>NOW</span></div>
        </div>
        <div class="metric-chart-card">
          <div class="chart-title">Reservoir level <span>% FULL</span></div>
          <canvas id="levelChart" class="mini-chart"></canvas>
        </div>
        <div class="metric-chart-card">
          <div class="chart-title">Inflow vs outflow <span>m³/s</span></div>
          <canvas id="flowChart" class="mini-chart"></canvas>
          <div class="chart-legend"><span class="inflow-key">● Inflow</span><span class="outflow-key">● Outflow</span></div>
        </div>
        <div class="metric-chart-card">
          <div class="chart-title">Gate position <span>% OPEN</span></div>
          <canvas id="gateChart" class="mini-chart"></canvas>
        </div>
      </div>

      <div class="separator"></div>
      <div class="eyebrow">07 / SCENARIO COMPARISON</div>
      <p class="subtle">Compare estimated discharge across operating conditions.</p>
      <label>Compare with</label>
      <select id="compareScenario">
        <option value="normal">Normal inflow</option>
        <option value="monsoon">Monsoon inflow</option>
        <option value="drought">Low inflow</option>
        <option value="release">High discharge test</option>
      </select>
      <div class="telemetry"><span>Current discharge</span><b id="compareCurrent">—</b></div>
      <div class="telemetry"><span>Selected scenario</span><b id="compareTarget">—</b></div>
      <div class="telemetry"><span>Difference</span><b id="compareDifference">—</b></div>

      <div class="separator"></div>
      <div class="eyebrow">08 / FCG GRAPHICS LAB</div>
      <div class="lab-controls">
        <label class="toggle"><span>Wireframe mode</span><input id="wireframeToggle" type="checkbox"></label>
        <label class="toggle"><span>Show world axes</span><input id="axesToggle" type="checkbox"></label>
        <label class="toggle"><span>Show geometry grid</span><input id="gridToggle" type="checkbox" checked></label>
        <label class="toggle"><span>Enhanced lighting</span><input id="lightingToggle" type="checkbox" checked></label>
        <label class="toggle"><span>Show water particles</span><input id="particlesToggle" type="checkbox" checked></label>
      </div>

      <div class="pipeline"><span>Projection</span><b>Perspective</b></div>
      <div class="pipeline"><span>Geometry</span><b>3D meshes</b></div>
      <div class="pipeline"><span>Animation</span><b>Real time</b></div>

      <div class="separator"></div>
      <div class="eyebrow">09 / EVENT LOG</div>
      <div id="eventLog" class="event-log">
        <div>Simulation initialized</div>
        <div>Graphics renderer ready</div>
      </div>

      <div class="separator"></div>
      <div class="eyebrow">10 / ADVANCED DIGITAL TWIN</div>
      <div class="advanced-feature-grid">
        <button id="stormBtn" class="feature-btn">⛈ Start storm / flood test</button>
        <button id="stopStormBtn" class="feature-btn">☀ Clear weather</button>
        <button id="nightBtn" class="feature-btn">☾ Day / night</button>
        <button id="stressBtn" class="feature-btn">◇ Structural stress view</button>
        <button id="tourBtn" class="feature-btn">◉ Start camera tour</button>
      </div>
      <div class="sensor-readout" id="sensorReadout">Select a sensor marker or 3D component to inspect it.</div>
      <div class="telemetry"><span>Rainfall intensity</span><b id="rainStat">0 mm/h</b></div>
      <div class="telemetry"><span>Structural index</span><b id="stressStat">LOW · DEMO</b></div>
      <div class="telemetry"><span>Environment</span><b id="environmentStat">DAYLIGHT</b></div>

      <div class="separator"></div>
      <div class="eyebrow">11 / FLOOD INTELLIGENCE LAB</div>
      <div class="risk-card" id="riskCard">
        <div class="risk-head"><span>DOWNSTREAM RISK INDEX</span><b id="riskPercent">28%</b></div>
        <div class="risk-track"><div id="riskFill"></div></div>
        <div class="risk-status"><i id="riskDot"></i><b id="riskLabel">GUARDED · SIMULATION</b></div>
        <p id="riskExplanation">Illustrative risk score derived from demo reservoir level and inflow.</p>
        <div class="risk-zones"><span><i class="zone-green"></i>Normal</span><span><i class="zone-amber"></i>Watch</span><span><i class="zone-red"></i>Critical</span></div>
      </div>
      <div class="replay-title">SCENARIO QUICK-REPLAY</div>
      <div class="replay-grid">
        <button id="replayNormal" class="feature-btn">▶ Normal day</button>
        <button id="replayMonsoon" class="feature-btn">⛈ Monsoon surge</button>
        <button id="replayRelease" class="feature-btn">↘ Gate release</button>
        <button id="replayDrought" class="feature-btn">☀ Drought</button>
      </div>
      <p class="replay-note">Replay presets are illustrative scenarios, not operational forecasts. Flood-zone rings in the 3D view are visual cues only.</p>

      <div class="concept">
        <b>FCG LEARNING NOTE</b>
        <p>Demonstrates 3D transformations, perspective projection, lighting, materials, particle animation and interactive visualization.</p>
      </div>
    </aside>
  </main>

  <footer><span>DAMWATCH 3D · FCG MINI-PROJECT</span><span>SIMULATED DATA · BUILD 4.0 FLOOD INTELLIGENCE</span></footer>
</div>`;

// Organize the existing dashboard into separate workspaces without recreating the Three.js scene.
(function setupTabLayout() {
  const dashboard = $('.dashboard');
  const controlsPanel = $('.controls-panel');
  const viewportPanel = $('.viewport');
  const telemetryPanel = $('.telemetry-panel');
  if (!dashboard || !controlsPanel || !viewportPanel || !telemetryPanel) return;

  const nav = document.createElement('nav');
  nav.className = 'workspace-tabs';
  nav.setAttribute('aria-label', 'DAMWATCH workspaces');
  nav.innerHTML = `
    <button class="workspace-tab active" data-tab="overview" aria-selected="true"><span class="tab-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3.5 10.5 12 3.8l8.5 6.7M5.5 9.5v10h13v-10M9.5 19.5v-6h5v6"/></svg></span><span class="tab-label">Overview</span></button>
    <button class="workspace-tab" data-tab="analytics" aria-selected="false"><span class="tab-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 17.5 8 12l4 3 7-8M15 7h4v4"/></svg></span><span class="tab-label">Analytics</span></button>
    <button class="workspace-tab" data-tab="control3d" aria-selected="false"><span class="tab-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 6h3M11 6h9M4 12h3M11 12h9M4 18h3M11 18h9"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></span><span class="tab-label">Dam Controls + 3D</span></button>
    <button class="workspace-tab" data-tab="system" aria-selected="false"><span class="tab-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 5h14M5 12h14M5 19h14"/></svg></span><span class="tab-label">Graphics & Events</span></button>`;
  dashboard.parentNode.insertBefore(nav, dashboard);

  const makePage = (id, extraClass = '') => {
    const page = document.createElement('section');
    page.className = `tab-page ${extraClass}`.trim();
    page.dataset.page = id;
    page.hidden = id !== 'overview';
    return page;
  };
  const overview = makePage('overview', 'overview-page');
  overview.innerHTML = `
    <div class="overview-hero panel">
      <div class="eyebrow">DAMWATCH / OPERATIONS OVERVIEW</div>
      <h2>Reservoir monitoring at a glance</h2>
      <p class="subtle">Explore the live digital twin, inspect telemetry trends, and adjust the simulated operating conditions from dedicated workspaces.</p>
      <div class="overview-status"><i class="status-dot" id="overviewStatusDot"></i><span id="overviewStatus">OPERATING NORMALLY</span><span class="overview-status-note">EDUCATIONAL SIMULATION</span></div>
      <div class="overview-metrics">
        <div class="overview-metric"><span>RESERVOIR LEVEL</span><b><span id="overviewLevel">72</span>%</b><small>Capacity estimate</small></div>
        <div class="overview-metric"><span>INFLOW</span><b id="overviewInflow">420 m³/s</b><small>Incoming water</small></div>
        <div class="overview-metric"><span>OUTFLOW</span><b id="overviewOutflow">323 m³/s</b><small>Estimated discharge</small></div>
        <div class="overview-metric"><span>GATE OPENING</span><b id="overviewGate">35%</b><small>Spillway position</small></div>
      </div>
    </div>
    <div class="overview-shortcuts">
      <button class="shortcut-card" data-go-tab="analytics"><span class="shortcut-icon">⌁</span><b>Open Analytics</b><small>View four full-size performance graphs</small><span class="shortcut-arrow">→</span></button>
      <button class="shortcut-card" data-go-tab="control3d"><span class="shortcut-icon">☷</span><b>Dam Controls + 3D</b><small>Adjust water level and gate opening beside the live 3D dam</small><span class="shortcut-arrow">→</span></button>
      <button class="shortcut-card" data-go-tab="control3d"><span class="shortcut-icon">▧</span><b>Open Live Dam Simulation</b><small>Control the dam and inspect its 3D animation together</small><span class="shortcut-arrow">→</span></button>
      <button class="shortcut-card" data-go-tab="system"><span class="shortcut-icon">≡</span><b>Graphics Lab & Events</b><small>Configure visual effects and review events</small><span class="shortcut-arrow">→</span></button>
    </div>
    <p class="overview-disclaimer">Simulated values are for an FCG educational demonstration only and must not be used for real dam operations.</p>`;

  const analytics = makePage('analytics', 'analytics-page');
  const control3d = makePage('control3d', 'control3d-page');
  const system = makePage('system', 'system-page');
  const analyticsPanel = document.createElement('aside');
  analyticsPanel.className = 'panel telemetry-panel analytics-panel';
  const systemPanel = document.createElement('aside');
  systemPanel.className = 'panel telemetry-panel system-panel';

  // Split the existing telemetry panel by its numbered section headings.
  const children = Array.from(telemetryPanel.children);
  let destination = analyticsPanel;
  children.forEach((child) => {
    if (child.classList.contains('eyebrow') && /^08\s*\//.test(child.textContent.trim())) {
      destination = systemPanel;
    }
    destination.appendChild(child);
  });

  // Keep the control panel and live 3D scene together so control changes
  // can be seen immediately without switching workspaces.
  control3d.appendChild(controlsPanel);
  control3d.appendChild(viewportPanel);
  analytics.appendChild(analyticsPanel);
  system.appendChild(systemPanel);
  dashboard.classList.add('tab-workspace');
  dashboard.replaceChildren(overview, analytics, control3d, system);

  function activateTab(id) {
    dashboard.querySelectorAll('.tab-page').forEach(page => {
      const active = page.dataset.page === id;
      page.hidden = !active;
      page.classList.toggle('active', active);
    });
    nav.querySelectorAll('.workspace-tab').forEach(button => {
      const active = button.dataset.tab === id;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    if (id === 'control3d') {
      requestAnimationFrame(() => {
        const host = $('#scene');
        if (host && host.clientWidth > 0) {
          const canvas = host.querySelector('canvas');
          if (canvas) {
            // The renderer's resize handler is also triggered by ResizeObserver.
            window.dispatchEvent(new Event('resize'));
          }
        }
      });
    }
    if (id === 'analytics') requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
  }

  nav.addEventListener('click', (event) => {
    const button = event.target.closest('[data-tab]');
    if (button) activateTab(button.dataset.tab);
  });
  overview.querySelectorAll('[data-go-tab]').forEach(button => {
    button.addEventListener('click', () => activateTab(button.dataset.goTab));
  });
})();

// Additional styling for the advanced controls and telemetry graphs.
const extraStyle = document.createElement('style');
extraStyle.textContent = `
  .advanced-controls { margin-top: 4px; }
  .advanced-controls input[type="range"] { accent-color: #39c9dd; }
  .charts-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; margin-top:12px; }
  .metric-chart-card { min-width:0; margin:0; padding:9px; border:1px solid rgba(130,190,210,.16); border-radius:10px; background:rgba(6,24,37,.42); overflow:hidden; }
  .metric-chart-card .chart-title { margin-bottom:6px; font-size:10px; white-space:nowrap; }
  .mini-chart { display:block; width:100%; height:78px; }
  .chart-title span { color:#56d9e6; font-size:9px; letter-spacing:.04em; }
  .chart-axis { display:flex; justify-content:space-between; color:#7195a5; font-size:8px; margin-top:3px; }
  .chart-legend { display:flex; justify-content:space-between; gap:4px; margin-top:4px; font-size:8px; white-space:nowrap; }
  .inflow-key { color:#42d5e8; } .outflow-key { color:#ffc05c; }
  @media (max-width:390px) { .charts-grid { grid-template-columns:1fr; } .mini-chart { height:90px; } }
  .lab-controls, .advanced-controls { min-width:0; }
  #autoFlowToggle, #autoCameraToggle { accent-color:#39c9dd; }
  button, select, input[type="range"] { transition: filter .18s ease, border-color .18s ease, background-color .18s ease; }
  button:hover { filter: brightness(1.12); }
  #scene canvas { display:block; }
  @media (prefers-reduced-motion: reduce) { button, select, input[type="range"] { transition:none; } }

  /* Multi-workspace navigation */
  .workspace-tabs { display:flex; flex-wrap:wrap; gap:8px; margin:0 0 16px; padding:8px; border:1px solid rgba(130,190,210,.17); border-radius:14px; background:rgba(5,20,32,.88); }
  .workspace-tab { display:flex; align-items:center; justify-content:center; gap:9px; flex:1 1 145px; min-height:44px; padding:10px 14px; border:1px solid transparent; border-radius:9px; background:transparent; color:#a9c2d0; font:inherit; font-size:12px; font-weight:700; cursor:pointer; }
  .workspace-tab:hover { background:rgba(63,190,213,.09); color:#eafaff; }
  /* Use consistent vector icons in fixed-width slots to prevent optical drift. */
  .workspace-tab { gap:8px; }
  .workspace-tab .tab-icon { display:inline-flex; flex:0 0 20px; width:20px; height:20px; align-items:center; justify-content:center; line-height:1; }
  .workspace-tab .tab-icon svg { display:block; width:18px; height:18px; fill:none; stroke:currentColor; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }
  .workspace-tab .tab-label { display:inline-block; flex:0 0 auto; text-align:left; white-space:nowrap; line-height:1.25; }
  @media (max-width:480px) { .workspace-tab { gap:7px; } .workspace-tab .tab-icon { flex-basis:18px; width:18px; } .workspace-tab .tab-icon svg { width:17px; height:17px; } }
  .workspace-tab.active { color:#eaffff; border-color:rgba(66,213,232,.34); background:linear-gradient(135deg,rgba(32,151,178,.24),rgba(28,79,105,.35)); box-shadow:inset 0 0 0 1px rgba(66,213,232,.05); }
  /* Final alignment override: keep every tab icon and label on one horizontal line. */
  .workspace-tabs .workspace-tab {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    align-items: center !important;
    justify-content: center !important;
    column-gap: 9px !important;
    text-align: center !important;
  }
  .workspace-tabs .workspace-tab .tab-icon {
    display: inline-flex !important;
    flex: 0 0 20px !important;
    width: 20px !important;
    height: 20px !important;
    margin: 0 !important;
    align-self: center !important;
  }
  .workspace-tabs .workspace-tab .tab-label {
    display: inline-block !important;
    flex: 0 0 auto !important;
    margin: 0 !important;
    line-height: 1.25 !important;
    white-space: nowrap !important;
    align-self: center !important;
  }
  .workspace-tab[aria-selected="true"] { outline:none; }
  .tab-workspace { display:block !important; min-width:0; }
  .tab-page[hidden] { display:none !important; }
  .tab-page.active { display:grid; grid-template-columns:minmax(0,1fr); gap:16px; min-width:0; align-items:start; }
  .tab-page > .panel, .tab-page > aside.panel { width:100%; min-width:0; box-sizing:border-box; }
  .control3d-page.active { grid-template-columns:minmax(300px,0.82fr) minmax(0,1.45fr) !important; align-items:stretch; }
  .control3d-page > .controls-panel { max-width:none; margin:0; }
  .control3d-page .viewport { min-width:0; min-height:650px; }
  .control3d-page #scene { min-height:520px; }
  .analytics-page { grid-template-columns:minmax(0,1fr) !important; }
  .analytics-panel { max-width:none; }
  .analytics-panel .charts-grid { grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; }
  .analytics-panel .metric-chart-card { padding:16px; }
  .analytics-panel .metric-chart-card .chart-title { font-size:12px; }
  .analytics-panel .mini-chart { height:170px; }
  .analytics-panel .chart-axis, .analytics-panel .chart-legend { font-size:10px; }
  .system-page { grid-template-columns:minmax(0,1fr) !important; }
  .system-panel { max-width:1100px; margin:0 auto; }
  .overview-hero { padding:clamp(20px,3vw,34px); background:linear-gradient(135deg,rgba(14,48,65,.96),rgba(8,25,39,.98)); }
  .overview-hero h2 { margin:8px 0 10px; font-size:clamp(23px,3vw,34px); }
  .overview-hero > .subtle { max-width:760px; line-height:1.7; }
  .overview-status { display:flex; align-items:center; flex-wrap:wrap; gap:9px; margin:22px 0; color:#73e4bc; font-size:11px; font-weight:800; letter-spacing:.08em; }
  .overview-status .status-dot { display:inline-block; }
  .overview-status-note { margin-left:auto; color:#85a8b9; font-size:9px; }
  .overview-metrics { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; }
  .overview-metric { min-width:0; padding:17px; border:1px solid rgba(130,190,210,.16); border-radius:12px; background:rgba(3,18,29,.46); }
  .overview-metric > span { display:block; color:#8fb0bf; font-size:9px; letter-spacing:.09em; }
  .overview-metric b { display:block; margin:11px 0 7px; color:#e7fbff; font-size:clamp(18px,2.3vw,27px); overflow-wrap:anywhere; }
  .overview-metric small { color:#7f9eae; font-size:10px; }
  .overview-shortcuts { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; }
  .shortcut-card { position:relative; display:flex; flex-direction:column; align-items:flex-start; gap:8px; min-width:0; min-height:145px; padding:22px; border:1px solid rgba(130,190,210,.18); border-radius:13px; background:rgba(7,25,39,.8); color:#e7f7fb; text-align:left; cursor:pointer; }
  .shortcut-card:hover { border-color:rgba(66,213,232,.55); background:rgba(15,47,65,.92); }
  .shortcut-icon { color:#42d5e8; font-size:23px; }
  .shortcut-card b { font-size:14px; }
  .shortcut-card small { max-width:90%; color:#91adbb; font-size:11px; line-height:1.6; }
  .shortcut-arrow { position:absolute; right:20px; top:22px; color:#42d5e8; font-size:20px; }
  .overview-disclaimer { margin:0; color:#7796a6; font-size:10px; line-height:1.6; }
  @media (max-width:1100px) { .control3d-page.active { grid-template-columns:minmax(0,1fr) !important; } .control3d-page .controls-panel { max-width:none; } .control3d-page .viewport { min-height:560px; } .control3d-page #scene { min-height:440px; } }
  @media (max-width:760px) { .overview-metrics { grid-template-columns:repeat(2,minmax(0,1fr)); } .analytics-panel .charts-grid { grid-template-columns:1fr; } .analytics-panel .mini-chart { height:145px; } .control3d-page .viewport { min-height:520px; } .control3d-page #scene { min-height:420px; } }
  @media (max-width:480px) { .workspace-tab { flex-basis:calc(50% - 8px); padding:9px 7px; } .workspace-tab .tab-label { font-size:10px; } .overview-shortcuts { grid-template-columns:1fr; } .overview-metric { padding:13px; } }

  /* Readability upgrade: larger, clearer text throughout every workspace */
  .tab-workspace { font-size:15px; }
  .tab-workspace :is(p, li, label, input, select, option, textarea, button, small, .subtle, .eyebrow, .section-label, .status, .badge, .metric-label, .metric-value, .control-label, .control-value, .event-log, .event-item, .learning-note) { font-size:14px !important; }
  .tab-workspace :is(h1, h2, h3, h4, .panel-title, .section-title) { line-height:1.35; }
  .tab-workspace :is(h2, .panel-title) { font-size:clamp(21px, 2vw, 27px) !important; }
  .tab-workspace :is(h3, .section-title) { font-size:18px !important; }
  .tab-workspace .eyebrow { font-size:12px !important; letter-spacing:.09em; }
  .workspace-tab { font-size:15px !important; min-height:50px; }
  .workspace-tab .tab-label { font-size:15px !important; }
  .overview-status { font-size:13px !important; }
  .overview-status-note { font-size:12px !important; }
  .overview-metric > span { font-size:12px !important; line-height:1.5; }
  .overview-metric b { font-size:clamp(22px, 2.5vw, 30px) !important; }
  .overview-metric small, .shortcut-card small, .overview-disclaimer { font-size:13px !important; line-height:1.65; }
  .shortcut-card b { font-size:17px !important; }
  .metric-chart-card .chart-title, .analytics-panel .metric-chart-card .chart-title { font-size:15px !important; }
  .chart-title span { font-size:12px !important; }
  .analytics-panel .chart-axis, .analytics-panel .chart-legend { font-size:12px !important; }
  .analytics-panel .metric-chart-card { padding:18px; }
  .tab-workspace input[type="range"] { min-height:24px; }
  .tab-workspace :is(button, select) { min-height:40px; }
  @media (max-width:760px) {
    .tab-workspace { font-size:14px; }
    .tab-workspace :is(p, li, label, input, select, option, textarea, button, small, .subtle, .metric-label, .metric-value, .control-label, .control-value, .event-log, .event-item) { font-size:13px !important; }
    .workspace-tab, .workspace-tab .tab-label { font-size:13px !important; }
  }

  /* EXTRA-LARGE ACCESSIBILITY PASS: override smaller styles from the original dashboard */
  .tab-workspace { font-size:18px !important; line-height:1.65; }
  .tab-workspace :is(p, li, label, input, select, option, textarea, button, small, .subtle, .eyebrow, .section-label, .status, .badge, .metric-label, .metric-value, .control-label, .control-value, .event-log, .event-item, .learning-note, .chart-axis, .chart-legend) { font-size:17px !important; line-height:1.55; }
  .tab-workspace :is(h1) { font-size:clamp(28px, 3vw, 38px) !important; }
  .tab-workspace :is(h2, .panel-title) { font-size:clamp(25px, 2.4vw, 32px) !important; line-height:1.35; }
  .tab-workspace :is(h3, .section-title) { font-size:22px !important; line-height:1.4; }
  .tab-workspace .eyebrow { font-size:14px !important; }
  .workspace-tabs { gap:10px; padding:10px; }
  .workspace-tab, .workspace-tab .tab-label { font-size:18px !important; min-height:56px; }
  .overview-status { font-size:16px !important; }
  .overview-status-note { font-size:15px !important; }
  .overview-metric > span { font-size:15px !important; line-height:1.5; }
  .overview-metric b { font-size:clamp(25px, 2.8vw, 34px) !important; }
  .overview-metric small, .shortcut-card small, .overview-disclaimer { font-size:15px !important; line-height:1.7; }
  .shortcut-card b { font-size:20px !important; }
  .shortcut-icon { font-size:27px !important; }
  .metric-chart-card .chart-title, .analytics-panel .metric-chart-card .chart-title { font-size:18px !important; white-space:normal; }
  .chart-title span { font-size:15px !important; }
  .analytics-panel .chart-axis, .analytics-panel .chart-legend { font-size:15px !important; }
  .analytics-panel .metric-chart-card { padding:20px; }
  .tab-workspace input[type="range"] { min-height:30px; }
  .tab-workspace :is(button, select, input:not([type="range"]), textarea) { min-height:46px; }
  @media (max-width:760px) {
    .tab-workspace :is(p, li, label, input, select, option, textarea, button, small, .subtle, .eyebrow, .metric-label, .metric-value, .control-label, .control-value, .event-log, .event-item, .chart-axis, .chart-legend) { font-size:16px !important; }
    .workspace-tab, .workspace-tab .tab-label { font-size:16px !important; }
    .overview-metrics { grid-template-columns:repeat(2,minmax(0,1fr)); }
  }
`;
document.head.appendChild(extraStyle);

// Final tab alignment fix: force each tab icon and its label to stay on one row.
const tabAlignmentStyle = document.createElement('style');
tabAlignmentStyle.textContent = `
  .workspace-tabs {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: wrap !important;
    align-items: stretch !important;
  }
  /* Tab typography only: keep all dashboard content and styling unchanged. */
  .workspace-tabs > .workspace-tab,
  .workspace-tabs > .workspace-tab > .tab-label {
    font-family: 'Trebuchet MS', 'Segoe UI', sans-serif !important;
    font-weight: 600 !important;
    letter-spacing: 0.015em !important;
  }
  .workspace-tabs > .workspace-tab {
    display: inline-flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 9px !important;
    white-space: nowrap !important;
    text-align: center !important;
    min-width: 0 !important;
  }
  .workspace-tabs > .workspace-tab > .tab-icon {
    display: inline-flex !important;
    flex: 0 0 20px !important;
    width: 20px !important;
    height: 20px !important;
    align-items: center !important;
    justify-content: center !important;
    margin: 0 !important;
  }
  .workspace-tabs > .workspace-tab > .tab-icon > svg {
    display: block !important;
    width: 18px !important;
    height: 18px !important;
  }
  .workspace-tabs > .workspace-tab > .tab-label {
    display: inline-block !important;
    flex: 0 0 auto !important;
    white-space: nowrap !important;
    text-align: left !important;
    line-height: 1.25 !important;
    margin: 0 !important;
  }
  @media (max-width: 560px) {
    .workspace-tabs { gap: 7px !important; padding: 8px !important; }
    .workspace-tabs > .workspace-tab { flex: 1 1 calc(50% - 7px) !important; padding: 10px 7px !important; gap: 7px !important; }
    .workspace-tabs > .workspace-tab > .tab-label { font-size: 13px !important; }
  }
`;

document.head.appendChild(tabAlignmentStyle);

// Styles for the advanced digital-twin controls. Kept inside main.js so the
// existing style.css and dashboard theme do not need to be replaced.
const advancedFeatureStyle = document.createElement('style');
advancedFeatureStyle.textContent = `
  .advanced-feature-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin:12px 0; }
  .advanced-feature-grid .feature-btn { border:1px solid rgba(111,190,211,.25); border-radius:9px; padding:10px 9px; background:rgba(29,69,82,.5); color:inherit; font:600 11px/1.35 inherit; cursor:pointer; text-align:left; transition:transform .18s ease, background .18s ease, border-color .18s ease; }
  .advanced-feature-grid .feature-btn:hover { transform:translateY(-1px); background:rgba(43,112,130,.65); border-color:rgba(87,220,236,.65); }
  .advanced-feature-grid .feature-btn.active { background:rgba(22,119,101,.6); border-color:rgba(81,236,176,.7); }
  .sensor-readout { padding:10px 11px; margin:8px 0 12px; border-radius:9px; border:1px solid rgba(102,191,212,.2); background:rgba(9,26,35,.55); color:#b7d4df; font-size:11px; line-height:1.5; }
  #scene canvas { display:block; width:100%; height:100%; outline:none; }
  .scene-chip { pointer-events:none; }
  @media(max-width:560px) { .advanced-feature-grid { grid-template-columns:1fr; } }
`;

document.head.appendChild(advancedFeatureStyle);
const floodLabStyle = document.createElement('style');
floodLabStyle.textContent = `
  .risk-card { margin-top:10px; padding:13px; border:1px solid rgba(95,191,209,.24); border-radius:12px; background:linear-gradient(145deg,rgba(8,32,45,.94),rgba(15,49,60,.7)); box-shadow:inset 0 1px rgba(255,255,255,.035); }
  .risk-head { display:flex; justify-content:space-between; align-items:center; gap:8px; font-size:10px; letter-spacing:.08em; color:#9dc4d2; }
  .risk-head b { color:#eafaff; font-size:24px; letter-spacing:0; font-variant-numeric:tabular-nums; }
  .risk-track { height:8px; background:#193c49; border-radius:20px; overflow:hidden; margin:10px 0; }
  #riskFill { height:100%; width:28%; background:linear-gradient(90deg,#43e0a0,#ffd166,#ff5265); border-radius:20px; transition:width .35s ease; }
  .risk-status { display:flex; align-items:center; gap:7px; font-size:11px; color:#cfe5ec; }
  .risk-status i { width:8px; height:8px; border-radius:50%; background:#43e0a0; box-shadow:0 0 10px currentColor; }
  #riskExplanation,.replay-note { color:#8fb0be; font-size:10px; line-height:1.5; margin:8px 0; }
  .risk-zones { display:flex; gap:12px; flex-wrap:wrap; color:#91b4c0; font-size:9px; }
  .risk-zones span { display:flex; align-items:center; gap:5px; }
  .risk-zones i { width:7px; height:7px; display:inline-block; border-radius:50%; }
  .zone-green { background:#43e0a0; }.zone-amber { background:#ffd166; }.zone-red { background:#ff5265; }
  .replay-title { color:#79a9b9; font-size:10px; letter-spacing:.1em; margin:14px 0 8px; }
  .replay-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:7px; }
  .replay-grid button { font-size:10px !important; }
  .replay-grid button:focus-visible { outline:2px solid #61e4f0; outline-offset:2px; }
`;
document.head.appendChild(floodLabStyle);

const cinematicUiStyle = document.createElement('style');
cinematicUiStyle.textContent = `
  .cinematic-tools{position:absolute;z-index:5;top:12px;left:50%;transform:translateX(-50%);display:flex;gap:6px;flex-wrap:wrap;justify-content:center;width:max-content;max-width:calc(100% - 24px);pointer-events:auto}
  .cinematic-tools button{border:1px solid rgba(166,225,239,.32);border-radius:999px;background:rgba(5,22,34,.76);color:#dff8ff;padding:7px 10px;font:600 10px/1.2 inherit;letter-spacing:.02em;backdrop-filter:blur(9px);cursor:pointer;box-shadow:0 5px 18px rgba(0,0,0,.16);transition:background .2s,border-color .2s,transform .2s}
  .cinematic-tools button:hover,.cinematic-tools button.active{background:rgba(28,129,151,.82);border-color:#73e6f4;transform:translateY(-1px)}
  @media(max-width:700px){.cinematic-tools{top:8px;gap:4px}.cinematic-tools button{padding:6px 8px;font-size:9px}}
`;
document.head.appendChild(cinematicUiStyle);

const sceneHost = $('#scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#a9ccd5');
scene.fog = new THREE.Fog('#a9ccd5', 90, 220);

const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 500);
const cameraViews = {
  hero: new THREE.Vector3(31, 20, 34),
  front: new THREE.Vector3(0, 13, 48),
  upstream: new THREE.Vector3(0, 25, -40),
  top: new THREE.Vector3(0, 65, 0)
};
camera.position.copy(cameraViews.hero);
const cameraTargetPosition = cameraViews.hero.clone();
let cameraTransitionActive = false; // Only move camera automatically during preset/reset transitions.
const cameraLookTarget = new THREE.Vector3(0, 5, 0);
let cameraSmoothing = 0.08;
let autoCameraDrift = false;
let autoFlowVariation = false;
let simulationSpeed = 1;
let rippleStrength = 1;

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
sceneHost.prepend(renderer.domElement);

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.target.set(0, 5, 0);
orbit.enableDamping = true;
orbit.dampingFactor = 0.06;
orbit.minDistance = 12;
orbit.maxDistance = 90;
orbit.maxPolarAngle = Math.PI * 0.48;

// Manual mouse/touch control takes priority over camera presets.
orbit.addEventListener('start', () => {
  cameraTransitionActive = false;
  autoCameraDrift = false;
  const autoCameraToggle = $('#autoCameraToggle');
  if (autoCameraToggle) autoCameraToggle.checked = false;
});

const ambient = new THREE.HemisphereLight('#e1f5ff', '#66715b', 1.8);
scene.add(ambient);

const sun = new THREE.DirectionalLight('#fff1d5', 3.0);
sun.position.set(-25, 38, 24);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -48;
sun.shadow.camera.right = 48;
sun.shadow.camera.top = 48;
sun.shadow.camera.bottom = -48;
sun.shadow.bias = -0.00025;
scene.add(sun);

const fill = new THREE.DirectionalLight('#7bc9f4', 1.1);
fill.position.set(25, 15, -25);
scene.add(fill);

const material = (color, roughness = 0.8, metalness = 0) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

const concrete = material('#aeb9bd');
const concreteSide = material('#84959d');
const rockA = material('#7e8f78');
const rockB = material('#9ca58a');
const ground = material('#829077');
const road = material('#455159');
const metal = material('#c8a66f', 0.38, 0.65);
const darkMetal = material('#4e626c', 0.42, 0.6);

const originalMaterials = new Map();

function registerMaterial(mat) {
  if (!originalMaterials.has(mat)) {
    originalMaterials.set(mat, mat.wireframe || false);
  }
  return mat;
}

function box(parent, name, x, y, z, w, h, d, mat, castShadow = true) {
  registerMaterial(mat);
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.name = name;
  mesh.position.set(x, y, z);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function rock(x, z, height, radius, mat, rotation = 0) {
  registerMaterial(mat);
  const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(radius, 1), mat);
  mesh.position.set(x, height * 0.34, z);
  mesh.scale.set(1.2, height / radius * 0.65, 1);
  mesh.rotation.set(rotation * 0.4, rotation, rotation * 0.25);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

// Ground and valley.
box(scene, 'Valley foundation', 0, -1.5, 0, 105, 3, 86, ground);

for (let i = 0; i < 19; i++) {
  const x = -44 + i * 4.9;
  rock(x, -24 - Math.sin(i * 0.8) * 5, 7 + (i % 4) * 1.5, 5 + (i % 3), i % 2 ? rockA : rockB, i * 0.7);
  rock(x + 1.5, 25 + Math.cos(i * 0.7) * 4, 6 + (i % 3) * 2, 5.5, i % 3 ? rockB : rockA, i * 0.4);
}

for (let i = 0; i < 16; i++) {
  const peak = new THREE.Mesh(
    new THREE.ConeGeometry(5 + (i % 3), 9 + (i % 4) * 2, 5),
    i % 2 ? rockA : rockB
  );
  peak.position.set(-38 + i * 5.1, 3.5 + (i % 4), -34 - (i % 3) * 2);
  peak.rotation.y = i * 0.47;
  peak.scale.z = 1.6;
  peak.castShadow = true;
  scene.add(peak);
}

// Dam body.
const profile = new THREE.Shape();
profile.moveTo(-22, 0);
profile.lineTo(22, 0);
profile.lineTo(18.4, 13.5);
profile.lineTo(16.8, 14);
profile.lineTo(-16.8, 14);
profile.lineTo(-18.4, 13.5);
profile.closePath();

const dam = new THREE.Mesh(
  new THREE.ExtrudeGeometry(profile, {
    depth: 5.4,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.22,
    bevelThickness: 0.18,
    steps: 1
  }),
  concrete
);
dam.position.z = -2.7;
dam.castShadow = true;
dam.receiveShadow = true;
dam.name = 'Main concrete dam';
scene.add(dam);
registerMaterial(concrete);

for (let i = 0; i < 9; i++) {
  const buttress = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 1.8, 10, 4),
    concreteSide
  );
  buttress.position.set(-17 + i * 4.25, 5, 3);
  buttress.scale.z = 1.5;
  buttress.rotation.y = Math.PI / 4;
  buttress.castShadow = true;
  scene.add(buttress);
}

box(scene, 'Crest deck', 0, 13.45, -0.1, 38, 0.7, 6.4, concreteSide);
box(scene, 'Upstream parapet', 0, 14, -2.7, 37, 0.5, 0.24, concrete);
box(scene, 'Downstream parapet', 0, 14, 2.5, 37, 0.5, 0.24, concrete);
box(scene, 'Crest road', 0, 13.83, 0, 34, 0.06, 2.3, road, false);

for (let x = -16; x <= 16; x += 4) {
  box(scene, 'Road marking', x, 13.87, 0, 1.6, 0.025, 0.09, material('#f2e5c2'), false);
}

// Animated reservoir surface.
const waterGeo = new THREE.PlaneGeometry(78, 37, 100, 55);
waterGeo.rotateX(-Math.PI / 2);

const waterMat = new THREE.MeshPhysicalMaterial({
  color: '#158dc4',
  roughness: 0.19,
  metalness: 0.12,
  transparent: true,
  opacity: 0.91,
  clearcoat: 0.85,
  clearcoatRoughness: 0.2,
  side: THREE.DoubleSide
});

const water = new THREE.Mesh(waterGeo, waterMat);
water.position.set(0, 8.86, -22);
water.receiveShadow = true;
scene.add(water);
const waterBase = waterGeo.attributes.position.array.slice();

const riverGeo = new THREE.PlaneGeometry(74, 25, 90, 32);
riverGeo.rotateX(-Math.PI / 2);

const riverMat = new THREE.MeshPhysicalMaterial({
  color: '#258fb8',
  roughness: 0.22,
  metalness: 0.1,
  transparent: true,
  opacity: 0.9,
  clearcoat: 0.7,
  side: THREE.DoubleSide
});

const river = new THREE.Mesh(riverGeo, riverMat);
river.position.set(0, 0.25, 19);
scene.add(river);
const riverBase = riverGeo.attributes.position.array.slice();

// Three gate assemblies.
const gates = [];

box(scene, 'Spillway apron', 0, 0.1, 5.3, 20, 0.45, 12, concreteSide);

for (let i = 0; i < 3; i++) {
  const x = (i - 1) * 5.5;
  box(scene, 'Gate pier', x - 2.45, 5.8, 2.2, 0.65, 11, 4.4, concrete);
  box(scene, 'Gate pier', x + 2.45, 5.8, 2.2, 0.65, 11, 4.4, concrete);
  box(scene, 'Gate header', x, 11.3, 2.2, 5.4, 0.65, 4.5, concreteSide);
  box(scene, 'Gate guide', x, 7.7, 0.15, 4.6, 8.2, 0.18, darkMetal);

  const gate = box(scene, 'Animated sluice gate', x, 5, 0.45, 4.35, 4.3, 0.32, metal);
  gate.userData.closedY = 5;
  gates.push(gate);

  box(scene, 'Gate rib', x, 5, 0.25, 0.12, 4.05, 0.12, darkMetal);

  const motor = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38, 0.38, 1.1, 16),
    darkMetal
  );
  motor.rotation.z = Math.PI / 2;
  motor.position.set(x, 14.8, -0.4);
  motor.castShadow = true;
  scene.add(motor);

  const beacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 14, 10),
    new THREE.MeshStandardMaterial({
      color: '#ffc15b',
      emissive: '#965000',
      emissiveIntensity: 1.4
    })
  );
  beacon.position.set(x, 14.4, 0.35);
  scene.add(beacon);
}

for (let i = 0; i < 28; i++) {
  rock(-34 + i * 2.5, 31 + Math.sin(i) * 2, 1.1 + (i % 3) * 0.4, 0.8 + (i % 2) * 0.4, i % 2 ? rockA : rockB, i);
}

// Trees.
const trunkMat = material('#604c3c');
const leafMats = [material('#355f4c'), material('#477456'), material('#70885b')];

for (let i = 0; i < 54; i++) {
  const side = i % 2 ? -1 : 1;
  const x = (Math.random() - 0.5) * 88;
  const z = side * (27 + Math.random() * 12);
  const h = 1.6 + Math.random() * 1.7;

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.2, h * 0.6, 7),
    trunkMat
  );
  trunk.position.set(x, h * 0.3, z);
  trunk.castShadow = true;
  scene.add(trunk);

  const crown = new THREE.Mesh(
    new THREE.ConeGeometry(0.75 + Math.random() * 0.45, h, 8),
    leafMats[i % 3]
  );
  crown.position.set(x, h * 0.72, z);
  crown.castShadow = true;
  scene.add(crown);
}

// Downstream discharge particles.
const particleCount = 850;
const particleArray = new Float32Array(particleCount * 3);
const particleSpeed = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
  particleArray[i * 3] = (Math.random() - 0.5) * 14;
  particleArray[i * 3 + 1] = 0.5 + Math.random() * 3;
  particleArray[i * 3 + 2] = 3 + Math.random() * 16;
  particleSpeed[i] = 0.7 + Math.random() * 2;
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(particleArray, 3));

const particleMat = new THREE.PointsMaterial({
  color: '#e2faff',
  size: 0.16,
  transparent: true,
  opacity: 0.88
});

const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// NEW: Stylized animated spillway jets.
const jets = [];
const jetGroup = new THREE.Group();
scene.add(jetGroup);

for (let i = 0; i < 3; i++) {
  const jetMaterial = new THREE.MeshStandardMaterial({
    color: '#7be8ff',
    emissive: '#137da7',
    emissiveIntensity: 0.45,
    transparent: true,
    opacity: 0.65,
    roughness: 0.18,
    side: THREE.DoubleSide
  });

  const jet = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.72, 1, 12, 1, true),
    jetMaterial
  );

  jet.position.set((i - 1) * 5.5, 2, 7);
  jet.rotation.x = -0.5;
  jetGroup.add(jet);
  jets.push(jet);
}

const splashCount = 240;
const splashPositions = new Float32Array(splashCount * 3);
const splashSpeeds = new Float32Array(splashCount);

for (let i = 0; i < splashCount; i++) {
  splashPositions[i * 3] = (Math.random() - 0.5) * 12;
  splashPositions[i * 3 + 1] = Math.random() * 2;
  splashPositions[i * 3 + 2] = 6 + Math.random() * 10;
  splashSpeeds[i] = 0.4 + Math.random() * 1.8;
}

const splashGeometry = new THREE.BufferGeometry();
splashGeometry.setAttribute('position', new THREE.BufferAttribute(splashPositions, 3));

const splashMaterial = new THREE.PointsMaterial({
  color: '#e5fbff',
  size: 0.19,
  transparent: true,
  opacity: 0.9
});

const splashes = new THREE.Points(splashGeometry, splashMaterial);
scene.add(splashes);

// Graphics grid and coordinate axes.
const grid = new THREE.GridHelper(100, 50, '#d8eee1', '#d8eee1');
grid.position.y = 0.025;
grid.material.transparent = true;
grid.material.opacity = 0.16;
scene.add(grid);

const axes = new THREE.AxesHelper(12);
axes.position.set(0, 0.2, 0);
axes.visible = false;
scene.add(axes);

// Simulation state.
let level = 72;
let opening = 35;
let inflow = 420;
let paused = false;
let time = 0;
let lightingEnabled = true;
let particlesEnabled = true;
let wireframeEnabled = false;

let chartData = Array.from({ length: 40 }, (_, i) => 180 + 60 * Math.sin(i * 0.36) + i * 2);
let levelChartData = Array.from({ length: 40 }, (_, i) => 68 + 4 * Math.sin(i * 0.24));
let inflowChartData = Array.from({ length: 40 }, (_, i) => 400 + 30 * Math.sin(i * 0.28));
let outflowChartData = Array.from({ length: 40 }, (_, i) => 300 + 24 * Math.cos(i * 0.25));
let gateChartData = Array.from({ length: 40 }, (_, i) => 34 + 3 * Math.sin(i * 0.2));
let autoFlowClock = 0;
let lastTelemetrySample = 0;

function calculateDischarge() {
  return Math.round(inflow * (0.15 + opening / 100 * 1.55));
}

function addEvent(message) {
  const log = $('#eventLog');
  const entry = document.createElement('div');
  entry.textContent = `${new Date().toLocaleTimeString()} — ${message}`;
  log.prepend(entry);

  while (log.children.length > 5) {
    log.lastElementChild.remove();
  }
}

const comparisonScenarios = {
  normal: { label: 'Normal inflow', level: 62, opening: 30, inflow: 350 },
  monsoon: { label: 'Monsoon inflow', level: 88, opening: 72, inflow: 820 },
  drought: { label: 'Low inflow', level: 22, opening: 18, inflow: 130 },
  release: { label: 'High discharge test', level: 78, opening: 95, inflow: 650 }
};

function updateComparison() {
  const selectedKey = $('#compareScenario').value;
  const selected = comparisonScenarios[selectedKey] || comparisonScenarios.normal;
  const currentDischarge = calculateDischarge();
  const targetDischarge = Math.round(
    selected.inflow * (0.15 + selected.opening / 100 * 1.55)
  );
  const difference = targetDischarge - currentDischarge;

  $('#compareCurrent').textContent = `${currentDischarge} m³/s`;
  $('#compareTarget').textContent = `${targetDischarge} m³/s`;
  $('#compareDifference').textContent =
    `${difference > 0 ? '+' : ''}${difference} m³/s`;
  $('#compareDifference').style.color =
    difference > 0 ? '#ffc05c' : difference < 0 ? '#62dfb1' : '#e0edf4';
}

function updateDashboard() {
  const outflow = calculateDischarge();

  $('#levelNum').textContent = level;
  $('#levelMeter').style.width = `${level}%`;
  $('#levelLabel').textContent = `${level}%`;
  $('#gateLabel').textContent = `${opening}%`;
  $('#flowLabel').textContent = `${inflow} m³/s`;
  $('#elevation').textContent = `${(100 + level * 0.59).toFixed(1)} m`;
  $('#gateStat').textContent = `${opening}%`;
  $('#inflowStat').textContent = `${inflow} m³/s`;
  $('#outflowStat').textContent = `${outflow} m³/s`;
  $('#pressure').textContent = `${(level * 0.0099).toFixed(2)} MPa`;
  $('#discharge').textContent = `${outflow} m³/s`;
  $('#actuator').textContent = `${opening}%`;
  $('#balance').textContent =
    `${inflow - outflow >= 0 ? '+' : ''}${inflow - outflow} m³/s`;
  $('#overviewLevel').textContent = level;
  $('#overviewInflow').textContent = `${inflow} m³/s`;
  $('#overviewOutflow').textContent = `${outflow} m³/s`;
  $('#overviewGate').textContent = `${opening}%`;

  water.userData.targetY = 1.3 + level * 0.105;
  waterMat.color.setHSL(0.55, 0.76, 0.32 + level * 0.001);

  gates.forEach((gate) => {
    gate.userData.targetY = gate.userData.closedY + opening * 0.036;
  });

  if (level >= 85 || inflow >= 750) {
    $('#statusTitle').textContent = 'HIGH-WATER SCENARIO';
    $('#alertText').textContent = 'Illustrative high-water alert: inspect the selected scenario.';
    $('#statusDot').className = 'status-dot warning';
  } else if (level <= 25 || inflow <= 150) {
    $('#statusTitle').textContent = 'LOW-WATER SCENARIO';
    $('#alertText').textContent = 'Illustrative low-water alert: reservoir storage is low.';
    $('#statusDot').className = 'status-dot warning';
  } else {
    $('#statusTitle').textContent = 'OPERATING NORMALLY';
    $('#alertText').textContent = 'Demo parameters are within the normal display range.';
    $('#statusDot').className = 'status-dot';
  }
  $('#overviewStatus').textContent = $('#statusTitle').textContent;
  $('#overviewStatusDot').className = $('#statusDot').className;

  updateComparison();
}

$('#compareScenario').addEventListener('change', () => {
  updateComparison();
  addEvent(`Comparison scenario: ${$('#compareScenario').selectedOptions[0].text}`);
});

$('#levelSlider').addEventListener('input', (e) => {
  level = Number(e.target.value);
  $('#scenario').value = 'custom';
  updateDashboard();
});

$('#gateSlider').addEventListener('input', (e) => {
  opening = Number(e.target.value);
  $('#scenario').value = 'custom';
  updateDashboard();
  addEvent(`Gate opening changed to ${opening}%`);
});

$('#flowSlider').addEventListener('input', (e) => {
  inflow = Number(e.target.value);
  $('#scenario').value = 'custom';
  updateDashboard();
});

$('#scenario').addEventListener('change', (e) => {
  const scenarios = {
    normal: [62, 30, 350],
    monsoon: [88, 72, 820],
    drought: [22, 18, 130],
    release: [78, 95, 650]
  };

  if (scenarios[e.target.value]) {
    [level, opening, inflow] = scenarios[e.target.value];
    $('#levelSlider').value = level;
    $('#gateSlider').value = opening;
    $('#flowSlider').value = inflow;
    updateDashboard();
    addEvent(`Scenario selected: ${e.target.options[e.target.selectedIndex].text}`);
  }
});

$('#speedSlider').addEventListener('input', (e) => {
  simulationSpeed = Number(e.target.value);
  $('#speedLabel').textContent = `${simulationSpeed.toFixed(2).replace(/0$/, '')}×`;
  addEvent(`Simulation speed set to ${simulationSpeed}x`);
});

$('#smoothSlider').addEventListener('input', (e) => {
  cameraSmoothing = Number(e.target.value);
  orbit.dampingFactor = cameraSmoothing;
  $('#smoothLabel').textContent = cameraSmoothing.toFixed(2);
});

$('#rippleSlider').addEventListener('input', (e) => {
  rippleStrength = Number(e.target.value) / 100;
  $('#rippleLabel').textContent = `${Math.round(rippleStrength * 100)}%`;
});

$('#autoFlowToggle').addEventListener('change', (e) => {
  autoFlowVariation = e.target.checked;
  addEvent(`Auto-flow variation ${autoFlowVariation ? 'enabled' : 'disabled'}`);
});

$('#autoCameraToggle').addEventListener('change', (e) => {
  autoCameraDrift = e.target.checked;
  addEvent(`Auto camera drift ${autoCameraDrift ? 'enabled' : 'disabled'}`);
});

$('#pauseBtn').addEventListener('click', (e) => {
  paused = !paused;
  e.currentTarget.textContent = paused ? '▶ Resume' : 'Ⅱ Pause';
  $('#animationState').textContent = paused ? 'ANIMATION PAUSED' : 'ANIMATION RUNNING';
  addEvent(paused ? 'Animation paused' : 'Animation resumed');
});

$('#resetBtn').addEventListener('click', () => {
  level = 72;
  opening = 35;
  inflow = 420;

  $('#levelSlider').value = level;
  $('#gateSlider').value = opening;
  $('#flowSlider').value = inflow;
  $('#scenario').value = 'custom';
  simulationSpeed = 1;
  cameraSmoothing = 0.08;
  rippleStrength = 1;
  autoFlowVariation = false;
  autoCameraDrift = false;
  $('#speedSlider').value = 1;
  $('#speedLabel').textContent = '1.0×';
  $('#smoothSlider').value = 0.08;
  $('#smoothLabel').textContent = '0.08';
  $('#rippleSlider').value = 100;
  $('#rippleLabel').textContent = '100%';
  $('#autoFlowToggle').checked = false;
  $('#autoCameraToggle').checked = false;
  if (typeof setStorm === 'function' && stormActive) setStorm(false);
  cameraTourActive = false;
  $('#tourBtn').classList.remove('active');
  $('#tourBtn').textContent = '◉ Start camera tour';
  stressViewActive = false;
  stressOverlay.visible = false;
  $('#stressBtn').classList.remove('active');
  $('#stressStat').textContent = 'LOW · DEMO';
  cameraTargetPosition.copy(cameraViews.hero);
  cameraTransitionActive = true;
  orbit.dampingFactor = cameraSmoothing;

  updateDashboard();
  addEvent('Simulation values and advanced controls reset');
});

// Camera presets.
$('#cameraPreset').addEventListener('change', (e) => {
  const preset = e.target.value;
  cameraTargetPosition.copy(cameraViews[preset] || cameraViews.hero);
  cameraTransitionActive = true;
  cameraLookTarget.set(0, 5, 0);
  orbit.target.copy(cameraLookTarget);
  addEvent(`Camera preset: ${preset}`);
});

$('#resetCamera').addEventListener('click', () => {
  cameraTargetPosition.copy(cameraViews.hero);
  cameraTransitionActive = true;
  cameraLookTarget.set(0, 5, 0);
  orbit.target.copy(cameraLookTarget);
  $('#cameraPreset').value = 'hero';
});

$('#fullscreenBtn').addEventListener('click', async () => {
  try {
    if (!document.fullscreenElement) {
      await $('.viewport').requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (error) {
    addEvent('Fullscreen is unavailable in this browser');
  }
});

// FCG laboratory controls.
$('#wireframeToggle').addEventListener('change', (e) => {
  wireframeEnabled = e.target.checked;

  scene.traverse((object) => {
    if (object.isMesh && object.material && !object.material.userData.keepSolid) {
      const mats = Array.isArray(object.material) ? object.material : [object.material];

      mats.forEach((mat) => {
        if ('wireframe' in mat) {
          mat.wireframe = wireframeEnabled;
        }
      });
    }
  });

  addEvent(`Wireframe ${wireframeEnabled ? 'enabled' : 'disabled'}`);
});

$('#axesToggle').addEventListener('change', (e) => {
  axes.visible = e.target.checked;
  addEvent(`World axes ${axes.visible ? 'shown' : 'hidden'}`);
});

$('#gridToggle').addEventListener('change', (e) => {
  grid.visible = e.target.checked;
  addEvent(`Geometry grid ${grid.visible ? 'shown' : 'hidden'}`);
});

$('#lightingToggle').addEventListener('change', (e) => {
  lightingEnabled = e.target.checked;
  ambient.intensity = lightingEnabled ? 1.8 : 0.12;
  sun.intensity = lightingEnabled ? 3 : 0;
  fill.intensity = lightingEnabled ? 1.1 : 0;
  addEvent(`Enhanced lighting ${lightingEnabled ? 'enabled' : 'disabled'}`);
});

$('#particlesToggle').addEventListener('change', (e) => {
  particlesEnabled = e.target.checked;
  particles.visible = particlesEnabled;
  splashes.visible = particlesEnabled && opening > 1;
  addEvent(`Water particles ${particlesEnabled ? 'enabled' : 'disabled'}`);
});

// Responsive chart.
const chart = $('#chart');
const ctx = chart.getContext('2d');

function drawLineChart(canvas, series, options = {}) {
  if (!canvas) return;
  const context = canvas.getContext('2d');
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (!w || !h) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(w * dpr));
  canvas.height = Math.max(1, Math.round(h * dpr));
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, w, h);
  context.lineWidth = 1;
  context.strokeStyle = 'rgba(95,148,169,.22)';
  for (let y = 12; y < h; y += 22) {
    context.beginPath(); context.moveTo(0, y); context.lineTo(w, y); context.stroke();
  }
  const all = series.flatMap(item => item.values);
  const min = options.min ?? Math.min(...all) - 8;
  const max = options.max ?? Math.max(...all) + 8;
  const range = Math.max(1, max - min);
  series.forEach((item, seriesIndex) => {
    const points = item.values.map((value, i) => ({
      x: i * w / Math.max(1, item.values.length - 1),
      y: h - 5 - ((value - min) / range) * (h - 12)
    }));
    if (seriesIndex === 0 && options.fill) {
      context.beginPath();
      points.forEach((point, i) => i ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
      context.lineTo(w, h); context.lineTo(0, h); context.closePath();
      context.fillStyle = options.fill; context.fill();
    }
    context.beginPath();
    points.forEach((point, i) => i ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
    context.strokeStyle = item.color;
    context.lineWidth = seriesIndex === 0 ? 2.2 : 1.8;
    context.lineJoin = 'round'; context.lineCap = 'round'; context.stroke();
  });
}

function drawChart() {
  drawLineChart($('#chart'), [{ values: chartData, color: '#42d5e8' }], { fill: 'rgba(51,205,222,.13)' });
  drawLineChart($('#levelChart'), [{ values: levelChartData, color: '#64e0ad' }], { min: 0, max: 100, fill: 'rgba(100,224,173,.10)' });
  drawLineChart($('#flowChart'), [
    { values: inflowChartData, color: '#42d5e8' },
    { values: outflowChartData, color: '#ffc05c' }
  ]);
  drawLineChart($('#gateChart'), [{ values: gateChartData, color: '#c5a3ff' }], { min: 0, max: 100, fill: 'rgba(197,163,255,.10)' });
}

function resize() {
  const width = sceneHost.clientWidth;
  const height = Math.max(1, sceneHost.clientHeight);
  if (width <= 0) return;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  drawChart();
}

new ResizeObserver(resize).observe(sceneHost);
new ResizeObserver(drawChart).observe($('.telemetry-panel'));
window.addEventListener('resize', drawChart);
resize();
updateDashboard();
water.position.y = water.userData.targetY;
gates.forEach((gate) => { gate.position.y = gate.userData.targetY; });
addEvent('DamWatch 3.1 advanced telemetry initialized');

// Advanced digital-twin features: rain/flood scenario, day/night, stress overlay,
// sensor markers, component picking, and a camera tour. All readings are simulated.
let stormActive = false;
let nightMode = false;
let stressViewActive = false;
let cameraTourActive = false;
let cameraTourClock = 0;
let cameraTourIndex = 0;
let advancedElapsed = 0;
const tourPresets = ['hero', 'upstream', 'front', 'top'];

// Add subtle terrain strata and a more cinematic horizon silhouette.
const terrainBands = new THREE.Group();
terrainBands.name = 'Terrain contour bands';
for (let i = 0; i < 5; i++) {
  const ridge = new THREE.Mesh(
    new THREE.TorusGeometry(20 + i * 4.8, 0.12, 5, 120),
    new THREE.MeshStandardMaterial({ color: i % 2 ? '#738d82' : '#91a49a', roughness: 1, transparent: true, opacity: 0.28 })
  );
  ridge.rotation.x = Math.PI / 2;
  ridge.position.set(0, -0.15 + i * 0.04, -8 - i * 1.4);
  ridge.scale.set(1.7, 0.72, 1);
  terrainBands.add(ridge);
}
scene.add(terrainBands);

// Cinematic environment layer: distant ridgelines, drifting volumetric-style clouds,
// stylized valley vegetation, sun glow and subtle moving water glints. All are lightweight meshes.
const cinematicEnvironment = new THREE.Group();
cinematicEnvironment.name = 'Cinematic environment layer';
scene.add(cinematicEnvironment);

const farRidgeMat = new THREE.MeshStandardMaterial({ color: '#526e75', roughness: 1, flatShading: true, transparent: true, opacity: 0.82 });
const farRidgeMat2 = new THREE.MeshStandardMaterial({ color: '#77918b', roughness: 1, flatShading: true, transparent: true, opacity: 0.72 });
for (let i = 0; i < 13; i++) {
  const ridge = new THREE.Mesh(new THREE.ConeGeometry(8 + (i % 4) * 2.4, 15 + (i % 5) * 3.1, 5), i % 2 ? farRidgeMat : farRidgeMat2);
  ridge.position.set(-57 + i * 9.4, 3 + (i % 3) * 1.4, -48 - (i % 4) * 2.5);
  ridge.rotation.y = i * 0.63;
  ridge.scale.z = 1.9;
  ridge.castShadow = false;
  cinematicEnvironment.add(ridge);
}

const cloudGroup = new THREE.Group();
cloudGroup.name = 'Drifting cloud formations';
const cloudMaterial = new THREE.MeshStandardMaterial({ color: '#eef8ff', roughness: 1, transparent: true, opacity: 0.72, depthWrite: false });
const cloudSeeds = [
  [-34, 29, -30, 1.1], [-8, 33, -39, 1.35], [23, 30, -35, 1.05], [43, 34, -17, 1.25],
  [-43, 26, 5, 0.85], [34, 28, 12, 0.9]
];
for (const [cx, cy, cz, scale] of cloudSeeds) {
  const cloud = new THREE.Group();
  cloud.position.set(cx, cy, cz);
  cloud.userData.drift = 0.35 + scale * 0.16;
  for (let j = 0; j < 5; j++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry((1.8 + (j % 3) * 0.5) * scale, 10, 7), cloudMaterial);
    puff.position.set((j - 2) * 1.7 * scale, Math.sin(j * 1.7) * 0.45 * scale, Math.cos(j * 1.2) * 0.45 * scale);
    puff.scale.y = 0.52;
    cloud.add(puff);
  }
  cloudGroup.add(cloud);
}
cinematicEnvironment.add(cloudGroup);

const valleyVegetation = new THREE.Group();
valleyVegetation.name = 'Valley conifers';
const cinematicTrunkMat = new THREE.MeshStandardMaterial({ color: '#574737', roughness: 1 });
const foliageMats = [new THREE.MeshStandardMaterial({ color: '#254f48', roughness: 1 }), new THREE.MeshStandardMaterial({ color: '#356653', roughness: 1 }), new THREE.MeshStandardMaterial({ color: '#47765b', roughness: 1 })];
for (let i = 0; i < 54; i++) {
  const side = i % 2 ? 1 : -1;
  const x = side * (25 + (i % 9) * 2.2);
  const z = -5 + Math.floor(i / 2) * 2.15;
  const h = 2.2 + ((i * 7) % 9) * 0.28;
  const tree = new THREE.Group();
  tree.position.set(x, 0, z);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, h * 0.48, 5), cinematicTrunkMat);
  trunk.position.y = h * 0.24;
  tree.add(trunk);
  for (let tier = 0; tier < 3; tier++) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(h * (0.27 - tier * 0.045), h * 0.43, 6), foliageMats[(i + tier) % foliageMats.length]);
    cone.position.y = h * (0.36 + tier * 0.22);
    cone.rotation.y = (i + tier) * 0.7;
    tree.add(cone);
  }
  tree.scale.setScalar(0.72 + (i % 4) * 0.12);
  valleyVegetation.add(tree);
}
cinematicEnvironment.add(valleyVegetation);

const sunGlow = new THREE.Mesh(new THREE.SphereGeometry(2.15, 20, 14), new THREE.MeshBasicMaterial({ color: '#ffe4a1', transparent: true, opacity: 0.22, depthWrite: false }));
sunGlow.position.set(-34, 35, -46);
cinematicEnvironment.add(sunGlow);
const sunCore = new THREE.Mesh(new THREE.SphereGeometry(0.95, 18, 12), new THREE.MeshBasicMaterial({ color: '#fff2c7', transparent: true, opacity: 0.86, depthWrite: false }));
sunCore.position.copy(sunGlow.position);
cinematicEnvironment.add(sunCore);

const waterGlints = new THREE.Group();
waterGlints.name = 'Water specular glints';
const glintMat = new THREE.MeshBasicMaterial({ color: '#d4f8ff', transparent: true, opacity: 0.34, depthWrite: false });
for (let i = 0; i < 74; i++) {
  const glint = new THREE.Mesh(new THREE.PlaneGeometry(0.45 + (i % 5) * 0.22, 0.035 + (i % 3) * 0.012), glintMat);
  glint.rotation.x = -Math.PI / 2;
  glint.position.set(-35 + (i * 17 % 70), 8.92 + (i % 4) * 0.004, -38 + (i * 13 % 31));
  glint.userData.phase = i * 0.71;
  glint.userData.baseOpacity = 0.16 + (i % 5) * 0.045;
  waterGlints.add(glint);
}
scene.add(waterGlints);

let cinematicMode = true;
let cloudsVisible = true;
let valleyVisible = true;
let waterFxVisible = true;
$('#cinematicModeBtn').classList.add('active');
$('#cloudsModeBtn').classList.add('active');
$('#forestModeBtn').classList.add('active');
$('#waterFxBtn').classList.add('active');
$('#cinematicModeBtn').addEventListener('click', () => {
  cinematicMode = !cinematicMode;
  $('#cinematicModeBtn').classList.toggle('active', cinematicMode);
  sunGlow.visible = cinematicMode;
  sunCore.visible = cinematicMode;
  terrainBands.visible = cinematicMode;
  renderer.toneMappingExposure = nightMode ? 0.78 : (cinematicMode ? 1.22 : 1.05);
  sun.intensity = nightMode ? 0.18 : (lightingEnabled ? (cinematicMode ? 3.35 : 2.6) : 0);
  addEvent(`Cinematic lighting ${cinematicMode ? 'enabled' : 'reduced'}`);
});
$('#cloudsModeBtn').addEventListener('click', () => {
  cloudsVisible = !cloudsVisible;
  cloudGroup.visible = cloudsVisible;
  $('#cloudsModeBtn').classList.toggle('active', cloudsVisible);
  addEvent(`Cloud formations ${cloudsVisible ? 'shown' : 'hidden'}`);
});
$('#forestModeBtn').addEventListener('click', () => {
  valleyVisible = !valleyVisible;
  valleyVegetation.visible = valleyVisible;
  $('#forestModeBtn').classList.toggle('active', valleyVisible);
  addEvent(`Valley vegetation ${valleyVisible ? 'shown' : 'hidden'}`);
});
$('#waterFxBtn').addEventListener('click', () => {
  waterFxVisible = !waterFxVisible;
  waterGlints.visible = waterFxVisible;
  $('#waterFxBtn').classList.toggle('active', waterFxVisible);
  addEvent(`Water reflection highlights ${waterFxVisible ? 'enabled' : 'disabled'}`);
});

// Rain particles live above the valley and are only visible during a storm test.
const rainCount = 1400;
const rainPositions = new Float32Array(rainCount * 3);
for (let i = 0; i < rainCount; i++) {
  rainPositions[i * 3] = (Math.random() - 0.5) * 95;
  rainPositions[i * 3 + 1] = 12 + Math.random() * 38;
  rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 82;
}
const rainGeometry = new THREE.BufferGeometry();
rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
const rainMaterial = new THREE.PointsMaterial({ color: '#b9e8ff', size: 0.11, transparent: true, opacity: 0.7, depthWrite: false });
const rain = new THREE.Points(rainGeometry, rainMaterial);
rain.visible = false;
scene.add(rain);

// Sensor beacons mark reservoir, dam structure, gate actuator and downstream flow.
const sensorMarkers = [];
const sensorDefs = [
  { name: 'Reservoir level sensor', position: [-23, 9.4, -19], color: '#4ee6ff', detail: 'Measures simulated reservoir elevation and storage percentage.' },
  { name: 'Dam structure sensor', position: [14, 11, 2.8], color: '#ffbd65', detail: 'Illustrative structural strain indicator; not a real engineering assessment.' },
  { name: 'Gate actuator sensor', position: [5.5, 14.5, 0.4], color: '#7effb1', detail: 'Reports the commanded spillway gate opening in the simulation.' },
  { name: 'Downstream flow sensor', position: [-17, 1.4, 18], color: '#bda0ff', detail: 'Displays the estimated downstream discharge for this demo.' }
];
for (const def of sensorDefs) {
  const mat = new THREE.MeshStandardMaterial({ color: def.color, emissive: def.color, emissiveIntensity: 1.7, roughness: 0.25 });
  const marker = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), mat);
  marker.position.set(...def.position);
  marker.name = def.name;
  marker.userData.sensor = def;
  marker.userData.baseY = marker.position.y;
  marker.castShadow = true;
  scene.add(marker);
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.035, 6, 28), new THREE.MeshBasicMaterial({ color: def.color, transparent: true, opacity: 0.75 }));
  halo.rotation.x = Math.PI / 2;
  marker.add(halo);
  sensorMarkers.push(marker);
}

const stressMaterial = new THREE.MeshBasicMaterial({ color: '#ff3e45', transparent: true, opacity: 0.22, wireframe: true, depthWrite: false });
const stressOverlay = new THREE.Mesh(dam.geometry, stressMaterial);
stressOverlay.position.copy(dam.position);
stressOverlay.rotation.copy(dam.rotation);
stressOverlay.scale.setScalar(1.004);
stressOverlay.visible = false;
stressOverlay.name = 'Illustrative structural stress overlay';
scene.add(stressOverlay);

const pickRaycaster = new THREE.Raycaster();
const pickPointer = new THREE.Vector2();
let pointerDownPoint = null;
const pickTargets = [dam, ...gates, ...sensorMarkers];
function showComponentInfo(object) {
  const readout = $('#sensorReadout');
  if (object.userData.sensor) {
    const sensor = object.userData.sensor;
    let value = '';
    if (sensor.name.includes('Reservoir')) value = `Current demo reading: ${level}% capacity · ${(100 + level * 0.59).toFixed(1)} m elevation.`;
    else if (sensor.name.includes('Gate')) value = `Current demo reading: ${opening}% open.`;
    else if (sensor.name.includes('Downstream')) value = `Current demo reading: ${calculateDischarge()} m³/s estimated discharge.`;
    else value = `Current demo reading: ${level >= 85 ? 'ELEVATED' : 'NOMINAL'} illustrative condition.`;
    readout.textContent = `${sensor.name} — ${sensor.detail} ${value}`;
    addEvent(`Sensor inspected: ${sensor.name}`);
    return;
  }
  readout.textContent = `${object.name || '3D component'} selected. Use the sliders and scenario controls to explore the simulated system. These values are illustrative, not operational measurements.`;
  addEvent(`3D component selected: ${object.name || 'unnamed mesh'}`);
}
renderer.domElement.addEventListener('pointerdown', (event) => { pointerDownPoint = { x: event.clientX, y: event.clientY }; });
renderer.domElement.addEventListener('pointerup', (event) => {
  if (!pointerDownPoint) return;
  const distance = Math.hypot(event.clientX - pointerDownPoint.x, event.clientY - pointerDownPoint.y);
  pointerDownPoint = null;
  if (distance > 5) return; // Ignore orbit drags; keep the working camera controls intact.
  const rect = renderer.domElement.getBoundingClientRect();
  pickPointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pickPointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  pickRaycaster.setFromCamera(pickPointer, camera);
  const hit = pickRaycaster.intersectObjects(pickTargets, false)[0];
  if (hit) showComponentInfo(hit.object);
});

function setStorm(active) {
  stormActive = active;
  rain.visible = active;
  $('#stormBtn').classList.toggle('active', active);
  $('#stopStormBtn').classList.toggle('active', !active);
  if (active) {
    level = 91;
    opening = 78;
    inflow = 850;
    $('#scenario').value = 'monsoon';
    $('#levelSlider').value = level;
    $('#gateSlider').value = opening;
    $('#flowSlider').value = inflow;
    scene.fog.color.set('#647f94');
    scene.fog.near = 45;
    scene.fog.far = 155;
    rainMaterial.opacity = 0.8;
    cloudMaterial.opacity = 0.88;
    sunGlow.visible = false;
    sunCore.visible = false;
    $('#rainStat').textContent = '68 mm/h · SIM';
    $('#sensorReadout').textContent = 'Storm / flood test active. Rain, reservoir rise and gate discharge are simulated for demonstration only.';
    addEvent('Storm and high-inflow flood scenario started (simulated)');
  } else {
    scene.fog.color.set(nightMode ? '#081729' : '#a9ccd5');
    scene.fog.near = nightMode ? 55 : 90;
    scene.fog.far = nightMode ? 170 : 220;
    $('#rainStat').textContent = '0 mm/h';
    cloudMaterial.opacity = 0.72;
    sunGlow.visible = cinematicMode && !nightMode;
    sunCore.visible = cinematicMode && !nightMode;
    addEvent('Storm cleared; weather returned to baseline');
  }
  updateDashboard();
}
$('#stormBtn').addEventListener('click', () => setStorm(!stormActive));
$('#stopStormBtn').addEventListener('click', () => setStorm(false));

$('#nightBtn').addEventListener('click', () => {
  nightMode = !nightMode;
  scene.background.set(nightMode ? '#071525' : '#a9ccd5');
  scene.fog.color.set(nightMode ? '#071525' : (stormActive ? '#647f94' : '#a9ccd5'));
  ambient.intensity = nightMode ? 0.42 : (lightingEnabled ? 1.8 : 0.12);
  sun.intensity = nightMode ? 0.18 : (lightingEnabled ? 3 : 0);
  fill.intensity = nightMode ? 0.55 : (lightingEnabled ? 1.1 : 0);
  renderer.toneMappingExposure = nightMode ? 0.78 : (cinematicMode ? 1.22 : 1.15);
  sunGlow.visible = cinematicMode && !nightMode && !stormActive;
  sunCore.visible = cinematicMode && !nightMode && !stormActive;
  $('#nightBtn').classList.toggle('active', nightMode);
  $('#environmentStat').textContent = nightMode ? 'NIGHT MODE' : 'DAYLIGHT';
  addEvent(nightMode ? 'Night environment enabled' : 'Daylight environment restored');
});

$('#stressBtn').addEventListener('click', () => {
  stressViewActive = !stressViewActive;
  stressOverlay.visible = stressViewActive;
  $('#stressBtn').classList.toggle('active', stressViewActive);
  $('#stressStat').textContent = stressViewActive ? 'VISUAL OVERLAY' : 'LOW · DEMO';
  $('#sensorReadout').textContent = stressViewActive
    ? 'Structural stress visualization enabled. Red wireframe is a conceptual graphics overlay only; it is not a finite-element analysis or safety rating.'
    : 'Structural stress overlay hidden.';
  addEvent(stressViewActive ? 'Illustrative structural overlay enabled' : 'Structural overlay disabled');
});

$('#tourBtn').addEventListener('click', () => {
  cameraTourActive = !cameraTourActive;
  cameraTourClock = 0;
  $('#tourBtn').classList.toggle('active', cameraTourActive);
  $('#tourBtn').textContent = cameraTourActive ? 'Ⅱ Stop camera tour' : '◉ Start camera tour';
  if (cameraTourActive) {
    autoCameraDrift = false;
    $('#autoCameraToggle').checked = false;
    cameraTourIndex = 0;
    $('#cameraPreset').value = tourPresets[cameraTourIndex];
    cameraTargetPosition.copy(cameraViews[tourPresets[cameraTourIndex]]);
    cameraTransitionActive = true;
    orbit.target.set(0, 5, 0);
    addEvent('Guided camera tour started');
  } else {
    cameraTransitionActive = false;
    addEvent('Guided camera tour stopped');
  }
});

function advancedUpdate(delta) {
  advancedElapsed += delta;
  sensorMarkers.forEach((marker, index) => {
    const pulse = 1 + Math.sin(advancedElapsed * 2.2 + index * 1.4) * 0.12;
    marker.scale.setScalar(pulse);
    marker.position.y = marker.userData.baseY + Math.sin(advancedElapsed * 1.8 + index) * 0.08;
  });
  if (stormActive) {
    const p = rainGeometry.attributes.position.array;
    for (let i = 0; i < rainCount; i++) {
      const j = i * 3;
      p[j + 1] -= delta * (20 + simulationSpeed * 8);
      p[j] += delta * 1.4;
      if (p[j + 1] < -1) {
        p[j] = (Math.random() - 0.5) * 95;
        p[j + 1] = 28 + Math.random() * 24;
        p[j + 2] = (Math.random() - 0.5) * 82;
      }
    }
    rainGeometry.attributes.position.needsUpdate = true;
  }
  if (cameraTourActive) {
    cameraTourClock += delta;
    if (cameraTourClock >= 7 && !cameraTransitionActive) {
      cameraTourClock = 0;
      cameraTourIndex = (cameraTourIndex + 1) % tourPresets.length;
      const preset = tourPresets[cameraTourIndex];
      $('#cameraPreset').value = preset;
      cameraTargetPosition.copy(cameraViews[preset]);
      cameraTransitionActive = true;
      orbit.target.set(0, 5, 0);
      addEvent(`Camera tour: ${preset} view`);
    }
  }
}

// Frame-rate-independent animation with throttled normal recalculation for smoother rendering.
let previousFrameTime = 0;
let normalUpdateFrame = 0;

// Flood Intelligence Lab: visual-only downstream risk bands and replayable demo scenarios.
const floodZoneGroup = new THREE.Group();
floodZoneGroup.name = 'Illustrative downstream flood-risk zones';
const floodZoneMaterials = [
  new THREE.MeshBasicMaterial({ color: '#45e4a2', transparent: true, opacity: 0.17, side: THREE.DoubleSide, depthWrite: false }),
  new THREE.MeshBasicMaterial({ color: '#ffd166', transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false }),
  new THREE.MeshBasicMaterial({ color: '#ff5265', transparent: true, opacity: 0.23, side: THREE.DoubleSide, depthWrite: false })
];
const floodZoneMeshes = [];
for (let i = 0; i < 3; i++) {
  const zone = new THREE.Mesh(new THREE.RingGeometry(5.5 + i * 3.2, 7.6 + i * 3.2, 72), floodZoneMaterials[i]);
  zone.rotation.x = -Math.PI / 2;
  zone.position.set(0, 0.16 + i * 0.015, 17 + i * 3.5);
  zone.scale.set(1.25, 0.72, 1);
  zone.visible = false;
  floodZoneGroup.add(zone);
  floodZoneMeshes.push(zone);
}
scene.add(floodZoneGroup);
let lastRiskBand = '';
function updateFloodIntelligence() {
  // This score is intentionally a transparent classroom heuristic, not a validated forecast.
  const risk = Math.max(0, Math.min(100, Math.round(level * 0.48 + Math.max(0, inflow - 250) / 9 + (opening < 20 && level > 70 ? 12 : 0))));
  const band = risk >= 72 ? 'CRITICAL' : risk >= 48 ? 'WATCH' : 'GUARDED';
  $('#riskPercent').textContent = `${risk}%`;
  $('#riskFill').style.width = `${risk}%`;
  $('#riskLabel').textContent = `${band} · SIMULATION`;
  $('#riskDot').style.background = risk >= 72 ? '#ff5265' : risk >= 48 ? '#ffd166' : '#43e0a0';
  $('#riskExplanation').textContent = risk >= 72
    ? 'High illustrative index: reservoir and inflow inputs are elevated. Review the simulated scenario.'
    : risk >= 48
      ? 'Watch condition: demo inputs suggest increased downstream attention may be needed.'
      : 'Demo inputs are within the guarded display band. This is not a real-world safety assessment.';
  const nextBand = risk >= 72 ? 'critical' : risk >= 48 ? 'watch' : 'normal';
  floodZoneMeshes.forEach((zone, i) => { zone.visible = i === 0 ? risk >= 25 : i === 1 ? risk >= 48 : risk >= 72; });
  if (nextBand !== lastRiskBand) {
    if (lastRiskBand) addEvent(`Illustrative downstream risk changed to ${nextBand.toUpperCase()}`);
    lastRiskBand = nextBand;
  }
}
function replayScenario(kind) {
  cameraTourActive = false;
  $('#tourBtn').classList.remove('active');
  $('#tourBtn').textContent = '◉ Start camera tour';
  if (kind === 'normal') {
    if (stormActive) setStorm(false);
    level = 58; opening = 38; inflow = 360; $('#scenario').value = 'normal';
  } else if (kind === 'monsoon') {
    setStorm(true);
  } else if (kind === 'release') {
    if (stormActive) setStorm(false);
    level = 82; opening = 92; inflow = 720; $('#scenario').value = 'release';
  } else if (kind === 'drought') {
    if (stormActive) setStorm(false);
    level = 24; opening = 18; inflow = 135; $('#scenario').value = 'drought';
  }
  $('#levelSlider').value = level;
  $('#gateSlider').value = opening;
  $('#flowSlider').value = inflow;
  $('#levelLabel').textContent = `${level}%`;
  $('#gateLabel').textContent = `${opening}%`;
  $('#flowLabel').textContent = `${inflow} m³/s`;
  updateDashboard();
  updateFloodIntelligence();
  addEvent(`Scenario replay loaded: ${kind.toUpperCase()} (simulated)`);
  $('#sensorReadout').textContent = `Scenario replay: ${kind}. The dashboard and 3D flood-zone cues show illustrative values only.`;
}
$('#replayNormal').addEventListener('click', () => replayScenario('normal'));
$('#replayMonsoon').addEventListener('click', () => replayScenario('monsoon'));
$('#replayRelease').addEventListener('click', () => replayScenario('release'));
$('#replayDrought').addEventListener('click', () => replayScenario('drought'));
updateFloodIntelligence();

// Advanced FCG feature pack: animated rain, lightning, cutaway inspection,
// and quick scenario controls. All values and effects are illustrative only.
let advancedRainEnabled = false;
let advancedLightningEnabled = true;
let advancedCutawayEnabled = false;
let lightningCooldown = 0;
let lightningFlash = 0;
const advancedRainCount = 950;
const advancedRainPositions = new Float32Array(advancedRainCount * 3);
const rainSpeeds = new Float32Array(advancedRainCount);
for (let i = 0; i < advancedRainCount; i++) {
  const j = i * 3;
  advancedRainPositions[j] = (Math.random() - 0.5) * 100;
  advancedRainPositions[j + 1] = Math.random() * 52 + 5;
  advancedRainPositions[j + 2] = (Math.random() - 0.5) * 100;
  rainSpeeds[i] = 13 + Math.random() * 24;
}
const advancedRainGeometry = new THREE.BufferGeometry();
advancedRainGeometry.setAttribute('position', new THREE.BufferAttribute(advancedRainPositions, 3));
const advancedRainMaterial = new THREE.PointsMaterial({ color: '#c7e9ff', size: 0.11, transparent: true, opacity: 0.72, depthWrite: false });
const rainParticles = new THREE.Points(advancedRainGeometry, advancedRainMaterial);
rainParticles.name = 'Simulated rain particle system';
rainParticles.visible = false;
scene.add(rainParticles);

const cutawayMaterial = dam.material;
const cutawayToggle = () => {
  advancedCutawayEnabled = !advancedCutawayEnabled;
  if (Array.isArray(cutawayMaterial)) {
    cutawayMaterial.forEach(m => { m.transparent = advancedCutawayEnabled; m.opacity = advancedCutawayEnabled ? 0.28 : 1; });
  } else {
    cutawayMaterial.transparent = advancedCutawayEnabled;
    cutawayMaterial.opacity = advancedCutawayEnabled ? 0.28 : 1;
    cutawayMaterial.depthWrite = !advancedCutawayEnabled;
  }
  $('#advancedCutawayBtn').classList.toggle('active', advancedCutawayEnabled);
  $('#sensorReadout').textContent = advancedCutawayEnabled
    ? 'Inspection cutaway enabled: the dam body is translucent for a conceptual view. Internal structure is illustrative, not a construction drawing.'
    : 'Inspection cutaway disabled.';
  addEvent(advancedCutawayEnabled ? 'Conceptual dam cutaway enabled' : 'Conceptual dam cutaway disabled');
};

const advancedFeatureDockStyle = document.createElement('style');
advancedFeatureDockStyle.textContent = `
  .advanced-feature-dock{position:absolute;z-index:8;left:12px;bottom:12px;display:flex;flex-wrap:wrap;gap:7px;max-width:min(94%,720px);padding:9px;border:1px solid rgba(142,210,225,.26);border-radius:12px;background:rgba(5,20,31,.82);backdrop-filter:blur(12px)}
  .advanced-feature-dock button{border:1px solid rgba(125,205,225,.28);border-radius:8px;background:#102b3b;color:#e5f7fb;padding:8px 10px;font:600 11px/1.2 system-ui,sans-serif;cursor:pointer}
  .advanced-feature-dock button:hover,.advanced-feature-dock button.active{background:#15566a;border-color:#54d6e8;color:#fff}
  .advanced-feature-dock .dock-label{width:100%;font-size:9px;letter-spacing:.12em;color:#8ccbd8;padding:0 2px 2px}
  .viewport{position:relative}
  .advanced-feature-dock .dw-level-control,.advanced-feature-dock .dw-timeline-control{display:flex;align-items:center;gap:7px;color:#d8f3f7;font:600 10px system-ui,sans-serif;min-width:180px;padding:4px 6px}
  .advanced-feature-dock input[type=range]{width:100px;accent-color:#54d6e8}
  .dw-cinematic-scene{position:fixed!important;inset:3vh 3vw!important;width:94vw!important;height:94vh!important;z-index:9999!important;border:2px solid rgba(84,214,232,.7);border-radius:16px;box-shadow:0 0 0 100vmax rgba(1,8,15,.86),0 0 45px rgba(84,214,232,.2)}
  .dw-cinematic-scene .advanced-feature-dock{max-width:95%;}
  @media(max-width:700px){.advanced-feature-dock{left:7px;bottom:7px;gap:5px}.advanced-feature-dock button{font-size:10px;padding:7px}.advanced-feature-dock .dw-level-control,.advanced-feature-dock .dw-timeline-control{min-width:140px}}
`;
document.head.appendChild(advancedFeatureDockStyle);
const featureDock = document.createElement('div');
featureDock.className = 'advanced-feature-dock';
featureDock.innerHTML = `
  <div class="dock-label">ADVANCED GRAPHICS LAB · SIMULATED</div>
  <button id="advancedRainBtn" type="button">☔ Rain particles</button>
  <button id="advancedCutawayBtn" type="button">▧ Dam cutaway</button>
  <button id="advancedStressBtn" type="button">◇ Stress heatmap</button>
  <button id="advancedStormBtn" type="button">⛈ Storm scenario</button>
  <button id="advancedReplayBtn" type="button">▶ Replay monsoon</button>
  <button id="advancedFlowBtn" type="button">〰 Flow particles</button>
  <button id="advancedWireBtn" type="button">▦ Wireframe</button>
  <button id="advancedTourBtn" type="button">◎ Camera tour</button>
  <button id="advancedShotBtn" type="button">▣ Screenshot</button>
  <button id="dwExplodedBtn" type="button">✥ Exploded view</button>
  <button id="dwDefectsBtn" type="button">⚠ Defect markers</button>
  <button id="dwGateBtn" type="button">▤ Cycle gates</button>
  <button id="dwViewsBtn" type="button">⌗ Engineering views</button>
  <button id="dwTimelineBtn" type="button">▶ Simulation timeline</button>
  <button id="dwCinemaBtn" type="button">⛶ Presentation mode</button>
  <label class="dw-level-control" for="dwWaterLevel">Reservoir level <span id="dwWaterLevelLabel">50%</span><input id="dwWaterLevel" type="range" min="0" max="100" value="50"></label>
  <label class="dw-timeline-control" for="dwTimeline">Timeline <span id="dwTimelineLabel">0%</span><input id="dwTimeline" type="range" min="0" max="100" value="0"></label>
`;
sceneHost.parentElement.appendChild(featureDock);
$('#advancedRainBtn').addEventListener('click', () => {
  advancedRainEnabled = !advancedRainEnabled;
  rainParticles.visible = advancedRainEnabled;
  $('#advancedRainBtn').classList.toggle('active', advancedRainEnabled);
  addEvent(advancedRainEnabled ? 'Rain particle system enabled' : 'Rain particle system disabled');
});
$('#advancedCutawayBtn').addEventListener('click', cutawayToggle);
$('#advancedStressBtn').addEventListener('click', () => $('#stressBtn').click());
$('#advancedStormBtn').addEventListener('click', () => {
  setStorm(!stormActive);
  $('#advancedStormBtn').classList.toggle('active', stormActive);
});
$('#advancedReplayBtn').addEventListener('click', () => replayScenario('monsoon'));

// Extra graphics features: flow particles, wireframe inspection, camera tour and screenshot.
let advancedFlowEnabled = false;
let advancedWireframeEnabled = false;
let advancedTourEnabled = false;
let advancedTourClock = 0;
const originalWireframeStates = new Map();
const flowCount = 420;
const flowPositions = new Float32Array(flowCount * 3);
const flowSpeeds = new Float32Array(flowCount);
for (let i = 0; i < flowCount; i++) {
  const j = i * 3;
  flowPositions[j] = -9 + Math.random() * 18;
  flowPositions[j + 1] = 1.2 + Math.random() * 2.4;
  flowPositions[j + 2] = 4 + Math.random() * 25;
  flowSpeeds[i] = 2.5 + Math.random() * 4.5;
}
const flowGeometry = new THREE.BufferGeometry();
flowGeometry.setAttribute('position', new THREE.BufferAttribute(flowPositions, 3));
const flowMaterial = new THREE.PointsMaterial({ color: '#70f1ff', size: 0.17, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending });
const flowParticles = new THREE.Points(flowGeometry, flowMaterial);
flowParticles.name = 'Illustrative spillway flow particles';
flowParticles.visible = false;
scene.add(flowParticles);

$('#advancedFlowBtn').addEventListener('click', () => {
  advancedFlowEnabled = !advancedFlowEnabled;
  flowParticles.visible = advancedFlowEnabled;
  $('#advancedFlowBtn').classList.toggle('active', advancedFlowEnabled);
  $('#sensorReadout').textContent = advancedFlowEnabled
    ? 'Flow particles enabled. Particle motion is illustrative and is not a hydraulic engineering simulation.'
    : 'Flow particle overlay disabled.';
  addEvent(advancedFlowEnabled ? 'Illustrative flow particles enabled' : 'Illustrative flow particles disabled');
});

$('#advancedWireBtn').addEventListener('click', () => {
  advancedWireframeEnabled = !advancedWireframeEnabled;
  scene.traverse((obj) => {
    if (!obj.isMesh || !obj.material) return;
    const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
    materials.forEach((mat) => {
      if (!originalWireframeStates.has(mat)) originalWireframeStates.set(mat, Boolean(mat.wireframe));
      mat.wireframe = advancedWireframeEnabled ? true : originalWireframeStates.get(mat);
      mat.needsUpdate = true;
    });
  });
  $('#advancedWireBtn').classList.toggle('active', advancedWireframeEnabled);
  addEvent(advancedWireframeEnabled ? 'Wireframe inspection view enabled' : 'Wireframe inspection view disabled');
});

$('#advancedTourBtn').addEventListener('click', () => {
  advancedTourEnabled = !advancedTourEnabled;
  advancedTourClock = 0;
  $('#advancedTourBtn').classList.toggle('active', advancedTourEnabled);
  if (advancedTourEnabled) {
    orbit.enabled = false;
    $('#sensorReadout').textContent = 'Camera tour playing. Click Camera tour again to stop and resume manual camera controls.';
  } else {
    orbit.enabled = true;
    $('#sensorReadout').textContent = 'Camera tour stopped. Manual camera controls restored.';
  }
  addEvent(advancedTourEnabled ? 'Camera fly-through started' : 'Camera fly-through stopped');
});

$('#advancedShotBtn').addEventListener('click', () => {
  try {
    renderer.render(scene, camera);
    const link = document.createElement('a');
    link.download = `damwatch-3d-${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
    link.href = renderer.domElement.toDataURL('image/png');
    link.click();
    addEvent('3D scene screenshot exported');
  } catch (error) {
    $('#sensorReadout').textContent = 'Screenshot could not be exported. Try again after the 3D scene finishes loading.';
  }
});

// Additional FCG showcase features: exploded view, water-level control, defect markers,
// gate cycling, engineering camera presets, simulation timeline and cinematic mode.
let dwExploded = false;
let dwExplodeProgress = 0;
let dwGateCycling = false;
let dwGateCycleClock = 0;
let dwTimelinePlaying = false;
let dwTimelineValue = 0;
let dwWaterLevelValue = 50;
let dwCinematicMode = false;
let dwEngineeringViewIndex = 0;
const dwEngineeringViews = ['hero', 'front', 'upstream', 'top'];
const dwDamBasePosition = dam.position.clone();
const dwGateBasePositions = gates.map(g => g.position.clone());
const dwDefectGroup = new THREE.Group();
dwDefectGroup.name = 'Illustrative defect markers';
const dwDefectMaterial = new THREE.MeshStandardMaterial({ color: '#ff4f61', emissive: '#8a1020', emissiveIntensity: 1.2, roughness: .35 });
[
  { x: -11, y: 8.5, z: 0.35, label: 'Conceptual surface crack marker A' },
  { x: 6, y: 10, z: 0.35, label: 'Conceptual surface crack marker B' },
  { x: 14, y: 6.2, z: 0.35, label: 'Conceptual inspection point C' }
].forEach((item, i) => {
  const marker = new THREE.Mesh(new THREE.SphereGeometry(.34, 14, 10), dwDefectMaterial);
  marker.position.set(item.x, item.y, item.z);
  marker.name = item.label;
  marker.userData.baseScale = 1;
  dwDefectGroup.add(marker);
});
dwDefectGroup.visible = false;
scene.add(dwDefectGroup);

$('#dwExplodedBtn').addEventListener('click', () => {
  dwExploded = !dwExploded;
  $('#dwExplodedBtn').classList.toggle('active', dwExploded);
  $('#sensorReadout').textContent = dwExploded
    ? 'Exploded view enabled: the dam body and gates are offset for visual inspection. Component spacing is illustrative.'
    : 'Exploded view reset to the assembled model.';
  addEvent(dwExploded ? 'Exploded component view enabled' : 'Exploded component view reset');
});
$('#dwWaterLevel').addEventListener('input', (e) => {
  dwWaterLevelValue = Number(e.target.value);
  $('#dwWaterLevelLabel').textContent = `${dwWaterLevelValue}%`;
  water.userData.targetY = -1.4 + dwWaterLevelValue * .055;
  $('#sensorReadout').textContent = `Reservoir visual level set to ${dwWaterLevelValue}%. This is an illustrative graphics control, not a hydraulic forecast.`;
});
$('#dwDefectsBtn').addEventListener('click', () => {
  dwDefectGroup.visible = !dwDefectGroup.visible;
  $('#dwDefectsBtn').classList.toggle('active', dwDefectGroup.visible);
  $('#sensorReadout').textContent = dwDefectGroup.visible
    ? 'Illustrative defect markers shown. These are fixed demo markers, not detected cracks or verified defects.'
    : 'Illustrative defect markers hidden.';
  addEvent(dwDefectGroup.visible ? 'Illustrative defect markers shown' : 'Illustrative defect markers hidden');
});
$('#dwGateBtn').addEventListener('click', () => {
  dwGateCycling = !dwGateCycling;
  dwGateCycleClock = 0;
  $('#dwGateBtn').classList.toggle('active', dwGateCycling);
  $('#sensorReadout').textContent = dwGateCycling
    ? 'Automatic spillway gate cycle started. Gate opening values are simulated.'
    : 'Automatic gate cycle stopped; use the gate slider for manual control.';
  addEvent(dwGateCycling ? 'Automatic spillway gate cycle started' : 'Automatic spillway gate cycle stopped');
});
$('#dwViewsBtn').addEventListener('click', () => {
  dwEngineeringViewIndex = (dwEngineeringViewIndex + 1) % dwEngineeringViews.length;
  const preset = dwEngineeringViews[dwEngineeringViewIndex];
  const presetSelector = $('#cameraPreset');
  if (presetSelector && [...presetSelector.options].some(option => option.value === preset)) {
    presetSelector.value = preset;
    presetSelector.dispatchEvent(new Event('change', { bubbles: true }));
  } else {
    cameraTargetPosition.copy(cameraViews[preset] || cameraViews.hero);
    cameraTransitionActive = true;
    orbit.enabled = true;
  }
  $('#dwViewsBtn').classList.add('active');
  $('#sensorReadout').textContent = `Engineering view: ${preset.toUpperCase()}. Click again to cycle views.`;
  addEvent(`Engineering camera view: ${preset}`);
});
$('#dwTimelineBtn').addEventListener('click', () => {
  dwTimelinePlaying = !dwTimelinePlaying;
  $('#dwTimelineBtn').classList.toggle('active', dwTimelinePlaying);
  $('#dwTimelineBtn').textContent = dwTimelinePlaying ? 'Ⅱ Pause timeline' : '▶ Simulation timeline';
  $('#sensorReadout').textContent = dwTimelinePlaying
    ? 'Scenario timeline playing: water level and gate opening will change as a visual demonstration.'
    : 'Scenario timeline paused.';
});
$('#dwTimeline').addEventListener('input', (e) => {
  dwTimelineValue = Number(e.target.value);
  $('#dwTimelineLabel').textContent = `${dwTimelineValue}%`;
  $('#dwTimelineBtn').classList.remove('active');
  $('#sensorReadout').textContent = `Simulation timeline positioned at ${dwTimelineValue}%. Press Simulation timeline to play.`;
  dwApplyTimeline(dwTimelineValue / 100);
});
function dwApplyTimeline(t) {
  dwWaterLevelValue = Math.round(15 + t * 80);
  $('#dwWaterLevel').value = dwWaterLevelValue;
  $('#dwWaterLevelLabel').textContent = `${dwWaterLevelValue}%`;
  water.userData.targetY = -1.4 + dwWaterLevelValue * .055;
  const gateValue = Math.round(t < .55 ? t * 100 : (1 - t) * 100 / .45);
  opening = Math.max(0, Math.min(100, gateValue));
  $('#gateSlider').value = opening;
  $('#gateLabel').textContent = `${opening}%`;
  $('#gateStat').textContent = `${opening}%`;
  gates.forEach(g => { g.userData.targetY = g.userData.closedY + opening * .036; });
  updateDashboard();
}
$('#dwCinemaBtn').addEventListener('click', () => {
  dwCinematicMode = !dwCinematicMode;
  sceneHost.classList.toggle('dw-cinematic-scene', dwCinematicMode);
  $('#dwCinemaBtn').classList.toggle('active', dwCinematicMode);
  $('#dwCinemaBtn').textContent = dwCinematicMode ? '× Exit presentation' : '⛶ Presentation mode';
  if (dwCinematicMode) {
    sceneHost.style.width = '100%';
    sceneHost.style.height = '100%';
    if (typeof resize === 'function') resize();
  } else {
    sceneHost.style.width = '';
    sceneHost.style.height = '';
    if (typeof resize === 'function') resize();
  }
  $('#sensorReadout').textContent = dwCinematicMode
    ? 'Presentation mode enabled. Click Exit presentation to return to the dashboard.'
    : 'Dashboard presentation mode closed.';
});

function animate(timestamp = 0) {
  requestAnimationFrame(animate);

  const deltaTime = Math.min((timestamp - previousFrameTime) / 1000 || 0.016, 0.033);
  previousFrameTime = timestamp;

  if (!paused) {
    const simDelta = deltaTime * simulationSpeed;
    time += simDelta;
    advancedUpdate(simDelta);
    updateFloodIntelligence();

    // Slow environmental motion adds depth without taking control away from OrbitControls.
    cloudGroup.children.forEach((cloud, index) => {
      cloud.position.x += deltaTime * cloud.userData.drift * (stormActive ? 1.45 : 1);
      if (cloud.position.x > 62) cloud.position.x = -62;
      cloud.position.y += Math.sin(time * 0.18 + index) * 0.0018;
    });
    waterGlints.children.forEach((glint) => {
      const shimmer = 0.55 + Math.sin(time * 1.7 + glint.userData.phase) * 0.45;
      glint.material.opacity = glint.userData.baseOpacity * shimmer * (stormActive ? 0.45 : 1);
      glint.position.x += Math.sin(time * 0.32 + glint.userData.phase) * 0.0009;
    });

    if (autoFlowVariation) {
      autoFlowClock += simDelta;
      if (autoFlowClock >= 3) {
        autoFlowClock = 0;
        inflow = Math.max(100, Math.min(900, Math.round((inflow + (Math.random() - 0.48) * 70) / 10) * 10));
        $('#flowSlider').value = inflow;
        $('#flowLabel').textContent = `${inflow} m³/s`;
        updateDashboard();
      }
    }

    // Smoothly interpolate water surface and gate positions instead of snapping.
    const visualLerp = 1 - Math.exp(-5 * simDelta);
    if (Number.isFinite(water.userData.targetY)) water.position.y += (water.userData.targetY - water.position.y) * visualLerp;
    gates.forEach((gate) => {
      if (Number.isFinite(gate.userData.targetY)) gate.position.y += (gate.userData.targetY - gate.position.y) * visualLerp;
    });

    const a = waterGeo.attributes.position.array;
    for (let i = 0; i < a.length; i += 3) {
      a[i + 1] =
        waterBase[i + 1]
        + Math.sin(waterBase[i] * 0.42 + time * 1.4) * 0.10 * rippleStrength
        + Math.cos(waterBase[i + 2] * 0.52 + time) * 0.07 * rippleStrength;
    }
    waterGeo.attributes.position.needsUpdate = true;

    const r = riverGeo.attributes.position.array;
    for (let i = 0; i < r.length; i += 3) {
      r[i + 1] =
        riverBase[i + 1]
        + Math.sin(riverBase[i] * 0.5 + time * 2) * 0.06
        + Math.cos(riverBase[i + 2] * 0.7 - time) * 0.04;
    }
    riverGeo.attributes.position.needsUpdate = true;

    // Rebuild surface normals every fourth frame instead of twice every frame.
    // This reduces CPU work while retaining a convincing animated water surface.
    normalUpdateFrame++;
    if (normalUpdateFrame % 4 === 0) {
      waterGeo.computeVertexNormals();
      riverGeo.computeVertexNormals();
    }

    const p = particleGeo.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      const j = i * 3;
      p[j + 2] += particleSpeed[i] * (0.2 + opening / 100) * deltaTime;
      p[j + 1] += Math.sin(time * 3 + i) * 0.008;

      if (p[j + 2] > 17) {
        p[j] = (Math.random() - 0.5) * 14;
        p[j + 1] = 0.4 + Math.random() * Math.max(0.6, opening * 0.055);
        p[j + 2] = 3 + Math.random() * 2;
      }
    }
    particleGeo.attributes.position.needsUpdate = true;

    // Jets grow with gate opening; splash particles move downstream.
    const intensity = opening / 100;

    jets.forEach((jet, i) => {
      jet.visible = opening > 1;
      jet.scale.set(
        0.35 + intensity * 0.8,
        0.25 + intensity * 3.2,
        0.35 + intensity * 0.8
      );
      jet.position.y = 2.4 + intensity * 1.5 + Math.sin(time * 4 + i) * 0.08;
      jet.material.opacity = 0.25 + intensity * 0.65;
    });

    const sp = splashGeometry.attributes.position.array;
    for (let i = 0; i < splashCount; i++) {
      const j = i * 3;
      sp[j + 2] += deltaTime * splashSpeeds[i] * (0.25 + intensity * 1.8);
      sp[j + 1] += Math.sin(time * 4 + i) * deltaTime * 0.25;

      if (sp[j + 2] > 19) {
        sp[j] = (Math.random() - 0.5) * 12;
        sp[j + 1] = 0.3 + Math.random() * (1 + intensity * 3);
        sp[j + 2] = 5 + Math.random() * 3;
      }
    }
    splashGeometry.attributes.position.needsUpdate = true;

    splashes.visible = particlesEnabled && opening > 1;
    particles.visible = particlesEnabled;

    if (time - lastTelemetrySample >= 1) {
      lastTelemetrySample = time;
      const outflowNow = calculateDischarge();
      chartData.push(outflowNow + Math.sin(time) * 8);
      levelChartData.push(level + Math.sin(time * 0.35) * 1.2);
      inflowChartData.push(inflow + Math.sin(time * 0.45) * 8);
      outflowChartData.push(outflowNow + Math.cos(time * 0.4) * 7);
      gateChartData.push(opening + Math.sin(time * 0.3) * 1.5);
      [chartData, levelChartData, inflowChartData, outflowChartData, gateChartData].forEach(data => {
        while (data.length > 40) data.shift();
      });
      drawChart();
    }

    if (autoCameraDrift) {
      cameraTargetPosition.x = cameraViews.hero.x + Math.sin(time * 0.18) * 3;
    } else if ($('#cameraPreset').value !== 'hero') {
      // Preserve selected preset when auto drift is switched off.
    }
  }

  if (!paused && advancedFlowEnabled) {
    const positions = flowGeometry.attributes.position.array;
    for (let i = 0; i < flowCount; i++) {
      const j = i * 3;
      positions[j + 2] += flowSpeeds[i] * deltaTime * (stormActive ? 1.45 : 1);
      positions[j + 1] += Math.sin(time * 2.2 + i * 0.13) * 0.003;
      if (positions[j + 2] > 34) {
        positions[j] = -9 + Math.random() * 18;
        positions[j + 1] = 1.2 + Math.random() * 2.4;
        positions[j + 2] = 4;
      }
    }
    flowGeometry.attributes.position.needsUpdate = true;
  }
  if (!paused && advancedTourEnabled) {
    advancedTourClock += deltaTime;
    const radius = 24;
    camera.position.set(Math.cos(advancedTourClock * 0.22) * radius, 10 + Math.sin(advancedTourClock * 0.37) * 3.5, Math.sin(advancedTourClock * 0.22) * radius);
    camera.lookAt(0, 4.5, 8);
  }

  if (!paused && advancedRainEnabled) {
    const rain = advancedRainGeometry.attributes.position.array;
    for (let i = 0; i < advancedRainCount; i++) {
      const j = i * 3;
      rain[j + 1] -= rainSpeeds[i] * deltaTime * (stormActive ? 1.65 : 1);
      rain[j] += deltaTime * (stormActive ? 2.4 : 0.7);
      if (rain[j + 1] < 0) {
        rain[j] = (Math.random() - 0.5) * 100;
        rain[j + 1] = 42 + Math.random() * 20;
        rain[j + 2] = (Math.random() - 0.5) * 100;
      }
    }
    advancedRainGeometry.attributes.position.needsUpdate = true;
  }
  if (!paused && advancedLightningEnabled && stormActive) {
    lightningCooldown -= deltaTime;
    if (lightningCooldown <= 0) {
      lightningCooldown = 2.8 + Math.random() * 5.5;
      lightningFlash = 0.12 + Math.random() * 0.12;
    }
  }
  if (lightningFlash > 0) {
    lightningFlash -= deltaTime;
    scene.background.set('#dceaf0');
    if (lightningFlash <= 0) scene.background.set(nightMode ? '#071522' : '#a9ccd5');
  }

  // Ease only an explicitly requested preset/reset. Never fight manual orbit dragging.
  if (cameraTransitionActive) {
    camera.position.lerp(cameraTargetPosition, 1 - Math.exp(-cameraSmoothing * 60 * deltaTime));
    if (camera.position.distanceTo(cameraTargetPosition) < 0.08) {
      camera.position.copy(cameraTargetPosition);
      cameraTransitionActive = false;
    }
  }
  // Smooth component offsets and the additional simulation controls.
  const explodeTarget = dwExploded ? 1 : 0;
  dwExplodeProgress += (explodeTarget - dwExplodeProgress) * Math.min(1, deltaTime * 2.5);
  dam.position.y = dwDamBasePosition.y + dwExplodeProgress * 2.2;
  gates.forEach((gate, index) => {
    const side = index - (gates.length - 1) / 2;
    gate.position.x = dwGateBasePositions[index].x + side * dwExplodeProgress * 0.65;
    gate.position.z = dwGateBasePositions[index].z + dwExplodeProgress * 1.5;
  });
  if (dwDefectGroup.visible) {
    dwDefectGroup.children.forEach((marker, index) => {
      const pulse = 1 + Math.sin(timestamp * .006 + index) * .18;
      marker.scale.setScalar(pulse);
    });
  }
  if (!paused && dwGateCycling) {
    dwGateCycleClock += deltaTime;
    const cyc = (Math.sin(dwGateCycleClock * .65) + 1) * 50;
    opening = Math.round(cyc);
    $('#gateSlider').value = opening;
    $('#gateLabel').textContent = `${opening}%`;
    $('#gateStat').textContent = `${opening}%`;
    gates.forEach(g => { g.userData.targetY = g.userData.closedY + opening * .036; });
    updateDashboard();
  }
  if (!paused && dwTimelinePlaying) {
    dwTimelineValue += deltaTime * 5;
    if (dwTimelineValue >= 100) dwTimelineValue = 0;
    $('#dwTimeline').value = Math.round(dwTimelineValue);
    $('#dwTimelineLabel').textContent = `${Math.round(dwTimelineValue)}%`;
    dwApplyTimeline(dwTimelineValue / 100);
  }

  orbit.update();
  renderer.render(scene, camera);
}

animate();

function tickClock() {
  $('#clock').textContent = new Date().toLocaleString();
}

tickClock();
setInterval(tickClock, 1000);