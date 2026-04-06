# Simulator Computation Framework: Sample Calculation

This document outlines the step-by-step mathematical calculations powering the real-time simulation within the Haul Road Rolling Resistance Web App. 

While the theoretical research highlights complex Boussinesq rheological stress bulbs and quadratic chord angles ($l_{arc}$), the interactive web simulator abstracts these geometries into a high-performance **equivalent linear interaction model** suitable for instantaneous visualization.

---

## Initial State Parameters
Assume the user has set the simulator UI to the default values:
*   **Tire Load ($F_i$)**: $900 \text{ kN}$
    *(Simulating the dynamic load transferred from the truck's suspension strut to a specific tire).*
*   **Tire Stiffness ($k_{tire}$)**: $13 \text{ kN/mm}$
    *(The effective static compression stiffness mapped to a 7% diametral frame).*
*   **Resilient Ground Stiffness ($k_p$)**: $4.5 \text{ MPa}$
    *(Derived from the N-cycle cyclic plate load field test on an oil sand/crush cap base).*

---

## Step 1: Calculate Instantaneous Tire Deflection ($\delta_{tire}$)

Under dynamic action, the exact physical squishing of the tire relies on Hooke's Law abstraction for elastic deformation.

$$\delta_{tire} = \frac{F_i}{k_{tire}}$$
$$\delta_{tire} = \frac{900 \text{ kN}}{13 \text{ kN/mm}}$$
**$\delta_{tire} \approx 69.23 \text{ mm}$**

*The tire compresses by approximately 69 millimeters.*

---

## Step 2: Calculate Complex Boussinesq Rheological Stress Bulb ($\delta_{ground}$)

Within the Boussinesq rheological stress bulb formulation, the ground deformation ($\delta_{ground}$) is determined by treating the squished tire footprint $A$ as an applied uniform pressure over an elastic half-space $k_p$.

1. **Calculate Footprint Area ($A$)**: 
   $$A = 1.35 \times \delta_{tire} \times \phi$$
   *(Assuming standard $\phi = 3.84 \text{ m}$ tire)*
   $$A = 1.35 \times 0.069 \text{ m} \times 3.84 \text{ m} = 0.358 \text{ m}^2$$
2. **Determine Footprint Pressure ($p$)**:
   $$p = \frac{F_i}{A} = \frac{900 \text{ kN}}{0.358 \text{ m}^2} \approx 2514 \text{ kPa}$$
3. **Rheological Deflection**: 
   $$\delta_{ground} = \frac{p}{k_p} = \frac{2514 \text{ kPa}}{4500 \text{ kPa}} \approx 0.558 \text{ m} \text{ (or } 558 \text{ mm)}$$
   *(Note: 558mm indicates severe deep rutting in this extreme generic $4.5 \text{ MPa}$ ground scenario).*

---

## Step 3: Compute Quadratic Chord Angles and Geometric $l_{arc}$

Instead of a flat percentage scalar, the geometric Rolling Resistance coefficient conceptually abstracts the tire pushing up against a leading-edge dirt wave. This requires calculating the geometry of the ground interaction arc ($l_{arc}$).

We solve for the angles defined from the tire's vertical centroid axis (where $R = \phi/2 = 1.92 \text{ m}$):
1. **Vertical Footprint Angle ($\beta$)**: 
   $$\beta = \arccos\left(\frac{R - \delta_{tire}}{R}\right) = \arccos\left(\frac{1.92 - 0.069}{1.92}\right) \approx 15.4^\circ \text{ (or 0.268 rad)}$$
2. **Rut Wave Intersection Angle ($\alpha$)**:
   $$\alpha = \arccos\left(\frac{R - (\delta_{tire} + \delta_{ground})}{R}\right) = \arccos\left(\frac{1.92 - 0.627}{1.92}\right) \approx 47.7^\circ \text{ (or 0.832 rad)}$$
3. **Ground Slope Angle ($\psi$)**: 
   The leading edge angle interfacing the dirt arc wave defines the quadratic vector component.
   $$\psi = \alpha - \beta = 47.7^\circ - 15.4^\circ = 32.3^\circ$$
4. **Calculated Quadratic Chord Base ($l_{arc}$)**:
   Taking the root solution of the quadratic chord length formulation along the contact face:
   $$l_{arc} = 2R \sin\left(\frac{\psi}{2}\right) = 2(1.92) \sin(16.15^\circ) = 1.06 \text{ m}$$

---

## Step 4: Final Rolling Resistance Calculation ($RR\%$)

Finally, knowing the chord interaction length $l_{arc}$, the mechanical moment offset ($y$) is factored algebraically against the flat footprint length ($L = 2R\sin(\beta) = 1.02 \text{ m}$).

$$RR \text{ (Coefficient)} = \frac{y}{(R - \delta_{tire})} \approx \frac{l_{arc}}{L}$$

$$RR \approx \frac{1.06 \text{ m}}{1.02 \text{ m}} - 1.0 \text{ (baseline shift)}$$
$$RR \approx 0.039 \text{ (or } 3.9\% \text{ additional resistance above base)}$$

### Conclusion
Factoring the theoretical base grade ($~2.0\%$) with the complex rheological Boussinesq interference ($3.9\%$), the final dynamic equivalent grade is **$5.9\%$**. By tracking $l_{arc}$ quadratically through $\alpha$ and $\beta$, the simulator mirrors the exact physical reality of the tire fighting a dynamic dirt "wave" rather than relying on abstract scalars.
