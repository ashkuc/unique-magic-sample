import {ethers} from 'ethers'
import type {Magic} from 'magic-sdk'

export function useBalance(magic: Magic) {
  const provider = new ethers.providers.Web3Provider(magic.rpcProvider as any)

  const getBalance = async (address: string) => {
    return provider.getBalance(address)
  }

  const transfer = async (from: string, to: string, amount: string) => {
    try {
      if (!ethers.utils.isAddress(from)) throw new Error(`Invalid address ${from}`)
      if (!ethers.utils.isAddress(to)) throw new Error(`Invalid address ${to}`)
      const amountBigInt = BigInt(amount)

      const balance = await getBalance(from)
      if (amountBigInt <= 0 || amountBigInt > balance.toBigInt()) throw new Error(`Invalid amount ${amount}`)

      const signer = await provider.getSigner(from)

      const gasPrice = await provider.getGasPrice()

      const sentTx = await signer.sendTransaction({
        to,
        value: amountBigInt,
        gasPrice,
      })

      const receipt = await sentTx.wait()
      alert(`Tx sent: ${receipt.transactionHash}`)
    } catch (e: any) {
      console.error(e)
      alert(`Error transferring: ${e.message}`)
    }
  }

  return {getBalance, transfer}
}
