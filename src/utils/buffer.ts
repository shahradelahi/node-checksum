import type { BufferLike } from '@/typings';

export function toBuffer(data: BufferLike): Buffer {
  if (Buffer.isBuffer(data)) {
    return data;
  }

  if (typeof data === 'string') {
    return Buffer.from(data, 'utf8');
  }

  return Buffer.from(data);
}
