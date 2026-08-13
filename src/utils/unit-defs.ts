// ---------------------------------------------------------------------------
// Unit catalog — all categories with SI base units and conversion factors
// ---------------------------------------------------------------------------
// Conversion model:  toBase(x)   = x * factor + (offset ?? 0)
//                    fromBase(b) = (b - (offset ?? 0)) / factor
//
// offset is non-zero only for affine temperature scales (°C, °F, °R).
// Every other unit has offset = 0 and only needs factor.
// ---------------------------------------------------------------------------

export type UnitSystem = 'metric' | 'english' | 'both';

export interface UnitDef {
  id: string; // unique within its category
  label: string; // human-readable name
  symbol: string; // display symbol (may include unicode superscripts/dots)
  factor: number; // multiply value by this to get SI base value
  offset?: number; // add after multiplying (temperature only)
  system: UnitSystem;
  /** Dimensional decomposition into primitive unit ids.
   *  Only defined when 1 [unit] = 1 [product of base units] exactly so the
   *  numeric value is unchanged by expansion.  parseUnitExpr uses this to
   *  expand compound units (e.g. ksi → kip·in⁻²) so unit cancellation works. */
  baseUnits?: Readonly<Record<string, number>>;
}

export interface UnitCategory {
  id: string;
  label: string;
  siBase: string; // symbol of the SI base unit for this category
  units: readonly UnitDef[];
}

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

const _PI = Math.PI;

