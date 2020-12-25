setTimeout(useWASM, 500);

function useWASM() {
  const arr = new Uint8Array([1,2,3,4,5,6,7,8,9,10]);
  const encoder = new TextEncoder()
  _calculate(encoder.encode("creature"), arr, 10);
  console.log(arr);
}