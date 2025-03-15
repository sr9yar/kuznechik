import { Kuznechik } from './kuznechik.class';


console.log(' >>> ');


// const key  Buffer.from('8899aabbccddeeff0011223344556677fedcba98765432100123456789abcdef', 'hex');
const key: string = '8899aabbccddeeff0011223344556677fedcba98765432100123456789abcdef';
const plainText: string = 'Кузнечик на яваскрипте';

const k = new Kuznechik();
k.setKey(key);
console.log(``);
const enc = k.encrypt(Buffer.from(plainText));
console.log(`Открытый текст: ${plainText}`);
console.log(``);
console.log(`Шифртекст: ${enc.toString('hex')}`);
console.log(``);
console.log(`Раcшифрование: ${k.decrypt(enc).toString()}`);
console.log(`\n\n`);



// режим простой замены (Electronic Codebook, ECB);
// режим гаммирования (Counter, CTR);
// режим гаммирования с обратной связью по выходу (Output Feedback, OFB);
// режим простой замены с зацеплением (Cipher Block Chaining, CBC);
// режим гаммирования с обратной связью по шифротексту (Cipher Feedback, CFB);
// режим выработки имитовставки (Message Authentication Code, MAC).


