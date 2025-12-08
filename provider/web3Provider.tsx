"use client";

import { PrivyProvider, useActiveWallet, usePrivy, useWallets } from "@privy-io/react-auth";
import { SmartWalletsProvider } from "@privy-io/react-auth/smart-wallets";
import { storyAeneid } from "viem/chains";
import { useEffect, useRef, useCallback, useState } from "react";
import { ensureUserExists } from "@/lib/auth";

const STORY_AENEID_CHAIN_ID = `eip155:${storyAeneid.id}`;

// Auto-create user profile and ensure correct chain on login/wallet switch
function WalletManager() {
    const { authenticated, user } = usePrivy();
    const { wallets } = useWallets();
    const { wallet: activeWallet } = useActiveWallet();
    const lastActiveWalletAddressRef = useRef<string | null>(null);
    const processedWalletAddressesRef = useRef<Set<string>>(new Set());
    const [activeAddress, setActiveAddress] = useState<string | null>(null);

    // Switch a wallet to Story Aeneid if not already on it
    const ensureCorrectChain = useCallback(async (wallet: typeof wallets[number]) => {
        console.log('[WalletManager] ensureCorrectChain called', {
            address: wallet.address,
            chainId: wallet.chainId,
            expectedChainId: STORY_AENEID_CHAIN_ID,
            walletClientType: wallet.walletClientType,
        });
        try {
            if (wallet.chainId !== STORY_AENEID_CHAIN_ID) {
                console.log('[WalletManager] Attempting to switch chain...');
                await wallet.switchChain(storyAeneid.id);
                console.log('[WalletManager] Chain switch successful');
            } else {
                console.log('[WalletManager] Wallet already on correct chain');
            }
        } catch (error) {
            console.error('[WalletManager] Failed to switch chain', {
                address: wallet.address,
                error,
            });
        }
    }, []);

    // Keep a single source of truth for the active address.
    useEffect(() => {
        const derivedAddress =
            activeWallet?.address ||
            user?.wallet?.address ||
            wallets[0]?.address ||
            null;

        if (derivedAddress?.toLowerCase() !== activeAddress?.toLowerCase()) {
            console.log('[WalletManager] Updating active address', {
                from: activeAddress,
                to: derivedAddress,
            });
            setActiveAddress(derivedAddress);
        }

        if (!derivedAddress && activeAddress !== null) {
            console.log('[WalletManager] Clearing active address');
            setActiveAddress(null);
        }
    }, [activeWallet?.address, user?.wallet?.address, wallets, activeAddress]);

    // Listen to account/chain changes from injected providers (e.g. MetaMask) to react instantly
    useEffect(() => {
        const cleanups: Array<() => void> = [];

        wallets.forEach((wallet) => {
            const provider = (wallet as any).getEthereumProvider?.();
            if (!provider?.on) return;

            const handleAccountsChanged = (accounts: string[]) => {
                const next = accounts[0] || null;
                if (next && next.toLowerCase() !== activeAddress?.toLowerCase()) {
                    console.log('[WalletManager] Detected accountsChanged', {
                        previous: activeAddress,
                        next,
                        walletClientType: wallet.walletClientType,
                    });
                    setActiveAddress(next);
                }
            };

            const handleChainChanged = () => {
                ensureCorrectChain(wallet);
            };

            provider.on("accountsChanged", handleAccountsChanged);
            provider.on("chainChanged", handleChainChanged);
            cleanups.push(() => {
                provider.removeListener?.("accountsChanged", handleAccountsChanged);
                provider.removeListener?.("chainChanged", handleChainChanged);
            });
        });

        return () => {
            cleanups.forEach((cleanup) => cleanup());
        };
    }, [wallets, ensureCorrectChain, activeAddress]);

    // Handle user profile creation on authentication
    useEffect(() => {
        if (authenticated && activeAddress) {
            ensureUserExists(activeAddress);
        }
    }, [authenticated, activeAddress]);

    // Handle wallet changes - detect new wallets or account switches
    useEffect(() => {
        const currentActiveAddress = activeAddress;

        console.log('[WalletManager] useEffect triggered', {
            authenticated,
            currentActiveAddress,
            lastActiveAddress: lastActiveWalletAddressRef.current,
            walletsCount: wallets.length,
            wallets: wallets.map((w) => ({
                address: w.address,
                chainId: w.chainId,
                walletClientType: w.walletClientType,
            })),
        });

        if (!authenticated) {
            console.log('[WalletManager] Not authenticated, resetting state');
            lastActiveWalletAddressRef.current = null;
            processedWalletAddressesRef.current.clear();
            return;
        }

        if (wallets.length === 0) {
            console.log('[WalletManager] No wallets available');
            return;
        }

        const handleWalletChanges = async () => {
            // Check if active wallet address changed (wallet switch or account switch)
            const activeWalletChanged = currentActiveAddress &&
                currentActiveAddress !== lastActiveWalletAddressRef.current;

            if (activeWalletChanged) {
                console.log('[WalletManager] Active wallet address changed', {
                    from: lastActiveWalletAddressRef.current,
                    to: currentActiveAddress,
                });
                lastActiveWalletAddressRef.current = currentActiveAddress;

                // Find the wallet matching the active address
                const activeWalletEntry = wallets.find(w => w.address.toLowerCase() === currentActiveAddress.toLowerCase());

                if (activeWalletEntry) {
                    console.log('[WalletManager] Processing active wallet switch', {
                        address: activeWalletEntry.address,
                        chainId: activeWalletEntry.chainId,
                        walletClientType: activeWalletEntry.walletClientType,
                    });

                    // Mark this address as processed
                    processedWalletAddressesRef.current.add(activeWalletEntry.address.toLowerCase());

                    // Ensure correct chain
                    await ensureCorrectChain(activeWalletEntry);
                } else {
                    console.warn('[WalletManager] Active wallet not found in wallets array', {
                        activeAddress: currentActiveAddress,
                        availableAddresses: wallets.map(w => w.address),
                    });
                }
            }

            // Process all wallets to ensure they're on the correct chain
            for (const wallet of wallets) {
                const walletAddressLower = wallet.address.toLowerCase();
                const isProcessed = processedWalletAddressesRef.current.has(walletAddressLower);

                console.log('[WalletManager] Processing wallet', {
                    address: wallet.address,
                    chainId: wallet.chainId,
                    walletClientType: wallet.walletClientType,
                    isProcessed,
                    isActive: walletAddressLower === currentActiveAddress?.toLowerCase(),
                });

                // Process new wallets or wallets that switched to wrong chain
                if (!isProcessed) {
                    console.log('[WalletManager] New wallet detected, processing...');
                    processedWalletAddressesRef.current.add(walletAddressLower);
                    await ensureCorrectChain(wallet);
                } else if (wallet.chainId !== STORY_AENEID_CHAIN_ID) {
                    console.log('[WalletManager] Wallet chain mismatch detected');
                    await ensureCorrectChain(wallet);
                }
            }

            // Clean up processed addresses that are no longer in wallets array
            const currentWalletAddresses = new Set(
                wallets.map(w => w.address.toLowerCase())
            );

            console.log('[WalletManager] Cleaning up disconnected wallets', {
                currentAddresses: Array.from(currentWalletAddresses),
                processedAddresses: Array.from(processedWalletAddressesRef.current),
            });

            for (const address of processedWalletAddressesRef.current) {
                if (!currentWalletAddresses.has(address) && address !== currentActiveAddress?.toLowerCase()) {
                    console.log('[WalletManager] Removing disconnected wallet', address);
                    processedWalletAddressesRef.current.delete(address);
                }
            }
        };

        handleWalletChanges();
    }, [authenticated, wallets, user?.wallet?.address, ensureCorrectChain]);

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
