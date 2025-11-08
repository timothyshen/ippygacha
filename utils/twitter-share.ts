export function shareToTwitter(itemName?: string, isRevealed: boolean = false) {
  // Create the tweet text based on reveal status
  const tweetText = isRevealed && itemName
    ? [
        `Just revealed my IPPY NFT: ${itemName}! 🎉`,
        `Come and join the IPPY verse to reveal your ippy!`,
        "",
        "#IPPY #NFT",
      ].join("\n")
    : [
        `Just pulled an IPPY blind box! 📦`,
        `Come and join the IPPY verse to reveal your ippy!`,
        "",
        "#IPPY",
      ].join("\n");

  // Create Twitter URL
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    tweetText
  )}`;

  // Open in new window
  window.open(twitterUrl, "_blank", "width=550,height=420");
}

export function shareCollectionMilestone(
  totalItems: number,
  uniqueItems: number,
  spaceCount: number
) {
  const tweetText = [
    `🎮 My Gacha Zone Collection Stats:`,
    `📦 ${totalItems} Total Items`,
    `🌟 ${uniqueItems} Unique Items`,
    `🚀 ${spaceCount} Space Collection Items`,
    "",
    "#GachaZone #Collection #GachaMaster",
  ].join("\n");

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    tweetText
  )}`;
  window.open(twitterUrl, "_blank", "width=550,height=420");
}
