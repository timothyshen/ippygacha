"use client";

import { PrivyProvider, usePrivy, useWallets } from "@privy-io/react-auth";
import { SmartWalletsProvider } from "@privy-io/react-auth/smart-wallets";
import { storyAeneid } from "viem/chains";
import { useEffect, useRef, useCallback } from "react";
import { ensureUserExists } from "@/lib/auth";

const STORY_AENEID_CHAIN_ID = `eip155:${storyAeneid.id}`;

// Auto-create user profile and ensure correct chain on login/wallet switch
function WalletManager() {
    const { authenticated, user } = usePrivy();
    const { wallets } = useWallets();
    const processedWalletsRef = useRef<Set<string>>(new Set());

    // Switch a wallet to Story Aeneid if not already on it
    const ensureCorrectChain = useCallback(async (wallet: typeof wallets[number]) => {
        try {
            if (wallet.chainId !== STORY_AENEID_CHAIN_ID) {
                await wallet.switchChain(storyAeneid.id);
            }
        } catch (error) {
            console.warn(`Failed to switch chain for wallet ${wallet.address}:`, error);
        }
    }, []);

    // Handle user profile creation on authentication
    useEffect(() => {
        if (authenticated && user?.wallet?.address) {
            ensureUserExists(user.wallet.address);
        }
    }, [authenticated, user?.wallet?.address]);

    // Handle wallet changes - detect new wallets or account switches
    useEffect(() => {
        if (!authenticated || wallets.length === 0) {
            return;
        }

        const handleWalletChanges = async () => {
            for (const wallet of wallets) {
                // Create a unique key for this wallet instance (address + connector type)
                const walletKey = `${wallet.address}-${wallet.walletClientType}`;

                // Check if this is a new wallet we haven't processed
                if (!processedWalletsRef.current.has(walletKey)) {
                    processedWalletsRef.current.add(walletKey);
                    await ensureCorrectChain(wallet);
                }
                // Also check if wallet switched to wrong chain externally
                else if (wallet.chainId !== STORY_AENEID_CHAIN_ID) {
                    await ensureCorrectChain(wallet);
                }
            }

            // Clean up processed wallets that are no longer connected
            const currentWalletKeys = new Set(
                wallets.map(w => `${w.address}-${w.walletClientType}`)
            );
            for (const key of processedWalletsRef.current) {
                if (!currentWalletKeys.has(key)) {
                    processedWalletsRef.current.delete(key);
                }
            }
        };

        handleWalletChanges();
    }, [authenticated, wallets, ensureCorrectChain]);

    return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
            config={{
                // Customize Privy's appearance in your app
                appearance: {
                    theme: "light",
                    accentColor: "#676FFF",
                    logo: "/story-logo.jpg",
                    walletList: ['rabby_wallet', 'metamask', 'rainbow', 'zerion', 'okx_wallet', 'wallet_connect']
                },
                // Create embedded wallets for users who don't have a wallet
                // when they sign in with email
                embeddedWallets: {
                    createOnLogin: "all-users",
                },
                defaultChain: storyAeneid,
                supportedChains: [storyAeneid],
            }}
        >
            <SmartWalletsProvider>
                <WalletManager />
                {children}
            </SmartWalletsProvider>
        </PrivyProvider>
    );
}