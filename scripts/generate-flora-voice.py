#!/usr/bin/env python3
"""Generate Flora's pre-recorded voice lines with a free neural TTS voice.

Uses edge-tts (Microsoft Edge's public read-aloud service) -- no API key,
no account, no cost. The generated mp3 files are bundled into the app and
played locally at runtime, so the totem never needs a network call to speak.

Run this once whenever the phrases below (kept in sync with
src/features/flora/tips.ts) change, then commit the resulting mp3 files.

    pip install edge-tts
    python scripts/generate-flora-voice.py
"""

from __future__ import annotations

import asyncio
from pathlib import Path

import edge_tts

VOICE = "pt-BR-FranciscaNeural"
PROJECT_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = PROJECT_ROOT / "public" / "audio" / "flora"

# Keep in sync with the `tips` object in src/features/flora/tips.ts.
PHRASES = {
    "home": "Olá! Eu sou a Flora. Toque em uma opção abaixo para começarmos: escolher uma planta, comparar plantas, ver o catálogo ou tirar dúvidas sobre cuidados.",
    "categorias": "Use a busca ou os filtros para encontrar rápido.",
    "escolher": "Respondendo as perguntas, eu cruzo com o catálogo e indico as melhores opções.",
    "comparar": "Escolha até duas plantas para eu comparar os cuidados.",
    "scanner": "Aponte a câmera, ou peça para o leitor do totem escanear o produto.",
    "acesso": "Entre com seu celular para ver suas dicas e histórico salvos.",
    "favoritos": "Aqui ficam os produtos que você salvou.",
    "historico": "Estes são os últimos produtos que você consultou.",
    "cuidados": "Dicas gerais para manter suas plantas saudáveis.",
    "ajuda": "Se precisar, chame também um de nossos vendedores.",
    "pedido": "Mostre esta lista para um vendedor quando for até o caixa.",
    "produto": "Veja os cuidados e os produtos que combinam com essa planta.",
    "fallback": "Precisa de ajuda? Estou por aqui!",
}


async def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for tip_id, text in PHRASES.items():
        output_path = OUTPUT_DIR / f"{tip_id}.mp3"
        communicate = edge_tts.Communicate(text, VOICE)
        await communicate.save(str(output_path))
        print(f"Wrote {output_path.relative_to(PROJECT_ROOT)}")


if __name__ == "__main__":
    asyncio.run(main())
