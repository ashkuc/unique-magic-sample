<script setup lang="ts">
import {useMagicAuth} from './composables/useMagicAuth.ts'
import {useBalance} from './composables/useBalance.ts'
import {computed, ref, watch} from 'vue'
import {useCollections} from './composables/useCollections.ts'

const { email, isLoggedIn, logIn, logOut, userMetadata, isMounted, magic } = useMagicAuth();
const { getBalance, transfer } = useBalance(magic);
const { mintCollection, mintToken } = useCollections(magic)

const balance = ref<string | null>(null);
const isBalanceLoading = ref(false);
const refreshBalance = async () => {
  const address = userMetadata.value?.publicAddress;
  if (!address) return;

  isBalanceLoading.value = true;
  try {
    const balanceBigInt = await getBalance(address);
    balance.value = balanceBigInt.toString();
  } finally {
    isBalanceLoading.value = false;
  }
};

watch(userMetadata, async (next, prev) => {
  if (!prev && next) await refreshBalance();
});

const to = ref('')
const amount = ref('')

const isSending = ref(false);
const onSend = async () => {
  const address = userMetadata.value?.publicAddress;
  if (!address) return;

  isSending.value = true;
  await transfer(address, to.value, amount.value).finally(() => {
    isSending.value = false;
  });
}

const isCopied = ref(false);
const copyAddress = async () => {
  const address = userMetadata.value?.publicAddress;
  if (!address) return;

  await navigator.clipboard.writeText(address)
  isCopied.value = true;

  setTimeout(() => {
    isCopied.value = false;
  }, 1000)
}

const collectionName = ref<string>('')
const collectionDescription = ref<string>('')
const collectionSymbol = ref<string>('')
const collectionAddress = ref<string>('')
const collectionId = ref<string>('')
const isCreatingCollection = ref(false)
const isCollectionCreated = computed(() => !!collectionAddress.value && !!collectionId.value)

const createCollection = async () => {
  const address = userMetadata.value?.publicAddress;
  if (!address) return;

  isCreatingCollection.value = true
  try {
    const collection = await mintCollection(collectionName.value, collectionDescription.value, collectionSymbol.value)

    collectionAddress.value = collection.collectionAddress
    collectionId.value = collection.collectionId.toString()
  } finally {
    isCreatingCollection.value = false
  }
}

const tokenId = ref<string>('')
const isCreatingToken = ref(false)

const createToken = async () => {
  const address = userMetadata.value?.publicAddress;
  if (!address) return;

  try {
    isCreatingToken.value = true
    const token = await mintToken(collectionAddress.value)

    tokenId.value = token.tokenId.toString()
  } finally {
    isCreatingToken.value = false
  }
}

</script>

<template>
  <template v-if="!isMounted">
    <h1>Loading...</h1>
  </template>

  <template v-else-if="isLoggedIn && userMetadata">
    <h2>Hello, {{ userMetadata.email}} !</h2>
    <div class="block">
      <p style="display: inline-block">Address: {{ userMetadata.publicAddress }}</p>
      <button style="display: inline-block" @click="copyAddress">{{ isCopied ? 'Copied!' : 'Copy' }}</button>
    </div>

    <div class="block">
      <p style="display: inline-block">Balance: {{ balance || '?' }}</p>
      <button @click="refreshBalance" :disabled="isBalanceLoading">{{ isBalanceLoading ? 'Loading...' : 'Refresh' }}</button>

      <div>
        <a href="https://t.me/unique2faucet_opal_bot" target="_blank">Get free tokens from faucet</a>
      </div>
    </div>

    <div class="block">
      <div class="block-item">
        <label for="to">To</label>
        <input id="to" style="min-width: 350px" type="text" v-model="to" placeholder="send to" />
      </div>
      <div class="block-item">
        <label for="amount">Amount</label>
        <input id="amount" type="text" v-model="amount" placeholder="amount" />
      </div>
      <button :disabled="isSending" @click="onSend">Send balance</button>
    </div>

    <div class="block">
      <div class="block-item">
        <label for="name">name</label>
        <input id="name" :disabled="isCollectionCreated" type="text" v-model="collectionName" placeholder="collection name" />
      </div>
      <div class="block-item">
        <label for="description">description</label>
        <input id="description" :disabled="isCollectionCreated" type="text" v-model="collectionDescription" placeholder="collection description" />
      </div>
      <div class="block-item">
        <label for="symbol">symbol</label>
        <input id="symbol" :disabled="isCollectionCreated" type="text" v-model="collectionSymbol" placeholder="collection symbol" />
      </div>

      <div v-if="isCollectionCreated">
        <p>Collection address: {{ collectionAddress }}</p>
        <p>Collection id: {{ collectionId }}</p>
        <a :href="`https://uniquescan.io/opal/collections/${collectionId}`" target="_blank">Link to scan</a>
      </div>

      <button
          v-else
          :disabled="isCreatingCollection"
          @click="createCollection"
      >
        {{ isCreatingCollection ? 'Minting...' : 'Mint collection' }}
      </button>

    </div>

    <div class="block">
      <button
        @click="createToken"
        :disabled="isCreatingToken || !collectionAddress"
      >
        {{ isCreatingToken ? 'Minting...' : 'Mint token' }}
      </button>
      <div v-if="tokenId">
        <p>Token id: {{ tokenId }}</p>
        <a :href="`https://uniquescan.io/opal/tokens/${collectionId}/${tokenId}`" target="_blank">Link to scan</a>
      </div>
    </div>

    <div class="block">
      <button @click="logOut" >LogOut</button>
    </div>
  </template>

  <template v-else>
    <label for="email">Email</label>
    <input id="email" type="text" v-model="email" placeholder="email" />
    <button @click="logIn">Connect (with Magic)</button>
  </template>
</template>

<style scoped>
.block {
  display: block;
  margin: 20px;
  padding: 10px;

  border: 1px solid #ccc;
}

.block button {
  margin-left: 20px;
  margin-top: 10px;
}

.block .block-item {
  margin-bottom: 10px;
}

.block .block-item label {
  margin-right: 20px;
}

</style>
