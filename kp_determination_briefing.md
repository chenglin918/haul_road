# Standard Operating Procedure: Field Determination of Resilient Pressure Stiffness (k_p)

This briefing outlines the cyclic plate load test methodology employed to determine the Resilient Pressure Stiffness ($k_p$) of haul road ground materials, serving as a critical parameter in the theoretical calculation of in-field rolling resistance.

## 1. Objective
To establish the resilient elastic equilibrium properties of ground surface conditions (e.g., oil sand, waste rock, wearing course caps) enabling accurate prediction of geometric rolling resistance for large-scale haulers.

## 2. Equipment Requirements
*   **Cyclic Plate Load Assembly**: An in-line bearing plate of known footprint area.
*   **Hydraulic Ram**: Driven load actuator with a built-in pressure transducer. Typically mounted on the hitch assembly of a light duty utility vehicle.
*   **Displacement Sensors**: An independent ground-referencing wire extensometer or parallel automated dial-gauge array to measure plate sinkage accurately.
*   **Data Acquisition System**: Real-time DAQ to verify cyclic convergence of deformation parameters.

## 3. Preparation and Placement
1.  **Site Selection**: Identify representative haul network locations, focusing on transitions, intersections, and highly traffic-pulped zones.
2.  **Surface Prep**: Grade or smooth the immediate test zone slightly (if grossly uneven) to secure uniform mating between the bearing plate and the running surface.
3.  **Deployment**: Lower the assembly from the light vehicle hitch, ensuring the plate rests squarely atop the material. Independent reference points for the extensometer must be firmly set outside the immediate pressure bulb of the plate.

## 4. Test Execution (The Boussinesq Strain Protocol)
1.  **Define Equipment & Plate Size**: The field test typically employs a standard **0.3m (12") to 0.45m (18") diameter bearing plate** mounted to the light-vehicle hitch, though scaled lab tests often use a 0.076m (3") plate. 
2.  **Define Peak Pressure (Loading Level)**: Calculate the nominal 1g static ground bearing pressure imparted by the target haul truck tires to act as the peak cyclic pressure. 
    *For example, a Caterpillar 797 at 558 metric tons gross vehicle weight loads ~912 kN (93 mt) per tire at 1g. With a 7% strain developing a 1.39 m² footprint, the target field bearing pressure is approx. **656 kPa**.*
3.  **Actuate Cycling (Frequency)**: Initiate a smooth hydraulically-actuated unload–reload cyclic protocol. Load steadily to the 656 kPa target, then fully release. Apply cycles at a steady low frequency (typically **~0.5 to 1.0 Hz**) or as fast as the hydraulic rig safely permits full stress-strain curve capture per cycle.
4.  **Monitor Deformation Convergence**: With each repetition, measure plastic vs. elastic deformation ($\delta_{ground}$). The first few cycles will typically exhibit dominant plastic failure/consolidation ruts.
5.  **Confirm Resiliency**: Continue cycling $N$ times until a *resilient constant cyclic deformation* ($\delta_{resilient}$) is observed. This represents the condition where the subgrade fully rebounds within an elastic threshold equal to the deformation applied.

### Illustrative Resilient Convergence Curve:
```text
Deformation (mm)
  | 
50|  X (Cycle 1 - Large initial plastic rut)
  |   \
40|    X (Cycle 2)
  |     \ 
30|      X (Cycle 3)
  |       X-------------X (Cycle N - Asymptotic Convergence)
20|                      \    
  |                       --> Δδ_resilient (Elastic Rebound)
10|
  |_________________________________________
        1    2    3    4    5    6    N   (Load Cycles)
```

## 5. Calculation of $k_p$
Once resilient state ($N$ test cycles) is achieved, Resilient Pressure Stiffness is geometrically extracted:

k_p = Δσ / Δδ_{resilient}

*Where:*
*   **Δσ** = Peak bearing cyclic pressure (load/area) matching 1g nominal tire metrics.
*   **Δδ_{resilient}** = Max downward deflection during the elastic equilibrium $N^{th}$ cycle.
*   **$k_p$** = Yields a field stiffness parameter typically denoted in $MPa$ or comparable modulus dimension.

## 6. Procedural Notes
*   *Mobility*: Because the test utilizes a hitch-mounted, unload-reload mechanism, measurements take mere minutes per site, allowing rapid profiling GPS-linked testing across dozens of daily segments.
*   *Application*: Merge logged $k_p$ datasets with dynamic hauler strut pressure (F_i) logs to comprehensively map real-time mine network Rolling Resistance coefficients.
*   

1. Derivation of Footprint Area ($A$)
The paper establishes an empirical correlation for off-road radial tires where the footprint area $A$ is a direct function of the tire's diametral strain. From the text's scale example, the formula used is: $$A = 1.35 \times (\text{Diametral Strain}) \times \phi^2$$

Since Diametral Strain is just the tire's deflection divided by its diameter $\left(\frac{\delta_{tire}}{\phi}\right)$, this simplifies to: $$A = 1.35 \times \delta_{tire} \times \phi$$ (Where $\phi$ is the tire diameter and $\delta_{tire}$ is the vertical tire deflection).

2. Geometric Derivation of Length ($L$)
When a circular tire is squashed against the ground, the length of the flat contact patch ($L$) is geometrically identical to the chord length of a circle segment cut off by the deflection depth ($\delta_{tire}$). Using standard circular trigonometry: $$L = 2 \sqrt{\left(\frac{\phi}{2}\right)^2 - \left(\frac{\phi}{2} - \delta_{tire}\right)^2}$$

Expanding the polynomials inside the root: $$L = 2 \sqrt{\phi \cdot \delta_{tire} - \delta_{tire}^2}$$

As you can see, the length $L$ requires exactly zero field measurements. It relies entirely on the tire diameter ($\phi$) and how much the tire is currently deflected ($\delta_{tire}$).

3. Abstraction of Width ($w$)
Because a tire's physical frame mostly deflects vertically and along the rotational axis, its horizontal bulging (width) effectively hits a rigid structural limit very quickly. Therefore, $w$ is treated as an "effectively constant tire width" in the Boussinesq model.

Even if we needed a dynamic $w$, since the contact patch roughly approximates a rectangle/ellipse ($A \approx L \times w$), it would simply be calculated internally as $w = \frac{A}{L}$.

Conclusion
To calculate the geometric angles ($\alpha, \beta, \psi$) and the ground interaction arc ($l_{arc}$) for Rolling Resistance, the model only needs the fundamental drivers: Tire Diameter ($\phi$) and Tire Deflection ($\delta_{tire}$). From those two inputs, $L$, $w$, and $A$ perfectly define themselves automatically!
