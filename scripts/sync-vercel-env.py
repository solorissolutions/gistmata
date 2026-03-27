from __future__ import annotations

import subprocess
import sys
from pathlib import Path


TARGETS = ("production", "preview", "development")
VERCEL_CLI = r"C:\Users\Owner\AppData\Roaming\npm\vercel.cmd"
KEYS = (
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_SECRET_KEY",
    "DATABASE_URL",
    "DIRECT_URL",
    "ALLOW_OGA_DEMO_ACCESS",
    "GEMINI_API_KEY",
)


def read_env_file(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        values[key.strip()] = value
    return values


def sync_value(key: str, target: str, value: str) -> None:
    args = [VERCEL_CLI, "env", "add", key, target, "--force"]
    if target != "development":
        args.append("--sensitive")
    result = subprocess.run(
        args,
        input=f"{value}\n",
        text=True,
        capture_output=True,
        check=False,
    )
    output = f"{result.stdout}{result.stderr}"
    if result.returncode == 0 or "already exists" in output.lower():
        print(f"OK {key} {target}")
        return
    print(output, file=sys.stderr, end="")
    raise SystemExit(result.returncode or 1)


def main() -> None:
    env_path = Path(".env.local")
    if not env_path.exists():
        raise SystemExit(".env.local not found")

    values = read_env_file(env_path)
    for key in KEYS:
        value = values.get(key)
        if value is None:
            print(f"SKIP {key}")
            continue
        for target in TARGETS:
            sync_value(key, target, value)


if __name__ == "__main__":
    main()
