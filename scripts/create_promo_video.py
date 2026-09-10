from __future__ import annotations

import math
import sys
import wave
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "scripts" / "video-src"
OUT = ROOT / "public" / "marketing"
WIDTH, HEIGHT = 1280, 720
FPS, DURATION = 30, 10.0

FONT_DISPLAY = Path(r"C:\Windows\Fonts\bahnschrift.ttf")
FONT_BODY = Path(r"C:\Windows\Fonts\segoeui.ttf")
FONT_BOLD = Path(r"C:\Windows\Fonts\segoeuib.ttf")


def clamp(value: float, minimum: float = 0.0, maximum: float = 1.0) -> float:
    return max(minimum, min(maximum, value))


def smooth(value: float) -> float:
    value = clamp(value)
    return value * value * (3.0 - 2.0 * value)


def ease_out(value: float) -> float:
    value = clamp(value)
    return 1.0 - (1.0 - value) ** 3


def segment(t: float, start: float, end: float) -> float:
    return clamp((t - start) / (end - start))


def font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(path), size=size)


def cover(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    target_w, target_h = size
    ratio = max(target_w / image.width, target_h / image.height)
    resized = image.resize(
        (round(image.width * ratio), round(image.height * ratio)),
        Image.Resampling.LANCZOS,
    )
    left = (resized.width - target_w) // 2
    top = (resized.height - target_h) // 2
    return resized.crop((left, top, left + target_w, top + target_h))


def rounded_image(image: Image.Image, size: tuple[int, int], radius: int) -> Image.Image:
    fitted = cover(image.convert("RGB"), size).convert("RGBA")
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    fitted.putalpha(mask)
    return fitted


def generic_rpg_desktop(image: Image.Image) -> Image.Image:
    """Replace account-specific task titles with neutral demo content."""
    result = image.copy()
    draw = ImageDraw.Draw(result)
    demo_font = font(FONT_BOLD, 15)
    rows = [
        ((460, 281, 850, 319), 296, "PLANEJAR A SEMANA"),
        ((460, 397, 850, 438), 414, "EXERCÍCIO"),
        ((460, 514, 850, 557), 532, "FOCO PROFUNDO"),
        ((460, 626, 850, 672), 646, "REVISAR PROJETO"),
    ]
    for box, text_y, label in rows:
        sample_y = min(image.height - 1, box[1] + 8)
        card_color = image.getpixel((700, sample_y))
        draw.rectangle(box, fill=card_color)
        draw.text((472, text_y), label, font=demo_font, fill=(248, 249, 255))
    return result


def generic_rpg_mobile(image: Image.Image) -> Image.Image:
    """Create a privacy-safe mobile demo while preserving the genuine UI."""
    result = image.copy()
    draw = ImageDraw.Draw(result)
    demo_font = font(FONT_BOLD, 14)
    rows = [
        ((88, 326, 240, 366), 340, "PLANEJAR"),
        ((88, 442, 240, 481), 456, "EXERCÍCIO"),
        ((88, 547, 182, 587), 561, "FOCO"),
        ((88, 670, 182, 710), 684, "REVISÃO"),
        ((88, 775, 240, 811), 789, "LEITURA"),
    ]
    for box, text_y, label in rows:
        sample_y = 760 if label == "LEITURA" else min(image.height - 1, box[1] + 8)
        card_color = image.getpixel((150, sample_y))
        draw.rectangle(box, fill=card_color)
        draw.text((98, text_y), label, font=demo_font, fill=(248, 249, 255))
    return result


def gradient_background(light: bool) -> Image.Image:
    x = np.linspace(0.0, 1.0, WIDTH, dtype=np.float32)[None, :, None]
    y = np.linspace(0.0, 1.0, HEIGHT, dtype=np.float32)[:, None, None]
    if light:
        top = np.array([250, 252, 255], dtype=np.float32)
        bottom = np.array([232, 238, 248], dtype=np.float32)
        side = np.array([224, 228, 248], dtype=np.float32)
    else:
        top = np.array([4, 8, 20], dtype=np.float32)
        bottom = np.array([10, 13, 34], dtype=np.float32)
        side = np.array([23, 11, 54], dtype=np.float32)
    base = top * (1.0 - y) + bottom * y
    base = np.broadcast_to(base, (HEIGHT, WIDTH, 3)).copy()
    base = base * (1.0 - 0.18 * x) + side * (0.18 * x)
    return Image.fromarray(np.uint8(np.clip(base, 0, 255)), "RGB").convert("RGBA")


LIGHT_BG = gradient_background(True)
DARK_BG = gradient_background(False)


def glow(canvas: Image.Image, xy: tuple[int, int], radius: int, color: tuple[int, int, int], alpha: int) -> None:
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    x, y = xy
    draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=(*color, alpha))
    layer = layer.filter(ImageFilter.GaussianBlur(radius // 2))
    canvas.alpha_composite(layer)


def add_grid(canvas: Image.Image, opacity: int) -> None:
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    for x in range(0, WIDTH, 64):
        draw.line((x, 0, x, HEIGHT), fill=(117, 139, 255, opacity), width=1)
    for y in range(0, HEIGHT, 64):
        draw.line((0, y, WIDTH, y), fill=(117, 139, 255, opacity), width=1)
    canvas.alpha_composite(layer)


def gradient_text(
    canvas: Image.Image,
    xy: tuple[int, int],
    text: str,
    text_font: ImageFont.FreeTypeFont,
    colors: tuple[tuple[int, int, int], tuple[int, int, int]],
    alpha: int = 255,
) -> None:
    bbox = text_font.getbbox(text)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    mask = Image.new("L", (tw + 8, th + 8), 0)
    md = ImageDraw.Draw(mask)
    md.text((4 - bbox[0], 4 - bbox[1]), text, font=text_font, fill=alpha)
    grad = Image.new("RGBA", mask.size)
    gd = ImageDraw.Draw(grad)
    for x in range(mask.width):
        p = x / max(1, mask.width - 1)
        color = tuple(round(colors[0][i] * (1 - p) + colors[1][i] * p) for i in range(3))
        gd.line((x, 0, x, mask.height), fill=(*color, 255))
    grad.putalpha(mask)
    canvas.alpha_composite(grad, xy)


def logo_lockup(canvas: Image.Image, x: int, y: int, scale: float, light_text: bool, alpha: int = 255) -> None:
    icon_size = round(58 * scale)
    icon = ICON.resize((icon_size, icon_size), Image.Resampling.LANCZOS).convert("RGBA")
    if alpha != 255:
        icon.putalpha(icon.getchannel("A").point(lambda value: value * alpha // 255))
    canvas.alpha_composite(icon, (x, y))
    name_font = font(FONT_BOLD, round(38 * scale))
    text_color = (245, 248, 255, alpha) if light_text else (10, 20, 40, alpha)
    ImageDraw.Draw(canvas).text((x + icon_size + round(16 * scale), y + round(4 * scale)), "NEURO", font=name_font, fill=text_color)
    prefix_width = ImageDraw.Draw(canvas).textlength("NEURO", font=name_font)
    gradient_text(
        canvas,
        (round(x + icon_size + 16 * scale + prefix_width), y + round(4 * scale)),
        "SYNC",
        name_font,
        ((74, 105, 255), (245, 69, 196)),
        alpha,
    )


def monitor(screen: Image.Image, scale: float = 1.0) -> Image.Image:
    sw, sh = round(690 * scale), round(327 * scale)
    bezel = round(13 * scale)
    pad = round(20 * scale)
    stand_h = round(85 * scale)
    total_w, total_h = sw + pad * 2, sh + pad * 2 + stand_h
    result = Image.new("RGBA", (total_w, total_h), (0, 0, 0, 0))
    shadow = Image.new("RGBA", result.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((12, 14, total_w - 12, sh + pad * 2 + 18), radius=25, fill=(0, 0, 0, 125))
    shadow = shadow.filter(ImageFilter.GaussianBlur(round(14 * scale)))
    result.alpha_composite(shadow)
    draw = ImageDraw.Draw(result)
    frame_box = (pad // 2, pad // 2, total_w - pad // 2, sh + pad + pad // 2)
    draw.rounded_rectangle(frame_box, radius=round(20 * scale), fill=(22, 28, 43, 255), outline=(112, 126, 166, 180), width=max(1, round(2 * scale)))
    prepared = rounded_image(screen, (sw, sh), radius=round(8 * scale))
    result.alpha_composite(prepared, (pad, pad))
    cx = total_w // 2
    draw.polygon(
        [(cx - round(55 * scale), sh + pad), (cx + round(55 * scale), sh + pad), (cx + round(75 * scale), total_h - round(15 * scale)), (cx - round(75 * scale), total_h - round(15 * scale))],
        fill=(25, 31, 48, 255),
    )
    draw.rounded_rectangle((cx - round(105 * scale), total_h - round(20 * scale), cx + round(105 * scale), total_h - round(8 * scale)), radius=8, fill=(16, 21, 35, 255))
    return result


def phone(screen: Image.Image, scale: float = 1.0) -> Image.Image:
    sw, sh = round(190 * scale), round(430 * scale)
    bezel = round(10 * scale)
    total_w, total_h = sw + bezel * 2, sh + bezel * 2
    result = Image.new("RGBA", (total_w + 28, total_h + 28), (0, 0, 0, 0))
    shadow = Image.new("RGBA", result.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle((20, 18, total_w + 8, total_h + 10), radius=32, fill=(0, 0, 0, 150))
    result.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(12)))
    draw = ImageDraw.Draw(result)
    draw.rounded_rectangle((8, 6, total_w + 8, total_h + 6), radius=round(28 * scale), fill=(14, 19, 31, 255), outline=(111, 127, 172, 190), width=2)
    prepared = rounded_image(screen, (sw, sh), radius=round(20 * scale))
    result.alpha_composite(prepared, (8 + bezel, 6 + bezel))
    notch_w = round(58 * scale)
    draw.rounded_rectangle((8 + total_w // 2 - notch_w // 2, 9, 8 + total_w // 2 + notch_w // 2, 9 + round(13 * scale)), radius=7, fill=(7, 10, 18, 255))
    return result


def paste_scaled(canvas: Image.Image, item: Image.Image, xy: tuple[float, float], scale: float, alpha: float = 1.0) -> None:
    scale = max(0.01, scale)
    resized = item.resize((max(1, round(item.width * scale)), max(1, round(item.height * scale))), Image.Resampling.LANCZOS)
    if alpha < 0.999:
        resized.putalpha(resized.getchannel("A").point(lambda value: round(value * clamp(alpha))))
    canvas.alpha_composite(resized, (round(xy[0]), round(xy[1])))


def pill(canvas: Image.Image, xy: tuple[int, int], label: str, dark: bool, alpha: int = 255) -> None:
    label_font = font(FONT_BOLD, 15)
    tw = round(ImageDraw.Draw(canvas).textlength(label, font=label_font))
    x, y = xy
    draw = ImageDraw.Draw(canvas)
    fill = (14, 22, 40, alpha) if not dark else (255, 255, 255, alpha)
    text_color = (255, 255, 255, alpha) if not dark else (16, 22, 38, alpha)
    draw.rounded_rectangle((x, y, x + tw + 34, y + 34), radius=17, fill=fill)
    draw.text((x + 17, y + 7), label, font=label_font, fill=text_color)


def feature_copy(canvas: Image.Image, t: float, rpg: bool, alpha: float, x_offset: float = 0) -> None:
    draw = ImageDraw.Draw(canvas)
    x = round(58 + x_offset)
    label = "MODO RPG" if rpg else "MODO PROFISSIONAL"
    pill(canvas, (x, 153), label, dark=rpg, alpha=round(255 * alpha))
    title = "TRANSFORME ROTINA\nEM JORNADA" if rpg else "ORGANIZE COM\nCLAREZA"
    title_font = font(FONT_DISPLAY, 44 if rpg else 54)
    title_color = (250, 251, 255, round(255 * alpha)) if rpg else (8, 20, 42, round(255 * alpha))
    draw.multiline_text((x, 205), title, font=title_font, fill=title_color, spacing=-2)
    if rpg:
        gradient_text(canvas, (x, 333), "MISSÕES • FOCO • PROGRESSO", font(FONT_BOLD, 18), ((131, 78, 255), (239, 68, 195)), round(255 * alpha))
        body = "Transforme tarefas em conquistas\ne mantenha sua evolução visível."
        body_color = (179, 188, 215, round(255 * alpha))
    else:
        gradient_text(canvas, (x, 333), "TAREFAS • PROJETOS • AGENDA", font(FONT_BOLD, 18), ((40, 99, 235), (15, 160, 130)), round(255 * alpha))
        body = "Planeje sua semana, proteja suas\nprioridades e execute o que importa."
        body_color = (74, 88, 112, round(255 * alpha))
    draw.multiline_text((x, 377), body, font=font(FONT_BODY, 23), fill=body_color, spacing=10)


def render_frame(t: float) -> Image.Image:
    # Background transitions: dark brand opening -> professional light -> RPG dark.
    light_mix = smooth(segment(t, 0.75, 1.55)) * (1.0 - smooth(segment(t, 3.85, 4.75)))
    canvas = Image.blend(DARK_BG, LIGHT_BG, light_mix)
    add_grid(canvas, 10 if light_mix > 0.5 else 14)
    drift = math.sin(t * 0.65) * 45
    glow(canvas, (round(1080 + drift), 90), 260, (80, 86, 255), 35 if light_mix < 0.5 else 20)
    glow(canvas, (round(950 - drift), 650), 230, (231, 63, 200), 26 if light_mix < 0.5 else 14)

    # Opening brand lockup.
    opening_alpha = 1.0 - smooth(segment(t, 0.72, 1.35))
    if opening_alpha > 0:
        p = ease_out(segment(t, 0.0, 0.6))
        logo_x = round(444 - (1 - p) * 18)
        logo_y = 250
        logo_lockup(canvas, logo_x, logo_y, 1.35, True, round(255 * opening_alpha * p))
        sub = "UMA CONTA. DUAS EXPERIÊNCIAS."
        sf = font(FONT_BOLD, 18)
        sw = ImageDraw.Draw(canvas).textlength(sub, font=sf)
        ImageDraw.Draw(canvas).text(((WIDTH - sw) / 2, 348), sub, font=sf, fill=(174, 187, 220, round(255 * opening_alpha * p)))

    # Professional section.
    pro_in = ease_out(segment(t, 0.9, 1.75))
    pro_out = 1.0 - smooth(segment(t, 3.85, 4.55))
    pro_alpha = pro_in * pro_out
    if pro_alpha > 0:
        feature_copy(canvas, t, False, pro_alpha, x_offset=-(1 - pro_in) * 28)
        device_x = 515 + (1 - pro_in) * 170
        monitor_y = 118 + math.sin(t * 1.3) * 3
        paste_scaled(canvas, PRO_MONITOR, (device_x, monitor_y), 0.86 + 0.04 * pro_in, pro_alpha)
        paste_scaled(canvas, PRO_PHONE, (1010 + (1 - pro_in) * 120, 178), 0.88, pro_alpha)

    # RPG section.
    rpg_in = ease_out(segment(t, 4.05, 4.8))
    rpg_out = 1.0 - smooth(segment(t, 7.15, 7.75))
    rpg_alpha = rpg_in * rpg_out
    if rpg_alpha > 0:
        feature_copy(canvas, t, True, rpg_alpha, x_offset=-(1 - rpg_in) * 28)
        device_x = 515 + (1 - rpg_in) * 170
        monitor_y = 118 + math.sin(t * 1.35) * 3
        paste_scaled(canvas, RPG_MONITOR, (device_x, monitor_y), 0.86 + 0.04 * rpg_in, rpg_alpha)
        paste_scaled(canvas, RPG_PHONE, (1010 + (1 - rpg_in) * 120, 178), 0.88, rpg_alpha)

    # Final brand frame.
    final_in = ease_out(segment(t, 7.15, 7.9))
    if final_in > 0:
        veil = Image.new("RGBA", canvas.size, (5, 8, 22, round(190 * final_in)))
        canvas.alpha_composite(veil)
        glow(canvas, (640, 580), 310, (94, 78, 255), round(40 * final_in))
        logo_lockup(canvas, 459, 92, 1.0, True, round(255 * final_in))
        headline_font = font(FONT_DISPLAY, 52)
        line1 = "ORGANIZE SUA ROTINA."
        line2 = "EVOLUA NO SEU RITMO."
        draw = ImageDraw.Draw(canvas)
        w1 = draw.textlength(line1, font=headline_font)
        draw.text(((WIDTH - w1) / 2, 194), line1, font=headline_font, fill=(250, 251, 255, round(255 * final_in)))
        w2 = draw.textlength(line2, font=headline_font)
        gradient_text(canvas, (round((WIDTH - w2) / 2), 259), line2, headline_font, ((81, 108, 255), (242, 73, 199)), round(255 * final_in))

        # Small dual-mode desktop cards reinforce the two experiences.
        left_thumb = rounded_image(PRO_DESKTOP, (360, 171), 12)
        right_thumb = rounded_image(RPG_DESKTOP, (360, 171), 12)
        paste_scaled(canvas, left_thumb, (251, 356 + (1 - final_in) * 35), 1.0, final_in)
        paste_scaled(canvas, right_thumb, (669, 356 + (1 - final_in) * 35), 1.0, final_in)
        draw.rounded_rectangle((251, 356, 611, 527), radius=12, outline=(235, 240, 255, round(105 * final_in)), width=2)
        draw.rounded_rectangle((669, 356, 1029, 527), radius=12, outline=(126, 105, 255, round(150 * final_in)), width=2)
        pill(canvas, (373, 542), "MODO PROFISSIONAL", dark=True, alpha=round(255 * final_in))
        pill(canvas, (735, 542), "MODO RPG", dark=True, alpha=round(255 * final_in))
        cta_font = font(FONT_BOLD, 22)
        cta = "ESCOLHA SEU MODO"
        cta_w = draw.textlength(cta, font=cta_font)
        button_box = (round((WIDTH - cta_w) / 2 - 30), 618, round((WIDTH + cta_w) / 2 + 30), 666)
        button = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        bd = ImageDraw.Draw(button)
        bd.rounded_rectangle(button_box, radius=24, fill=(87, 88, 244, round(245 * final_in)))
        button = button.filter(ImageFilter.GaussianBlur(0.2))
        canvas.alpha_composite(button)
        draw = ImageDraw.Draw(canvas)
        draw.text(((WIDTH - cta_w) / 2, 629), cta, font=cta_font, fill=(255, 255, 255, round(255 * final_in)))

    # Global cinematic fade in/out.
    fade = min(ease_out(segment(t, 0.0, 0.25)), 1.0 - smooth(segment(t, 9.65, 10.0)))
    if fade < 1.0:
        black = Image.new("RGBA", canvas.size, (2, 4, 12, round(255 * (1.0 - fade))))
        canvas.alpha_composite(black)
    return canvas.convert("RGB")


def create_music(path: Path) -> None:
    sample_rate = 44_100
    count = round(DURATION * sample_rate)
    t = np.arange(count, dtype=np.float64) / sample_rate
    music = np.zeros(count, dtype=np.float64)

    # Original ambient electronic pad: Cm -> Ab -> Eb -> Bb.
    chords = [
        (130.81, 155.56, 196.00),
        (103.83, 130.81, 155.56),
        (155.56, 196.00, 233.08),
        (116.54, 146.83, 174.61),
    ]
    chord_length = DURATION / len(chords)
    for index, chord in enumerate(chords):
        start = index * chord_length
        local = t - start
        active = (local >= 0) & (local < chord_length + 0.35)
        env = np.zeros_like(t)
        env[active] = np.sin(np.pi * np.clip(local[active] / (chord_length + 0.35), 0, 1)) ** 0.45
        for frequency in chord:
            pad = np.sin(2 * np.pi * frequency * t + 0.18 * np.sin(2 * np.pi * 0.17 * t))
            pad += 0.35 * np.sin(2 * np.pi * frequency * 2 * t)
            music += 0.045 * env * pad

    # Soft rhythmic pulse and glassy arpeggio.
    pulse_notes = [261.63, 311.13, 392.00, 466.16, 392.00, 311.13, 261.63, 196.00]
    step = 0.3125
    for i in range(math.ceil(DURATION / step)):
        start = i * step
        local = t - start
        env = np.exp(-local * 8.0) * (local >= 0)
        note = pulse_notes[i % len(pulse_notes)]
        tone = np.sin(2 * np.pi * note * local) + 0.25 * np.sin(2 * np.pi * note * 2 * local)
        music += 0.035 * env * tone

    # Subtle beat, intentionally restrained for a productivity ad.
    for beat in np.arange(0.6, DURATION, 0.625):
        local = t - beat
        env = np.exp(-local * 13.0) * (local >= 0)
        kick = np.sin(2 * np.pi * (72 - 25 * np.clip(local, 0, 0.2)) * local)
        music += 0.07 * env * kick

    # Transition swells at the mode change and final card.
    rng = np.random.default_rng(42)
    noise = rng.normal(0, 1, count)
    noise = np.convolve(noise, np.ones(360) / 360, mode="same")
    for center in (4.25, 7.45):
        rise = np.clip((t - (center - 0.65)) / 0.65, 0, 1)
        fall = np.exp(-np.maximum(t - center, 0) * 8)
        window = rise * fall * (t < center + 0.45)
        music += 0.16 * window * noise

    # Final resolving chime.
    for frequency, delay in ((523.25, 7.65), (659.25, 7.78), (783.99, 7.91)):
        local = t - delay
        env = np.exp(-local * 2.4) * (local >= 0)
        music += 0.035 * env * np.sin(2 * np.pi * frequency * local)

    fade_in = np.clip(t / 0.35, 0, 1)
    fade_out = np.clip((DURATION - t) / 0.55, 0, 1)
    music *= fade_in * fade_out
    peak = max(1e-6, np.max(np.abs(music)))
    music = np.tanh(music / peak * 1.45) * 0.72
    stereo = np.stack([music, np.roll(music, 310) * 0.98], axis=1)
    pcm = np.int16(np.clip(stereo, -1, 1) * 32767)
    with wave.open(str(path), "wb") as output:
        output.setnchannels(2)
        output.setsampwidth(2)
        output.setframerate(sample_rate)
        output.writeframes(pcm.tobytes())


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    audio_path = OUT / "neurosync-promo-10s-trilha.wav"
    video_path = OUT / "neurosync-promo-10s.mp4"
    create_music(audio_path)

    sys.path.insert(0, str(ROOT / ".video-tools-local"))
    import imageio_ffmpeg  # noqa: PLC0415

    writer = imageio_ffmpeg.write_frames(
        str(video_path),
        (WIDTH, HEIGHT),
        pix_fmt_in="rgb24",
        pix_fmt_out="yuv420p",
        fps=FPS,
        quality=7,
        codec="libx264",
        macro_block_size=16,
        ffmpeg_log_level="warning",
        audio_path=str(audio_path),
        audio_codec="aac",
        output_params=["-movflags", "+faststart", "-shortest", "-t", str(DURATION)],
    )
    writer.send(None)
    try:
        for frame_index in range(round(FPS * DURATION)):
            frame_time = frame_index / FPS
            writer.send(np.asarray(render_frame(frame_time), dtype=np.uint8).tobytes())
            if frame_index % FPS == 0:
                print(f"Renderizando {frame_index // FPS + 1}/{round(DURATION)}s", flush=True)
    finally:
        writer.close()
    print(video_path)


PRO_DESKTOP = Image.open(SRC / "professional-desktop.png").convert("RGB")
RPG_DESKTOP = generic_rpg_desktop(Image.open(SRC / "rpg-desktop.png").convert("RGB"))
PRO_MOBILE = Image.open(SRC / "professional-mobile.png").convert("RGB")
RPG_MOBILE = generic_rpg_mobile(Image.open(SRC / "rpg-mobile.png").convert("RGB"))
ICON = Image.open(ROOT / "public" / "IconNeuroSyncProfessional.png").convert("RGBA")
PRO_MONITOR = monitor(PRO_DESKTOP)
RPG_MONITOR = monitor(RPG_DESKTOP)
PRO_PHONE = phone(PRO_MOBILE)
RPG_PHONE = phone(RPG_MOBILE)


if __name__ == "__main__":
    main()
