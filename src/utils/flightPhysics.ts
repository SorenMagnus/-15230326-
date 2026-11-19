/**
 * Pure Aerospace Physics & UAM Economic Calculation Engine for Joby S4 Research
 * Decoupled from React/DOM for deterministic unit testing via node:test.
 */

export interface FlightPhysicsParams {
  /** Aircraft total gross mass in kg (Joby S4 baseline: 2177 - 2400 kg) */
  massKg: number;
  /** Usable battery pack capacity in kWh (Joby S4 baseline: 145 - 160 kWh) */
  batteryKwh: number;
  /** Overall propulsive & electrical drivetrain efficiency in cruise (0.55 - 0.90) */
  propulsionEfficiency: number;
  /** Target mission point-to-point distance in km (10 - 250 km) */
  missionDistanceKm: number;
  /** Mandatory regulatory energy reserve fraction (0.10 - 0.35, e.g. 0.20 = 20%) */
  reserveFraction: number;
  /** Cruise aerodynamic Lift-to-Drag ratio L/D (Joby S4 baseline: 12.5) */
  liftToDrag?: number;
  /** Cruise true airspeed in km/h (Joby S4 baseline: 265 km/h optimal, 322 km/h max) */
  cruiseSpeedKmh?: number;
  /** Total hover + vertical climb/descent duration per sortie in seconds (default 180s) */
  hoverDurationSec?: number;
  /** Air density in kg/m^3 (ISA sea level: 1.225) */
  airDensity?: number;
}

export interface FlightPhysicsResult {
  weightNewtons: number;
  totalDiskAreaM2: number;
  diskLoadingKgM2: number;
  diskLoadingNM2: number;
  inducedHoverVelocityMs: number;
  hoverPowerKw: number;
  cruisePowerKw: number;
  hoverEnergyKwh: number;
  transitionEnergyKwh: number;
  cruiseEnergyKwh: number;
  totalMissionEnergyKwh: number;
  reserveEnergyKwh: number;
  usableNetEnergyKwh: number;
  energyMarginKwh: number;
  stateOfChargeAtLandingPct: number;
  maxAchievableRangeKm: number;
  cruiseFlightTimeMin: number;
  totalBlockTimeMin: number;
  specificEnergyConsumptionWhPerKm: number;
  specificEnergyWhPerPaxKm: number;
  isMissionFeasible: boolean;
  feasibilityStatus: 'NOMINAL' | 'MARGINAL_RESERVE' | 'INSUFFICIENT_ENERGY';
}

export const JOBY_S4_CONSTANTS = {
  ROTOR_COUNT: 6,
  ROTOR_RADIUS_M: 1.45, // 2.9m diameter per 5-blade low-noise rotor
  FIGURE_OF_MERIT: 0.76,
  HOVER_ELEC_EFFICIENCY: 0.88,
  DEFAULT_LIFT_TO_DRAG: 12.8,
  DEFAULT_CRUISE_SPEED_KMH: 265,
  MAX_SPEED_KMH: 322, // 200 mph
  GRAVITY: 9.80665,
  ISA_RHO_SEA_LEVEL: 1.225,
  PAX_CAPACITY: 4,
};

/**
 * Calculates hover power, cruise power, energy breakdown, and maximum range
 * using Actuator Disk Momentum Theory + Electric Breguet Range formulation.
 */
