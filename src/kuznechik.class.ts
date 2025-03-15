// counter (CTR) mode

import {
  F,
  generateRoundConstants,
  L,
  reverseL,
  reverseS,
  S,
  X,
} from './transformations';


// элементарные преобразования
//
// операции на блоком данных
//
// руанд - совокупность операций надо блоком 
//
// несколько раундов - зашифрование 

// P - открытый текст
// P* - дополненный открытый текст
//
// синхоросылка - initializing value 
// IV - синхоросылка - двоичная последовательность n/2
// 1-30-00 https://kinescope.io/aDrMDLqGbonpho13j3KTmn
// C1, C2 - блоки шифр текста
//
//

export class Kuznechik {

  private key: Uint8Array = new Uint8Array();
  private readonly roundKeys: Uint8Array[] = [];
  private readonly roundConstants: Uint8Array[] = [];

  /**
    * 8899aabbccddeeff0011223344556677fedcba98765432100123456789abcdef
    * ключ во соответствии с А.1.4 ГОСТ Р 34.12─2015
    **/
  constructor() {
    this.roundConstants = generateRoundConstants();
    const key: string = '8899aabbccddeeff0011223344556677fedcba98765432100123456789abcdef';
    this.setKey(key);
  }



  /**
   * Set new key
   * @param key 
   */
  setKey(key: string): void {
    // this.keys = Uint8Array.fromHex(key);
    // const key = Buffer.from('8899aabbccddeeff0011223344556677fedcba98765432100123456789abcdef', 'hex');

    this.key = new Uint8Array(Buffer.from(key, 'hex'));
    this.generateKeys();
  }



  /**
   * Зашифрование
   * @param a Uint8Array
   * @returns 
   */
  encrypt(a: Uint8Array) {
    let result = a;
    for (let i = 0; i < 9; i++) {
      result = X(result, this.roundKeys[i]);
      result = S(result);
      result = L(result);
    }
    result = X(result, this.roundKeys[9]);
    return result;
  }



  /**
   * Расшифрование
   * @param a 
   * @returns 
   */
  decrypt(a: Uint8Array) {
    let result = X(a, this.roundKeys[9]);
    for (let i = 8; i >= 0; i--) {
      result = reverseL(result);
      result = reverseS(result);
      result = X(result, this.roundKeys[i]);
    }
    return result;
  }



  /**
   * Развертывание раундовых ключей
   * Генерация 32 итерационных ключей
   */
  generateKeys() {
    for (let i = 0; i < 32; i++) {
      this.key[i] = Math.floor(Math.random() * 255);
    }

    // Вычисление первых двух раундовых ключей как двух частей ключа шифрования
    const key1 = new Uint8Array(16);
    const key2 = new Uint8Array(16);

    for (let i = 0; i < 16; i++) {
      key1[i] = this.key[i];
      key2[i] = this.key[16 + i];
    }

    this.roundKeys[0] = key1;
    this.roundKeys[1] = key2;

    let temp1 = this.roundKeys.map((a: Uint8Array): Uint8Array => new Uint8Array([...a]));
    let temp2: Uint8Array[];

    // Вычисление 8 раундовых ключей на основе первых двух
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 8; j += 2) {
        temp2 = F(temp1[0], temp1[1], this.roundConstants[j + 8 * i]);
        temp1 = F(temp2[0], temp2[1], this.roundConstants[j + 1 + 8 * i]);
      }

      this.roundKeys[2 * i + 2] = temp1[0];
      this.roundKeys[2 * i + 3] = temp1[1];
    }
  }



}

