// javascript negative modulo bug
// correct implementation
function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

export default mod;
