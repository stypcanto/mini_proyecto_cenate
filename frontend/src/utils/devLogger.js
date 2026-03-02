/**
 * devLogger — wrapper de console solo activo en desarrollo.
 *
 * En producción (NODE_ENV !== 'development') todos los métodos
 * son no-ops para que ningún dato sensible llegue a la consola
 * del navegador del usuario final.
 *
 * Uso:
 *   import { devLog, devWarn, devError } from '../utils/devLogger';
 *   devLog('mensaje', data);   // solo imprime en dev
 */

const IS_DEV = process.env.NODE_ENV === 'development';

/* eslint-disable no-console */
export const devLog   = IS_DEV ? (...a) => console.log(...a)   : () => {};
export const devWarn  = IS_DEV ? (...a) => console.warn(...a)  : () => {};
export const devInfo  = IS_DEV ? (...a) => console.info(...a)  : () => {};
export const devError = IS_DEV ? (...a) => console.error(...a) : () => {};
/* eslint-enable no-console */

export default { devLog, devWarn, devInfo, devError };
