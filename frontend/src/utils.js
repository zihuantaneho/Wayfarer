export function chunkArray(arr, size) {
    const chunks = [];
    let index = 0;

    while (index < arr.length) {
      chunks.push(arr.slice(index, index + size));
      index += size;
    }

    return chunks;
  }
