"use client";

import * as React from "react";
import { apiGet, apiList, ApiError } from "./api";

function errorMessage(e: unknown): string {
  return e instanceof Error ? (e as ApiError).message || e.message : "Request failed";
}

export function useApiData<T>(path: string | null) {
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const reload = React.useCallback(async () => {
    if (!path) return;
    setLoading(true);
    setError(null);
    try {
      setData(await apiGet<T>(path));
    } catch (e) {
      setData(null);
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [path]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  return { data, error, loading, reload, setData };
}

export function useApiList<T>(path: string | null) {
  const [data, setData] = React.useState<T[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const reload = React.useCallback(async () => {
    if (!path) return;
    setLoading(true);
    setError(null);
    try {
      setData(await apiList<T>(path));
    } catch (e) {
      setData([]);
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [path]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  return { data, error, loading, reload, setData };
}