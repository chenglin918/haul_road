import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import katex from 'katex';
import puppeteer from 'puppeteer';

const rootDir = process.cwd();
const publicDir = path.join(rootDir, 'public');
const distDir = path.join(rootDir, 'dist');
const katexCssPath = path.join(rootDir, 'node_modules', 'katex', 'dist', 'katex.min.css');
const katexFontsDir = path.join(rootDir, 'node_modules', 'katex', 'dist', 'fonts');

function renderMath(math) {
  return katex.renderToString(math, {
    displayMode: true,
    throwOnError: false,
    output: 'htmlAndMathml',
    strict: 'ignore',
  });
}

function fontAwareKatexCss(css) {
  const fontsBase = pathToFileURL(`${katexFontsDir}${path.sep}`).href;
  return css.replace(/url\((fonts\/[^)]+)\)/g, (_, fontPath) => `url("${fontsBase}${fontPath.slice('fonts/'.length)}")`);
}

function shellPage({ title, subtitle, lead, badges = [], body, palette = 'blue' }, katexCss) {
  return `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>${title}</title>
      <style>
        ${katexCss}
        @page {
          size: Letter;
          margin: 0.55in;
        }
        :root {
          --page-bg: #f4f7fb;
          --surface: #ffffff;
          --surface-muted: #eff4fa;
          --text: #162132;
          --muted: #536274;
          --line: #d8e1ee;
          --shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
          --blue: #2563eb;
          --blue-soft: #dbeafe;
          --green: #0f9b6c;
          --green-soft: #d7f4e8;
          --amber: #b7791f;
          --amber-soft: #f8ebcb;
        }
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          background: var(--page-bg);
          color: var(--text);
          font-family: Georgia, "Times New Roman", serif;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .page {
          display: grid;
          gap: 16px;
        }
        .hero {
          background:
            radial-gradient(circle at top right, rgba(37, 99, 235, 0.08), transparent 40%),
            linear-gradient(180deg, #ffffff, #f7f9fc);
          border: 1px solid var(--line);
          border-radius: 24px;
          padding: 28px 30px;
          box-shadow: var(--shadow);
        }
        .hero h1 {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 24px;
          line-height: 1.15;
          letter-spacing: -0.02em;
        }
        .hero .subtitle {
          margin-top: 8px;
          color: var(--muted);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 13.5px;
          line-height: 1.55;
        }
        .hero .lead {
          margin-top: 14px;
          font-size: 13.5px;
          line-height: 1.7;
        }
        .badge-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 14px;
        }
        .badge {
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid var(--line);
          background: #fff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--muted);
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 14px;
        }
        .span-12 { grid-column: span 12; }
        .span-8 { grid-column: span 8; }
        .span-6 { grid-column: span 6; }
        .span-4 { grid-column: span 4; }
        .card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 20px;
          padding: 18px 18px 16px;
          box-shadow: var(--shadow);
          break-inside: avoid;
        }
        .card h2 {
          margin: 0 0 8px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 15px;
          line-height: 1.25;
        }
        .card h3 {
          margin: 0 0 6px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 13px;
          line-height: 1.3;
        }
        .kicker {
          margin-bottom: 6px;
          color: var(--muted);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.14em;
        }
        .math-card {
          position: relative;
          overflow: hidden;
        }
        .math-card::before {
          content: "";
          position: absolute;
          inset: 0 auto 0 0;
          width: 5px;
          background: var(--blue);
        }
        .math-card.green::before {
          background: var(--green);
        }
        .math-card.amber::before {
          background: var(--amber);
        }
        .math-wrap {
          margin-top: 10px;
          padding: 12px 14px;
          border-radius: 14px;
          background: var(--surface-muted);
          overflow-x: auto;
        }
        .math-wrap .katex-display {
          margin: 0;
        }
        .note {
          margin-top: 10px;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.6;
        }
        .metric-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .metric {
          padding: 14px;
          border-radius: 16px;
          border: 1px solid var(--line);
          background: #fff;
        }
        .metric-label {
          color: var(--muted);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }
        .metric-value {
          margin-top: 8px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 21px;
          font-weight: 700;
          color: var(--text);
        }
        .metric-note {
          margin-top: 6px;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.55;
        }
        .step-list {
          display: grid;
          gap: 12px;
        }
        .step {
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 14px;
          background: #fff;
        }
        .step-head {
          display: grid;
          grid-template-columns: 32px 1fr;
          gap: 10px;
          align-items: start;
        }
        .step-index {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 999px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 11px;
          font-weight: 700;
          background: ${palette === 'green' ? 'var(--green-soft)' : 'var(--blue-soft)'};
          color: ${palette === 'green' ? 'var(--green)' : 'var(--blue)'};
        }
        .step-title {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 13px;
          font-weight: 700;
          line-height: 1.35;
        }
        .step-text {
          margin-top: 4px;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.55;
        }
        .result {
          margin-top: 10px;
          display: inline-block;
          padding: 6px 10px;
          border-radius: 999px;
          background: ${palette === 'green' ? 'var(--green-soft)' : 'var(--blue-soft)'};
          color: ${palette === 'green' ? 'var(--green)' : 'var(--blue)'};
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 11.5px;
          font-weight: 700;
        }
        ul {
          margin: 8px 0 0 18px;
          padding: 0;
        }
        li {
          margin: 0 0 7px;
          line-height: 1.55;
          font-size: 12.5px;
        }
        .footer-note {
          color: var(--muted);
          font-size: 11.5px;
          line-height: 1.55;
          text-align: center;
          padding: 6px 0 2px;
        }
      </style>
    </head>
    <body>
      <main class="page">
        <section class="hero">
          <h1>${title}</h1>
          <div class="subtitle">${subtitle}</div>
          <p class="lead">${lead}</p>
          ${badges.length ? `<div class="badge-row">${badges.map((badge) => `<span class="badge">${badge}</span>`).join('')}</div>` : ''}
        </section>
        ${body}
      </main>
    </body>
  </html>`;
}

