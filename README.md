# node-checksum

[![npm](https://img.shields.io/npm/v/@litehex%2Fnode-checksum)](https://www.npmjs.com/package/@litehex/node-checksum)
[![install size](https://packagephobia.com/badge?p=@litehex%2Fnode-checksum)](https://packagephobia.com/result?p=@litehex%2Fnode-checksum)
[![GPL-3.0 Licensed](https://img.shields.io/badge/License-GPL3.0-blue.svg?style=flat)](https://opensource.org/licenses/GPL-3.0)

> Checksum utility Library written for Node.js + CLI

### 📦 Installation

```sh
npm i -g @litehex/node-checksum # or npx @litehex/node-checksum help
```

### 📚 Documentation

For all configuration options, please see [the API docs](https://paka.dev/npm/@litehex%2Fnode-checksum/api)

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

### 🤝 Contributing

You can contribute to this project by opening an issue or a pull request
on [GitHub](https://github.com/shahradelahi/node-checksum). Feel free to contribute, we care about your
ideas and suggestions.

### License

[GPL-3.0](LICENSE) © [Shahrad Elahi](https://github.com/shahradelahi)
