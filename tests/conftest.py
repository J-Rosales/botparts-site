from __future__ import annotations

from pathlib import Path

import pytest

ROOT_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT_DIR / "src" / "data"


def _snapshot_data_files() -> dict[str, tuple[int, int]]:
    snapshot: dict[str, tuple[int, int]] = {}
    if not DATA_DIR.exists():
        return snapshot
    for path in DATA_DIR.rglob("*"):
        if path.is_file():
            stat = path.stat()
            snapshot[str(path)] = (stat.st_mtime_ns, stat.st_size)
    return snapshot


def _format_snapshot_diff(before: dict[str, tuple[int, int]], after: dict[str, tuple[int, int]]) -> str:
    before_keys = set(before)
    after_keys = set(after)
    added = sorted(after_keys - before_keys)
    removed = sorted(before_keys - after_keys)
    changed = sorted(
        path for path in before_keys & after_keys if before[path] != after[path]
    )
    lines = []
    if added:
        lines.append("Added files in src/data:")
        lines.extend(f"  + {path}" for path in added)
    if removed:
        lines.append("Removed files from src/data:")
        lines.extend(f"  - {path}" for path in removed)
    if changed:
        lines.append("Modified files in src/data:")
        lines.extend(f"  * {path}" for path in changed)
    return "\n".join(lines)


@pytest.fixture(scope="session", autouse=True)
def assert_data_read_only() -> None:
    before = _snapshot_data_files()
    yield
    after = _snapshot_data_files()
    if before != after:
        diff = _format_snapshot_diff(before, after)
        pytest.fail(
            "Tests must not write to src/data. Detected changes.\n" + diff
        )
