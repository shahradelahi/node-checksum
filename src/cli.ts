#!/usr/bin/env node

import { hashCmd, verifyCmd } from '@/commands';
import { Command } from 'commander';

const program = new Command();
program
  .name('checksum')
  .description(
    `\
Checksum utility CLI
Author: @shahradelahi, https://github.com/shahradelahi
`
  )
  .version('0.2.0')
  .addCommand(verifyCmd)
  .addCommand(hashCmd)
  .parse(process.argv)
  .showSuggestionAfterError()
  .showHelpAfterError();