export function calculateFlightPhysics(params: FlightPhysicsParams): FlightPhysicsResult {
  const massKg = Math.max(800, params.massKg);
  const batteryKwh = Math.max(20, params.batteryKwh);
  const etaP = Math.min(0.95, Math.max(0.4, params.propulsionEfficiency));
  const missionDistanceKm = Math.max(1, params.missionDistanceKm);
  const reserveFraction = Math.min(0.5, Math.max(0.05, params.reserveFraction));

  const liftToDrag = params.liftToDrag ?? JOBY_S4_CONSTANTS.DEFAULT_LIFT_TO_DRAG;
  const cruiseSpeedKmh = params.cruiseSpeedKmh ?? JOBY_S4_CONSTANTS.DEFAULT_CRUISE_SPEED_KMH;
  const hoverDurationSec = params.hoverDurationSec ?? 180;
  const rho = params.airDensity ?? JOBY_S4_CONSTANTS.ISA_RHO_SEA_LEVEL;

  const weightNewtons = massKg * JOBY_S4_CONSTANTS.GRAVITY;
  const singleDiskArea = Math.PI * Math.pow(JOBY_S4_CONSTANTS.ROTOR_RADIUS_M, 2);
  const totalDiskAreaM2 = JOBY_S4_CONSTANTS.ROTOR_COUNT * singleDiskArea;

  const diskLoadingKgM2 = massKg / totalDiskAreaM2;
  const diskLoadingNM2 = weightNewtons / totalDiskAreaM2;

  // Actuator disk momentum theory induced velocity in hover: v_i = sqrt(W / (2 * rho * A))
  const inducedHoverVelocityMs = Math.sqrt(weightNewtons / (2 * rho * totalDiskAreaM2));

  // Ideal induced power P_ideal = W * v_i; actual electrical power accounts for Figure of Merit & motor/inverter efficiency
  const hoverEfficiencyProduct = JOBY_S4_CONSTANTS.FIGURE_OF_MERIT * JOBY_S4_CONSTANTS.HOVER_ELEC_EFFICIENCY * (etaP / 0.80);
  const clampedHoverEff = Math.min(0.85, Math.max(0.45, hoverEfficiencyProduct));
  const hoverPowerKw = (weightNewtons * inducedHoverVelocityMs) / (clampedHoverEff * 1000);

  // Winged forward cruise power: P_cruise = (W / (L/D)) * V / eta_p
  const cruiseSpeedMs = cruiseSpeedKmh / 3.6;
  const aerodynamicDragNewtons = weightNewtons / liftToDrag;
  const cruisePowerKw = (aerodynamicDragNewtons * cruiseSpeedMs) / (etaP * 1000);

  // Phase energy consumption (kWh)
  const hoverEnergyKwh = hoverPowerKw * (hoverDurationSec / 3600);
  // Transition phase (accelerate + tilt nacelles on departure and arrival, ~55s total at 1.85x cruise power)
  const transitionEnergyKwh = cruisePowerKw * 1.85 * (55 / 3600);

  const cruiseFlightHours = missionDistanceKm / cruiseSpeedKmh;
  const cruiseEnergyKwh = cruisePowerKw * cruiseFlightHours;

  const totalMissionEnergyKwh = hoverEnergyKwh + transitionEnergyKwh + cruiseEnergyKwh;
  const reserveEnergyKwh = batteryKwh * reserveFraction;
  const usableNetEnergyKwh = Math.max(0, batteryKwh - reserveEnergyKwh);
  const energyMarginKwh = usableNetEnergyKwh - totalMissionEnergyKwh;

  const stateOfChargeAtLandingPct = Math.max(
    0,
    ((batteryKwh - totalMissionEnergyKwh) / batteryKwh) * 100
  );

  // Max achievable cruise range with reserve intact
  const energyAvailableForCruiseKwh = Math.max(
    0,
    usableNetEnergyKwh - hoverEnergyKwh - transitionEnergyKwh
  );
  const energyPerCruiseKm = cruisePowerKw / cruiseSpeedKmh; // kWh/km
  const maxAchievableRangeKm =
    energyPerCruiseKm > 0 ? energyAvailableForCruiseKwh / energyPerCruiseKm : 0;

  const cruiseFlightTimeMin = cruiseFlightHours * 60;
  const totalBlockTimeMin = cruiseFlightTimeMin + hoverDurationSec / 60 + 1.5;

  const specificEnergyConsumptionWhPerKm = (totalMissionEnergyKwh * 1000) / missionDistanceKm;
  const specificEnergyWhPerPaxKm =
    specificEnergyConsumptionWhPerKm / JOBY_S4_CONSTANTS.PAX_CAPACITY;

  let feasibilityStatus: FlightPhysicsResult['feasibilityStatus'] = 'NOMINAL';
  if (totalMissionEnergyKwh > batteryKwh) {
    feasibilityStatus = 'INSUFFICIENT_ENERGY';
  } else if (totalMissionEnergyKwh > usableNetEnergyKwh) {
    feasibilityStatus = 'MARGINAL_RESERVE';
  }

  return {
    weightNewtons: Number(weightNewtons.toFixed(1)),
    totalDiskAreaM2: Number(totalDiskAreaM2.toFixed(2)),
    diskLoadingKgM2: Number(diskLoadingKgM2.toFixed(2)),
    diskLoadingNM2: Number(diskLoadingNM2.toFixed(1)),
    inducedHoverVelocityMs: Number(inducedHoverVelocityMs.toFixed(2)),
    hoverPowerKw: Number(hoverPowerKw.toFixed(1)),
    cruisePowerKw: Number(cruisePowerKw.toFixed(1)),
    hoverEnergyKwh: Number(hoverEnergyKwh.toFixed(2)),
    transitionEnergyKwh: Number(transitionEnergyKwh.toFixed(2)),
    cruiseEnergyKwh: Number(cruiseEnergyKwh.toFixed(2)),
    totalMissionEnergyKwh: Number(totalMissionEnergyKwh.toFixed(2)),
    reserveEnergyKwh: Number(reserveEnergyKwh.toFixed(2)),
    usableNetEnergyKwh: Number(usableNetEnergyKwh.toFixed(2)),
    energyMarginKwh: Number(energyMarginKwh.toFixed(2)),
    stateOfChargeAtLandingPct: Number(stateOfChargeAtLandingPct.toFixed(1)),
    maxAchievableRangeKm: Number(maxAchievableRangeKm.toFixed(1)),
    cruiseFlightTimeMin: Number(cruiseFlightTimeMin.toFixed(1)),
    totalBlockTimeMin: Number(totalBlockTimeMin.toFixed(1)),
    specificEnergyConsumptionWhPerKm: Number(specificEnergyConsumptionWhPerKm.toFixed(0)),
    specificEnergyWhPerPaxKm: Number(specificEnergyWhPerPaxKm.toFixed(0)),
    isMissionFeasible: feasibilityStatus === 'NOMINAL',
    feasibilityStatus,
  };
}

