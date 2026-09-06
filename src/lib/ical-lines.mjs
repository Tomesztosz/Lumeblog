// RFC 5545: fold at 75 UTF-8 octets without splitting a Unicode character.
export function foldIcsLine(line) {
  const encoder = new TextEncoder();
  let output = '', bytes = 0;
  for (const character of line) {
    const size = encoder.encode(character).length;
    if (bytes + size > 75) { output += '\r\n '; bytes = 1; }
    output += character; bytes += size;
  }
  return output;
}
