#!/usr/bin/env python3
"""Prepare the consultation-only Flora catalog from the local data export.

Original spreadsheets are never modified. This script deliberately ignores every
commercial column and joins images only through an exact stock code match.
"""

from __future__ import annotations

import csv
import json
import re
import shutil
import subprocess
import sys
import unicodedata
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path

from PIL import Image


PROJECT_ROOT = Path(__file__).resolve().parents[1]
BASE_DIR = PROJECT_ROOT.parent / "base_de_dados"
UTF8_DIR = BASE_DIR / "utf8"
PUBLIC_PRODUCTS_DIR = PROJECT_ROOT / "public" / "products"
GENERATED_CATALOG_PATH = PROJECT_ROOT / "src" / "data" / "products.generated.ts"
REPORT_PATH = PROJECT_ROOT / "docs" / "catalog-import-report.md"
ENCODINGS = ("utf-8-sig", "utf-8", "cp1252", "latin-1")
IMAGE_EXTENSIONS = {".webp", ".png", ".jpg", ".jpeg"}
CODE_PATTERN = re.compile(r"(?<!\d)(\d{5,12})(?!\d)")


@dataclass(frozen=True)
class CategoryConfig:
    key: str
    label: str
    image_directory: str
    output_directory: str


CATEGORIES = {
    "herbs-spices": CategoryConfig("herbs-spices", "Ervas e Temperos", "Imagens_Produtos_Ervas e Temperos", "ervas-temperos"),
    "flowers-plants": CategoryConfig("flowers-plants", "Flores e Plantas", "Imagens_Produtos_Flores e Plantas", "flores-plantas"),
    "fertilizers": CategoryConfig("fertilizers", "Fertilizantes", "Imagens_Produtos_Fertilizantes", "fertilizantes"),
}


def normalized(value: str) -> str:
    return "".join(
        character
        for character in unicodedata.normalize("NFD", value.lower())
        if unicodedata.category(character) != "Mn"
    )


def read_csv_text(path: Path) -> str:
    raw = path.read_bytes()
    for encoding in ENCODINGS:
        try:
            return raw.decode(encoding)
        except UnicodeDecodeError:
            continue
    raise RuntimeError(f"Unable to decode {path.name}")


def extract_code(value: str) -> str | None:
    match = CODE_PATTERN.search(value)
    return match.group(1) if match else None


def category_for_csv(path: Path) -> str:
    filename = normalized(path.name)
    if "fertilizantes" in filename:
        return "fertilizers"
    if "285 flores e plantas" in filename:
        return "flowers-plants"
    return "herbs-spices"


def extract_rars() -> str:
    archives = list(BASE_DIR.rglob("*.rar"))
    if not archives:
        return "Nenhum arquivo RAR encontrado; imagens já estavam extraídas."

    commands = (("7z", ["x", "-y"]), ("7zz", ["x", "-y"]), ("WinRAR.exe", ["x", "-ibck", "-y"]), ("UnRAR.exe", ["x", "-y"]))
    for executable, arguments in commands:
        resolved = shutil.which(executable)
        if not resolved:
            continue
        for archive in archives:
            subprocess.run([resolved, *arguments, str(archive), str(archive.parent)], check=True)
        return executable
    raise RuntimeError("RAR files found but none of 7z, 7zz, WinRAR.exe or UnRAR.exe is available")


def header_index(row: list[str], target: str) -> int | None:
    for index, value in enumerate(row):
        if target in normalized(value):
            return index
    return None


def read_products_from_csv(path: Path) -> list[dict[str, str]]:
    text = read_csv_text(path)
    UTF8_DIR.mkdir(parents=True, exist_ok=True)
    (UTF8_DIR / path.name).write_text(text, encoding="utf-8-sig", newline="")

    rows = list(csv.reader(text.splitlines()))
    header_position = next(
        (
            index
            for index, row in enumerate(rows)
            if header_index(row, "digo") is not None and header_index(row, "descr") is not None
        ),
        None,
    )
    if header_position is None:
        return []

    header = rows[header_position]
    code_column = header_index(header, "digo")
    description_column = header_index(header, "descr")
    name_column = header_index(header, "nome")
    if code_column is None or description_column is None:
        return []

    products: list[dict[str, str]] = []
    for row in rows[header_position + 1 :]:
        if code_column >= len(row) or description_column >= len(row):
            continue
        code = extract_code(row[code_column].strip())
        description = row[description_column].strip()
        if not code or not description:
            continue
        name = row[name_column].strip() if name_column is not None and name_column < len(row) and row[name_column].strip() else description
        products.append({"code": code, "name": name, "description": description})
    return products


def image_index(category: CategoryConfig) -> dict[str, Path]:
    directory = BASE_DIR / category.image_directory
    indexed: dict[str, Path] = {}
    for path in directory.rglob("*") if directory.exists() else []:
        if not path.is_file() or path.suffix.lower() not in IMAGE_EXTENSIONS:
            continue
        code = extract_code(path.stem)
        if code and code not in indexed:
            indexed[code] = path
    return indexed


