// TEST hat hier keine wirkliche Funktion, jedoch beschwert sich ESLint, wenn nur eine
// Konstante eportiert wird und will die dann als Default exportiert haben. Das wollen
// wir aber nicht, um konsistent für die Zukunft zu sein. Sobald es mehrere Konstanten
// gibt, kann das bedenkenlos gelöscht werden.
export const TEST = 0;

/**
 * Bestimmt den Faktor, um den die Korrelation runter skaliert wird. Ein Faktor von 2
 * bedeutet z.b., dass das erzeugte "Bild" um ein 4-faches kleiner als original ist.
 */
export const CORRELATION_SCALE = 6;
