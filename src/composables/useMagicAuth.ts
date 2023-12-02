import {Magic, MagicUserMetadata} from 'magic-sdk'
import {ref, onMounted} from 'vue';

export function useMagicAuth() {
  const magic = new Magic(import.meta.env.VITE_MAGIC_PUBLIC_KEY, {
    deferPreload: true,
    network: {
      rpcUrl: 'https://rpc-opal.unique.network',
      chainId: 8882,
    },
  });

  const isMounted = ref(false);
  const isLoggedIn = ref(false);
  const email = ref('');
  const userMetadata = ref<MagicUserMetadata | null>(null);

  const loadUserData = async () => {
    userMetadata.value = await magic.user.getMetadata();
  };

  const logIn = async () => {
    try {
      await magic.auth.loginWithMagicLink({ email: email.value });
      isLoggedIn.value = true;
      await loadUserData();
    } catch (e: any) {
      alert(`Error logging in: ${e.message}`);
      console.error(e);
    }
  };

  const logOut = async () => {
    await magic.user.logout();
    isLoggedIn.value = false;
    userMetadata.value = null;
  };

  onMounted(async () => {
    isLoggedIn.value = await magic.user.isLoggedIn();

    if (isLoggedIn.value) {
      await loadUserData();
    }

    isMounted.value = true;
  });

  return { email, isLoggedIn, logIn, logOut, userMetadata, isMounted, magic };
}
