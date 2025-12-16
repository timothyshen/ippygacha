export function shareToTwitter(itemName?: string, isRevealed: boolean = false) {
  const ippySite = "https://ippygacha.vercel.app/gacha";
  // Create the tweet text based on reveal status
  const tweetText = isRevealed && itemName
    ? [
        `Just revealed my IPPY NFT: ${itemName}! 🎉`,
        `Come and join the IPPY verse to reveal your ippy!`,
        "",
        ippySite,
      ].join("\n")
    : [
        `Just pulled an IPPY blind box! `,
        `Come and join the IPPY verse to reveal your ippy!`,
        "",
        ippySite,
      ].join("\n");

  // Create Twitter URL
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    tweetText
  )}`;

  // Open in new window
  window.open(twitterUrl, "_blank", "width=550,height=420");
}
