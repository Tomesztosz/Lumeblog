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


# ---------- a Lume kapcsolóhangja ----------
# A kattanás pillanata mindhárom változatban a 0. minta (PRE után), utána
# ugyanaz a „derengés” réteg jön: a lume felizzásának hangja.

PRE = 0.3  # ennyi hely van a kattanás előtt az előjátékra (lánc, fogazás)


def _decay(t, d):
    return np.where(t >= 0, np.exp(-np.clip(t, 0, None) / d), 0.0)


def _click(t, d, rng, amp):
    """Világos, rövid kattanás: felülvágott zaj gyors lecsengéssel."""
    n = rng.standard_normal(len(t))
    n = np.diff(n, prepend=0.0)
    return n * _decay(t, d) * amp


def _ring(t, partials):
    out = np.zeros(len(t))
    for f, d, a in partials:
        out += np.sin(2 * np.pi * f * np.clip(t, 0, None)) * _decay(t, d) * a
    return out


def _thock(t, f0, f1, d, amp):
    """Mély, tompa koppanás enyhén lefelé csúszó hangmagassággal."""
    tc = np.clip(t, 0, None)
    f = f1 + (f0 - f1) * np.exp(-tc / 0.012)
    phase = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(phase) * _decay(t, d) * amp


def _glow(t, start, rng):
    """A derengés: magas, tiszta hangok lassú felfutással és hosszú lecsengéssel,
    alatta egy lehelletnyi levegős zaj. Mintha a lume felizzana."""
    tt = t - start
    tc = np.clip(tt, 0, None)
    env = np.where(tt >= 0, (1 - np.exp(-tc / 0.12)) * np.exp(-tc / 1.25), 0.0)
    vib = 1 + 0.003 * np.sin(2 * np.pi * 5.2 * tc)
    tone = (np.sin(2 * np.pi * 1567.98 * vib * tc) * 1.0
            + np.sin(2 * np.pi * 2349.32 * vib * tc) * 0.45
            + np.sin(2 * np.pi * 3951.07 * tc) * 0.12)
    # lehelletnyi levegő: lágyított, sávkorlátozott zaj, a hang alatt marad
    air = np.diff(rng.standard_normal(len(t)), prepend=0.0)
    air = np.convolve(air, np.ones(6) / 6, mode='same')
    return env * (tone * 0.075 + air * 0.012)


def _bakelit(t, rng):
    """Régi bakelit billenőkapcsoló: a kar átpattan, majd zár az érintkező."""
    return (_click(t, 0.0007, rng, 0.55)
            + _ring(t, [(1150, 0.012, 0.32), (2620, 0.006, 0.12)])
            + _thock(t, 170, 118, 0.032, 0.55)
            + _click(t - 0.011, 0.0006, rng, 0.32)
            + _ring(t - 0.011, [(2600, 0.008, 0.14)]))


def _sargarez(t, rng):
    """Sárgaréz forgókapcsoló: két halk fogazás, majd a súlyos reteszelés."""
    out = np.zeros(len(t))
    for d, a in ((-0.072, 0.13), (-0.036, 0.18)):
        out += _click(t - d, 0.0005, rng, a) + _ring(t - d, [(3400, 0.006, a * 0.5)])
    return (out + _click(t, 0.0009, rng, 0.5) + _thock(t, 130, 96, 0.045, 0.6)
            + _ring(t, [(1870, 0.18, 0.16), (3120, 0.12, 0.11), (4410, 0.08, 0.07), (6230, 0.05, 0.045)]))


def _lanc(t, rng):
    """Húzóláncos lámpa: a gyöngyös lánc csörren, kattan a kapcsoló, a lánc visszaleng."""
    out = np.zeros(len(t))
    for d in sorted(rng.uniform(-0.22, -0.04, 7)):
        a = rng.uniform(0.05, 0.11)
        out += _click(t - d, 0.0003, rng, a) + _ring(t - d, [(rng.uniform(6000, 8200), 0.003, a * 0.6)])
    for d in sorted(rng.uniform(0.08, 0.2, 4)):
        a = rng.uniform(0.03, 0.06)
        out += _click(t - d, 0.0003, rng, a) + _ring(t - d, [(rng.uniform(6000, 8200), 0.003, a * 0.6)])
    return (out + _click(t, 0.0008, rng, 0.5) + _ring(t, [(2200, 0.02, 0.2), (3500, 0.01, 0.08)])
            + _thock(t, 185, 140, 0.028, 0.45))


SWITCHES = {'bakelit': _bakelit, 'sargarez': _sargarez, 'lanc': _lanc}


def lume_switch(name, rng, seconds=2.6):
    """A kapcsolóhang és a derengés együtt. A kattanás a PRE másodpercnél van."""
    n = int(SR * seconds)
    t = np.arange(n) / SR - PRE
    return SWITCHES[name](t, rng) + _glow(t, 0.12, rng)


def _write(path, x):
    left = x
    right = np.roll(x, int(0.00035 * SR))
    data = (np.stack([left, right], axis=1) * 32767).astype('<i2')
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


def export_switch(name, path):
    """Önálló hangfájl: kis csend, kattanás, derengés. Ez a márkahang magában."""
    rng = np.random.default_rng(1801)
    x = np.concatenate([np.zeros(int(0.25 * SR)), lume_switch(name, rng, 2.8)])
    x = _reverb(x, seconds=0.45, mix=0.14, rng=rng)
    x *= np.clip((len(x) / SR - np.arange(len(x)) / SR) / 0.3, 0, 1)
    _write(path, x / np.max(np.abs(x)) * 0.8)


def synth(meta, path, switch='bakelit'):
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
            # a kattanás után a ketyegés egy pillanatra elcsendesedik,
            # hogy a derengés tisztán szóljon, aztán visszatér
            dt = b['t'] - lights_off
            gain *= 0.82 * (0.15 + 0.85 * min(1.0, max(0.0, (dt - 0.5) / 0.9)))
        if b['t'] > end_card:
            gain *= max(0.0, 1 - (b['t'] - end_card) / 2.6)
        seg = s[: total - start] * gain
        x[start:start + len(seg)] += seg

    # lámpa le: a Lume kapcsolóhangja, a kattanás pontosan a sötétedés kezdetén
    sw = lume_switch(switch, np.random.default_rng(1801)) * 1.45
    i = int((lights_off - PRE) * SR)
    seg = sw[: total - i]
    x[i:i + len(seg)] += seg

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
    # hangosság: átlagszint beállítása, majd lágy limiter, ami a csúcsokat
    # (kattanás, ketyegés) arányában megtartja, csak a legtetejét kerekíti
    x = x / np.sqrt(np.mean(x ** 2)) * 0.07
    x = np.tanh(x / 0.62) * 0.62

    _write(path, x)
