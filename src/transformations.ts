import {
  LINEAR,
  π,
} from './constants';

/**
 * Substitution, permutations,
 * 
 * base operations
 */





/**
 * 4.1.1 Нелинейное биективное преобразование
 * Преобразование S
 * @param bytes 
 * @returns Uint8Array
 */
export function S(bytes: Uint8Array) {
  const π1 = new Uint8Array(bytes.length);

  for (let i = 0; i < bytes.length; i++) {
    const index = Number.parseInt(`${bytes[i]}`, 16);
    π1[i] = π[index];
  }

  return π1;
}



// 56-20

/**
 * 4.1.2 Линейное преобразование
 * Преобразование L
 * Перемешивание блока данных
 * L(a) = R¹⁶(a)
 * @param a 
 * @returns Uint8Array
 */
export function L(a: Uint8Array): Uint8Array {
  let result: Uint8Array = new Uint8Array();
  for (let i = 0; i < 16; i++) {
    result = R(a);
  }
  return result;
}



/**
 * 4.1.2 Линейное преобразование
 * Преобразование R
 * R(a)
 * @param a 
 * @returns 
 */
export function R(a: Uint8Array): Uint8Array {
  let arr = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    arr[i] = a[i - 1];
    arr[0] ^= calcGaloisField(LINEAR[i], a[i]);
  }
  return arr;
}



/**
 * Обратное наложение раундового ключа k ∈ V₁₂₃ на блок ключа
 * 41-35
 * Сложение двух двоичных векторов по модулю 2
 * 
 */
export function X(a: Uint8Array, b: Uint8Array): Uint8Array {
  const arr = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    arr[i] = a[i] ^ b[i];
  }
  return arr;
}



//
// https://www.samiam.org/key-schedule.html
//

/**
 * Функция умножения чисел в конечном поле (или поле Галуа F₂^₈) 
 * над неприводимым полиномом x⁸ + x⁷ + x⁶ + x + 1
 * 
 * Преобразование Δ 23-10
 * 
 * @param a 
 * @param b 
 * @returns 
 */
export function calcGaloisField(a: number, b: number): number {
  let r: number = 0x00;
  for (let i = 0; i < 8; i++) {
    if (b & 1) {
      r ^= a;
    }
    // 0x80 128
    // 0xc3 195
    // 0x00 0
    a = (a & 0x80 ? 0xc3 : 0x00) ^ (a <<= 1);
    b >>= 1;
  }
  return r;
}



/**
 * Вычисление раундовых констант
 * Ci = L(Vec₁₂₆(i)), i = 1,32
 * 54-35
 */
export function generateRoundConstants(): Uint8Array[] {
  const roundConstants: Uint8Array[] = [];
  for (let Ci = 0; Ci < 32; Ci++) {
    let arr = new Uint8Array(16);
    arr[15] = Ci + 1;
    const transformed: Uint8Array = L(arr);
    roundConstants.push(transformed);
  }
  return roundConstants;
}



/**
 * Обратное нелинейное биективное преобразование 
 * 
 * Обратная замена байтов в блоке данных 
 * 
 * 28-25 https://kinescope.io/aDrMDLqGbonpho13j3KTmn
 * @param a 
 * @returns 
 */
export function reverseS(a: Uint8Array): Uint8Array {
  const arr = new Uint8Array(16);

  const padded = new Uint8Array([
    ...a,
    ...new Uint8Array(16 - a.length)
  ]);

  for (let i = 0; i < 16; i++) {
    arr[i] = π.indexOf(padded[i]);
  }
  return arr;
}



/**
 * Обратное линейное преобразование 
 * 
 * Обратное перемешивание блока данных 
 * 
 * @param a 
 * @returns 
 */
export function reverseL(a: Uint8Array): Uint8Array {
  let result: Uint8Array = new Uint8Array();
  for (let i = 0; i < 16; i++) {
    result = reverseR(a);
  }
  return result;
}



/**
 * Обратное преобразование R  
 * @param a 
 * @returns 
 */
export function reverseR(a: Uint8Array): Uint8Array {
  let arr = new Uint8Array(16);
  arr[15] = a[0];
  for (let i = 0; i < 15; i++) {
    arr[i] = a[i + 1];
    arr[15] ^= calcGaloisField(a[i + 1], LINEAR[i]);
  }
  return arr;
}



/**
 * Преобразование F
 * @param key1 
 * @param key2 
 * @param roundConstant
 * @returns 
 */
export function F(
  key1: Uint8Array,
  key2: Uint8Array,
  roundConstant: Uint8Array,
) {
  const outKey2 = key1;
  const xResult = X(key1, roundConstant);
  const sResult = S(xResult);
  const lResult = L(sResult);
  const result = X(lResult, key2);
  const ret = [result, outKey2];
  return ret;
}


/**
 * Get random bytes
 * @param size 
 * @returns 
 */
export function getRandomBytes(size: number): Uint8Array {
  const arr = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    arr[i] = Math.floor(Math.random() * 256);
  }
  return arr;
}



/**
 * Get Uint8Array
 * from hex string
 * @param hexString 
 * @returns 
 */
export function fromHex(hexString: string): Uint8Array {
  return Uint8Array.from((hexString.match(/.{1,2}/g) ?? []).map((byte: string) => Number.parseInt(byte, 16)));
}



/**
 * Convert Uint8Array
 * to hash string 
 * @param bytes 
 * @returns 
 */
export function toHex(bytes: Uint8Array): string {
  return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
}



/**
 * Check if string is a hex string
 * @param stringToTest 
 * @returns 
 */
export function isHex(stringToTest: string): boolean {
  return stringToTest.length !== 0 && stringToTest.length % 2 === 0 && !/[^a-fA-F0-9]/u.test(stringToTest);
}

