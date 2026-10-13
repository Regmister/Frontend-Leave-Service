import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useApi } from '../../hooks/useApi.js';

describe('useApi', () => {
  it('starts with loading=false, error=null, data=null', () => {
    const { result } = renderHook(() => useApi(vi.fn()));
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();
  });

  it('sets loading=true while the async function is running', async () => {
    let resolve;
    const apiFn = () => new Promise((r) => { resolve = r; });
    const { result } = renderHook(() => useApi(apiFn));

    act(() => { result.current.execute(); });
    expect(result.current.loading).toBe(true);

    await act(async () => { resolve('done'); });
    expect(result.current.loading).toBe(false);
  });

  it('sets data to the resolved value on success', async () => {
    const apiFn = vi.fn().mockResolvedValue({ id: 1 });
    const { result } = renderHook(() => useApi(apiFn));

    await act(async () => { await result.current.execute(); });

    expect(result.current.data).toEqual({ id: 1 });
    expect(result.current.error).toBeNull();
  });

  it('sets error when the function throws', async () => {
    const apiFn = vi.fn().mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useApi(apiFn));

    await act(async () => {
      try { await result.current.execute(); } catch { /* expected */ }
    });

    expect(result.current.error).toBe('boom');
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('re-throws the error so the caller can handle it', async () => {
    const apiFn = vi.fn().mockRejectedValue(new Error('rethrown'));
    const { result } = renderHook(() => useApi(apiFn));

    await act(async () => {
      await expect(result.current.execute()).rejects.toThrow('rethrown');
    });
  });

  it('returns the resolved value from execute()', async () => {
    const apiFn = vi.fn().mockResolvedValue(42);
    const { result } = renderHook(() => useApi(apiFn));

    let returned;
    await act(async () => { returned = await result.current.execute(); });

    expect(returned).toBe(42);
  });

  it('passes arguments through to the wrapped function', async () => {
    const apiFn = vi.fn().mockResolvedValue(null);
    const { result } = renderHook(() => useApi(apiFn));

    await act(async () => { await result.current.execute('arg1', 2); });

    expect(apiFn).toHaveBeenCalledWith('arg1', 2);
  });

  it('resets error and data to null when reset() is called', async () => {
    const apiFn = vi.fn().mockRejectedValue(new Error('err'));
    const { result } = renderHook(() => useApi(apiFn));

    await act(async () => {
      try { await result.current.execute(); } catch { /* expected */ }
    });

    expect(result.current.error).toBe('err');

    act(() => { result.current.reset(); });

    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();
  });

  it('clears previous error before a new execute() call', async () => {
    const apiFn = vi.fn()
      .mockRejectedValueOnce(new Error('first'))
      .mockResolvedValueOnce('ok');

    const { result } = renderHook(() => useApi(apiFn));

    await act(async () => {
      try { await result.current.execute(); } catch { /* expected */ }
    });
    expect(result.current.error).toBe('first');

    await act(async () => { await result.current.execute(); });
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBe('ok');
  });

  it('uses the error message property when available', async () => {
    const err = { message: 'custom message' };
    const apiFn = vi.fn().mockRejectedValue(err);
    const { result } = renderHook(() => useApi(apiFn));

    await act(async () => {
      try { await result.current.execute(); } catch { /* expected */ }
    });

    expect(result.current.error).toBe('custom message');
  });

  it('falls back to default message when error has no message', async () => {
    const apiFn = vi.fn().mockRejectedValue({});
    const { result } = renderHook(() => useApi(apiFn));

    await act(async () => {
      try { await result.current.execute(); } catch { /* expected */ }
    });

    expect(result.current.error).toBe('An unexpected error occurred.');
  });
});
