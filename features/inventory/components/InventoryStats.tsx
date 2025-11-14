"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ContractInfo } from "@/types/inventory"
import { Star } from "lucide-react"



export function InventoryStats(contractInfo: ContractInfo) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 px-0.5 sm:px-0">

            <Card className="bg-white/80 border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
                <CardContent className="p-3 sm:p-4 text-center">
                    <div className="text-lg sm:text-2xl md:text-3xl font-bold text-slate-800 mb-0.5 sm:mb-1">{(Number(contractInfo.boxPrice) / 1e18).toFixed(2)} IP</div>
                    <div className="text-xs sm:text-sm text-slate-600 font-medium">Box Price</div>
                </CardContent>
            </Card>

            <Card className="bg-white/80 border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
                <CardContent className="p-3 sm:p-4 text-center">
                    <div className="text-lg sm:text-2xl md:text-3xl font-bold text-blue-600 mb-0.5 sm:mb-1">{contractInfo.totalSupply.toString()}</div>
                    <div className="text-xs sm:text-sm text-slate-600 font-medium">Total Supply</div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-300 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-3 sm:p-4 text-center">
                    <div className="text-lg sm:text-2xl md:text-3xl font-bold text-indigo-700 mb-0.5 sm:mb-1 flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                        {contractInfo.currentSupply.toString()}
                    </div>
                    <div className="text-xs sm:text-sm text-indigo-600 font-medium">Minted</div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-3 sm:p-4 text-center">
                    <div className="text-lg sm:text-2xl md:text-3xl font-bold text-purple-700 mb-0.5 sm:mb-1">{contractInfo.remainingBoxes.toString()}</div>
                    <div className="text-xs sm:text-sm text-purple-600 font-medium">Remaining</div>
                </CardContent>
            </Card>
        </div>
    )
} 