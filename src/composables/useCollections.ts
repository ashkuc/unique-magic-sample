import {CollectionHelpersFactory, UniqueNFTFactory, parseEthersV5TxReceipt} from '@unique-nft/solidity-interfaces'
import {Address} from '@unique-nft/utils/address'
import type {Magic} from 'magic-sdk'
import {ethers} from 'ethers'

export const useCollections = (magic: Magic) => {
  const provider = new ethers.providers.Web3Provider(magic.rpcProvider as any)

  const mintCollection = async (
    name = 'Test',
    description = `Test collection, created at ${new Date().toISOString()}}`,
    symbol = 'TST',
  ) => {
    const signer = provider.getSigner()
    const collectionHelpers = await CollectionHelpersFactory(signer, ethers)

    const creationFee = await collectionHelpers.collectionCreationFee()
    const gasPrice = await provider.getGasPrice()

    const createCollectionTx = await collectionHelpers.createNFTCollection(
      name,
      description,
      symbol,
      {
        value: creationFee,
        gasLimit: 1000000,
        gasPrice,
      }
    )

    const createCollectionReceipt = await createCollectionTx.wait()

    const collectionAddress = parseEthersV5TxReceipt<{
      CollectionCreated: { collectionId: string }
    }
    >(createCollectionReceipt).events.CollectionCreated.collectionId

    const collectionId = Address.collection.addressToId(collectionAddress)
    alert(`Collection created at ${collectionAddress} (${collectionId})`)

    return {collectionAddress, collectionId}
  }

  const mintToken = async (collectionIdOrAddress: string) => {
    const signer = provider.getSigner()
    const uniqueNFT = await UniqueNFTFactory(collectionIdOrAddress, signer, ethers)

    const to = await provider.getSigner().getAddress()
    const gasPrice = await provider.getGasPrice()

    const mintTx = await uniqueNFT.mint(to, {
      gasLimit: 1000000,
      gasPrice,
    })

    const mintReceipt = await mintTx.wait()

    const tokenId = Number(parseEthersV5TxReceipt(mintReceipt).events.Transfer.tokenId)

    alert(`Minted token ${tokenId} in collection ${collectionIdOrAddress}`)

    return {tokenId}
  }

  return {mintCollection, mintToken}
}