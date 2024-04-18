# node-checksum

Checksum utility for Node.js

### Install

```sh
npm i -g @litehex/node-checksum
```

### Usage

```text
Usage: checksum [options] [command] [file...]

Arguments:
  file                                file to hash (default: [])

Options:
  -a, --algorithm <algorithm>         hash algorithm (default: "sha256")
  -C, --context <context>             context to hash
  --cwd <cwd>                         current working directory (default: ".")
  -h, --help                          display help for command

Commands:
  verify [options] <file> [checksum]  verify checksum
```

### Examples

#### Generate checksum

```sh
$ checksum package.json --algorithm sha256
> b6f69eb6fcf34f5f3e9b34724562b7c6b681f6b2aeefc7909363930febd5da83

$ checksum package.json README.md --algorithm md5
> 85f96e23f8adb7e1b1faf6f6341fe768  package.json
> ddc66b29b08d70b9accaa797d98ccdcc  README.md

$ checksum -C "Hello World" --algorithm md5
> b10a8db164e0754105b7a99be72e3fe5

$ echo -n "Hello World" | checksum --algorithm sha1
> 0a4d55a8d778e5022fab701977c5d840bbc486d0
```

#### Verify checksum

```sh
$ checksum verify package.json b6f69eb6fcf34f5f3e9b34724562b7c6b681f6b2aeefc7909363930febd5da83
> match

$ echo -n "56bfa638dc6449196cf8110d693b6dab" | checksum verify package.json -a md5
> match

$ echo -n "WRONG" | checksum verify package.json -a md5
> mismatch: expected 56bfa638dc6449196cf8110d693b6dab but got 0a4d55a8d778e5022fab701977c5d840bbc486d0

$ echo -n "WRONG" | checksum verify package.json -a md5 --quiet # exit code 1
```

### License

[GPL-3.0](LICENSE) © [Shahrad Elahi](https://github.com/shahradelahi)
