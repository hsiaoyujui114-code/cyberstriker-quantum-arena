/**
 * CyberStriker control-feel adapter.
 *
 * The production page ships a generated classic bundle. This adapter is loaded
 * immediately after that bundle so control tuning can stay small, reviewable,
 * and independent from generated bundle output.
 *
 * Improvements:
 * - analogue joystick deadzone + response curve + axis intent filtering
 * - stable touch ownership for multi-touch play
 * - edge-triggered jump/double-jump (holding jump no longer burns both jumps)
 * - short jump buffer and coyote time
 * - deterministic ground acceleration/deceleration while preserving the
 *   combat engine's existing walk states, collision logic, knockback and 60 FPS
 */
(() => {
  'use strict';

  const CONTROL = Object.freeze({
    joystickRadius: 60,
    joystickDeadzone: 0.16,
    joystickCurve: 1.28,
    axisSnapThreshold: 0.22,
    axisSnapRatio: 1.35,
    moveInputThreshold: 0.15,
    groundAcceleration: 1.15,
    groundReversalAcceleration: 1.65,
    groundDeceleration: 1.45,
    jumpBufferFrames: 6,
    coyoteFrames: 5,
    groundForwardSpeed: 5.0,
    groundBackSpeed: 3.6,
    jumpHorizontalSpeed: 4.8
  });

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const approach = (value, target, maxDelta) => {
    if (value < target) return Math.min(value + maxDelta, target);
    if (value > target) return Math.max(value - maxDelta, target);
    return target;
  };

  const install = () => {
    const app = window.app;
    if (!app || app.__controlFeelInstalled) return false;

    app.__controlFeelInstalled = true;
    app.__controlFeel = {
      fighters: new Map(),
      movement: new Map(),
      jump: new Map(),
      joystickTouchId: null
    };

    const runtime = app.__controlFeel;

    const getMovementState = (fighterId) => {
      if (!runtime.movement.has(fighterId)) {
        runtime.movement.set(fighterId, { velocity: 0 });
      }
      return runtime.movement.get(fighterId);
    };

    const getJumpState = (fighterId) => {
      if (!runtime.jump.has(fighterId)) {
        runtime.jump.set(fighterId, {
          previousRawJump: false,
          bufferFrames: 0,
          coyoteFrames: 0
        });
      }
      return runtime.jump.get(fighterId);
    };

    // Capture the actual fighter objects owned by the bundled combat engine.
    // This hook runs for both fighters every rendered battle frame.
    if (typeof app._drawMeleeSkillVisuals === 'function') {
      const originalDrawMeleeSkillVisuals = app._drawMeleeSkillVisuals;
      app._drawMeleeSkillVisuals = function patchedDrawMeleeSkillVisuals(ctx, fighter) {
        if (fighter && (fighter.id === 1 || fighter.id === 2)) {
          runtime.fighters.set(fighter.id, fighter);
        }
        return originalDrawMeleeSkillVisuals.call(this, ctx, fighter);
      };
    }

    // Reset transient controller state at the beginning of each match so a
    // held key/touch from the lobby can never leak into the next round.
    const launchMethodName = typeof app._launchMatch === 'function'
      ? '_launchMatch'
      : (typeof app.startBattle === 'function' ? 'startBattle' : null);
    if (launchMethodName) {
      const originalLaunch = app[launchMethodName];
      app[launchMethodName] = function patchedLaunch(...args) {
        runtime.fighters.clear();
        runtime.movement.clear();
        runtime.jump.clear();
        runtime.joystickTouchId = null;
        if (this.mobileInputs) {
          this.mobileInputs.x = 0;
          this.mobileInputs.y = 0;
          this.mobileInputs.jump = false;
          this.mobileInputs.down = false;
        }
        return originalLaunch.apply(this, args);
      };
    }

    // Analogue joystick: a small radial deadzone removes thumb jitter, while a
    // mild response curve preserves precision near center without making full
    // deflection feel sluggish. Axis intent filtering prevents accidental jump
    // or crouch while the player mainly wants to move left/right.
    app._updateJoystick = function updateJoystickWithCurve(dx, dy) {
      const distance = Math.hypot(dx, dy);
      if (!Number.isFinite(distance) || distance <= 0.0001) {
        this.mobileInputs.x = 0;
        this.mobileInputs.y = 0;
        return;
      }

      const rawMagnitude = clamp(distance / CONTROL.joystickRadius, 0, 1);
      if (rawMagnitude <= CONTROL.joystickDeadzone) {
        this.mobileInputs.x = 0;
        this.mobileInputs.y = 0;
        return;
      }

      const normalizedMagnitude =
        (rawMagnitude - CONTROL.joystickDeadzone) / (1 - CONTROL.joystickDeadzone);
      const curvedMagnitude = Math.pow(normalizedMagnitude, CONTROL.joystickCurve);
      const nx = dx / distance;
      const ny = dy / distance;

      let x = nx * curvedMagnitude;
      let y = ny * curvedMagnitude;
      const absX = Math.abs(x);
      const absY = Math.abs(y);

      if (absY < CONTROL.axisSnapThreshold && absX > absY * CONTROL.axisSnapRatio) {
        y = 0;
      } else if (absX < CONTROL.axisSnapThreshold && absY > absX * CONTROL.axisSnapRatio) {
        x = 0;
      }

      this.mobileInputs.x = clamp(x, -1, 1);
      this.mobileInputs.y = clamp(y, -1, 1);
    };

    const normalGroundStates = new Set([
      'idle',
      'walk_fwd',
      'walk_back',
      'crouch',
      'high_guard',
      'low_guard'
    ]);

    const hasHigherPriorityAction = (input) => !!(
      input.punch ||
      input.kick ||
      input.guard ||
      input.skill1 ||
      input.skill2 ||
      input.skill3 ||
      input.skill4 ||
      input.skill5 ||
      input.burst ||
      input.superMove ||
      input.dropThrough ||
      input.down ||
      input.y > 0.35
    );

    const prepareJumpInput = (fighterId, input) => {
      const fighter = runtime.fighters.get(fighterId);
      const state = getJumpState(fighterId);
      const rawJump = !!input.jump || input.y < -0.35;
      const jumpPressed = rawJump && !state.previousRawJump;
      state.previousRawJump = rawJump;

      if (fighter && fighter.isGrounded) {
        state.coyoteFrames = CONTROL.coyoteFrames;
      } else if (state.coyoteFrames > 0) {
        state.coyoteFrames--;
      }

      if (jumpPressed) {
        state.bufferFrames = CONTROL.jumpBufferFrames;
      } else if (state.bufferFrames > 0) {
        state.bufferFrames--;
      }

      let emitJump = false;
      let usedCoyoteJump = false;

      if (!fighter) {
        emitJump = jumpPressed;
        if (emitJump) state.bufferFrames = 0;
      } else if (state.bufferFrames > 0) {
        if (fighter.isGrounded && !input.down) {
          emitJump = true;
          state.bufferFrames = 0;
          state.coyoteFrames = 0;
        } else if (
          !fighter.isGrounded &&
          state.coyoteFrames > 0 &&
          fighter.state === 'jump' &&
          !fighter.currentAction
        ) {
          // Run the same first-jump impulse directly so stepping off a platform
          // still has a short, forgiving jump window without consuming the
          // character's double jump.
          fighter.vy = -14.4;
          fighter.vx = clamp(input.x || 0, -1, 1) * CONTROL.jumpHorizontalSpeed;
          fighter.hasDoubleJump = true;
          fighter.stateTime = 0;
          state.bufferFrames = 0;
          state.coyoteFrames = 0;
          usedCoyoteJump = true;
        } else if (
          fighter.state === 'jump' &&
          fighter.hasDoubleJump &&
          !fighter.currentAction &&
          fighter.stateTime >= 6
        ) {
          emitJump = true;
          state.bufferFrames = 0;
        }
      }

      const result = { ...input };
      result.jump = emitJump;

      // The combat engine also treats negative Y as jump. Neutralize held-up Y
      // after the press so one long press cannot trigger the second jump six
      // frames later. Explicit drop-through input remains untouched.
      if (!emitJump && !result.dropThrough && result.y < -0.35) {
        result.y = 0;
      }

      if (usedCoyoteJump) {
        result.jump = false;
        if (result.y < -0.35) result.y = 0;
      }

      return result;
    };

    const smoothGroundMovement = (fighterId, input) => {
      const fighter = runtime.fighters.get(fighterId);
      if (!fighter) return input;

      const moveState = getMovementState(fighterId);
      const result = { ...input };
      const rawX = clamp(Number(result.x) || 0, -1, 1);

      if (!fighter.isGrounded || !normalGroundStates.has(fighter.state)) {
        moveState.velocity = 0;
        return result;
      }

      // Jump should inherit the current running momentum when no new horizontal
      // direction is supplied, instead of dropping horizontal speed to zero.
      if (result.jump) {
        if (Math.abs(rawX) <= CONTROL.moveInputThreshold && Math.abs(moveState.velocity) > 0.05) {
          result.x = clamp(moveState.velocity / CONTROL.jumpHorizontalSpeed, -1, 1);
        }
        moveState.velocity = 0;
        return result;
      }

      if (hasHigherPriorityAction(result)) {
        moveState.velocity = 0;
        return result;
      }

      if (Math.abs(rawX) > CONTROL.moveInputThreshold) {
        const direction = Math.sign(rawX);
        const inputMagnitude = clamp(Math.abs(rawX), 0, 1);
        const speedModifier = fighter.frostTimer > 0 ? 0.55 : 1;
        const isMovingForward =
          (fighter.facing === 1 && direction > 0) ||
          (fighter.facing === -1 && direction < 0);
        const maxSpeed =
          (isMovingForward ? CONTROL.groundForwardSpeed : CONTROL.groundBackSpeed) * speedModifier;
        const targetVelocity = direction * maxSpeed * inputMagnitude;
        const reversing =
          Math.abs(moveState.velocity) > 0.05 && Math.sign(moveState.velocity) !== direction;
        const acceleration = reversing
          ? CONTROL.groundReversalAcceleration
          : CONTROL.groundAcceleration;

        moveState.velocity = approach(moveState.velocity, targetVelocity, acceleration);

        // _handleNormalInputs() in the bundled engine still adds the legacy
        // full-speed displacement. Pre-compensate only that locomotion delta;
        // the engine then applies its normal state/animation/collision logic and
        // the resulting net displacement is our smoothed deterministic value.
        const legacyDelta = isMovingForward
          ? fighter.facing * CONTROL.groundForwardSpeed * speedModifier
          : -fighter.facing * CONTROL.groundBackSpeed * speedModifier;
        fighter.x += moveState.velocity - legacyDelta;
        return result;
      }

      moveState.velocity = approach(moveState.velocity, 0, CONTROL.groundDeceleration);
      if (Math.abs(moveState.velocity) < 0.01) {
        moveState.velocity = 0;
      } else {
        // No legacy walk delta is emitted when x is neutral, so apply the short
        // braking coast directly. This is deterministic and lasts only a few
        // fixed frames.
        fighter.x += moveState.velocity;
      }

      return result;
    };

    const wrapGather = (methodName, fighterId) => {
      if (typeof app[methodName] !== 'function') return;
      const originalGather = app[methodName];
      app[methodName] = function patchedGatherInputs(...args) {
        const rawInput = originalGather.apply(this, args);
        const jumpPrepared = prepareJumpInput(fighterId, rawInput);
        return smoothGroundMovement(fighterId, jumpPrepared);
      };
    };

    wrapGather('_gatherInputsP1', 1);
    wrapGather('_gatherInputsP2', 2);

    // Replace the joystick zone's anonymous legacy touch handlers in the event
    // capture phase. Tracking the initiating touch identifier prevents an
    // attack-button finger from stealing the movement joystick on multi-touch.
    const joystickZone = document.getElementById('mobileJoystickZone');
    if (joystickZone) {
      const findTouch = (touchList, identifier) => {
        for (let i = 0; i < touchList.length; i++) {
          if (touchList[i].identifier === identifier) return touchList[i];
        }
        return null;
      };

      const updateFromTouch = (touch) => {
        if (!touch) return;
        const rect = joystickZone.getBoundingClientRect();
        app._updateJoystick(
          touch.clientX - rect.left - rect.width / 2,
          touch.clientY - rect.top - rect.height / 2
        );
      };

      joystickZone.addEventListener('touchstart', (event) => {
        if (runtime.joystickTouchId !== null) return;
        const touch = event.changedTouches[0] || event.targetTouches[0];
        if (!touch) return;
        runtime.joystickTouchId = touch.identifier;
        updateFromTouch(touch);
        event.preventDefault();
        event.stopImmediatePropagation();
      }, { capture: true, passive: false });

      joystickZone.addEventListener('touchmove', (event) => {
        if (runtime.joystickTouchId === null) return;
        const touch = findTouch(event.touches, runtime.joystickTouchId);
        if (touch) updateFromTouch(touch);
        event.preventDefault();
        event.stopImmediatePropagation();
      }, { capture: true, passive: false });

      const releaseJoystick = (event) => {
        if (runtime.joystickTouchId === null) return;
        const released = findTouch(event.changedTouches, runtime.joystickTouchId);
        if (!released && event.type !== 'touchcancel') return;
        runtime.joystickTouchId = null;
        app.mobileInputs.x = 0;
        app.mobileInputs.y = 0;
        event.preventDefault();
        event.stopImmediatePropagation();
      };

      joystickZone.addEventListener('touchend', releaseJoystick, { capture: true, passive: false });
      joystickZone.addEventListener('touchcancel', releaseJoystick, { capture: true, passive: false });
    }

    return true;
  };

  if (!install()) {
    window.addEventListener('DOMContentLoaded', install, { once: true });
    setTimeout(install, 0);
  }
})();
