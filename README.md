# @litehex/node-checksum

[![CI](https://github.com/shahradelahi/node-checksum/actions/workflows/ci.yml/badge.svg?branch=main&event=push)](https://github.com/shahradelahi/node-checksum/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@litehex%2Fnode-checksum)](https://www.npmjs.com/package/@litehex/node-checksum)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@litehex/node-checksum)
[![install size](https://packagephobia.com/badge?p=@litehex%2Fnode-checksum)](https://packagephobia.com/result?p=@litehex%2Fnode-checksum)
[![MIT Licensed](https://img.shields.io/badge/License-MIT-blue.svg?style=flat)](https://opensource.org/licenses/MIT)

Checksum utility Library written for Node.js + CLI

---

- [Installation](#-installation)
- [Usage](#-usage)
- [CLI Usage](#-usage)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#license)

### 📦 Installation

```sh
npm i -g @litehex/node-checksum # or npx @litehex/node-checksum help
```

## 📖 Usage

Here are some examples of how to use this library:

**Hashing a string**

```typescript
import { hash, md5, sha256 } from '@litehex/node-checksum';

const hashed = hash('sha256', 'hello world');
// 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9'

const hashedShort = sha256('hello world');
// 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9'

const hashedMd5 = md5('hello world');
// '5f4dcc3b5aa765d61d8327deb882cf99'
```

**Hashing a file**

```typescript
import { hashFile, md5File, sha256File } from '@litehex/node-checksum';

const fileHash = await hashFile('sha256', 'package.json');

const fileHashShort = await sha256File('package.json');

const fileHashMd5 = await md5File('package.json');
```

**Hashing a stream**

```typescript
import { createReadStream } from 'node:fs';
import { hashStream } from '@litehex/node-checksum';

const stream = createReadStream('package.json');
const streamHash = await hashStream('sha256', stream);
```

**Hashing a directory**

```typescript
import { hashDirectory } from '@litehex/node-checksum';

// Hashes all files in 'src' directory recursively
const hashedFiles = await hashDirectory('sha256', 'src', { recursive: true });
```

**Hashing files using glob patterns**

```typescript
import { hashGlob } from '@litehex/node-checksum';

const hashedFiles = await hashGlob('sha256', 'src/**/*.ts');
```

**Verifying a file**

```typescript
import { verifyFile } from '@litehex/node-checksum';

const checksum =
  'd033084eeb1b83e54db79013c9676ff2c51b3ee24c5542787daaa8b526ff2004';
const isValid = await verifyFile('sha256', 'package.json', checksum);
// isValid will be true if the checksum matches
```

**Verifying a batch of files**

`checksums.txt`:

```
d033084eeb1b83e54db79013c9676ff2c51b3ee24c5542787daaa8b526ff2004  package.json
...
```

```typescript
import { verifyBatch } from '@litehex/node-checksum';

const result = await verifyBatch('sha256', ['package.json'], 'checksums.txt');
/*
{
  files: [ { filename: '/path/to/package.json', result: true } ],
  success: true
}
*/
```

### 📖 CLI Usage

```text
Usage: checksum [options] [command]

Options:
  -h, --help                            display help for command

Commands:
  verify|v [options] <file> [checksum]  verify checksum
  hash|h [options] [file...]            hash a file or directory
  help [command]                        display help for command
```

##### Examples

###### Hashing

<!-- prettier-ignore -->
```shell
$ checksum hash package.json --algorithm sha256
>d033084eeb1b83e54db79013c9676ff2c51b3ee24c5542787daaa8b526ff2004

$ checksum h package.json README.md -a md5
>85f96e23f8adb7e1b1faf6f6341fe768 package.json
>ddc66b29b08d70b9accaa797d98ccdcc README.md

$ checksum hash --exclude "**/{.git,node_modules}/**" .
>62bbd7fec4e27c35cbf9a5058913c1e76ebe5d9dcb7ae6644f79c4cec1c6821b .gitignore
>88f36901e0a2735c58156120e9887ed0456918c8ffbf3a60eca0a9f221faa6ab .mocharc.json
>5f0fd6fa76c54ca557bdecdb6de94cec59745b4cd90469d79210c1554b679a18 .prettierignore
>...

$ checksum h --recursive src >checksum.txt

$ checksum h -C "Hello World" --algorithm md5
>b10a8db164e0754105b7a99be72e3fe5

$ echo -n "Hello World" | checksum h -a sha1
>0a4d55a8d778e5022fab701977c5d840bbc486d0
```

###### Verify

<!-- prettier-ignore -->
```shell
$ checksum verify package.json d033084eeb1b83e54db79013c9676ff2c51b3ee24c5542787daaa8b526ff2004 # exit code 0
>package.json: OK

$ echo -n "56bfa638dc6449196cf8110d693b6dab" | checksum v package.json -a md5 # exit code 0
>package.json: OK

$ checksum v -c checksum.txt # exit code 1
>tsup.config.ts: OK
>test/index.test.ts: FAILED
>...
>WARNING: 2 computed checksums did NOT match

$ echo -n "WRONG" | checksum v package.json -a md5 # exit code 1
>package.json: FAILED

$ echo -n "WRONG" | checksum v package.json -a md5 --quiet # exit code 1
```

### 📚 Documentation

For all configuration options, please see [the API docs](https://www.jsdocs.io/package/@litehex%2Fnode-checksum).

## 🤝 Contributing

Want to contribute? Awesome! To show your support is to star the project, or to raise issues on [GitHub](https://github.com/shahradelahi/node-checksum)

Thanks again for your support, it is much appreciated! 🙏

## License

[MIT](/LICENSE) © [Shahrad Elahi](https://github.com/shahradelahi) and [contributors](https://github.com/shahradelahi/node-checksum/graphs/contributors).
