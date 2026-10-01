// Rough filter for automated visitors, so the dashboard's view counts
// reflect people rather than link-preview fetchers. When a card's link is
// pasted into iMessage, Facebook, Slack, etc., those services load the page
// themselves to build the preview — without this, every share would count
// as one or more extra "views".
const BOT_PATTERN =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|facebookcatalog|meta-externalagent|whatsapp|telegram|slack|discord|linkedin|embedly|pinterest|skype|vkshare|redditbot|applebot|google-inspectiontool|headless|lighthouse|curl|wget|python-requests|axios|node-fetch|go-http-client/i;

export function isLikelyBot(userAgent: string | null): boolean {
  if (!userAgent) return true; // real browsers always send one
  return BOT_PATTERN.test(userAgent);
}
