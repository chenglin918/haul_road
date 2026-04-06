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

## Step 2: Calculate Equivalent Ground Deflection ($\delta_{ground}$)

To create a responsive web environment, the complex non-linear rutting formulas from the Boussinesq stress bulb (Eq 6 & Eq 7 in the paper) are condensed into a proportional scaled heuristic. 

$$\delta_{ground} = \left(\frac{F_i}{k_p}\right) \times 0.15$$
$$\delta_{ground} = \left(\frac{900}{4.5}\right) \times 0.15$$
$$\delta_{ground} = 200 \times 0.15$$
**$\delta_{ground} = 30 \text{ mm}$**

*The wheels dig a rut approximately 30 millimeters deep into the material.*

---

## Step 3: Compute Geometric Rolling Resistance ($RR\%$)

Rolling resistance acts as an "effective uphill slope" that the engine must continuously fight to climb out of its own rut. The simulator mathematically binds the tire deflection width (footprint variance) and the ground deflection depth (rut geometry) to a pure hard-surface baseline rolling resistance ($RR_{base} = 2.0\%$).

$$RR\% = RR_{base} + \left(\delta_{ground} \times 0.2\right) + \left(\delta_{tire} \times 0.05\right)$$

Plugging in our derived values:
$$RR\% = 2.0 + \left(30 \times 0.2\right) + \left(69.23 \times 0.05\right)$$
$$RR\% = 2.0 + 6.0 + 3.46$$
**$RR\% = 11.46\%$**

### Conclusion
At $900\text{ kN}$ of force on ground rated at $4.5\text{ MPa}$, the suspension mapping generates **$11.46\%$** Rolling Resistance. This means $11.46\%$ of the vehicle's motive force is permanently lost just overcoming the tire footprint friction and pushing through the squishy 30mm rut.
