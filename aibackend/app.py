import subprocess
import sys
from pathlib import Path


def main() -> int:
    base_dir = Path(__file__).resolve().parent
    launcher = base_dir / "run-ai-backends.ps1"

    if not launcher.exists():
        print(f"Launcher not found: {launcher}")
        return 1

    # Delegate to the existing PowerShell launcher that starts both services.
    cmd = [
        "powershell",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        str(launcher),
    ]

    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as exc:
        print(f"Failed to start backends (exit code {exc.returncode}).")
        return exc.returncode

    return 0


if __name__ == "__main__":
    sys.exit(main())
