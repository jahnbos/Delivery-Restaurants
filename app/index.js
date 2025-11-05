import { Redirect } from "expo-router";

export default function Index() {
  const DEFAULT_STORE_ID = ""; // e.g. "store-001" to deep link directly into a store

  if (DEFAULT_STORE_ID) {
    return (
      <Redirect
        href={{
          pathname: "/features/store/(tabs)/storeScreen",
          params: { shopId: DEFAULT_STORE_ID },
        }}
      />
    );
  }

  return <Redirect href="/features/store" />;
}
