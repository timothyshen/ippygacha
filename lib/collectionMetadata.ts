export interface CollectionMetadata {
  name: string
  description: string
  image: string
  bannerColor: string
}

export const IPPY_COLLECTION: CollectionMetadata = {
  name: "IPPY Collection",
  description: "A unique collection of on-chain NFTs featuring 7 distinct character types. Each IPPY represents a different personality and rarity tier, bringing charm and collectibility to the blockchain.",
  image: "https://ipfs.io/ipfs/bafybeiad5nptvwmhcgiw5j3fbolenjq2rku4ngpfjmrqf4qbky2keffima",
  bannerColor: "from-slate-900 to-white",
}

// Future collections can be added here
export const COLLECTION_METADATA: Record<string, CollectionMetadata> = {
  ippy: IPPY_COLLECTION,
}