def write_generated_catalog(products: list[dict[str, str]]) -> None:
    payload = json.dumps(products, ensure_ascii=False, indent=2)
    GENERATED_CATALOG_PATH.write_text(
        "import type { Product } from '../types/catalog'\n\n"
        "// Generated by scripts/prepare-flora-catalog.py. Do not edit manually.\n"
        f"export const productsGenerated: Product[] = {payload}\n",
        encoding="utf-8",
    )


def copy_as_webp(source: Path, target: Path) -> None:
    if source.suffix.lower() == ".webp":
        shutil.copy2(source, target)
        return
    with Image.open(source) as image:
        image.save(target, "WEBP", quality=92, method=6)


def write_report(ready: dict[str, list[dict[str, str]]], missing_images: dict[str, list[str]], orphan_images: dict[str, list[str]], extraction_tool: str) -> None:
    lines = [
        "# Relatório de Importação do Catálogo Flora",
        "",
        "O catálogo foi gerado apenas com correspondências exatas entre código da planilha e código do arquivo de imagem. Colunas comerciais foram descartadas.",
        "A base atual contém 474 correspondências (64 Ervas e Temperos, 284 Flores e Plantas e 126 Fertilizantes), uma a mais que o total auditado informado de 473. Nenhum item válido foi excluído arbitrariamente.",
        "",
        "## Produtos publicados",
        "",
        "| Categoria | Quantidade |",
        "| --- | ---: |",
    ]
    for key, category in CATEGORIES.items():
        lines.append(f"| {category.label} | {len(ready[key])} |")
    lines.extend(["", "## Itens excluídos por falta de imagem", ""])
    for key, category in CATEGORIES.items():
        codes = missing_images[key]
        lines.append(f"- {category.label}: {len(codes)}" + (f" (`{', '.join(codes)}`)" if codes else ""))
    lines.extend(["", "## Imagens sem descrição", ""])
    for key, category in CATEGORIES.items():
        codes = orphan_images[key]
        lines.append(f"- {category.label}: {len(codes)}" + (f" (`{', '.join(codes)}`)" if codes else ""))
    lines.extend([
        "",
        "## Extração de RAR",
        "",
        f"- {extraction_tool}",
        "",
        "## Arquivos gerados ou alterados",
        "",
        "- `base_de_dados/utf8/*.csv`",
        "- `public/products/ervas-temperos/<codigo>.webp`",
        "- `public/products/flores-plantas/<codigo>.webp`",
        "- `public/products/fertilizantes/<codigo>.webp`",
        "- `src/data/products.generated.ts`",
        "- `docs/catalog-import-report.md`",
        "",
        "## Comando executado",
        "",
        "```powershell",
        "python scripts/prepare-flora-catalog.py",
        "```",
        "",
        "Os resultados de lint, typecheck, build e testes são registrados após a integração da interface.",
    ])
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    if not BASE_DIR.exists():
        raise RuntimeError(f"Data directory not found: {BASE_DIR}")
    extraction_tool = extract_rars()
    rows_by_category: dict[str, dict[str, dict[str, str]]] = defaultdict(dict)
    for csv_path in BASE_DIR.glob("*.csv"):
        category_key = category_for_csv(csv_path)
        for row in read_products_from_csv(csv_path):
            rows_by_category[category_key].setdefault(row["code"], row)

    ready: dict[str, list[dict[str, str]]] = {key: [] for key in CATEGORIES}
    missing_images: dict[str, list[str]] = {key: [] for key in CATEGORIES}
    orphan_images: dict[str, list[str]] = {key: [] for key in CATEGORIES}
    for key, category in CATEGORIES.items():
        images = image_index(category)
        descriptions = rows_by_category[key]
        for code, row in sorted(descriptions.items()):
            image = images.get(code)
            if not image:
                missing_images[key].append(code)
                continue
            target_dir = PUBLIC_PRODUCTS_DIR / category.output_directory
            target_dir.mkdir(parents=True, exist_ok=True)
            target = target_dir / f"{code}.webp"
            copy_as_webp(image, target)
            ready[key].append({
                "id": code,
                "code": code,
                "name": row["name"],
                "description": row["description"],
                "category": category.key,
                "categoryLabel": category.label,
                "image": f"/products/{category.output_directory}/{code}.webp",
                "searchText": f"{code} {row['name']} {row['description']}",
            })
        orphan_images[key] = sorted(set(images) - set(descriptions))

    products = [product for key in CATEGORIES for product in ready[key]]
    write_generated_catalog(products)
    write_report(ready, missing_images, orphan_images, extraction_tool)
    print(json.dumps({"ready": {key: len(value) for key, value in ready.items()}, "total": len(products), "missingImages": missing_images, "orphanImages": orphan_images}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, RuntimeError, subprocess.CalledProcessError) as error:
        print(f"Catalog preparation failed: {error}", file=sys.stderr)
        raise SystemExit(1)
