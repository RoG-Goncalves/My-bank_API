import express from 'express';
import { accountModel } from '../models/accountModel.js'
import { formatAmount } from '../helpers/formatters.js'
const app = express();

//RETRIEVE ALL ACCOUNTS----------------------------------------
app.get('/account', async (_req, res) => {
  try {
    const allAccounts = await accountModel.find({});
    res.send(allAccounts)
  } catch (error) {
    res.status(500).send(error);
  }
});
// //RETRIEVE ALL ACCOUNTS----------------------------------------
app.get('/account/teste', async (req, res) => {
  try {
    // const agency = 10;
    // const allAccounts = await accountModel.find({});
    // allAccounts.map(async account => {
    //   if (agency == account.agencia) {
    //     const selectedAgency = [];
    //     selectedAgency.push(account);
    //     selectedAgency.sort((a, b) => { a.balance - b.balance });
    //     const userToUpdate = await accountModel.findOneAndUpdate({ name: selectedAgency[-1].name }, { agencia: 99 });
    //     console.log(userToUpdate);
    //   } agency = account.agencia
    // })
    // const primeAgency = await accountModel.find({ agencia: 99 }, { _id: 0 })

    // res.send(primeAgency);


    // const
  } catch (error) {
    res.status(500).send(error);
  }
});
//RETRIEVE BALANCE----------------------------------------
app.get('/account/saldo/:agencia/:conta', async (req, res) => {
  try {
    const { agencia, conta } = req.params
    const accountToCheckBalance = await accountModel.findOne({ agencia: agencia, conta: conta });
    res.send(`Saldo Atual: ${formatAmount(accountToCheckBalance.balance)}`)
  } catch (error) {
    res.status(500).send(error);
  }
});
//RETRIEVE BALANCE----------------------------------------
app.get('/account/media/:agencia/', async (req, res) => {
  try {
    const { agencia } = req.params
    const agencyToCheckAvarageBalance = await accountModel.find({ agencia: agencia });
    console.log(agencyToCheckAvarageBalance)
    const totalMoney = agencyToCheckAvarageBalance.reduce((acc, curr) => {
      return acc + curr.balance
    }, 0)
    console.log(totalMoney)
    console.log(agencyToCheckAvarageBalance.length)
    const avarageDepositedMoney = parseFloat(totalMoney) / agencyToCheckAvarageBalance.length;
    console.log(avarageDepositedMoney)
    res.send(`Média dos valores depositados: ${formatAmount(avarageDepositedMoney)}`)
  } catch (error) {
    res.status(500).send(error);
  }
});
//RETRIEVE POOREST----------------------------------------
app.get('/account/poorest/:agencia/:quantidade', async (req, res) => {
  try {
    const { agencia, quantidade } = req.params
    const agencyToCheckAvarageBalance = await accountModel.find(
      { agencia: agencia },
      { _id: 0, name: 1, conta: 1, balance: 1 })
      .sort({ balance: 1 })
      .limit(parseInt(quantidade));
    res.send(agencyToCheckAvarageBalance);
  } catch (error) {
    res.status(500).send(error);
  }
});
//RETRIEVE RICHEST----------------------------------------
app.get('/account/richest/:agencia/:quantidade', async (req, res) => {
  try {
    const { agencia, quantidade } = req.params
    const agencyToCheckAvarageBalance = await accountModel.find({ agencia: agencia }, { _id: 0, name: 1, conta: 1, balance: 1 }).sort({ balance: -1, name: 1 }).limit(parseInt(quantidade));
    res.send(agencyToCheckAvarageBalance);
  } catch (error) {
    res.status(500).send(error);
  }
});
//UPDATE ACCOUNT WITH NEW BALANCE (DEPOSIT)-------------------------------------
app.patch('/account/deposito/:agencia/:conta/:balance', async (req, res) => {
  try {
    const { agencia, conta, balance } = req.params
    const accountUpdated = await accountModel.findOneAndUpdate(
      { agencia: agencia, conta: conta },
      { $inc: { balance: balance } },
      { new: true });
    res.send(`Saldo atual R$ ${accountUpdated.balance}`)
    if (!accountToUpdate) {
      res.status(404).send('Conta não válida')
    }
  } catch (error) {
    res.status(500).send(error);
  }
});
//UPDATE ACCOUNT WITH NEW BALANCE (WITHDRAW)------------------------------------
app.patch('/account/retirada/:agencia/:conta/:balance', async (req, res, next) => {
  try {
    const { agencia, conta, balance } = req.params
    const accountToUpdate = await accountModel.findOne({ agencia: agencia, conta: conta });
    if (!accountToUpdate) {
      res.status(404).send('Conta não válida')
    }
    const balanceToWithdraw = parseFloat(balance).toFixed(2)
    const newBalance = accountToUpdate.balance - balanceToWithdraw - 1;
    if (newBalance < 0) {
      res.status(500).send(`SALDO NÃO PODE FICAR NEGATIVO. SAQUE NÃO AUTORIZADO | \n
      Saldo atual: ${formatAmount(accountToUpdate.balance.toFixed(2))}`).next()
    }
    const accountUpdated = await accountModel.findOneAndUpdate(
      { agencia: agencia, conta: conta },
      { $set: { balance: newBalance.toFixed(2) } },
      { new: true });
    res.send(`
    Saldo anterior: ${formatAmount(accountToUpdate.balance)} | \n
    Valor Retirado: ${formatAmount(balanceToWithdraw)} | \n
    Tarifa de Retirada : R$ 1 | \n
    Saldo atual: ${formatAmount(accountUpdated.balance.toFixed(2))}
    `)
  } catch (error) {
    res.status(500).send(error);
  }
});
//UPDATE ACCOUNT WITH TRANSFERING MONEY BETWEEN ACCOUNTS------------------------
app.patch('/account/transferencia/:contaOrigem/:contaDestino/:balance', async (req, res, next) => {
  try {
    const { contaOrigem, contaDestino, balance } = req.params
    const balanceToTransfer = parseFloat(balance)
    const accountToDebit = await accountModel.findOne({ conta: contaOrigem });
    const accountToCredit = await accountModel.findOne({ conta: contaDestino });

    const accountDebiting = await accountModel.findOneAndUpdate(
      { conta: contaOrigem },
      { $inc: accountToDebit.agencia == accountToCredit.agencia ? { balance: - balanceToTransfer } : { balance: - balanceToTransfer - 8 } },
      { new: true });

    const accountCrediting = await accountModel.findOneAndUpdate(
      { conta: contaDestino },
      { $inc: { balance: (balanceToTransfer).toFixed(2) } },
      { new: true });

    res.send(`Saldo na conta de Origem: ${formatAmount(accountDebiting.balance)}`)
  } catch (error) {
    res.status(500).send(error);
  }
});
//DELETE ONE ACCOUNT------------------------------------------------------------
app.delete('/account/fechar/:agencia/:conta', async (req, res, next) => {
  try {
    const { agencia, conta } = req.params;
    const accountToDelete = await accountModel.findOneAndRemove({ agencia: agencia, conta: conta })
    if (!accountToDelete) {
      res.status(404).send('Documento não encontrado na coleção').next();
    }
    const allAccounts = await accountModel.find({});
    res.send(`Contas Ativas nesta Agência: ${allAccounts.length}`);
  } catch (error) {
    res.status(500).send(error);
  }
})
export { app as accountRouter }