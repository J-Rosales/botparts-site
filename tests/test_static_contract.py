from __future__ import annotations

import json
from pathlib import Path

import pytest

ROOT_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT_DIR / "src" / "data"
SCHEMA_DIR = ROOT_DIR / "automation" / "schemas"


FORBIDDEN_ROOT_FILES = [
    "package.json",
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock",
    "bun.lockb",
    "webpack.config.js",
    "webpack.config.cjs",
    "webpack.config.mjs",
    "vite.config.js",
    "vite.config.ts",
    "rollup.config.js",
    "rollup.config.ts",
    "gulpfile.js",
    "gulpfile.cjs",
    "Gruntfile.js",
    "Makefile",
    "pyproject.toml",
    "requirements.txt",
    "requirements-dev.txt",
    "Pipfile",
    "Pipfile.lock",
    "setup.py",
    "setup.cfg",
    "poetry.lock",
]

FORBIDDEN_ROOT_DIRS = [
    "node_modules",
    "build",
    "dist",
    "generator",
    "generators",
    "data-src",
    "data_source",
    "raw-data",
    "raw_data",
    "source-data",
    "source_data",
    "inputs",
    "input-data",
    "input_data",
    "venv",
    ".venv",
]

FORBIDDEN_SRC_DIRS = [
    "data-src",
    "data_source",
    "raw-data",
    "raw_data",
    "source-data",
    "source_data",
    "inputs",
    "input-data",
    "input_data",
    "generator",
    "generators",
]


def load_json(path: Path) -> object:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def require_jsonschema():
    try:
        import jsonschema
    except ImportError as exc:  # pragma: no cover - explicit failure message
        pytest.fail(
            "jsonschema is required for schema validation tests. "
            "Install it in the test environment."
        )
    return jsonschema


def validate_against_schema(jsonschema, instance: object, schema: dict, path: Path) -> None:
    validator = jsonschema.Draft202012Validator(schema)
    errors = sorted(validator.iter_errors(instance), key=lambda err: err.path)
    if errors:
        message_lines = [f"Schema validation failed for {path}:"]
        for error in errors:
            location = " -> ".join(str(part) for part in error.path) or "<root>"
            message_lines.append(f"  - {location}: {error.message}")
        raise AssertionError("\n".join(message_lines))


def iter_character_dirs() -> list[Path]:
    characters_dir = DATA_DIR / "characters"
    if not characters_dir.exists():
        return []
    return [path for path in characters_dir.iterdir() if path.is_dir()]


def test_data_presence() -> None:
    index_path = DATA_DIR / "index.json"
    assert index_path.exists(), "Missing src/data/index.json"

    character_dirs = iter_character_dirs()
    assert character_dirs, "Expected at least one character directory in src/data/characters"

    for character_dir in character_dirs:
        manifest_path = character_dir / "manifest.json"
        fragments_dir = character_dir / "fragments"
        assert manifest_path.exists(), f"Missing manifest.json for {character_dir.name}"
        assert fragments_dir.exists(), f"Missing fragments/ directory for {character_dir.name}"
        assert fragments_dir.is_dir(), f"fragments is not a directory for {character_dir.name}"


def test_schema_validation() -> None:
    jsonschema = require_jsonschema()

    index_schema = load_json(SCHEMA_DIR / "index.schema.json")
    manifest_schema = load_json(SCHEMA_DIR / "manifest.schema.json")
    character_schema = load_json(SCHEMA_DIR / "character.schema.json")

    index_data = load_json(DATA_DIR / "index.json")
    validate_against_schema(jsonschema, index_data, index_schema, DATA_DIR / "index.json")

    for character_dir in iter_character_dirs():
        manifest_path = character_dir / "manifest.json"
        manifest_data = load_json(manifest_path)
        validate_against_schema(jsonschema, manifest_data, manifest_schema, manifest_path)

    for character_json in DATA_DIR.rglob("character.json"):
        character_data = load_json(character_json)
        validate_against_schema(jsonschema, character_data, character_schema, character_json)


def test_no_generator_logic_present() -> None:
    forbidden_files = [
        path for name in FORBIDDEN_ROOT_FILES if (path := ROOT_DIR / name).exists()
    ]
    if forbidden_files:
        formatted = "\n".join(f"  - {path}" for path in forbidden_files)
        pytest.fail("Generator/build files must not be present:\n" + formatted)

    forbidden_dirs = [
        path
        for name in FORBIDDEN_ROOT_DIRS
        if (path := ROOT_DIR / name).exists()
    ]
    if forbidden_dirs:
        formatted = "\n".join(f"  - {path}" for path in forbidden_dirs)
        pytest.fail("Generator/build directories must not be present:\n" + formatted)

    forbidden_src_dirs = [
        path
        for name in FORBIDDEN_SRC_DIRS
        if (path := (ROOT_DIR / "src" / name)).exists()
    ]
    if forbidden_src_dirs:
        formatted = "\n".join(f"  - {path}" for path in forbidden_src_dirs)
        pytest.fail("Source input directories must not be present:\n" + formatted)

    scripts_dir = ROOT_DIR / "scripts"
    if scripts_dir.exists():
        script_files = [path for path in scripts_dir.iterdir() if path.is_file()]
        if script_files:
            formatted = "\n".join(f"  - {path}" for path in script_files)
            pytest.fail("Generator scripts must not be present:\n" + formatted)


def test_static_integrity_basics() -> None:
    index_data = load_json(DATA_DIR / "index.json")
    entries = index_data.get("entries", [])
    assert isinstance(entries, list), "index.json entries must be a list"
    assert entries, "index.json entries must not be empty"

    for entry in entries:
        for field in ("slug", "name", "description", "tags", "dataPath"):
            assert field in entry, f"index.json entry missing {field}"

        data_path = entry["dataPath"]
        assert isinstance(data_path, str), "index.json dataPath must be a string"
        data_path_clean = data_path.lstrip("/")
        data_file = ROOT_DIR / "src" / data_path_clean
        assert data_file.exists(), f"dataPath does not resolve to file: {data_path}"

        if data_file.name == "manifest.json":
            manifest = load_json(data_file)
            slug = entry.get("slug")
            if slug is not None:
                assert (
                    manifest.get("slug") == slug
                ), f"Manifest slug mismatch for {data_file}"
