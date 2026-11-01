"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDownWideNarrow, CalendarDays, Clapperboard, LoaderCircle, Play, X, Youtube } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { MinistryVideo, VideoCategory, VideoPageResponse } from "@/lib/youtube-types";

const categories: { value: VideoCategory; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "sermons", label: "Pregações" },
  { value: "services", label: "Cultos" },
  { value: "events", label: "Eventos" },
];

const emptyMessages: Record<NonNullable<VideoPageResponse["error"]>, string> = {
  not_configured: "A biblioteca oficial está aguardando a configuração da chave da YouTube Data API v3 no ambiente seguro do projeto.",
  configuration_missing: "Os IDs oficiais do canal ou da playlist desta categoria ainda não foram configurados. Nenhum vídeo de exemplo será exibido como conteúdo do ministério.",
  upstream_error: "Não foi possível consultar o YouTube agora. Tente novamente em instantes.",
  invalid_request: "Não foi possível carregar esta seleção de vídeos. Atualize a página e tente novamente.",
};

export function VideoLibrary() {
  const [category, setCategory] = useState<VideoCategory>("services");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [videos, setVideos] = useState<MinistryVideo[]>([]);
  const [selected, setSelected] = useState<MinistryVideo | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<VideoPageResponse["error"]>();

  const loadInitial = useCallback(async (activeCategory: VideoCategory, signal: AbortSignal) => {
    setLoading(true);
    setError(undefined);
    setVideos([]);
    setSelected(null);
    setNextPageToken(null);
    try {
      const response = await fetch(`/api/youtube?category=${activeCategory}`, { signal, cache: "no-store" });
      const data = (await response.json()) as VideoPageResponse;
      if (!response.ok) {
        setError(data.error ?? "upstream_error");
        return;
      }
      setVideos(data.items);
      setNextPageToken(data.nextPageToken);
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === "AbortError") return;
      setError("upstream_error");
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadInitial(category, controller.signal);
    return () => controller.abort();
  }, [category, loadInitial]);

  async function loadMore() {
    if (!nextPageToken || loadingMore) return;
    setLoadingMore(true);
    setError(undefined);
    try {
      const query = new URLSearchParams({ category, pageToken: nextPageToken });
      const response = await fetch(`/api/youtube?${query.toString()}`, { cache: "no-store" });
      const data = (await response.json()) as VideoPageResponse;
      if (!response.ok) {
        setError(data.error ?? "upstream_error");
        return;
      }
      setVideos((current) => {
        const existing = new Set(current.map((video) => video.id));
        return [...current, ...data.items.filter((video) => !existing.has(video.id))];
      });
      setNextPageToken(data.nextPageToken);
    } catch {
      setError("upstream_error");
    } finally {
      setLoadingMore(false);
    }
  }

  const visibleVideos = useMemo(() => {
    return [...videos].sort((a, b) => {
      const difference = new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      return sortOrder === "newest" ? -difference : difference;
    });
  }, [videos, sortOrder]);

  const statusMessage = error ? emptyMessages[error] : "Ainda não há vídeos publicados para esta seleção.";

  return (
    <section className="video-section section-pad" id="videos" aria-labelledby="videos-title">
      <div className="section-shell">
        <div className="video-header">
          <div>
            <span className="eyebrow">Pregações e eventos</span>
            <h2 className="section-title" id="videos-title">Assista e seja edificado <em>pela Palavra.</em></h2>
            <p className="section-lead">Acompanhe nossas pregações, cultos, eventos e mensagens que fortalecem nossa fé.</p>
          </div>
        </div>

        <div className="video-controls">
          <div className="category-tabs" role="group" aria-label="Filtrar vídeos por categoria">
            {categories.map((item) => (
              <button
                className="category-tab"
                key={item.value}
                type="button"
                aria-pressed={category === item.value}
                onClick={() => setCategory(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <label className="sort-control">
            <ArrowDownWideNarrow size={16} aria-hidden="true" />
            <span>Ordenar</span>
            <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as "newest" | "oldest")}>
              <option value="newest">Mais recentes primeiro</option>
              <option value="oldest">Mais antigos primeiro</option>
            </select>
          </label>
        </div>

        {selected && (
          <div className="video-player" aria-label="Player do vídeo selecionado">
            <div className="video-player-frame">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(selected.id)}?autoplay=1&rel=0`}
                title={selected.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            <div className="video-player-caption">
              <h3>{selected.title}</h3>
              <button className="player-close" type="button" onClick={() => setSelected(null)} aria-label="Fechar player"><X size={16} /></button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="library-state" role="status">
            <div className="library-state-icon"><LoaderCircle size={22} className="animate-spin" aria-hidden="true" /></div>
            <h3>Carregando vídeos</h3>
            <p>Buscando as mensagens mais recentes do canal oficial.</p>
          </div>
        ) : visibleVideos.length > 0 ? (
          <div className="video-grid" aria-live="polite">
            {visibleVideos.map((video) => (
              <button
                className="video-card"
                type="button"
                key={video.id}
                aria-pressed={selected?.id === video.id}
                onClick={() => setSelected(video)}
              >
                <span className="video-thumb">
                  {video.thumbnail ? <img src={video.thumbnail} alt="" loading="lazy" decoding="async" /> : <span aria-hidden="true" />}
                  <span className="play-indicator"><Play size={17} fill="currentColor" aria-hidden="true" /></span>
                </span>
                <span className="video-copy">
                  <span className="video-date"><CalendarDays size={13} aria-hidden="true" />{formatDate(video.publishedAt)}</span>
                  <span className="video-title">{video.title}</span>
                  <span className="video-summary">{video.description || "Assista a esta mensagem do Ministério Resgate & Salvação."}</span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="library-state" role={error ? "status" : "status"}>
            <div className="library-state-icon">
              {error === "not_configured" || error === "configuration_missing" ? <Clapperboard size={22} aria-hidden="true" /> : <Youtube size={23} aria-hidden="true" />}
            </div>
            <h3>{error ? "Biblioteca em preparação" : "Novas mensagens em breve"}</h3>
            <p>{statusMessage}</p>
          </div>
        )}

        {error && visibleVideos.length > 0 && <p role="status" className="section-lead">{emptyMessages[error]}</p>}
        {nextPageToken && !loading && (
          <div className="library-footer">
            <button className="button-quiet load-more" type="button" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? <LoaderCircle size={16} className="animate-spin" /> : null}
              {loadingMore ? "Carregando…" : "Carregar mais"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
