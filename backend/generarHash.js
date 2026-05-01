import bcrypt from 'bcryptjs';

const passwordReal = 'visualizador123';
const hash = bcrypt.hashSync(passwordReal, 10);

console.log('-----------------------------------');
console.log('Tu hash correcto para visualizador123 es:');
console.log(hash);
console.log('-----------------------------------');