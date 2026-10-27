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


def _modes(t, modes):
    out = np.zeros(len(t))
    tc = np.clip(t, 0, None)
    for f, d, a in modes:
        out += np.sin(2 * np.pi * f * tc) * _decay(t, d) * a
    return out


def _klikk(t, rng, snap, modes, settle_at, settle_modes):
    """Kis lámpakapcsoló: egy nagyon rövid, magas pattanás a műanyag ház
    rezonanciáival, és utána ezredmásodpercekkel az érintkező apró ráülése."""
    return (_click(t, snap, rng, 0.9) + _modes(t, modes)
            + _click(t - settle_at, snap * 0.8, rng, 0.38) + _modes(t - settle_at, settle_modes))


def _apro(t, rng):
    """Apró: a legvékonyabb, legélesebb klikk."""
    return _klikk(t, rng, 0.00025, [(6200, 0.0016, 0.35), (9100, 0.0009, 0.2), (3900, 0.0022, 0.16)],
                  0.0016, [(7000, 0.001, 0.14)])


def _billeno(t, rng):
    """Billenő: asztali lámpa billenőkapcsolója, egy hajszálnyi testtel."""
    return _klikk(t, rng, 0.00035, [(4700, 0.0025, 0.38), (7300, 0.0014, 0.2), (1250, 0.004, 0.1)],
                  0.0024, [(5400, 0.0016, 0.18)])


def _zsinor(t, rng):
    """Zsinór: a lámpa vezetékén lévő kis kapcsoló, kicsit üregesebb házzal."""
    return _klikk(t, rng, 0.0003, [(3600, 0.003, 0.34), (5800, 0.0018, 0.22), (950, 0.006, 0.12)],
                  0.003, [(4200, 0.002, 0.2)])


SWITCHES = {'apro': _apro, 'billeno': _billeno, 'zsinor': _zsinor}


def lume_switch(name, rng, seconds=0.4):
    """A kapcsolóhang. A klikk a PRE másodpercnél van."""
    n = int(SR * seconds)
    t = np.arange(n) / SR - PRE
    return SWITCHES[name](t, rng)


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
    """Önálló hangfájl: a klikk kétszer, egy másodperc különbséggel, kis szobában."""
    rng = np.random.default_rng(1801)
    one = lume_switch(name, rng, 1.0)
    x = np.concatenate([one, one, np.zeros(int(0.3 * SR))])
    x = _reverb(x, seconds=0.12, mix=0.07, rng=rng)
    _write(path, x / np.max(np.abs(x)) * 0.7)


def synth(meta, path, switch='billeno'):
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
        if b['t'] > lights_off - 0.15:
            # a klikk körül a ketyegés egy pillanatra elcsendesedik, hogy a
            # kapcsoló magában szóljon, aztán az óra visszatér
            dt = b['t'] - lights_off
            gain *= 0.82 * (0.2 + 0.8 * min(1.0, max(0.0, (dt - 0.3) / 0.6)))
        if b['t'] > end_card:
            gain *= max(0.0, 1 - (b['t'] - end_card) / 2.6)
        seg = s[: total - start] * gain
        x[start:start + len(seg)] += seg


    # zárókártya: csendes, meleg lecsengés (két tiszta szinusz)
    pad_env = np.clip((t_all - end_card) / 0.9, 0, 1) * np.clip((dur - t_all) / 1.2, 0, 1)
    x += pad_env * (np.sin(2 * np.pi * 196 * t_all) * 0.05 + np.sin(2 * np.pi * 293.66 * t_all) * 0.035)

    # halk szobazaj (rózsaszín zaj közelítés)
    white = rng.standard_normal(total)
    pink = np.fft.irfft(np.fft.rfft(white) / np.sqrt(np.arange(1, total // 2 + 2)), total)
    x += pink / np.max(np.abs(pink)) * 0.006

    x = _reverb(x, rng=rng)

    # lámpa le: a klikk a zengetés után kerül be, hogy száraz és éles maradjon
    sw = _reverb(lume_switch(switch, np.random.default_rng(1801)), seconds=0.12, mix=0.07, rng=rng)
    sw = np.convolve(sw, [0.25, 0.5, 0.25], mode='same')  # a hallhatatlan legfelső él lágyítása
    sw = sw / np.max(np.abs(sw)) * np.max(np.abs(x)) * 2.2
    i = int((lights_off - PRE) * SR)
    seg = sw[: total - i]
    x[i:i + len(seg)] += seg
    fade = np.clip((dur - t_all) / 0.25, 0, 1) * np.clip(t_all / 0.02, 0, 1)
    x *= fade
    # hangosság: átlagszint beállítása, majd lágy limiter, ami a csúcsokat
    # (kattanás, ketyegés) arányában megtartja, csak a legtetejét kerekíti
    x = x / np.sqrt(np.mean(x ** 2)) * 0.064
    x = np.tanh(x / 0.5) * 0.5

    _write(path, x)