function renderSampleCalculation(katexCss) {
  const tireLoad = 900;
  const tireStiffness = 13;
  const groundStiffness = 4.5;
  const phi = 3.84;
  const radius = phi / 2;
  const deltaTireMeters = (tireLoad / tireStiffness) / 1000;
  const tireDeflectionMm = deltaTireMeters * 1000;
  const linearGroundDeflectionMm = (tireLoad / groundStiffness) * 0.15;
  const linearRr = 2 + (linearGroundDeflectionMm * 0.2) + (tireDeflectionMm * 0.05);
  const area = 1.35 * deltaTireMeters * phi;
  const footprintLength = 2 * Math.sqrt(Math.max(0, (phi * deltaTireMeters) - (deltaTireMeters ** 2)));
  const tireWidth = area / footprintLength;
  const deltaGroundMeters = tireLoad / (area * groundStiffness * 1000);
  const deltaGroundMm = deltaGroundMeters * 1000;
  const betaHalfSine = footprintLength / phi;
  const beta = 2 * Math.asin(betaHalfSine);
  const lArc = 0.5 * phi * (Math.sqrt((betaHalfSine ** 2) + ((4 * deltaGroundMeters) / phi)) - betaHalfSine);
  const alpha = 2 * Math.asin(lArc / phi);
  const omega = Math.asin(deltaGroundMeters / lArc);
  const projectedLead = lArc * Math.cos(omega);
  const leadingEdgeOffset = (0.5 * footprintLength) + projectedLead;
  const reactionOffset = (
    leadingEdgeOffset - (
      (
        ((2 / 3) * (projectedLead ** 2) * deltaGroundMeters)
        + ((Math.PI / 8) * ((footprintLength + projectedLead) ** 3))
      ) / (
        (projectedLead * deltaGroundMeters)
        + ((Math.PI / 4) * ((footprintLength + projectedLead) ** 2))
      )
    )
  );
  const paperRr = (reactionOffset / (radius - deltaTireMeters)) * 100;

  return shellPage(
    {
      title: 'Simulator Computation Framework',
      subtitle: 'Readable sample calculation sheet for the Haul Road Rolling Resistance model',
      lead:
        'This version is organized for print and screen reading. Method B now follows the paper directly using Eq. (1), Eq. (3), Eq. (5), Eq. (6), and Eq. (8) through Eq. (11), while Method A remains the fast operational heuristic.',
      badges: ['Tire Load: 900 kN', 'Tire Stiffness: 13 kN/mm', 'Ground Stiffness: 4.5 kPa/mm', `Derived Width: ${tireWidth.toFixed(2)} m`],
      palette: 'blue',
      body: `
        <section class="grid">
          <article class="card span-12">
            <h2>Initial State Parameters</h2>
            <div class="metric-grid">
              <div class="metric">
                <div class="metric-label">Tire Load</div>
                <div class="metric-value">900 kN</div>
                <div class="metric-note">Dynamic load transferred to an individual tire from the suspension strut.</div>
              </div>
              <div class="metric">
                <div class="metric-label">Tire Stiffness</div>
                <div class="metric-value">13 kN/mm</div>
                <div class="metric-note">Effective tire stiffness corresponding to the mapped 7% diametral strain condition.</div>
              </div>
              <div class="metric">
                <div class="metric-label">Ground Stiffness</div>
                <div class="metric-value">4.5 kPa/mm</div>
                <div class="metric-note">Resilient pressure stiffness derived from the cyclic plate load test and used directly in Eq. (6).</div>
              </div>
            </div>
          </article>
          <article class="card span-6">
            <div class="kicker">Method A</div>
            <h2>Equivalent Linear Interaction Model</h2>
            <div class="card math-card" style="box-shadow:none; margin-bottom:12px; padding:14px 14px 12px;">
              <div class="kicker">Key Equation</div>
              <h3>Method A rolling resistance</h3>
              <div class="math-wrap">${renderMath(String.raw`RR\% = 2.0 + \left(\delta_{ground} \times 0.2\right) + \left(\delta_{tire} \times 0.05\right)`)}</div>
            </div>
            <div class="step-list">
              <div class="step">
                <div class="step-head">
                  <div class="step-index">01</div>
                  <div>
                    <div class="step-title">Tire deflection</div>
                    <div class="step-text">Elastic tire compression under the applied wheel load.</div>
                  </div>
                </div>
                <div class="math-wrap">${renderMath(String.raw`\delta_{tire} = \frac{F_i}{k_{tire}} = \frac{900}{13} = 69.23\ \text{mm}`)}</div>
                <div class="result">Compression = 69.23 mm</div>
              </div>
              <div class="step">
                <div class="step-head">
                  <div class="step-index">02</div>
                  <div>
                    <div class="step-title">Equivalent ground deflection</div>
                    <div class="step-text">A proportional field-friendly map representing the ground response.</div>
                  </div>
                </div>
                <div class="math-wrap">${renderMath(String.raw`\delta_{ground} = \left(\frac{F_i}{k_p}\right)\times 0.15 = \left(\frac{900}{4.5}\right)\times 0.15 = 30.0\ \text{mm}`)}</div>
                <div class="result">Ground sink = 30.0 mm</div>
              </div>
              <div class="step">
                <div class="step-head">
                  <div class="step-index">03</div>
                  <div>
                    <div class="step-title">Linear rolling resistance</div>
                    <div class="step-text">Baseline hard-surface resistance plus tire and ground deformation penalties.</div>
                  </div>
                </div>
                <div class="math-wrap">${renderMath(String.raw`RR\% = 2.0 + \left(30.0 \times 0.2\right) + \left(69.23 \times 0.05\right) = 11.46\%`)}</div>
                <div class="result">RR_linear = 11.46%</div>
              </div>
            </div>
          </article>
          <article class="card span-6">
            <div class="kicker">Method B</div>
            <h2>Paper Geometric Model</h2>
            <div class="card math-card green" style="box-shadow:none; margin-bottom:12px; padding:14px 14px 12px;">
              <div class="kicker">Key Equation</div>
              <h3>Paper Eq. (1)</h3>
              <div class="math-wrap">${renderMath(String.raw`RR\% = 100\left(\frac{y}{\left(\frac{\phi_{\text{tire}}}{2} - \delta_{\text{tire}}\right)}\right)`)}</div>
            </div>
            <div class="step-list">
              <div class="step">
                <div class="step-head">
                  <div class="step-index">01</div>
                  <div>
                    <div class="step-title">Footprint geometry</div>
                    <div class="step-text">Eq. (5) gives the area and A = Lw provides the base contact length used in Eq. (10).</div>
                  </div>
                </div>
                <div class="math-wrap">${renderMath(String.raw`A = 1.35\,\delta_{tire}\phi = 1.35 \times ${deltaTireMeters.toFixed(3)} \times ${phi.toFixed(2)} = ${area.toFixed(3)}\ \text{m}^2`)}</div>
                <div class="math-wrap">${renderMath(String.raw`L = 2\sqrt{\phi\,\delta_{tire} - \delta_{tire}^2} = 2\sqrt{(${phi.toFixed(2)})(${deltaTireMeters.toFixed(3)}) - (${deltaTireMeters.toFixed(3)})^2} = ${footprintLength.toFixed(3)}\ \text{m}`)}</div>
                <div class="result">A = ${area.toFixed(3)} m², L = ${footprintLength.toFixed(3)} m</div>
              </div>
              <div class="step">
                <div class="step-head">
                  <div class="step-index">02</div>
                  <div>
                    <div class="step-title">Effective width and ground deformation</div>
                    <div class="step-text">Width follows from A = Lw, then Eq. (6) uses the footprint area and resilient pressure stiffness k_p.</div>
                  </div>
                </div>
                <div class="math-wrap">${renderMath(String.raw`w = \frac{A}{L} = \frac{${area.toFixed(3)}}{${footprintLength.toFixed(3)}} = ${tireWidth.toFixed(3)}\ \text{m}`)}</div>
                <div class="math-wrap">${renderMath(String.raw`\delta_{ground} = \frac{F_i}{A\,k_p} = \frac{${tireLoad}}{${area.toFixed(3)} \times (${groundStiffness.toFixed(2)} \times 1000)} = ${deltaGroundMeters.toFixed(3)}\ \text{m}`)}</div>
                <div class="result">w = ${tireWidth.toFixed(3)} m, δ_ground = ${deltaGroundMm.toFixed(1)} mm</div>
              </div>
              <div class="step">
                <div class="step-head">
                  <div class="step-index">03</div>
                  <div>
                    <div class="step-title">Lead contact geometry</div>
                    <div class="step-text">Eq. (8), Eq. (9), Eq. (10), and Eq. (11) define the geometry of the leading tire-ground contact.</div>
                  </div>
                </div>
                <div class="math-wrap">${renderMath(String.raw`\beta = ${(beta * 180 / Math.PI).toFixed(2)}^\circ,\ \alpha = ${(alpha * 180 / Math.PI).toFixed(2)}^\circ,\ \omega = ${(omega * 180 / Math.PI).toFixed(2)}^\circ`)}</div>
                <div class="math-wrap">${renderMath(String.raw`l_{arc} = ${lArc.toFixed(3)}\ \text{m}, \quad l_{arc}\cos\omega = ${projectedLead.toFixed(3)}\ \text{m}`)}</div>
                <div class="result">l_arc = ${lArc.toFixed(3)} m</div>
              </div>
              <div class="step">
                <div class="step-head">
                  <div class="step-index">04</div>
                  <div>
                    <div class="step-title">Reaction offset and rolling resistance</div>
                    <div class="step-text">Eq. (3) gives y and Eq. (1) converts that offset into equivalent slope percent.</div>
                  </div>
                </div>
                <div class="math-wrap">${renderMath(String.raw`y = ${reactionOffset.toFixed(3)}\ \text{m}`)}</div>
                <div class="math-wrap">${renderMath(String.raw`RR\% = 100\left(\frac{${reactionOffset.toFixed(3)}}{\left(\frac{${phi.toFixed(2)}}{2} - ${deltaTireMeters.toFixed(3)}\right)}\right) = ${paperRr.toFixed(2)}\%`)}</div>
                <div class="result">RR_paper = ${paperRr.toFixed(2)}%</div>
              </div>
            </div>
          </article>
        </section>
        <div class="footer-note">Prepared for web download and print review. All equations are rendered in KaTeX for consistent browser and PDF readability.</div>
      `,
    },
    katexCss,
  );
}