export interface UamEconomicsParams {
  /** Average ticket price per passenger per trip in USD */
  ticketPricePerPaxUsd: number;
  /** Average passenger load factor (1.0 to 4.0 passengers out of 4 seats) */
  avgPassengersPerFlight: number;
  /** Daily flight sorties per aircraft (4 to 24 flights/day) */
  dailySorties: number;
  /** Average trip distance in km */
  tripDistanceKm: number;
  /** Battery pack replacement life in cycles (e.g. 1500 - 10000 cycles) */
  batteryCycleLife: number;
  /** Vertiport landing & infrastructure fee per sortie in USD */
  vertiportFeePerFlightUsd: number;
}

export interface UamEconomicsResult {
  revenuePerFlightUsd: number;
  energyCostPerFlightUsd: number;
  batteryAmortizationPerFlightUsd: number;
  pilotAndCrewCostPerFlightUsd: number;
  maintenanceCostPerFlightUsd: number;
  totalOperatingCostPerFlightUsd: number;
  netMarginPerFlightUsd: number;
  costPerSeatMileUsd: number;
  costPerSeatKmUsd: number;
  annualNetProfitPerAircraftUsd: number;
  paybackPeriodYears: number;
  breakEvenLoadFactorPax: number;
  isProfitable: boolean;
}

/**
 * Evaluates UAM unit economics and break-even sensitivity for a 4-passenger eVTOL air taxi.
 */
