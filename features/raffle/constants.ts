import { Coins, ImageIcon, Heart } from "lucide-react";
import { Prize, Winner } from "./types";

export const PRIZES: Prize[] = [
  { name: "1 IP", icon: Coins, color: "text-yellow-500" },
  { name: "2 IP", icon: Coins, color: "text-green-500" },
  { name: "0.5 IP", icon: Coins, color: "text-blue-500" },
  { name: "5 IP", icon: Coins, color: "text-purple-500" },
  { name: "NFT", icon: ImageIcon, color: "text-pink-500" },
  { name: "Thank You", icon: Heart, color: "text-red-500" },
];

export const PRIZE_VALUES = [
  "1 IP",
  "2 IP",
  "0.5 IP",
  "5 IP",
  "NFT",
  "Thank You",
];

export const INITIAL_WINNERS: Winner[] = [
  {
    id: 1,
    name: "0x2F6D5c8eE17aA4F3c5B0C6E9F4b7D2E3a8E9f7B1",
    prize: "1 IP",
    date: "2 hours ago",
    value: "1 IP",
  },
  {
    id: 2,
    name: "0x67c6e6d45a01668109ad13c13a9dd0f23a7556f9",
    prize: "NFT",
    date: "4 hours ago",
    value: "NFT",
  },
  {
    id: 3,
    name: "0x12c9a35fB39D82c51B4201E57B783Da3e1A43F8C",
    prize: "Thank You",
    date: "6 hours ago",
    value: "Thank You",
  },
  {
    id: 4,
    name: "0x4bE7F68B7a8d2dB7C2e6aE97C4B8eE2A9dC9F3a4",
    prize: "5 IP",
    date: "1 day ago",
    value: "5 IP",
  },
  {
    id: 5,
    name: "0x9E6F0D3A7A84E41A9C8e3A54Bc7D87F9F21C3A55",
    prize: "0.5 IP",
    date: "1 day ago",
    value: "0.5 IP",
  },
  {
    id: 6,
    name: "0x84d7A3a617dFd7F6e6f0D2c5d22E6a9B8a7E90f2",
    prize: "2 IP",
    date: "2 days ago",
    value: "2 IP",
  },
];

export const COOLDOWN_PERIOD = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

export const PRIZE_COLORS = [
  "bg-gradient-to-br from-yellow-400 to-yellow-600",
  "bg-gradient-to-br from-green-400 to-green-600",
  "bg-gradient-to-br from-blue-400 to-blue-600",
  "bg-gradient-to-br from-purple-400 to-purple-600",
  "bg-gradient-to-br from-pink-400 to-pink-600",
  "bg-gradient-to-br from-red-400 to-red-600",
];
