const { version } = require('../package.json')
const { program, Option } = require('commander')
const { event, ContractMethods } = require('./commands/event')

const app = program
  .version(version)
  .description(`
            @@@@@@@@  @@@@@@@           
         @@@@@    @@@@@    @@@@@        
           @@@  @@@  @@@ @@@@@          
    @@@      @@@@@     @@@@       @@@   
  @@@@@@@@ &@@@  @@@@@@@@ @@@@  @@@@@@@ 
 @@@    @@@@       @@@      @@@@@    @@@
 @@@  @@@ *@@@@           @@@  @@@  @@@@
   @@@@@     @@@         @@@     @@@@@  
 @@@@  @@@  @@@           @@@@  @@@  @@@
 @@@    @@@@@      @@@       @@@@    @@@
  @@@@@@@  @@@  @@@@@@@@  @@@  @@@@@@@@ 
    @@@       @@@@     @@@@@      @@@   
           @@@@  @@@  @@@  @@@          
         @@@@@    @@@@@    @@@@@        
            @@@@@@@  @@@@@@@@    
 
           Signum Art Toolbox          
      
  Author: ohager
  Version: ${version}
  `)

program
  .command('event', 'Sends an event to Nfts (costs 0.5 SIGNA)')
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

// add more commands here

(async () => {
  try {
    await app.parseAsync(process.argv)
  } catch (e) {
    console.error('❌ Damn, something Failed:', e)
  }
})()
