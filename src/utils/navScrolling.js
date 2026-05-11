/* Shared mutable flag — set by Nav when a programmatic scroll is in flight.
   Experience checks this to skip the impact animation during nav jumps. */
export const navScrolling = { active: false }
