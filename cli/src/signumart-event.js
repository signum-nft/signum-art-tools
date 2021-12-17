#!/usr/bin/env node

const { program, Option } = require('commander')
const { event, ContractMethods } = require('./commands/event')

program
  .requiredOption('-n, --node <node>', 'The Node Host Url to be used', "http://localhost:6876")
  .requiredOption('-c, --contract <contract>', 'The id or address of the contract')
  .addOption(new Option('-m, --method <method>', 'One of the methods to be called')
    .choices(Object.keys(ContractMethods))
    .makeOptionMandatory()
  )
  .option('-a1, --arg1 <arg1>', 'For "PutForSale" or "PutForAuction" it is the price in Signa')
  .option('-a2, --arg2 <arg2>', 'For "PutForAuction" the timeout in minutes from now')
  .option('-p, --phrase <phrase>', 'The passphrase to execute the call')
  .option('-d, --dry', 'Run a dry run, without sending', false)
  .action(event);

  //
  // .argument('[node]', 'The Node Host Url to be used', "http://localhost:6876")
  // .argument('<contract>', 'The id or address of the contract')
  // .addArgument(new Argument('<method>', 'One of the methods to be called')
  //   .choices(Object.keys(ContractMethods))
  // )
  // .argument('[arg1]', 'For "PutForSale" or "PutForAuction" it is the price in Signa')
  // .argument('[arg2]', 'For "PutForAuction" the timeout in minutes from now')
  // .argument('[phrase]', 'The passphrase to execute the call')
  // .option('-d, --dry', 'Run a dry run, without sending', false)

program.parseAsync(process.argv)
