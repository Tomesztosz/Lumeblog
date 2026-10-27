"""Saját, szintetizált hang a Reelekhez: a gátlómű ketyegése a jelenet
valódi ütemeiből, egy halk szobazaj, a lámpa le kattanása és egy csendes
lecsengés a zárókártyán. Nincs külső hangfájl, nincs jogdíjas zene."""
import wave

import numpy as np

SR = 48000


def _tick(rate, tock, rng):
    """Egy ütés: két gyors kattanás (kioldás és impulzus) fémes rezonanciával."""
    slow = 1 / max(rate, 0.05)
    pitch = rate ** 0.3 * (0.92 if tock else 1.0)
    decay = 0.0055 * slow ** 0.55
    n = int(SR * (decay * 7 + 0.004 * slow))
    t = np.arange(n) / SR
    out = np.zeros(n)
    for delay, amp in ((0.0, 1.0), (0.0024 * slow ** 0.8, 0.55)):
        tt = t - delay
        m = tt >= 0
        env = np.where(m, np.exp(-np.clip(tt, 0, None) / decay), 0)
        tone = (np.sin(2 * np.pi * 3100 * pitch * tt) * 0.6
                + np.sin(2 * np.pi * 5200 * pitch * tt) * 0.3
                + np.sin(2 * np.pi * 7700 * pitch * tt) * 0.15)
        click = rng.standard_normal(n) * np.exp(-np.clip(tt, 0, None) / (decay * 0.18)) * 0.5
        out += amp * env * (tone + click) * m
    return out


def _reverb(x, seconds=0.55, mix=0.18, rng=None):
    n = int(SR * seconds)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / (SR * seconds / 5))
    ir /= np.sqrt(np.sum(ir ** 2))
    size = 1 << int(np.ceil(np.log2(len(x) + n)))
    wet = np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[:len(x)]
    return x * (1 - mix) + wet * mix


def synth(meta, path):
    rng = np.random.default_rng(1801)
    dur = meta['DUR']
    total = int(SR * dur)
    x = np.zeros(total)
    t_all = np.arange(total) / SR

    lights_off = meta.get('lightsOff', 13.6)
    end_card = meta.get('endCard', 18.5)
    for b in meta['beats']:
        start = int(b['t'] * SR)
        if start >= total:
            continue
        s = _tick(b['rate'], b['n'] % 2 == 1, rng)
        gain = 0.32 + 0.3 * (1 - min(b['rate'], 1)) ** 0.5
        if b['t'] > lights_off:
            gain *= 0.82
        if b['t'] > end_card:
            gain *= max(0.0, 1 - (b['t'] - end_card) / 2.6)
        seg = s[: total - start] * gain
        x[start:start + len(seg)] += seg

    # lámpa le: rövid kapcsolókattanás és egy mély puffanás
    i = int(lights_off * SR)
    n = int(0.18 * SR)
    tt = np.arange(n) / SR
    sw = rng.standard_normal(n) * np.exp(-tt / 0.004) * 0.35
    thump = np.sin(2 * np.pi * 68 * tt) * np.exp(-tt / 0.07) * 0.55
    x[i:i + n] += (sw + thump)[: total - i]

    # zárókártya: csendes, meleg lecsengés (két tiszta szinusz)
    pad_env = np.clip((t_all - end_card) / 0.9, 0, 1) * np.clip((dur - t_all) / 1.2, 0, 1)
    x += pad_env * (np.sin(2 * np.pi * 196 * t_all) * 0.05 + np.sin(2 * np.pi * 293.66 * t_all) * 0.035)

    # halk szobazaj (rózsaszín zaj közelítés)
    white = rng.standard_normal(total)
    pink = np.fft.irfft(np.fft.rfft(white) / np.sqrt(np.arange(1, total // 2 + 2)), total)
    x += pink / np.max(np.abs(pink)) * 0.006

    x = _reverb(x, rng=rng)
    fade = np.clip((dur - t_all) / 0.25, 0, 1) * np.clip(t_all / 0.02, 0, 1)
    x *= fade
    x = x / np.max(np.abs(x)) * 0.84

    # sztereó: a ketyegés picit szélesebb térben
    left = x
    right = np.roll(x, int(0.00035 * SR))
    data = (np.stack([left, right], axis=1) * 32767).astype('<i2')
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())
