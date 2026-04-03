import os
import subprocess
import sys
import time
from pathlib import Path


def resolve_python(base_dir: Path) -> str:
    shared_python = base_dir / ".venv" / "Scripts" / "python.exe"
    chatbot_python = base_dir / "chatbotbackend" / ".venv" / "Scripts" / "python.exe"

    if shared_python.exists():
        return str(shared_python)
    if chatbot_python.exists():
        return str(chatbot_python)
    return sys.executable


def terminate_process(proc: subprocess.Popen) -> None:
    if proc.poll() is not None:
        return

    try:
        proc.terminate()
        proc.wait(timeout=8)
    except Exception:
        try:
            proc.kill()
        except Exception:
            pass


def main() -> int:
    base_dir = Path(__file__).resolve().parent
    chatbot_dir = base_dir / "chatbotbackend"
    route_safety_dir = base_dir / "routesafetybackend"
    bike_recommendation_dir = base_dir / "bikerecommendationbackend"
    price_predict_dir = base_dir / "pricepredictbackend"

    python_exe = resolve_python(base_dir)
    env = os.environ.copy()
    env["PYTHONUNBUFFERED"] = "1"

    chatbot_proc = subprocess.Popen(
        [python_exe, "app.py"],
        cwd=str(chatbot_dir),
        env=env,
    )
    route_proc = subprocess.Popen(
        [python_exe, "app.py"],
        cwd=str(route_safety_dir),
        env=env,
    )
    bike_proc = subprocess.Popen(
        [python_exe, "app.py"],
        cwd=str(bike_recommendation_dir),
        env=env,
    )
    price_proc = subprocess.Popen(
        [python_exe, "app.py"],
        cwd=str(price_predict_dir),
        env=env,
    )

    print("Started AI chatbot backend on http://127.0.0.1:8000")
    print("Started route safety backend on http://127.0.0.1:5001")
    print("Started bike recommendation backend on http://127.0.0.1:5002")
    print("Started price prediction backend on http://127.0.0.1:5003")
    print("All AI services are running in this terminal")

    try:
        while True:
            chatbot_code = chatbot_proc.poll()
            route_code = route_proc.poll()
            bike_code = bike_proc.poll()
            price_code = price_proc.poll()

            if chatbot_code is not None:
                print(f"Chatbot backend exited with code {chatbot_code}")
                terminate_process(route_proc)
                return chatbot_code

            if route_code is not None:
                print(f"Route safety backend exited with code {route_code}")
                terminate_process(chatbot_proc)
                terminate_process(bike_proc)
                terminate_process(price_proc)
                return route_code

            if bike_code is not None:
                print(f"Bike recommendation backend exited with code {bike_code}")
                terminate_process(chatbot_proc)
                terminate_process(route_proc)
                terminate_process(price_proc)
                return bike_code

            if price_code is not None:
                print(f"Price prediction backend exited with code {price_code}")
                terminate_process(chatbot_proc)
                terminate_process(route_proc)
                terminate_process(bike_proc)
                return price_code

            time.sleep(0.5)
    except KeyboardInterrupt:
        print("Stopping all AI services...")
        terminate_process(chatbot_proc)
        terminate_process(route_proc)
        terminate_process(bike_proc)
        terminate_process(price_proc)
        return 0


if __name__ == "__main__":
    sys.exit(main())
