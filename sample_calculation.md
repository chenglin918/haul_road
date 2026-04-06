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

## Method A: Equivalent Linear Interaction Model

The linear model abstracts the Boussinesq stress bulb into a highly performant proportional map.

**1. Calculate Equivalent Ground Deflection ($\delta_{ground}$)**
To create a responsive heuristic, the complex non-linear rutting formulas from the Boussinesq stress bulb are condensed into a proportional scaled evaluation. 

$$\delta_{ground} = \left(\frac{F_i}{k_p}\right) \times 0.15$$
$$\delta_{ground} = \left(\frac{900}{4.5}\right) \times 0.15 = 200 \times 0.15 = 30 \text{ mm}$$

**2. Compute Geometric Rolling Resistance ($RR\%$)**
The simulator mathematically binds the tire deflection and the ground deflection depth to a pure hard-surface baseline rolling resistance ($RR_{base} = 2.0\%$).

$$RR\% = RR_{base} + \left(\delta_{ground} \times 0.2\right) + \left(\delta_{tire} \times 0.05\right)$$
$$RR\% = 2.0 + \left(30 \times 0.2\right) + \left(69.23 \times 0.05\right)$$
$$RR\% = 2.0 + 6.0 + 3.46 = 11.46\%$$

---

## Method B: Complex Boussinesq Rheological Stress Bulb Model

Within the formal rheological model, the ground deformation is mapped explicitly through a stress bulb and geometric chord intersection wave.

**1. Calculate Footprint Pressure ($p$)**:
   $$A = 1.35 \times \delta_{tire} \times \phi = 1.35 \times 0.069 \text{ m} \times 3.84 \text{ m} = 0.358 \text{ m}^2$$
   $$p = \frac{F_i}{A} = \frac{900 \text{ kN}}{0.358 \text{ m}^2} \approx 2514 \text{ kPa}$$

**2. Rheological Deflection ($\delta_{ground}$)**:
   $$\delta_{ground} = \frac{p}{k_p} = \frac{2514 \text{ kPa}}{4500 \text{ kPa}} \approx 0.558 \text{ m} \text{ (or } 558 \text{ mm)}$$

**3. Compute Quadratic Chord Angles and Geometric $l_{arc}$**
   We solve for the interaction angle using tire vertical centroid axis ($R = \phi/2 = 1.92 \text{ m}$):
   $$\beta = \arccos\left(\frac{R - \delta_{tire}}{R}\right) = \arccos\left(\frac{1.92 - 0.069}{1.92}\right) \approx 15.4^\circ$$
   $$\alpha = \arccos\left(\frac{R - (\delta_{tire} + \delta_{ground})}{R}\right) = \arccos\left(\frac{1.92 - 0.627}{1.92}\right) \approx 47.7^\circ$$
   $$\psi = \alpha - \beta = 32.3^\circ$$
   $$l_{arc} = 2R \sin\left(\frac{\psi}{2}\right) = 2(1.92) \sin(16.15^\circ) = 1.06 \text{ m}$$

**4. Final Rolling Resistance Calculation ($RR\%$)**
   $$RR = \frac{l_{arc}}{L} = \frac{1.06 \text{ m}}{1.02 \text{ m}} - 1.0 \text{ (baseline shift)} \approx 3.9\%$$
   
**Conclusion B**: Dynamic Grade Equivalent = Base ($2.0\%$) + Rutting ($3.9\%$) = **$5.9\%$**.
