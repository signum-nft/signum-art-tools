const inquirer = require("inquirer");
const {Address} = require("@signumjs/core");
const {Amount, FeeQuantPlanck} = require("@signumjs/util");
const {provideLedger, handleError} = require('../helpers');
const {generateMasterKeys} = require("@signumjs/crypto");

const ContractMethods = {
  TransferRoyalties: '7174296962751784077',
  Transfer: '-8011735560658290665',
  PutForAuction: '4465321042251021641',
  SetNotForSale: '-1462395320800038545',
  PutForSale: '483064598096680683',
}

async function confirm(params) {

  console.info("These are your parameters\n", JSON.stringify(params, null, '\t'))

  const {arg1, arg2, method, passphrase} = params

  const needPrice = !arg1 && (method === "PutForSale" || method === "PutForAuction")
  const needAddress = !arg1 && (method === "Transfer" || method === "TransferRoyalties")
  const needTimeout = !arg2 && method === "PutForAuction"

  return inquirer.prompt([
    {
      type: 'input',
      name: 'price',
      message: 'Please the enter the price in Signa',
      when: () => needPrice
    },
    {
      type: 'input',
      name: 'address',
      message: 'Please enter the address of the beneficiary',
      when: () => needAddress
    },
    {
      type: 'input',
      name: 'timeout',
      message: 'Please enter the minutes from now when auction should end',
      when: () => needTimeout
    },
    {
      type: 'input',
      name: 'passphrase',
      message: 'Please enter your passphrase',
      default: null,
      when: () => !passphrase
    },
    {
      type: 'confirm',
      name: 'confirmed',
      message: 'Ready to send?',
    },
  ])
}


async function callMethodOfContract(params) {
  try {

    const {node, contract, method, arg1, arg2, phrase, dry} = params;

    const contractId = Address.create(contract).getNumericId()

    const {passphrase = phrase, price, timeout, address, confirmed} = await confirm(params);
    if (!confirmed) {
      console.info('Aborted');
      process.exit(-1);
      return
    }

    const methodArgs = []
    if (method === "PutForSale") {
      methodArgs.push(Amount.fromSigna(arg1 || price).getPlanck())
    } else if (method === "PutForAuction") {
      methodArgs.push(Amount.fromSigna(arg1 || price).getPlanck())
      methodArgs.push(arg2 || timeout)
    } else if (method === "Transfer" || method === "TransferRoyalties") {
      methodArgs.push(arg1 || address)
    }

    const ledger = provideLedger(node)
    const senderKeys = generateMasterKeys(passphrase);
    const args = {
      contractId,
      amountPlanck: Amount.fromSigna(0.5).getPlanck(),
      senderPublicKey: senderKeys.publicKey,
      senderPrivateKey: senderKeys.signPrivateKey,
      feePlanck: "" + FeeQuantPlanck,
      methodHash: ContractMethods[method],
      methodArgs,
    }

    const contractAddress = Address.create(contractId)
    const senderAddress = Address.create(senderKeys.publicKey)
    console.info('You are sending from', senderAddress.getReedSolomonAddress())
    console.info('You are sending to contract', contractAddress.getReedSolomonAddress())
    console.info('Calling method', method)
    console.info('with arguments', JSON.stringify(methodArgs), '\n\n')

    if (dry) {
      console.info('----- DRY RUN  -----')
      console.info('Your call would have the following parameters')
      console.info(JSON.stringify(args, null, '\t'))
      console.info('----- NOT EXECUTED -----')
    } else {
      console.info('----- EXECUTING  -----')
      const {transaction} = await ledger.contract.callContractMethod(args)
      console.info('Call successful - tx id:', transaction)
    }

    return Promise.resolve()
  } catch (e) {
    // If the API returns an exception,
    // the return error object is of type HttpError
    handleError(e);
  }
}


async function event(params) {
  return callMethodOfContract(params);
}

module.exports = {
  event: event,
  ContractMethods
}
