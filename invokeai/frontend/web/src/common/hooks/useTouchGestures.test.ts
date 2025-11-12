// src/common/hooks/useTouchGestures.test.ts
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Touch/TouchList APIs are mocked for testing and can't be properly typed
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useTouchGestures } from './useTouchGestures';

// Helper to create TouchList from Touch array
const createTouchList = (touches: Touch[]): TouchList => touches as unknown as TouchList;

describe('useTouchGestures', () => {
  it('should detect pinch gesture distance', () => {
    const onPinch = vi.fn();
    const ref = { current: document.createElement('div') };

    renderHook(() =>
      useTouchGestures(ref, {
        onPinch,
        onPan: vi.fn(),
      })
    );

    // Simulate pinch by dispatching touch events
    const touch1Start = new Touch({
      identifier: 1,
      target: ref.current,
      clientX: 100,
      clientY: 100,
      radiusX: 0,
      radiusY: 0,
      rotationAngle: 0,
      force: 1,
    });

    const touch2Start = new Touch({
      identifier: 2,
      target: ref.current,
      clientX: 200,
      clientY: 100,
      radiusX: 0,
      radiusY: 0,
      rotationAngle: 0,
      force: 1,
    });

    const touchStartEvent = new TouchEvent('touchstart', {
      touches: createTouchList([touch1Start, touch2Start]),
      cancelable: true,
      bubbles: true,
    });

    ref.current.dispatchEvent(touchStartEvent);

    // Verify pinch callback receives initial distance
    expect(onPinch).toHaveBeenCalled();
  });

  it('should detect pan gesture with 2 fingers', () => {
    const onPan = vi.fn();
    const ref = { current: document.createElement('div') };

    renderHook(() =>
      useTouchGestures(ref, {
        onPan,
        onPinch: vi.fn(),
      })
    );

    // Start with 2 touches
    const touch1Start = new Touch({
      identifier: 1,
      target: ref.current,
      clientX: 100,
      clientY: 100,
      radiusX: 0,
      radiusY: 0,
      rotationAngle: 0,
      force: 1,
    });

    const touch2Start = new Touch({
      identifier: 2,
      target: ref.current,
      clientX: 200,
      clientY: 100,
      radiusX: 0,
      radiusY: 0,
      rotationAngle: 0,
      force: 1,
    });

    const touchStartEvent = new TouchEvent('touchstart', {
      touches: createTouchList([touch1Start, touch2Start]),
      cancelable: true,
      bubbles: true,
    });

    ref.current.dispatchEvent(touchStartEvent);

    // Move both touches
    const touch1Move = new Touch({
      identifier: 1,
      target: ref.current,
      clientX: 110,
      clientY: 110,
      radiusX: 0,
      radiusY: 0,
      rotationAngle: 0,
      force: 1,
    });

    const touch2Move = new Touch({
      identifier: 2,
      target: ref.current,
      clientX: 210,
      clientY: 110,
      radiusX: 0,
      radiusY: 0,
      rotationAngle: 0,
      force: 1,
    });

    const touchMoveEvent = new TouchEvent('touchmove', {
      touches: createTouchList([touch1Move, touch2Move]),
      cancelable: true,
      bubbles: true,
    });

    ref.current.dispatchEvent(touchMoveEvent);

    // Verify pan callback was called with delta
    expect(onPan).toHaveBeenCalledWith(10, 10);
  });

  it('should detect tap gesture', () => {
    const onTap = vi.fn();
    const ref = { current: document.createElement('div') };

    renderHook(() =>
      useTouchGestures(ref, {
        onTap,
      })
    );

    // Start touch
    const touch = new Touch({
      identifier: 1,
      target: ref.current,
      clientX: 100,
      clientY: 100,
      radiusX: 0,
      radiusY: 0,
      rotationAngle: 0,
      force: 1,
    });

    const touchStartEvent = new TouchEvent('touchstart', {
      touches: createTouchList([touch]),
      cancelable: true,
      bubbles: true,
    });

    ref.current.dispatchEvent(touchStartEvent);

    // End touch (all touches removed)
    const touchEndEvent = new TouchEvent('touchend', {
      touches: createTouchList([]),
      cancelable: true,
      bubbles: true,
    });

    ref.current.dispatchEvent(touchEndEvent);

    // Verify tap callback was called
    expect(onTap).toHaveBeenCalled();
  });

  it('should detect double-tap gesture', () => {
    const onDoubleTap = vi.fn();
    const ref = { current: document.createElement('div') };

    renderHook(() =>
      useTouchGestures(ref, {
        onDoubleTap,
      })
    );

    // First tap
    const touch1 = new Touch({
      identifier: 1,
      target: ref.current,
      clientX: 100,
      clientY: 100,
      radiusX: 0,
      radiusY: 0,
      rotationAngle: 0,
      force: 1,
    });

    ref.current.dispatchEvent(
      new TouchEvent('touchstart', {
        touches: createTouchList([touch1]),
        cancelable: true,
        bubbles: true,
      })
    );

    ref.current.dispatchEvent(
      new TouchEvent('touchend', {
        touches: createTouchList([]),
        cancelable: true,
        bubbles: true,
      })
    );

    // Second tap (within 300ms)
    const touch2 = new Touch({
      identifier: 2,
      target: ref.current,
      clientX: 100,
      clientY: 100,
      radiusX: 0,
      radiusY: 0,
      rotationAngle: 0,
      force: 1,
    });

    ref.current.dispatchEvent(
      new TouchEvent('touchstart', {
        touches: createTouchList([touch2]),
        cancelable: true,
        bubbles: true,
      })
    );

    ref.current.dispatchEvent(
      new TouchEvent('touchend', {
        touches: createTouchList([]),
        cancelable: true,
        bubbles: true,
      })
    );

    // Verify double-tap callback was called
    expect(onDoubleTap).toHaveBeenCalled();
  });

  it('should calculate pinch scale correctly', () => {
    const onPinch = vi.fn();
    const ref = { current: document.createElement('div') };

    renderHook(() =>
      useTouchGestures(ref, {
        onPinch,
      })
    );

    // Start with touches 100px apart
    const touch1Start = new Touch({
      identifier: 1,
      target: ref.current,
      clientX: 100,
      clientY: 100,
      radiusX: 0,
      radiusY: 0,
      rotationAngle: 0,
      force: 1,
    });

    const touch2Start = new Touch({
      identifier: 2,
      target: ref.current,
      clientX: 200,
      clientY: 100,
      radiusX: 0,
      radiusY: 0,
      rotationAngle: 0,
      force: 1,
    });

    ref.current.dispatchEvent(
      new TouchEvent('touchstart', {
        touches: createTouchList([touch1Start, touch2Start]),
        cancelable: true,
        bubbles: true,
      })
    );

    // Move touches to 200px apart (2x scale)
    const touch1Move = new Touch({
      identifier: 1,
      target: ref.current,
      clientX: 50,
      clientY: 100,
      radiusX: 0,
      radiusY: 0,
      rotationAngle: 0,
      force: 1,
    });

    const touch2Move = new Touch({
      identifier: 2,
      target: ref.current,
      clientX: 250,
      clientY: 100,
      radiusX: 0,
      radiusY: 0,
      rotationAngle: 0,
      force: 1,
    });

    ref.current.dispatchEvent(
      new TouchEvent('touchmove', {
        touches: createTouchList([touch1Move, touch2Move]),
        cancelable: true,
        bubbles: true,
      })
    );

    // Verify scale is 2x (200 / 100)
    expect(onPinch).toHaveBeenCalledWith(200, 2);
  });

  it('should not throw when ref is null', () => {
    const ref = { current: null };

    expect(() => {
      renderHook(() =>
        useTouchGestures(ref, {
          onPan: vi.fn(),
        })
      );
    }).not.toThrow();
  });

  it('should cleanup event listeners on unmount', () => {
    const ref = { current: document.createElement('div') };
    const removeEventListenerSpy = vi.spyOn(ref.current, 'removeEventListener');

    const { unmount } = renderHook(() =>
      useTouchGestures(ref, {
        onPan: vi.fn(),
      })
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
  });

  it('should not detect tap if finger moved more than 10px', () => {
    const onTap = vi.fn();
    const ref = { current: document.createElement('div') };

    renderHook(() =>
      useTouchGestures(ref, {
        onTap,
      })
    );

    // Start touch
    const touchStart = new Touch({
      identifier: 1,
      target: ref.current,
      clientX: 100,
      clientY: 100,
      radiusX: 0,
      radiusY: 0,
      rotationAngle: 0,
      force: 1,
    });

    ref.current.dispatchEvent(
      new TouchEvent('touchstart', {
        touches: createTouchList([touchStart]),
        cancelable: true,
        bubbles: true,
      })
    );

    // Move touch by 20px
    const touchMove = new Touch({
      identifier: 1,
      target: ref.current,
      clientX: 120,
      clientY: 100,
      radiusX: 0,
      radiusY: 0,
      rotationAngle: 0,
      force: 1,
    });

    ref.current.dispatchEvent(
      new TouchEvent('touchmove', {
        touches: createTouchList([touchMove]),
        cancelable: true,
        bubbles: true,
      })
    );

    // End touch
    ref.current.dispatchEvent(
      new TouchEvent('touchend', {
        touches: createTouchList([]),
        cancelable: true,
        bubbles: true,
      })
    );

    // Verify tap was NOT called (movement > 10px)
    expect(onTap).not.toHaveBeenCalled();
  });
});