export const UNIT_CATEGORIES: Record<string, UnitCategory> = {
  // ---- Length (base: m) ---------------------------------------------------
  length: {
    id: 'length',
    label: 'Length',
    siBase: 'm',
    units: [
      { id: 'mm', label: 'Millimeters', symbol: 'mm', factor: 1e-3, system: 'metric' },
      { id: 'cm', label: 'Centimeters', symbol: 'cm', factor: 1e-2, system: 'metric' },
      { id: 'm', label: 'Meters', symbol: 'm', factor: 1, system: 'metric' },
      { id: 'km', label: 'Kilometers', symbol: 'km', factor: 1e3, system: 'metric' },
      { id: 'in', label: 'Inches', symbol: 'in', factor: 0.0254, system: 'english' },
      { id: 'ft', label: 'Feet', symbol: 'ft', factor: 0.3048, system: 'english' },
      { id: 'yd', label: 'Yards', symbol: 'yd', factor: 0.9144, system: 'english' },
      { id: 'mi', label: 'Miles', symbol: 'mi', factor: 1609.344, system: 'english' },
    ],
  },

  // ---- Area (base: m²) ----------------------------------------------------
  area: {
    id: 'area',
    label: 'Area',
    siBase: 'm²',
    units: [
      { id: 'mm2', label: 'Square Millimeters', symbol: 'mm²', factor: 1e-6, system: 'metric' },
      { id: 'cm2', label: 'Square Centimeters', symbol: 'cm²', factor: 1e-4, system: 'metric' },
      { id: 'm2', label: 'Square Meters', symbol: 'm²', factor: 1, system: 'metric' },
      { id: 'km2', label: 'Square Kilometers', symbol: 'km²', factor: 1e6, system: 'metric' },
      { id: 'ha', label: 'Hectares', symbol: 'ha', factor: 1e4, system: 'metric' },
      { id: 'in2', label: 'Square Inches', symbol: 'in²', factor: 6.4516e-4, system: 'english' },
      { id: 'ft2', label: 'Square Feet', symbol: 'ft²', factor: 0.09290304, system: 'english' },
      { id: 'yd2', label: 'Square Yards', symbol: 'yd²', factor: 0.83612736, system: 'english' },
      { id: 'acre', label: 'Acres', symbol: 'ac', factor: 4046.8564224, system: 'english' },
      {
        id: 'mi2',
        label: 'Square Miles',
        symbol: 'mi²',
        factor: 2589988.110336,
        system: 'english',
      },
    ],
  },

  // ---- Volume (base: m³) --------------------------------------------------
  volume: {
    id: 'volume',
    label: 'Volume',
    siBase: 'm³',
    units: [
      { id: 'mm3', label: 'Cubic Millimeters', symbol: 'mm³', factor: 1e-9, system: 'metric' },
      { id: 'cm3', label: 'Cubic Centimeters', symbol: 'cm³', factor: 1e-6, system: 'metric' },
      { id: 'm3', label: 'Cubic Meters', symbol: 'm³', factor: 1, system: 'metric' },
      { id: 'L', label: 'Liters', symbol: 'L', factor: 1e-3, system: 'metric' },
      { id: 'mL', label: 'Milliliters', symbol: 'mL', factor: 1e-6, system: 'metric' },
      { id: 'in3', label: 'Cubic Inches', symbol: 'in³', factor: 1.6387064e-5, system: 'english' },
      { id: 'ft3', label: 'Cubic Feet', symbol: 'ft³', factor: 0.028316846592, system: 'english' },
      { id: 'yd3', label: 'Cubic Yards', symbol: 'yd³', factor: 0.764554857984, system: 'english' },
      {
        id: 'gal',
        label: 'Gallons (US)',
        symbol: 'gal',
        factor: 3.785411784e-3,
        system: 'english',
      },
      { id: 'qt', label: 'Quarts (US)', symbol: 'qt', factor: 9.46352946e-4, system: 'english' },
      {
        id: 'floz',
        label: 'Fluid Ounces (US)',
        symbol: 'fl oz',
        factor: 2.95735295625e-5,
        system: 'english',
      },
    ],
  },

  // ---- Mass (base: kg) ----------------------------------------------------
  mass: {
    id: 'mass',
    label: 'Mass',
    siBase: 'kg',
    units: [
      { id: 'g', label: 'Grams', symbol: 'g', factor: 1e-3, system: 'metric' },
      { id: 'kg', label: 'Kilograms', symbol: 'kg', factor: 1, system: 'metric' },
      { id: 't', label: 'Metric Tons', symbol: 't', factor: 1e3, system: 'metric' },
      { id: 'oz', label: 'Ounces', symbol: 'oz', factor: 0.028349523125, system: 'english' },
      { id: 'lbm', label: 'Pounds', symbol: 'lbm', factor: 0.45359237, system: 'english' },
      { id: 'slug', label: 'Slugs', symbol: 'slug', factor: 14.593902937206, system: 'english' },
      {
        id: 'tonm_s',
        label: 'Tons (US short)',
        symbol: 'tonm',
        factor: 907.18474,
        system: 'english',
      },
      {
        id: 'tonm_l',
        label: 'Tons (long)',
        symbol: 'LTm',
        factor: 1016.0469088,
        system: 'english',
      },
    ],
  },

  // ---- Time (base: s) -----------------------------------------------------
  time: {
    id: 'time',
    label: 'Time',
    siBase: 's',
    units: [
      { id: 'ms', label: 'Milliseconds', symbol: 'ms', factor: 1e-3, system: 'both' },
      { id: 's', label: 'Seconds', symbol: 's', factor: 1, system: 'both' },
      { id: 'min', label: 'Minutes', symbol: 'min', factor: 60, system: 'both' },
      { id: 'hr', label: 'Hours', symbol: 'hr', factor: 3600, system: 'both' },
      { id: 'day', label: 'Days', symbol: 'day', factor: 86400, system: 'both' },
    ],
  },

  // ---- Temperature (base: K, affine) --------------------------------------
  // toBase(x) = x * factor + offset;  fromBase(b) = (b - offset) / factor
  temperature: {
    id: 'temperature',
    label: 'Temperature',
    siBase: 'K',
    units: [
      { id: 'K', label: 'Kelvin', symbol: 'K', factor: 1, offset: 0, system: 'metric' },
      { id: 'C', label: 'Celsius', symbol: '°C', factor: 1, offset: 273.15, system: 'metric' },
      // offset = 273.15 - 32*(5/9) = 255.37222…
      {
        id: 'F',
        label: 'Fahrenheit',
        symbol: '°F',
        factor: 5 / 9,
        offset: 255.37222222222222,
        system: 'english',
      },
      { id: 'R', label: 'Rankine', symbol: '°R', factor: 5 / 9, offset: 0, system: 'english' },
    ],
  },

  // ---- Force (base: N) ----------------------------------------------------
  force: {
    id: 'force',
    label: 'Force',
    siBase: 'N',
    units: [
      { id: 'N', label: 'Newtons', symbol: 'N', factor: 1, system: 'metric' },
      { id: 'kN', label: 'Kilonewtons', symbol: 'kN', factor: 1e3, system: 'metric' },
      { id: 'MN', label: 'Meganewtons', symbol: 'MN', factor: 1e6, system: 'metric' },
      {
        id: 'lbf',
        label: 'Pounds-force',
        symbol: 'lbf',
        factor: 4.4482216152605,
        system: 'english',
      },
      { id: 'kip', label: 'Kips', symbol: 'kip', factor: 4448.2216152605, system: 'english' },
      {
        id: 'tonf',
        label: 'Tons-force (US)',
        symbol: 'tonf',
        factor: 8896.443230521,
        system: 'english',
      },
    ],
  },

  // ---- Force per unit length (base: N/m) ----------------------------------------------------
  forcePerUnitLength: {
    id: 'forcePerUnitLength',
    label: 'Force per unit length',
    siBase: 'N/m',
    units: [
      { id: 'N_m', label: 'Newtons per meter', symbol: 'N/m', factor: 1, system: 'metric' },
      { id: 'kN_m', label: 'Kilonewtons per meter', symbol: 'kN/m', factor: 1e3, system: 'metric' },
      { id: 'MN_m', label: 'Meganewtons per meter', symbol: 'MN/m', factor: 1e6, system: 'metric' },
      {
        id: 'lbf_ft',
        label: 'Pounds-force per foot',
        symbol: 'lbf/ft',
        factor: 14.593902937206,
        system: 'english',
      },
      {
        id: 'plf',
        label: 'Pounds-force per foot',
        symbol: 'plf',
        factor: 14.593902937206,
        system: 'english',
      },
      {
        id: 'kip_ft',
        label: 'Kips per foot',
        symbol: 'kip/ft',
        factor: 14593.902937206,
        system: 'english',
      },
      {
        id: 'klf',
        label: 'Kips per foot',
        symbol: 'klf',
        factor: 14593.902937206,
        system: 'english',
      },
      {
        id: 'tonf_ft',
        label: 'Tons-force (US) per foot',
        symbol: 'tonf/ft',
        factor: 28178.345536848,
        system: 'english',
      },
    ],
  },

  // ---- Pressure (base: Pa) ------------------------------------------------
  // baseUnits: 1 [unit] = 1 [product-of-primitives] exactly (no numeric scaling).
  // Pa=N/m², kPa=kN/m², MPa=N/mm², GPa=kN/mm²,
  // psi=lbf/in², ksi=kip/in², psf=lbf/ft², ksf=kip/ft²
  pressure: {
    id: 'pressure',
    label: 'Pressure',
    siBase: 'Pa',
    units: [
      {
        id: 'Pa',
        label: 'Pascals',
        symbol: 'Pa',
        factor: 1,
        system: 'metric',
        baseUnits: { N: 1, m: -2 },
      },
      {
        id: 'kPa',
        label: 'Kilopascals',
        symbol: 'kPa',
        factor: 1e3,
        system: 'metric',
        baseUnits: { kN: 1, m: -2 },
      },
      {
        id: 'MPa',
        label: 'Megapascals',
        symbol: 'MPa',
        factor: 1e6,
        system: 'metric',
        baseUnits: { N: 1, mm: -2 },
      },
      {
        id: 'GPa',
        label: 'Gigapascals',
        symbol: 'GPa',
        factor: 1e9,
        system: 'metric',
        baseUnits: { kN: 1, mm: -2 },
      },
      { id: 'bar', label: 'Bar', symbol: 'bar', factor: 1e5, system: 'metric' },
      { id: 'atm', label: 'Atmospheres', symbol: 'atm', factor: 101325, system: 'both' },
      {
        id: 'mmHg',
        label: 'Millimeters of Mercury',
        symbol: 'mmHg',
        factor: 133.322387415,
        system: 'both',
      },
      {
        id: 'psi',
        label: 'Pounds per sq. in.',
        symbol: 'psi',
        factor: 6894.757293168,
        system: 'english',
        baseUnits: { lbf: 1, in: -2 },
      },
      {
        id: 'ksi',
        label: 'Kips per sq. in.',
        symbol: 'ksi',
        factor: 6894757.293168,
        system: 'english',
        baseUnits: { kip: 1, in: -2 },
      },
      {
        id: 'psf',
        label: 'Pounds per sq. ft.',
        symbol: 'psf',
        factor: 47.88025898,
        system: 'english',
        baseUnits: { lbf: 1, ft: -2 },
      },
      {
        id: 'ksf',
        label: 'Kips per sq. ft.',
        symbol: 'ksf',
        factor: 47880.25898,
        system: 'english',
        baseUnits: { kip: 1, ft: -2 },
      },
    ],
  },

  // ---- Energy / Work (base: J) --------------------------------------------
  // J=N·m, kJ=kN·m, MJ=MN·m; ft_lbf=lbf·ft, ft_kip=kip·ft, in_lbf=lbf·in, in_kip=kip·in
  energy: {
    id: 'energy',
    label: 'Energy',
    siBase: 'J',
    units: [
      {
        id: 'J',
        label: 'Joules',
        symbol: 'J',
        factor: 1,
        system: 'metric',
        baseUnits: { N: 1, m: 1 },
      },
      {
        id: 'kJ',
        label: 'Kilojoules',
        symbol: 'kJ',
        factor: 1e3,
        system: 'metric',
        baseUnits: { kN: 1, m: 1 },
      },
      {
        id: 'MJ',
        label: 'Megajoules',
        symbol: 'MJ',
        factor: 1e6,
        system: 'metric',
        baseUnits: { MN: 1, m: 1 },
      },
      { id: 'kWh', label: 'Kilowatt-hours', symbol: 'kWh', factor: 3.6e6, system: 'metric' },
      { id: 'cal', label: 'Calories', symbol: 'cal', factor: 4.184, system: 'metric' },
      { id: 'kcal', label: 'Kilocalories', symbol: 'kcal', factor: 4184, system: 'metric' },
      { id: 'BTU', label: 'BTU', symbol: 'BTU', factor: 1055.05585262, system: 'english' },
      {
        id: 'ft-lbf',
        label: 'Foot-pounds',
        symbol: 'ft·lbf',
        factor: 1.3558179483314,
        system: 'english',
        baseUnits: { lbf: 1, ft: 1 },
      },
      {
        id: 'ft-kip',
        label: 'Foot-kips',
        symbol: 'ft·kip',
        factor: 1355.8179483314,
        system: 'english',
        baseUnits: { kip: 1, ft: 1 },
      },
      {
        id: 'in-lbf',
        label: 'Inch-pounds',
        symbol: 'in·lbf',
        factor: 0.1129848290276,
        system: 'english',
        baseUnits: { lbf: 1, in: 1 },
      },
      {
        id: 'in-kip',
        label: 'Inch-kips',
        symbol: 'in·kip',
        factor: 112.9848290276,
        system: 'english',
        baseUnits: { kip: 1, in: 1 },
      },
    ],
  },

  // ---- Power (base: W) ----------------------------------------------------
  // W=N·m/s, kW=kN·m/s, MW=MN·m/s
  power: {
    id: 'power',
    label: 'Power',
    siBase: 'W',
    units: [
      {
        id: 'W',
        label: 'Watts',
        symbol: 'W',
        factor: 1,
        system: 'metric',
        baseUnits: { N: 1, m: 1, s: -1 },
      },
      {
        id: 'kW',
        label: 'Kilowatts',
        symbol: 'kW',
        factor: 1e3,
        system: 'metric',
        baseUnits: { kN: 1, m: 1, s: -1 },
      },
      {
        id: 'MW',
        label: 'Megawatts',
        symbol: 'MW',
        factor: 1e6,
        system: 'metric',
        baseUnits: { MN: 1, m: 1, s: -1 },
      },
      { id: 'hp', label: 'Horsepower', symbol: 'hp', factor: 745.69987158227, system: 'english' },
      {
        id: 'BTU_hr',
        label: 'BTU per hour',
        symbol: 'BTU/hr',
        factor: 0.29307107017,
        system: 'english',
      },
    ],
  },

  // ---- Velocity (base: m/s) -----------------------------------------------
  velocity: {
    id: 'velocity',
    label: 'Velocity',
    siBase: 'm/s',
    units: [
      {
        id: 'm_s',
        label: 'Meters per second',
        symbol: 'm/s',
        factor: 1,
        system: 'metric',
        baseUnits: { m: 1, s: -1 },
      },
      {
        id: 'm_h',
        label: 'Meters per hour',
        symbol: 'm/h',
        factor: 1 / 3600,
        system: 'metric',
        baseUnits: { m: 1, hr: -1 },
      },
      {
        id: 'km_s',
        label: 'Kilometers per second',
        symbol: 'km/s',
        factor: 1 / 1000,
        system: 'metric',
      },
      {
        id: 'km_h',
        label: 'Kilometers per hour',
        symbol: 'km/h',
        factor: 1 / 3.6,
        system: 'metric',
        baseUnits: { km: 1, hr: -1 },
      },
      {
        id: 'ft_s',
        label: 'Feet per second',
        symbol: 'ft/s',
        factor: 0.3048,
        system: 'english',
        baseUnits: { ft: 1, s: -1 },
      },
      {
        id: 'in_s',
        label: 'Inches per second',
        symbol: 'in/s',
        factor: 0.0254,
        system: 'english',
        baseUnits: { in: 1, s: -1 },
      },
      {
        id: 'mph',
        label: 'Miles per hour',
        symbol: 'mph',
        factor: 0.44704,
        system: 'english',
        baseUnits: { mi: 1, hr: -1 },
      },
      { id: 'kn', label: 'Knots', symbol: 'kn', factor: 1.852 / 3.6, system: 'both' },
    ],
  },

  // ---- Acceleration (base: m/s²) ------------------------------------------
  acceleration: {
    id: 'acceleration',
    label: 'Acceleration',
    siBase: 'm/s²',
    units: [
      {
        id: 'm_s2',
        label: 'Meters per second²',
        symbol: 'm/s²',
        factor: 1,
        system: 'metric',
        baseUnits: { m: 1, s: -2 },
      },
      {
        id: 'cm_s2',
        label: 'Centimeters per second²',
        symbol: 'cm/s²',
        factor: 0.01,
        system: 'metric',
        baseUnits: { cm: 1, s: -2 },
      },
      {
        id: 'ft_s2',
        label: 'Feet per second²',
        symbol: 'ft/s²',
        factor: 0.3048,
        system: 'english',
        baseUnits: { ft: 1, s: -2 },
      },
      {
        id: 'in_s2',
        label: 'Inches per second²',
        symbol: 'in/s²',
        factor: 0.0254,
        system: 'english',
        baseUnits: { in: 1, s: -2 },
      },
      { id: 'g', label: 'Standard Gravity', symbol: 'g', factor: 9.80665, system: 'both' },
    ],
  },

  // ---- Angle (base: rad) --------------------------------------------------
  angle: {
    id: 'angle',
    label: 'Angle',
    siBase: 'rad',
    units: [
      { id: 'rad', label: 'Radians', symbol: 'rad', factor: 1, system: 'both' },
      { id: 'deg', label: 'Degrees', symbol: '°', factor: _PI / 180, system: 'both' },
      { id: 'grad', label: 'Gradians', symbol: 'grad', factor: _PI / 200, system: 'both' },
      { id: 'arcmin', label: 'Arcminutes', symbol: "'", factor: _PI / 10800, system: 'both' },
      { id: 'arcsec', label: 'Arcseconds', symbol: '"', factor: _PI / 648000, system: 'both' },
      { id: 'rev', label: 'Revolutions', symbol: 'rev', factor: 2 * _PI, system: 'both' },
    ],
  },

  // ---- Linear Momentum (base: kg·m/s) -------------------------------------
  momentum: {
    id: 'momentum',
    label: 'Linear Momentum',
    siBase: 'kg·m/s',
    units: [
      {
        id: 'kg-m_s',
        label: 'Kilogram·meters/s',
        symbol: 'kg·m/s',
        factor: 1,
        system: 'metric',
        baseUnits: { kg: 1, m: 1, s: -1 },
      },
      {
        id: 'g-cm_s',
        label: 'Gram·centimeters/s',
        symbol: 'g·cm/s',
        factor: 1e-5,
        system: 'metric',
        baseUnits: { g: 1, cm: 1, s: -1 },
      },
      {
        id: 'lb-ft_s',
        label: 'Pound·feet/s',
        symbol: 'lb·ft/s',
        factor: 0.45359237 * 0.3048,
        system: 'english',
        baseUnits: { lbm: 1, ft: 1, s: -1 },
      },
      {
        id: 'lb-in_s',
        label: 'Pound·inches/s',
        symbol: 'lb·in/s',
        factor: 0.45359237 * 0.0254,
        system: 'english',
        baseUnits: { lbm: 1, in: 1, s: -1 },
      },
      {
        id: 'slug-ft_s',
        label: 'Slug·feet/s',
        symbol: 'slug·ft/s',
        factor: 14.593902937206 * 0.3048,
        system: 'english',
        baseUnits: { slug: 1, ft: 1, s: -1 },
      },
    ],
  },

  // ---- Angular Momentum (base: kg·m²/s) -----------------------------------
  angular_momentum: {
    id: 'angular_momentum',
    label: 'Angular Momentum',
    siBase: 'kg·m²/s',
    units: [
      {
        id: 'kg-m2_s',
        label: 'Kilogram·meters²/s',
        symbol: 'kg·m²/s',
        factor: 1,
        system: 'metric',
        baseUnits: { kg: 1, m: 2, s: -1 },
      },
      {
        id: 'g-cm2_s',
        label: 'Gram·cm²/s',
        symbol: 'g·cm²/s',
        factor: 1e-7,
        system: 'metric',
        baseUnits: { g: 1, cm: 2, s: -1 },
      },
      {
        id: 'lb-ft2_s',
        label: 'Pound·feet²/s',
        symbol: 'lb·ft²/s',
        factor: 0.45359237 * 0.09290304,
        system: 'english',
        baseUnits: { lbm: 1, ft: 2, s: -1 },
      },
      {
        id: 'lb-in2_s',
        label: 'Pound·inches²/s',
        symbol: 'lb·in²/s',
        factor: 0.45359237 * 6.4516e-4,
        system: 'english',
        baseUnits: { lbm: 1, in: 2, s: -1 },
      },
      {
        id: 'slug-ft2_s',
        label: 'Slug·feet²/s',
        symbol: 'slug·ft²/s',
        factor: 14.593902937206 * 0.09290304,
        system: 'english',
        baseUnits: { slug: 1, ft: 2, s: -1 },
      },
    ],
  },

  // ---- Angular Acceleration (base: rad/s²) --------------------------------
  angular_acceleration: {
    id: 'angular_acceleration',
    label: 'Angular Acceleration',
    siBase: 'rad/s²',
    units: [
      { id: 'rad_s2', label: 'Radians/s²', symbol: 'rad/s²', factor: 1, system: 'both' },
      { id: 'deg_s2', label: 'Degrees/s²', symbol: '°/s²', factor: _PI / 180, system: 'both' },
      { id: 'rev_s2', label: 'Revolutions/s²', symbol: 'rev/s²', factor: 2 * _PI, system: 'both' },
      {
        id: 'rpm_s',
        label: 'RPM per second',
        symbol: 'rpm/s',
        factor: 2 * _PI / 60,
        system: 'both',
      },
      {
        id: 'rpm_min',
        label: 'RPM per minute',
        symbol: 'rpm/min',
        factor: 2 * _PI / 3600,
        system: 'both',
      },
    ],
  },

  // ---- Torque (base: N·m) -------------------------------------------------
  // N_mm=N·mm, N_m=N·m, kN_m=kN·m; lbf_in=lbf·in, lbf_ft=lbf·ft, kip_in=kip·in, kip_ft=kip·ft
  torque: {
    id: 'torque',
    label: 'Torque',
    siBase: 'N·m',
    units: [
      {
        id: 'N-mm',
        label: 'Newton·millimeters',
        symbol: 'N·mm',
        factor: 1e-3,
        system: 'metric',
        baseUnits: { N: 1, mm: 1 },
      },
      {
        id: 'N-m',
        label: 'Newton·meters',
        symbol: 'N·m',
        factor: 1,
        system: 'metric',
        baseUnits: { N: 1, m: 1 },
      },
      {
        id: 'kN-m',
        label: 'Kilonewton·meters',
        symbol: 'kN·m',
        factor: 1e3,
        system: 'metric',
        baseUnits: { kN: 1, m: 1 },
      },
      {
        id: 'lbf-in',
        label: 'Pound-force·inches',
        symbol: 'lbf·in',
        factor: 0.1129848290276,
        system: 'english',
        baseUnits: { lbf: 1, in: 1 },
      },
      {
        id: 'lbf-ft',
        label: 'Pound-force·feet',
        symbol: 'lbf·ft',
        factor: 1.3558179483314,
        system: 'english',
        baseUnits: { lbf: 1, ft: 1 },
      },
      {
        id: 'kip-in',
        label: 'Kip·inches',
        symbol: 'kip·in',
        factor: 112.9848290276,
        system: 'english',
        baseUnits: { kip: 1, in: 1 },
      },
      {
        id: 'kip-ft',
        label: 'Kip·feet',
        symbol: 'kip·ft',
        factor: 1355.8179483314,
        system: 'english',
        baseUnits: { kip: 1, ft: 1 },
      },
    ],
  },

  // ---- Density / Specific Gravity (base: kg/m³) ---------------------------
  // Specific gravity (SG) is dimensionless: SG = density / 1000 kg/m³ (water at 4 °C).
  // It is listed here as a unit with factor = 1000 so convert() treats it correctly.
  density: {
    id: 'density',
    label: 'Density / Specific Gravity',
    siBase: 'kg/m³',
    units: [
      {
        id: 'kg_m3',
        label: 'Kilograms/m³',
        symbol: 'kg/m³',
        factor: 1,
        system: 'metric',
        baseUnits: { kg: 1, m: -3 },
      },
      {
        id: 'g_cm3',
        label: 'Grams/cm³',
        symbol: 'g/cm³',
        factor: 1000,
        system: 'metric',
        baseUnits: { g: 1, cm: -3 },
      },
      { id: 'kg_L', label: 'Kilograms/liter', symbol: 'kg/L', factor: 1000, system: 'metric' },
      {
        id: 'sg',
        label: 'Specific Gravity (water = 1)',
        symbol: 'SG',
        factor: 1000,
        system: 'both',
      },
      {
        id: 'lb_ft3',
        label: 'Pounds/ft³',
        symbol: 'lb/ft³',
        factor: 16.01846337396,
        system: 'english',
        baseUnits: { lbm: 1, ft: -3 },
      },
      {
        id: 'lb_in3',
        label: 'Pounds/in³',
        symbol: 'lb/in³',
        factor: 27679.904710191,
        system: 'english',
        baseUnits: { lbm: 1, in: -3 },
      },
      {
        id: 'slug_ft3',
        label: 'Slugs/ft³',
        symbol: 'slug/ft³',
        factor: 515.37882,
        system: 'english',
        baseUnits: { slug: 1, ft: -3 },
      },
    ],
  },

  // ---- Area Moment of Inertia / Second Moment of Area (base: m⁴) ----------
  area_moi: {
    id: 'area_moi',
    label: 'Area Moment of Inertia (Second Moment of Area)',
    siBase: 'm⁴',
    units: [
      { id: 'mm4', label: 'mm⁴', symbol: 'mm⁴', factor: 1e-12, system: 'metric' },
      { id: 'cm4', label: 'cm⁴', symbol: 'cm⁴', factor: 1e-8, system: 'metric' },
      { id: 'm4', label: 'm⁴', symbol: 'm⁴', factor: 1, system: 'metric' },
      // in⁴: 0.0254^4 = 4.162314256e-7
      { id: 'in4', label: 'in⁴', symbol: 'in⁴', factor: 4.162314256e-7, system: 'english' },
      // ft⁴: 0.3048^4 = 8.630975e-3
      { id: 'ft4', label: 'ft⁴', symbol: 'ft⁴', factor: 8.630975e-3, system: 'english' },
    ],
  },

  // ---- Mass Moment of Inertia (base: kg·m²) -------------------------------
  mass_moi: {
    id: 'mass_moi',
    label: 'Mass Moment of Inertia',
    siBase: 'kg·m²',
    units: [
      {
        id: 'kg-m2',
        label: 'Kilogram·meters²',
        symbol: 'kg·m²',
        factor: 1,
        system: 'metric',
        baseUnits: { kg: 1, m: 2 },
      },
      {
        id: 'g-cm2',
        label: 'Gram·centimeters²',
        symbol: 'g·cm²',
        factor: 1e-7,
        system: 'metric',
        baseUnits: { g: 1, cm: 2 },
      },
      {
        id: 'kg-cm2',
        label: 'Kilogram·cm²',
        symbol: 'kg·cm²',
        factor: 1e-4,
        system: 'metric',
        baseUnits: { kg: 1, cm: 2 },
      },
      {
        id: 'lb-ft2',
        label: 'Pound·feet²',
        symbol: 'lb·ft²',
        factor: 0.45359237 * 0.09290304,
        system: 'english',
        baseUnits: { lbm: 1, ft: 2 },
      },
      {
        id: 'lb-in2',
        label: 'Pound·inches²',
        symbol: 'lb·in²',
        factor: 0.45359237 * 6.4516e-4,
        system: 'english',
        baseUnits: { lbm: 1, in: 2 },
      },
      {
        id: 'slug-ft2',
        label: 'Slug·feet²',
        symbol: 'slug·ft²',
        factor: 14.593902937206 * 0.09290304,
        system: 'english',
        baseUnits: { slug: 1, ft: 2 },
      },
      {
        id: 'slug-in2',
        label: 'Slug·inches²',
        symbol: 'slug·in²',
        factor: 14.593902937206 * 6.4516e-4,
        system: 'english',
        baseUnits: { slug: 1, in: 2 },
      },
    ],
  },

  // ---- Section Modulus (base: m³) -----------------------------------------
  section_modulus: {
    id: 'section_modulus',
    label: 'Section Modulus',
    siBase: 'm³',
    units: [
      { id: 'mm3', label: 'mm³', symbol: 'mm³', factor: 1e-9, system: 'metric' },
      { id: 'cm3', label: 'cm³', symbol: 'cm³', factor: 1e-6, system: 'metric' },
      { id: 'm3', label: 'm³', symbol: 'm³', factor: 1, system: 'metric' },
      // in³: 0.0254^3 = 1.6387064e-5
      { id: 'in3', label: 'in³', symbol: 'in³', factor: 1.6387064e-5, system: 'english' },
      // ft³: 0.3048^3 = 0.028316846592
      { id: 'ft3', label: 'ft³', symbol: 'ft³', factor: 0.028316846592, system: 'english' },
    ],
  },

  // ---- Torsional Warping Constant (base: m⁶) ------------------------------
  warping_constant: {
    id: 'warping_constant',
    label: 'Torsional Warping Constant',
    siBase: 'm⁶',
    units: [
      { id: 'mm6', label: 'mm⁶', symbol: 'mm⁶', factor: 1e-18, system: 'metric' },
      { id: 'cm6', label: 'cm⁶', symbol: 'cm⁶', factor: 1e-12, system: 'metric' },
      { id: 'm6', label: 'm⁶', symbol: 'm⁶', factor: 1, system: 'metric' },
      // in⁶: 0.0254^6 = 2.68536e-10
      { id: 'in6', label: 'in⁶', symbol: 'in⁶', factor: 2.68536e-10, system: 'english' },
      // ft⁶: 0.3048^6 = 8.01843e-4
      { id: 'ft6', label: 'ft⁶', symbol: 'ft⁶', factor: 8.01843e-4, system: 'english' },
    ],
  },
} as const satisfies Record<string, UnitCategory>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getCategory(id: string): UnitCategory | undefined {
  return UNIT_CATEGORIES[id as keyof typeof UNIT_CATEGORIES];
}

export function findUnitDef(categoryId: string, unitId: string): UnitDef | undefined {
  return getCategory(categoryId)?.units.find((u) => u.id === unitId);
}

export function unitsBySystem(category: UnitCategory, system: UnitSystem): readonly UnitDef[] {
  return category.units.filter((u) => u.system === system || u.system === 'both');
}

/**
 * Flat lookup from unit id → UnitDef, built from all categories at module load time.
 * Used by expr.ts to resolve conversion factors for [[targetUnit]] annotations.
 * When the same id appears in multiple categories (e.g. 'N_m' in both torque and
 * angular_momentum — they don't share ids), the first category wins.
 */
export const UNIT_LOOKUP: ReadonlyMap<string, UnitDef> = (() => {
  const m = new Map<string, UnitDef>();
  for (const cat of Object.values(UNIT_CATEGORIES)) {
    for (const u of cat.units) {
      if (!m.has(u.id)) m.set(u.id, u as UnitDef);
    }
  }
  return m;
})();
