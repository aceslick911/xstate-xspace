export const CONFIG = {
  logging: {
    enabled: true as boolean,
    logToXState: true as boolean,
    logFacets: false as boolean,
  },
  integration: {
    overrideAtoms: false as boolean,
    timers: {
      ActionDebounce: 1000,
      useEffectDebounce: 900,
    },
  },

  api_management: {
    InterceptFetches: false as boolean,
    print_boot_seq_fetches_seconds: false as false | number,
    print_as_objects: true as boolean,
    InjectCollisions: false as boolean,
    filterBlacklist: true as boolean,
    asObjectOnly: true as boolean,
    apiFilter: [
      {
        sender: {
          file: 'App/Services/Endpoints/Wallet.tsx',
          method: 'fetchWallet',
        },
      },
    ],
  },
};

if (CONFIG.api_management.InterceptFetches === false) {
  if (
    (CONFIG.api_management.print_boot_seq_fetches_seconds ||
      CONFIG.api_management.InjectCollisions) !== false
  ) {
    throw new Error(
      'DEV: You must enable InterceptFetches to use api_management features',
    );
  }
}
