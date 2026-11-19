import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CINEMA_BEATS,
  evaluateCinemaState,
  getBeatForProgress,
} from './cinemaTimeline';

test('evaluateCinemaState clamps out-of-range and NaN progress safely', () => {
  const neg = evaluateCinemaState(-0.4);
  const over = evaluateCinemaState(1.8);
  const nan = evaluateCinemaState(Number.NaN);

  assert.equal(neg.progress, 0);
  assert.equal(over.progress, 1);
  assert.equal(nan.progress, 0);
  assert.equal(neg.beat.id, 'CITY_ESTABLISH');
  assert.equal(over.beat.id, 'APPROACH_VERTIPORT');
});

test('forward and reverse scrubbing produce identical deterministic scene state', () => {
  const forward = evaluateCinemaState(0.66);
  // Jump to end then scrub back to 0.66
  evaluateCinemaState(0.98);
  const reversed = evaluateCinemaState(0.66);

  assert.deepEqual(forward, reversed);
  assert.equal(forward.beat.id, 'TRANSITION_CRUISE');
  assert.ok(forward.airspeedKmh > 180, 'Cruise phase should exceed 180 km/h');
  assert.ok(forward.nacelleTiltDeg < 20, 'Cruise phase nacelles should tilt near horizontal (0 deg)');
});

test('Joby S4 tilt-rotor kinematics match vertical takeoff -> cruise -> vertical approach', () => {
  const liftoff = evaluateCinemaState(0.38);
  const cruise = evaluateCinemaState(0.72);
  const approach = evaluateCinemaState(0.96);

  assert.equal(liftoff.beat.id, 'VERTICAL_LIFTOFF');
  assert.equal(Math.round(liftoff.nacelleTiltDeg), 90);
  assert.ok(liftoff.altitudeM > 100);

  assert.equal(cruise.beat.id, 'TRANSITION_CRUISE');
  assert.equal(Math.round(cruise.nacelleTiltDeg), 0);
  assert.equal(cruise.airspeedKmh, 265);

  assert.equal(approach.beat.id, 'APPROACH_VERTIPORT');
  assert.ok(approach.nacelleTiltDeg >= 80, 'Landing approach tilts rotors back toward vertical');
});

test('FREE_ORBIT takeover immediately hides 2D establishing plate for unobstructed 3D orbit', () => {
  const cinemaStart = evaluateCinemaState(0.0, 'CINEMA_SCROLL');
  const freeOrbitStart = evaluateCinemaState(0.0, 'FREE_ORBIT');

  assert.equal(cinemaStart.plateOpacity, 1);
  assert.equal(freeOrbitStart.plateOpacity, 0);
  assert.equal(freeOrbitStart.interactionMode, 'FREE_ORBIT');
  assert.equal(CINEMA_BEATS.length, 4);
  assert.equal(getBeatForProgress(0.55).id, 'TRANSITION_CRUISE');
});

test('landing gear retracts cleanly during cruise and 4-shot plate weights stay normalized', () => {
  const parked = evaluateCinemaState(0.0, 'CINEMA_SCROLL');
  const cruise = evaluateCinemaState(0.72, 'CINEMA_SCROLL');
  const landed = evaluateCinemaState(1.0, 'CINEMA_SCROLL');
  const orbit = evaluateCinemaState(0.72, 'FREE_ORBIT');

  assert.equal(parked.gearDeploy, 1);
  assert.ok(parked.padShadowOpacity > 0.8);
  assert.equal(cruise.gearDeploy, 0);
  assert.equal(cruise.padShadowOpacity, 0);
  assert.equal(landed.gearDeploy, 1);
  assert.ok(landed.padShadowOpacity > 0.8);

  const wSum =
    cruise.plateWeights.vertiport +
    cruise.plateWeights.climb +
    cruise.plateWeights.cruise +
    cruise.plateWeights.approach;
  assert.ok(Math.abs(wSum - 1) < 0.001, 'Cinema scroll plate weights should sum to 1');
  assert.equal(orbit.plateWeights.cruise, 0, 'Free orbit disables 2D cinema plates');
});
