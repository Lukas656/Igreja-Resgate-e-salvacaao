export type VideoCategory = "all" | "sermons" | "services" | "events" | "worship";

export type MinistryVideo = {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnail: string;
  category: Exclude<VideoCategory, "all"> | "channel";
};

export type VideoPageResponse = {
  items: MinistryVideo[];
  nextPageToken: string | null;
  error?: "not_configured" | "configuration_missing" | "upstream_error" | "invalid_request";
};