function renderKpBriefing(katexCss) {
  return shellPage(
    {
      title: 'Field Determination of Resilient Pressure Stiffness (k_p)',
      subtitle: 'Condensed operating procedure and geometric reference sheet',
      lead:
        'This briefing turns the original note into a print-first field handout. Key equations are isolated into bordered math cards and the procedure is condensed into an operational checklist.',
      badges: ['Plate Diameter: 0.3 to 0.45 m', 'Target Pressure: 1g tire bearing pressure', 'Typical Cycling Rate: 0.5 to 1.0 Hz'],
      palette: 'green',
      body: `
        <section class="grid">
          <article class="card span-8">
            <div class="kicker">Field Procedure</div>
            <h2>Execution sequence</h2>
            <div class="step-list">
              <div class="step">
                <div class="step-head">
                  <div class="step-index">01</div>
                  <div>
                    <div class="step-title">Prepare and place the plate</div>
                    <div class="step-text">Select representative haul-road locations, smooth the immediate contact zone, and seat the bearing plate squarely on the running surface.</div>
                  </div>
                </div>
              </div>
              <div class="step">
                <div class="step-head">
                  <div class="step-index">02</div>
                  <div>
                    <div class="step-title">Match the target tire pressure</div>
                    <div class="step-text">Set the cyclic loading target to the nominal 1g tire bearing pressure for the haul truck being modeled.</div>
                  </div>
                </div>
              </div>
              <div class="step">
                <div class="step-head">
                  <div class="step-index">03</div>
                  <div>
                    <div class="step-title">Cycle until deformation converges</div>
                    <div class="step-text">Repeat unload-reload cycles until the resilient portion of the deformation stabilizes and the response becomes repeatable.</div>
                  </div>
                </div>
              </div>
              <div class="step">
                <div class="step-head">
                  <div class="step-index">04</div>
                  <div>
                    <div class="step-title">Record the resilient rebound response</div>
                    <div class="step-text">Use the peak cyclic stress and the resilient elastic displacement from the converged cycle to compute k_p.</div>
                  </div>
                </div>
              </div>
            </div>
          </article>
          <article class="card span-4">
            <div class="kicker">Equipment</div>
            <h2>Required field setup</h2>
            <ul>
              <li>Cyclic plate load assembly with known footprint area.</li>
              <li>Hydraulic ram with reliable pressure readout.</li>
              <li>Independent ground-referenced displacement measurement.</li>
              <li>Data acquisition system to confirm cyclic convergence.</li>
            </ul>
          </article>
          <article class="card math-card green span-4">
            <div class="kicker">Primary Stiffness Equation</div>
            <h2>Resilient pressure stiffness</h2>
            <div class="math-wrap">${renderMath(String.raw`k_p = \frac{\Delta \sigma}{\Delta \delta_{\text{resilient}}}`)}</div>
            <div class="note">Use the peak cyclic pressure and the resilient elastic deformation measured from the converged cycle.</div>
          </article>
          <article class="card math-card span-4">
            <div class="kicker">Footprint Area</div>
            <h2>Empirical tire contact relation</h2>
            <div class="math-wrap">${renderMath(String.raw`A = 1.35 \times \delta_{tire} \times \phi`)}</div>
            <div class="note">The area is inferred from tire deflection and diameter rather than measured directly in the field.</div>
          </article>
          <article class="card math-card amber span-4">
            <div class="kicker">Footprint Chord</div>
            <h2>Contact patch length</h2>
            <div class="math-wrap">${renderMath(String.raw`L = 2\sqrt{\left(\frac{\phi}{2}\right)^2 - \left(\frac{\phi}{2} - \delta_{tire}\right)^2}`)}</div>
            <div class="note">This is the cleanest print form of the chord equation because it exposes the underlying circle geometry directly.</div>
          </article>
          <article class="card span-12">
            <div class="kicker">Interpretation Notes</div>
            <h2>How the geometry feeds the rolling resistance model</h2>
            <ul>
              <li>The simulator only needs a few primary drivers: tire load, tire stiffness, tire diameter, and resilient ground stiffness.</li>
              <li>From those values it can derive tire deflection, footprint area, footprint chord length, and the geometric interaction arc.</li>
              <li>Separating the equations into isolated math cards avoids the dense inline notation that becomes difficult to read in PDFs.</li>
            </ul>
          </article>
        </section>
        <div class="footer-note">Prepared as a compact field reference for the haul-road rolling resistance workflow.</div>
      `,
    },
    katexCss,
  );
}

async function ensureDir(directory) {
  await fs.mkdir(directory, { recursive: true });
}

async function writePdfToTargets(filename, pdfBuffer) {
  const targets = [
    path.join(rootDir, filename),
    path.join(publicDir, filename),
  ];

  if (await fs.stat(distDir).then(() => true).catch(() => false)) {
    targets.push(path.join(distDir, filename));
  }

  await Promise.all(targets.map(async (target) => {
    await ensureDir(path.dirname(target));
    await fs.writeFile(target, pdfBuffer);
  }));
}

async function generatePdf(browser, filename, html) {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({
    format: 'Letter',
    printBackground: true,
    margin: {
      top: '0.55in',
      right: '0.55in',
      bottom: '0.55in',
      left: '0.55in',
    },
  });
  await page.close();
  await writePdfToTargets(filename, pdfBuffer);
}

async function main() {
  const katexCssRaw = await fs.readFile(katexCssPath, 'utf8');
  const katexCss = fontAwareKatexCss(katexCssRaw);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    await generatePdf(browser, 'sample_calculation.pdf', renderSampleCalculation(katexCss));
    await generatePdf(browser, 'kp_determination_briefing.pdf', renderKpBriefing(katexCss));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
