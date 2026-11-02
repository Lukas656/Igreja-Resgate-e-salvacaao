import { NextRequest, NextResponse } from "next/server";
import { ministryConfig } from "@/lib/config";
import type { MinistryVideo, VideoCategory } from "@/lib/youtube-types";

const API_ROOT = "https://www.googleapis.com/youtube/v3";
const PAGE_SIZE = 9;
const categoryPlaylists: Record<
  Exclude<VideoCategory, "all">,
  string | undefined
> = {
  sermons:
    process.env.YOUTUBE_PLAYLIST_SERMONS ||
    ministryConfig.youtube.playlists.sermons,
  services:
    process.env.YOUTUBE_PLAYLIST_SERVICES ||
    ministryConfig.youtube.playlists.services,
  events:
    process.env.YOUTUBE_PLAYLIST_EVENTS ||
    ministryConfig.youtube.playlists.events,
  worship:
    process.env.YOUTUBE_PLAYLIST_WORSHIP ||
    ministryConfig.youtube.playlists.worship,
};

type YouTubeResponse = {
  nextPageToken?: string;
  items?: Array<{
    snippet?: {
      title?: string;
      description?: string;
      publishedAt?: string;
      thumbnails?: Record<string, { url?: string }>;
      resourceId?: { videoId?: string };
    };
    contentDetails?: {
      videoId?: string;
      relatedPlaylists?: { uploads?: string };
    };
  }>;
};

function resultError(
  error:
    | "not_configured"
    | "configuration_missing"
    | "upstream_error"
    | "invalid_request",
  status: number,
) {
  return NextResponse.json(
    { items: [], nextPageToken: null, error },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

async function youtubeGet(
  path: string,
  params: Record<string, string>,
): Promise<YouTubeResponse> {
  const url = new URL(`${API_ROOT}/${path}`);
  for (const [key, value] of Object.entries(params))
    url.searchParams.set(key, value);
  url.searchParams.set("key", process.env.YOUTUBE_API_KEY ?? "");

  const response = await fetch(url, {
    next: { revalidate: 300 },
  });
  if (!response.ok)
    throw new Error("YouTube API returned a non-success response");
  return (await response.json()) as YouTubeResponse;
}

function toVideoItems(
  response: YouTubeResponse,
  category: MinistryVideo["category"],
): MinistryVideo[] {
  return (response.items ?? []).flatMap((item) => {
    const snippet = item.snippet;
    const id = item.contentDetails?.videoId ?? snippet?.resourceId?.videoId;
    if (!id || !snippet) return [];

    const thumbnails = snippet.thumbnails ?? {};
    const thumbnail =
      thumbnails.maxres?.url ??
      thumbnails.standard?.url ??
      thumbnails.high?.url ??
      thumbnails.medium?.url ??
      thumbnails.default?.url ??
      `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`;

    return [
      {
        id,
        title: snippet.title ?? "Vídeo do Ministério Resgate & Salvação",
        description: snippet.description ?? "",
        publishedAt: snippet.publishedAt ?? "",
        thumbnail,
        category,
      },
    ];
  });
}

function validId(value: string | undefined): value is string {
  return Boolean(value && /^[A-Za-z0-9_-]{6,80}$/.test(value));
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawCategory = searchParams.get("category") ?? "all";
  const allowed: VideoCategory[] = [
    "all",
    "sermons",
    "services",
    "events",
    "worship",
  ];
  if (!allowed.includes(rawCategory as VideoCategory))
    return resultError("invalid_request", 400);
  const category = rawCategory as VideoCategory;
  const pageToken = searchParams.get("pageToken") ?? "";
  if (
    pageToken &&
    (pageToken.length > 1024 || !/^[A-Za-z0-9_=-]+$/.test(pageToken))
  ) {
    return resultError("invalid_request", 400);
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return resultError("not_configured", 503);

  try {
    let playlistId: string | undefined;
    let videoCategory: MinistryVideo["category"] = "channel";

    if (category === "all") {
      const channelId =
        process.env.YOUTUBE_CHANNEL_ID || ministryConfig.youtube.channelId;
      if (!validId(channelId)) return resultError("configuration_missing", 422);
      const channel = await youtubeGet("channels", {
        part: "contentDetails",
        id: channelId,
      });
      playlistId =
        channel.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    } else {
      playlistId = categoryPlaylists[category];
      videoCategory = category;
    }

    if (!validId(playlistId)) return resultError("configuration_missing", 422);

    const params: Record<string, string> = {
      part: "snippet,contentDetails",
      playlistId,
      maxResults: String(PAGE_SIZE),
    };
    if (pageToken) params.pageToken = pageToken;
    const response = await youtubeGet("playlistItems", params);
    const items = toVideoItems(response, videoCategory);

    return NextResponse.json(
      { items, nextPageToken: response.nextPageToken ?? null },
      {
        headers: {
          "Cache-Control":
            "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch {
    console.error("Falha ao consultar a YouTube Data API v3.");
    return resultError("upstream_error", 502);
  }
}
