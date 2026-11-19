import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateFlightPhysics,
  calculateUamEconomics,
  JOBY_S4_CONSTANTS,
} from './flightPhysics';

test('Joby S4 baseline hover and cruise physics calculations are physically accurate', () => {
  const baseline = calculateFlightPhysics({
    massKg: 2177,
    batteryKwh: 150,
    propulsionEfficiency: 0.78,
    missionDistanceKm: 60,
    reserveFraction: 0.2,
  });

  // 6 rotors of radius 1.45m => total disk area ~39.63 m^2
  assert.ok(baseline.totalDiskAreaM2 > 39.5 && baseline.totalDiskAreaM2 < 39.7);
  // Hover power must significantly exceed winged cruise power for tilt-propeller eVTOL
  assert.ok(baseline.hoverPowerKw > baseline.cruisePowerKw * 2.2);
  // A 60 km mission with 150 kWh battery and 20% reserve must be feasible
  assert.equal(baseline.isMissionFeasible, true);
  assert.equal(baseline.feasibilityStatus, 'NOMINAL');
  assert.ok(baseline.maxAchievableRangeKm > 120);
});

test('Heavier aircraft mass increases hover power non-linearly (M^1.5 momentum scaling)', () => {
  const light = calculateFlightPhysics({
    massKg: 1800,
    batteryKwh: 150,
    propulsionEfficiency: 0.78,
    missionDistanceKm: 50,
    reserveFraction: 0.2,
  });

  const heavy = calculateFlightPhysics({
    massKg: 2400,
    batteryKwh: 150,
    propulsionEfficiency: 0.78,
    missionDistanceKm: 50,
    reserveFraction: 0.2,
  });

  const massRatio = 2400 / 1800;
  const expectedPowerRatio = Math.pow(massRatio, 1.5);
  const actualPowerRatio = heavy.hoverPowerKw / light.hoverPowerKw;

  assert.ok(Math.abs(actualPowerRatio - expectedPowerRatio) < 0.02);
  assert.ok(heavy.maxAchievableRangeKm < light.maxAchievableRangeKm);
});

test('Excessive mission distance triggers MARGINAL_RESERVE or INSUFFICIENT_ENERGY', () => {
  const extremeMission = calculateFlightPhysics({
    massKg: 2400,
    batteryKwh: 120,
    propulsionEfficiency: 0.72,
    missionDistanceKm: 220,
    reserveFraction: 0.25,
  });

  assert.equal(extremeMission.isMissionFeasible, false);
  assert.notEqual(extremeMission.feasibilityStatus, 'NOMINAL');
});

test('UAM unit economics calculates seat-mile cost and break-even load factor accurately', () => {
  const econ = calculateUamEconomics({
    ticketPricePerPaxUsd: 165,
    avgPassengersPerFlight: 3.2,
    dailySorties: 14,
    tripDistanceKm: 35,
    batteryCycleLife: 5000,
    vertiportFeePerFlightUsd: 45,
  });

  assert.equal(econ.revenuePerFlightUsd, Number((165 * 3.2).toFixed(2)));
  assert.ok(econ.costPerSeatMileUsd > 1.5 && econ.costPerSeatMileUsd < 10);
  assert.equal(JOBY_S4_CONSTANTS.PAX_CAPACITY, 4);
  assert.ok(econ.breakEvenLoadFactorPax > 0);
});
