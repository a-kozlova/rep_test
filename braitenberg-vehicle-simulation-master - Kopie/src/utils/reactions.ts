import Phaser from 'phaser';

type KernelFunction = (x: number, y: number) => number;
type VectorLike = Phaser.Types.Math.Vector2Like;

/**
 * Liefert eine "Reaktions-Funktion" zurück, welche überall einen konstanten
 * Wert zurück gibt, in Form einer Gauss-Verteilung.
 *
 * @param center
 * @param sigma Die Standardabweichung für die Verteilung.
 */
export function gaussian(center: VectorLike, sigma: VectorLike): KernelFunction {
  const x0 = center.x || 0;
  const y0 = center.y || 0;
  const sigmaX = sigma.x || 0;
  const sigmaY = sigma.y || 0;
  const sX = 2 * sigmaX ** 2;
  const sY = 2 * sigmaY ** 2;

  return (x: number, y: number) => {
    const exponent = -((x - x0) ** 2 / sX + (y - y0) ** 2 / sY);
    return Math.exp(exponent);
  };
}

export function flat(): KernelFunction {
  return () => 1.0;
}

/**
 * Liefert eine "Reaktions-Funktion" zurück, welche überall einen konstanten
 * Wert zurück gibt, in Form eines Kreises.
 *
 * @param center
 * @param radius
 */
export function flatCircle(center: VectorLike, radius: number): KernelFunction {
  const x0 = center.x || 0;
  const y0 = center.y || 0;
  const r2 = radius ** 2;

  return (x: number, y: number) => {
    return (x - x0) ** 2 + (y - y0) ** 2 <= r2 ? 3 : 0;
  };
}

/**
 * Liefert eine "Reaktions-Funktion" zurück, welche überall einen konstanten
 * Wert zurück gibt, in Form eines Rechtecks.
 *
 * @param topLeft
 * @param width
 * @param height
 * @param angle
 */
export function flatRect(topLeft: VectorLike, width: number, height: number, angle: number = 0): KernelFunction {
  const x0 = topLeft.x || 0;
  const y0 = topLeft.y || 0;

  const rect = new Phaser.Geom.Rectangle(x0, y0, width, height);
  // Der Mittelpunkt des Rechtecks `rect`.
  const origin = { x: x0 + width / 2, y: y0 + height / 2 };

  // Da sich der Winkel des Rechtecks nicht ändert (Wenn doch, dann sollte ein
  // neues Rechteckt erstellt werden), können wir die Konstanten einmal hier
  // berechnen und in der eigentlich Funktion die Berechnung sparen.
  const s = Math.sin(-angle);
  const c = Math.cos(-angle);

  return (x: number, y: number) => {
    // Wir wollen den Punkt um den Mittelpunkt des Rechtecks drehen, damit die
    // Rotation in der nächsten Zeile korrekt ist.
    const newPoint = { x: x - origin.x, y: y - origin.y };

    // Hier wird der Punkt einmal rotiert, da die Überprüfung, ob ein Punkt in einem
    // Rechteck liegt, welche aufrecht ist, viel einfacher ist.
    const rotatedX = newPoint.x * c - newPoint.y * s;
    const rotatedY = newPoint.x * s + newPoint.y * c;
    if (rect.contains(rotatedX + origin.x, rotatedY + origin.y)) {
      return 3;
    }

    return 0;
  };
}

/**
 * Liefert die Winkelwerte zurück, welche zur Berechnung von der Korrelation verwendet
 * werden sollten.
 * Die Funktion sollte theorethisch niemals selbst aufgerufen werden, da nachfolgend
 * das Ganze als Konstante exportier wird.
 */
function getAvailableAngles(): number[] {
  // Der Delta Wert zwischen den einzelnen Winkelwerten.
  const angleDelta = Math.PI / 16;
  const angles = [];

  for (let a = 0; a <= Math.PI * 2; a += angleDelta) {
    angles.push(a);
  }

  return angles;
}

// Da sich die Winkelwerte nicht zur Laufzeit ändern, wird das hier einmal
// berechnet und als Konstante exportiert.
export const AVAILABLE_ANGLES = getAvailableAngles();
