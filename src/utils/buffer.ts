import type { BufferLike } from '@/typings';

export function toBuffer(data: BufferLike): Buffer {
  if (Buffer.isBuffer(data)) {
    return data;
  }

  if (data instanceof ArrayBuffer) {
    return Buffer.from(data);
  }

  return typeof data === 'string' ? Buffer.from(data, 'utf8') : Buffer.alloc(0);
}
