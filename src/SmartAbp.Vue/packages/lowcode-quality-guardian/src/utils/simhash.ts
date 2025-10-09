/*
 * This code is adapted from simhash-js (https://github.com/NaturalNode/simhash-js)
 * which is licensed under the MIT license.
 */

const a = new Array(64);

function md5(data: string): number[] {
  // Simple MD5-like hash for demonstration. A proper implementation would be much more complex.
  // In a real-world scenario, a robust hashing library should be used.
  let h0 = 0x67452301, h1 = 0xEFCDAB89, h2 = 0x98BADCFE, h3 = 0x10325476;
  const str = unescape(encodeURIComponent(data));
  for (let i = 0; i < str.length; i++) {
    h0 = (h0 + str.charCodeAt(i)) | 0;
    h1 = (h1 + str.charCodeAt(i)) | 0;
    h2 = (h2 + str.charCodeAt(i)) | 0;
    h3 = (h3 + str.charCodeAt(i)) | 0;
  }
  return [h0, h1, h2, h3];
}

function getFeatures(string: string): string[] {
  const features = [];
  const tokens = string.split(/\s+/);
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] && tokens[i].length > 1) {
      features.push(tokens[i]);
    }
  }
  return features;
}

export function simhash(d: string | string[]): bigint {
  for (let i = 0; i < 64; i++) {
    a[i] = 0;
  }

  const features = Array.isArray(d) ? d : getFeatures(d);

  features.forEach(feature => {
    const hash = md5(feature);
    const h1 = hash[0];
    const h2 = hash[1];

    for (let i = 0; i < 64; i++) {
      const bit = i < 32 ? (h1 >> i) & 1 : (h2 >> (i - 32)) & 1;
      a[i] += bit === 1 ? 1 : -1;
    }
  });

  let hash = 0n;
  for (let i = 0; i < 64; i++) {
    if (a[i] > 0) {
      hash |= 1n << BigInt(i);
    }
  }
  return hash;
}
