export function shareToTwitter() {
  // Create the tweet text
  const tweetText = [
    `Just pulled a ippy blind box`,
    `Come and join the IPPY verse to reveal your ippy!`,
    "",
    "#IPPY",
  ].join("\n");

  const finalTweet = tweetText;

  // Create Twitter URL
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    finalTweet
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
