export function noop(): void {}

// https://stackoverflow.com/a/39187274
export function gaussianRand(): number {
  let rand = 0;

  for (let i = 0; i < 6; i += 1) {
    rand += Math.random();
  }

  return rand / 6;
}

/**
 * Liefert einen zufällig generierten Wert zurück, welche normalverteilt ist.
 * @param start
 * @param end
 */
export function gaussianRandom(start: number, end: number): number {
  return start + gaussianRand() * (end - start);
}
