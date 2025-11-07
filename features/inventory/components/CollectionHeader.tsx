"use client"

import { ContractInfo } from "@/types/inventory"
import { IPPY_COLLECTION } from "@/lib/collectionMetadata"
import Image from "next/image"

interface NFTTypeBreakdown {
    typeName: string
    count: number
}

interface CollectionHeaderProps {
    contractInfo: ContractInfo
    nftTypeBreakdown: NFTTypeBreakdown[]
    totalItems: number
}

export function CollectionHeader({
    contractInfo,
    nftTypeBreakdown,
    totalItems,
}: CollectionHeaderProps) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden mx-0.5 sm:mx-0 mb-6">
            {/* Collection Banner */}
            <div className={`relative h-32 sm:h-48 bg-gradient-to-r ${IPPY_COLLECTION.bannerColor} overflow-hidden`}>
                {/* Animated gradient orbs in banner */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-float" />
                    <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-float" style={{ animationDelay: "2s" }} />
                </div>

                {/* Collection Icon */}
                <div className="absolute -bottom-12 left-6 sm:left-8">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-2xl border-4 border-white shadow-2xl overflow-hidden">
                        <Image
                            src={IPPY_COLLECTION.image}
                            alt={IPPY_COLLECTION.name}
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>

            {/* Collection Info Section */}
            <div className="pt-16 sm:pt-20 px-6 sm:px-8 pb-6">
                {/* Collection Name & Description */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                        {IPPY_COLLECTION.name}
                    </h1>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
                        {IPPY_COLLECTION.description}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 pb-6 border-b border-slate-200">
                    <div className="space-y-1">
                        <div className="text-xs sm:text-sm text-slate-500 font-medium">Total Items</div>
                        <div className="text-xl sm:text-2xl font-bold text-slate-900">{totalItems}</div>
                    </div>

                    <div className="space-y-1">
                        <div className="text-xs sm:text-sm text-slate-500 font-medium">Floor Price</div>
                        <div className="text-xl sm:text-2xl font-bold text-slate-900">
                            {(Number(contractInfo.boxPrice) / 1e18).toFixed(3)} ETH
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="text-xs sm:text-sm text-slate-500 font-medium">Total Supply</div>
                        <div className="text-xl sm:text-2xl font-bold text-slate-900">
                            {contractInfo.totalSupply.toString()}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="text-xs sm:text-sm text-slate-500 font-medium">Minted</div>
                        <div className="text-xl sm:text-2xl font-bold text-blue-600">
                            {contractInfo.currentSupply.toString()}
                        </div>
                    </div>
                </div>

                {/* NFT Types Breakdown - Simple Numbers */}
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-slate-500">Type Breakdown</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-700">
                        {nftTypeBreakdown.map(({ typeName, count }, index) => (
                            <span key={typeName}>
                                <span className="font-medium">{typeName}</span>: {count}
                                {index < nftTypeBreakdown.length - 1 && <span className="ml-4 text-slate-300">•</span>}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
