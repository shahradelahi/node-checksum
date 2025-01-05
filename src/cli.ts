#!/usr/bin/env node
import { Command } from 'commander';

import { hashCmd, verifyCmd } from '@/commands';

const program = new Command();
program
  .name('checksum')
  .description(
    `\
Checksum utility CLI
Author: @shahradelahi, https://github.com/shahradelahi
`
  )
  .version('0.2.1')
  .addCommand(verifyCmd)
  .addCommand(hashCmd)
  .parse(process.argv)
  .showSuggestionAfterError()
  .showHelpAfterError();
