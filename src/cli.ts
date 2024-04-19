#!/usr/bin/env node

import { hashCmd, verifyCmd } from '@/commands';
import { Command } from 'commander';

const program = new Command();
program
  .addCommand(verifyCmd)
  .addCommand(hashCmd)
  .parse(process.argv)
  .showSuggestionAfterError()
  .showHelpAfterError();
