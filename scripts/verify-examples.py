"""Execute deterministic, local Python examples without accessing production data."""
import pathlib
import re
import subprocess
import sys
import tempfile

root = pathlib.Path(__file__).resolve().parents[1]
count = 0
with tempfile.TemporaryDirectory() as work:
    for chapter in sorted((root / "chapters").glob("*.md")):
        for code in re.findall(r"```python\n(.*?)```", chapter.read_text(encoding="utf-8"), re.S):
            result = subprocess.run([sys.executable, "-c", code], cwd=work, capture_output=True, text=True, timeout=20)
            if result.returncode:
                raise RuntimeError(f"{chapter.name}: {result.stderr}")
            print(chapter.name, result.stdout.strip())
            count += 1
assert count >= 3, "Expected at least three Python examples"
print(f"Verified {count} Python code examples")