export function calculateUamEconomics(params: UamEconomicsParams): UamEconomicsResult {
  const ticketPrice = Math.max(10, params.ticketPricePerPaxUsd);
  const avgPax = Math.min(4, Math.max(0.5, params.avgPassengersPerFlight));
  const dailySorties = Math.max(1, params.dailySorties);
  const tripDistanceKm = Math.max(5, params.tripDistanceKm);
  const batteryCycles = Math.max(300, params.batteryCycleLife);
  const vertiportFee = Math.max(0, params.vertiportFeePerFlightUsd);

  const revenuePerFlightUsd = ticketPrice * avgPax;

  // Energy cost: ~0.72 kWh/km + 18 kWh hover/transition at $0.18/kWh industrial rate
  const kwhUsed = 18 + tripDistanceKm * 0.72;
  const energyCostPerFlightUsd = kwhUsed * 0.18;

  // Battery pack replacement cost assumption: 150 kWh aerospace pack @ $420/kWh = $63,000
  const batteryPackCostUsd = 63000;
  const batteryAmortizationPerFlightUsd = batteryPackCostUsd / batteryCycles;

  // Pilot + ground ops amortized across daily sorties ($520/day pilot & dispatch pool)
  const pilotAndCrewCostPerFlightUsd = 520 / dailySorties + (tripDistanceKm / 265) * 85;

  // Airframe & propulsion maintenance ($115 base + $1.10/km)
  const maintenanceCostPerFlightUsd = 115 + tripDistanceKm * 1.1;

  // Capital depreciation & insurance amortized per flight ($1,450,000 aircraft cost over 10 yrs, 320 ops days/yr)
  const fixedCapExPerDayUsd = 1450000 / (10 * 320) + 180; // includes hull/liability insurance
  const capexPerFlightUsd = fixedCapExPerDayUsd / dailySorties;

  const totalOperatingCostPerFlightUsd =
    energyCostPerFlightUsd +
    batteryAmortizationPerFlightUsd +
    pilotAndCrewCostPerFlightUsd +
    maintenanceCostPerFlightUsd +
    vertiportFee +
    capexPerFlightUsd;

  const netMarginPerFlightUsd = revenuePerFlightUsd - totalOperatingCostPerFlightUsd;

  const tripDistanceMiles = tripDistanceKm * 0.621371;
  const availableSeatMiles = tripDistanceMiles * JOBY_S4_CONSTANTS.PAX_CAPACITY;
  const availableSeatKm = tripDistanceKm * JOBY_S4_CONSTANTS.PAX_CAPACITY;

  const costPerSeatMileUsd = totalOperatingCostPerFlightUsd / Math.max(1, availableSeatMiles);
  const costPerSeatKmUsd = totalOperatingCostPerFlightUsd / Math.max(1, availableSeatKm);

  const annualNetProfitPerAircraftUsd = netMarginPerFlightUsd * dailySorties * 320;
  const paybackPeriodYears =
    annualNetProfitPerAircraftUsd > 0
      ? Number((1450000 / annualNetProfitPerAircraftUsd).toFixed(1))
      : 99.9;

  const breakEvenLoadFactorPax = totalOperatingCostPerFlightUsd / ticketPrice;

  return {
    revenuePerFlightUsd: Number(revenuePerFlightUsd.toFixed(2)),
    energyCostPerFlightUsd: Number(energyCostPerFlightUsd.toFixed(2)),
    batteryAmortizationPerFlightUsd: Number(batteryAmortizationPerFlightUsd.toFixed(2)),
    pilotAndCrewCostPerFlightUsd: Number(pilotAndCrewCostPerFlightUsd.toFixed(2)),
    maintenanceCostPerFlightUsd: Number(maintenanceCostPerFlightUsd.toFixed(2)),
    totalOperatingCostPerFlightUsd: Number(totalOperatingCostPerFlightUsd.toFixed(2)),
    netMarginPerFlightUsd: Number(netMarginPerFlightUsd.toFixed(2)),
    costPerSeatMileUsd: Number(costPerSeatMileUsd.toFixed(2)),
    costPerSeatKmUsd: Number(costPerSeatKmUsd.toFixed(2)),
    annualNetProfitPerAircraftUsd: Number(annualNetProfitPerAircraftUsd.toFixed(0)),
    paybackPeriodYears,
    breakEvenLoadFactorPax: Number(breakEvenLoadFactorPax.toFixed(2)),
    isProfitable: netMarginPerFlightUsd > 0,
  };
}
