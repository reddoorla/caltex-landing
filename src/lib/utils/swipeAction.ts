import { useSwipe, type SwipeCustomEvent } from "svelte-gestures";

export type { SwipeCustomEvent };

/**
 * svelte-gestures v5 swipe wrapped as a classic Svelte action.
 *
 * v5 removed the `swipe` action export in favour of the `useSwipe` hook.
 * Calling `useSwipe(..., isRaw = true)` returns a `swipe(node)` binder whose
 * return value is the cleanup fn — exactly the `{ destroy }` an action needs.
 *
 * Call this at component top-level (it runs `useSwipe` during init):
 *   const swipe = createSwipeAction((e) => { ... });
 *   <div use:swipe> ... </div>
 */
export const createSwipeAction = (handler: (e: SwipeCustomEvent) => void) => {
  const gesture = useSwipe(handler, undefined, undefined, true);
  return (node: HTMLElement) => ({ destroy: gesture.swipe(node) });
};
