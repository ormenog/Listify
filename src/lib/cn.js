/** Unisce classi CSS ignorando valori falsy. */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
