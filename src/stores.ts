import { writable } from "svelte/store";

export const page = writable("home");
export const mediaQuery = writable("desktop");
export const doNotTrack = writable("DO_NOT_TRACK");
