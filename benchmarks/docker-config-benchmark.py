#!/usr/bin/env python3
"""
Docker Config Benchmark for InvokeAI SDXL on AMD ROCm

Cycles through docker-compose service configs, enqueues 2 standardized SDXL
images per config via the InvokeAI REST API, and records generation times.

Image 1 (pink bunny girl) = cold/warmup run
Image 2 (black bunny girl) = warmed cache run

Works on a clean install: loads the graph from sdxl_benchmark_graph.json,
auto-installs required models via the InvokeAI API if not present, and
resolves installation-specific model keys at runtime.

Usage:
    python3 benchmarks/docker-config-benchmark.py [config ...]
"""

import argparse
import json
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

try:
    import requests
except ImportError:
    print("ERROR: requests library required. Install with: pip install requests")
    sys.exit(1)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

CONFIGS = [
    "baseline",
    "naive-off",
    "find-mode-2-naive-off",
    "find-mode-5-naive-off",
    "full-combo",
    "nightly",
]

TEST_IMAGES = [
    {"prompt": "pink bunny girl", "seed": 1796950436, "label": "warmup"},
    {"prompt": "black bunny girl", "seed": 1796950436, "label": "warmed"},
]

REQUIRED_MODELS = [
    {
        "placeholder": "__MAIN_MODEL_KEY__",
        "name": "Juggernaut XL v9",
        "source": "RunDiffusion/Juggernaut-XL-v9",
        "type": "main",
    },
    {
        "placeholder": "__VAE_MODEL_KEY__",
        "name": "sdxl-vae-fp16-fix",
        "source": "madebyollin/sdxl-vae-fp16-fix",
        "type": "vae",
    },
]

API_BASE = "http://127.0.0.1:9090/api/v1"
API_V2_BASE = "http://127.0.0.1:9090/api/v2"
COMPOSE_FILE = Path(__file__).resolve().parent.parent / "docker" / "docker-compose.yml"
GRAPH_TEMPLATE = Path(__file__).resolve().parent / "sdxl_benchmark_graph.json"
RESULTS_DIR = Path(__file__).resolve().parent.parent.parent / "test-data"

API_READY_TIMEOUT = 480   # seconds to wait for API to come up (nightly installs wheels at startup, needs extra time)
MODEL_INSTALL_TIMEOUT = 600  # seconds to wait for model download
IMAGE_TIMEOUT = 600       # seconds to wait per image generation
POLL_INTERVAL = 2         # seconds between status polls

SEED_NODE_PATH = "seed:k3517Vrfxw"
PROMPT_NODE_PATH = "positive_prompt:lmDrO5N1Xg"


# ---------------------------------------------------------------------------
# Graph loading and model resolution
# ---------------------------------------------------------------------------

def load_graph_template():
    """Load the SDXL graph template from JSON. Dies with a clear message if missing."""
    if not GRAPH_TEMPLATE.exists():
        print(f"ERROR: Graph template not found at {GRAPH_TEMPLATE}")
        print("Re-generate it with: python3 benchmarks/extract_graph_template.py")
        sys.exit(1)

    with open(GRAPH_TEMPLATE) as f:
        graph = json.load(f)

    if SEED_NODE_PATH not in graph.get("nodes", {}):
        print(f"ERROR: Expected seed node '{SEED_NODE_PATH}' not in graph template.")
        sys.exit(1)
    if PROMPT_NODE_PATH not in graph.get("nodes", {}):
        print(f"ERROR: Expected prompt node '{PROMPT_NODE_PATH}' not in graph template.")
        sys.exit(1)

    print(f"Loaded graph template: {len(graph['nodes'])} nodes, {len(graph['edges'])} edges")
    return graph


def find_model_key(model_name, model_type):
    """Look up a model's installation key by name and type via the API."""
    try:
        resp = requests.get(f"{API_V2_BASE}/models/?model_type={model_type}", timeout=10)
        if resp.status_code != 200:
            return None
        for model in resp.json().get("models", []):
            if model.get("name") == model_name:
                return model.get("key")
    except (requests.ConnectionError, requests.Timeout):
        pass
    return None


def install_model(source):
    """Trigger a model install from HuggingFace. Returns install job id or None."""
    try:
        resp = requests.post(
            f"{API_V2_BASE}/models/install",
            params={"source": source},
            json={},
            timeout=30,
        )
        if resp.status_code in (200, 201):
            return resp.json().get("id")
    except (requests.ConnectionError, requests.Timeout):
        pass
    return None


def wait_for_install(job_id, source):
    """Poll install job until complete or timeout. Returns True on success."""
    print(f"    Downloading {source}...", end="", flush=True)
    start = time.time()
    while time.time() - start < MODEL_INSTALL_TIMEOUT:
        try:
            resp = requests.get(f"{API_V2_BASE}/models/install/{job_id}", timeout=10)
            if resp.status_code == 200:
                job = resp.json()
                status = job.get("status")
                total = job.get("total_bytes", 0)
                done = job.get("bytes", 0)
                if total:
                    print(f"\r    Downloading {source}: {done/1e6:.0f}/{total/1e6:.0f}MB ({done/total*100:.0f}%)  ",
                          end="", flush=True)
                if status == "completed":
                    print(f"\r    Downloaded {source} ({total/1e6:.0f}MB)                    ")
                    return True
                if status == "error":
                    print(f"\r    ERROR downloading {source}: {job.get('error')}")
                    return False
        except (requests.ConnectionError, requests.Timeout):
            pass
        time.sleep(3)
    print(f"\r    TIMEOUT downloading {source}")
    return False


def ensure_models_installed():
    """
    Check each required model is installed; download any that are missing.
    Returns a {placeholder: key} mapping for graph resolution, or exits on failure.
    """
    print("  Checking required models...")
    model_keys = {}
    installs_needed = []

    for spec in REQUIRED_MODELS:
        key = find_model_key(spec["name"], spec["type"])
        if key:
            print(f"    {spec['name']}: found ({key[:8]}...)")
            model_keys[spec["placeholder"]] = key
        else:
            print(f"    {spec['name']}: not found, will install from {spec['source']}")
            installs_needed.append(spec)

    for spec in installs_needed:
        job_id = install_model(spec["source"])
        if job_id is None:
            print(f"  ERROR: Failed to trigger install for {spec['source']}")
            return None
        if not wait_for_install(job_id, spec["source"]):
            print(f"  ERROR: Install failed for {spec['source']}")
            return None
        key = find_model_key(spec["name"], spec["type"])
        if not key:
            # Model may have been registered under a slightly different name; search by source
            print(f"  WARNING: Could not find '{spec['name']}' after install. Check model manager.")
            return None
        model_keys[spec["placeholder"]] = key

    return model_keys


def resolve_graph(template, model_keys):
    """Substitute model key placeholders in the graph template."""
    raw = json.dumps(template)
    for placeholder, key in model_keys.items():
        raw = raw.replace(placeholder, key)
    return json.loads(raw)


# ---------------------------------------------------------------------------
# Docker helpers
# ---------------------------------------------------------------------------

def docker_compose(*args):
    """Run a docker compose command and return the result."""
    cmd = ["docker", "compose", "-f", str(COMPOSE_FILE)] + list(args)
    print(f"  $ {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if result.returncode != 0:
        print(f"  STDERR: {result.stderr.strip()}")
    return result


def start_service(service_name):
    """Start a docker-compose service."""
    print(f"\n  Starting service '{service_name}'...")
    result = docker_compose("up", "-d", service_name)
    if result.returncode != 0:
        print(f"  ERROR: Failed to start {service_name}")
        return False
    return True


def stop_service():
    """Stop all docker-compose services."""
    print("  Stopping services...")
    docker_compose("down")


def get_nightly_versions(service_name):
    """Fetch nightly package versions from a running container. Returns dict or None."""
    if service_name != "nightly":
        return None
    try:
        result = subprocess.run(
            ["docker", "compose", "-f", str(COMPOSE_FILE),
             "exec", "-T", service_name, "cat", "/opt/nightly-versions.txt"],
            capture_output=True, text=True, timeout=15,
        )
        if result.returncode != 0:
            print(f"  WARNING: Could not read nightly versions: {result.stderr.strip()}")
            return None
        versions = {}
        for line in result.stdout.strip().splitlines():
            if "=" in line:
                key, val = line.split("=", 1)
                versions[key.strip()] = val.strip()
        print(f"  Nightly versions: {versions}")
        return versions
    except (subprocess.TimeoutExpired, OSError) as e:
        print(f"  WARNING: Could not read nightly versions: {e}")
        return None


# ---------------------------------------------------------------------------
# API helpers
# ---------------------------------------------------------------------------

def wait_for_api():
    """Poll the API version endpoint until it responds or timeout."""
    print(f"  Waiting for API (up to {API_READY_TIMEOUT}s)...", end="", flush=True)
    start = time.time()
    backoff = 2

    while time.time() - start < API_READY_TIMEOUT:
        try:
            resp = requests.get(f"{API_BASE}/app/version", timeout=5)
            if resp.status_code == 200:
                version = resp.json().get("version", "unknown")
                elapsed = time.time() - start
                print(f" ready in {elapsed:.1f}s (v{version})")
                return True
        except (requests.ConnectionError, requests.Timeout):
            pass
        print(".", end="", flush=True)
        time.sleep(backoff)
        backoff = min(backoff * 1.5, 10)

    print(f" TIMEOUT after {API_READY_TIMEOUT}s")
    return False


def enqueue_image(graph, prompt, seed):
    """Enqueue a single image generation and return the batch_id."""
    payload = {
        "batch": {
            "graph": graph,
            "runs": 1,
            "data": [[
                {"node_path": SEED_NODE_PATH, "field_name": "value", "items": [seed]},
                {"node_path": PROMPT_NODE_PATH, "field_name": "value", "items": [prompt]},
            ]],
        },
        "prepend": False,
    }

    resp = requests.post(
        f"{API_BASE}/queue/default/enqueue_batch",
        json=payload,
        timeout=30,
    )

    if resp.status_code not in (200, 201):
        print(f"  ERROR: Enqueue failed ({resp.status_code}): {resp.text[:200]}")
        return None

    result = resp.json()
    batch_id = result.get("batch", {}).get("batch_id")
    enqueued = result.get("enqueued", 0)
    print(f"  Enqueued: batch_id={batch_id}, items={enqueued}")
    return batch_id


def wait_for_batch(batch_id):
    """Poll batch status until complete, failed, or timeout. Returns elapsed seconds or None."""
    start = time.time()

    while time.time() - start < IMAGE_TIMEOUT:
        try:
            resp = requests.get(
                f"{API_BASE}/queue/default/b/{batch_id}/status",
                timeout=10,
            )
            if resp.status_code != 200:
                time.sleep(POLL_INTERVAL)
                continue

            status = resp.json()
            completed = status.get("completed", 0)
            failed = status.get("failed", 0)
            canceled = status.get("canceled", 0)
            in_progress = status.get("in_progress", 0)
            pending = status.get("pending", 0)
            total = status.get("total", 1)

            if failed > 0:
                elapsed = time.time() - start
                print(f"  FAILED after {elapsed:.1f}s")
                return None

            if canceled > 0:
                elapsed = time.time() - start
                print(f"  CANCELED after {elapsed:.1f}s")
                return None

            if completed >= total and in_progress == 0 and pending == 0:
                elapsed = time.time() - start
                print(f"  Completed in {elapsed:.1f}s")
                return elapsed

        except (requests.ConnectionError, requests.Timeout):
            pass

        time.sleep(POLL_INTERVAL)

    elapsed = time.time() - start
    print(f"  TIMEOUT after {elapsed:.1f}s")
    return None


# ---------------------------------------------------------------------------
# Results
# ---------------------------------------------------------------------------

def save_results(results):
    """Write results to JSON and markdown report."""
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)

    json_path = RESULTS_DIR / "docker-benchmark-results.json"
    with open(json_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nResults saved to {json_path}")

    md_path = RESULTS_DIR / "docker-benchmark-report.md"
    lines = [
        "# Docker Config Benchmark Results",
        "",
        f"**Date:** {results['timestamp']}",
        f"**Compose file:** `{COMPOSE_FILE}`",
        f"**Model:** SDXL (Juggernaut XL v9)",
        "",
        "## Results",
        "",
        "| Config | Warmup (s) | Warmed (s) | Speedup | Status |",
        "|--------|-----------|-----------|---------|--------|",
    ]

    for entry in results["configs"]:
        name = entry["config"]
        warmup = entry["images"][0]
        warmed = entry["images"][1]

        warmup_time = f"{warmup['time_s']:.1f}" if warmup["time_s"] is not None else "FAIL"
        warmed_time = f"{warmed['time_s']:.1f}" if warmed["time_s"] is not None else "FAIL"

        if warmup["time_s"] and warmed["time_s"]:
            speedup = f"{warmup['time_s'] / warmed['time_s']:.2f}x"
            status = "OK"
        else:
            speedup = "N/A"
            status = "FAIL"

        lines.append(f"| {name} | {warmup_time} | {warmed_time} | {speedup} | {status} |")

    nightly_entries = [e for e in results["configs"] if e.get("nightly_versions")]
    if nightly_entries:
        lines.extend(["", "## Nightly Package Versions", ""])
        for entry in nightly_entries:
            lines.append(f"**{entry['config']}:**")
            for pkg, ver in entry["nightly_versions"].items():
                lines.append(f"- {pkg}: `{ver}`")
            lines.append("")

    lines.extend([
        "",
        "## Test Parameters",
        "",
        f"- **Image 1 (warmup):** \"{TEST_IMAGES[0]['prompt']}\" seed={TEST_IMAGES[0]['seed']}",
        f"- **Image 2 (warmed):** \"{TEST_IMAGES[1]['prompt']}\" seed={TEST_IMAGES[1]['seed']}",
        "- **Resolution:** 840x1256",
        "- **Steps:** 30, Scheduler: dpmpp_3m_k, CFG: 7.5",
        "",
        "## Notes",
        "",
        "- Warmup time includes MIOpen kernel compilation (cold cache)",
        "- Warmed time represents sustained performance",
        "- Each config runs in isolation (docker compose down between configs)",
        "",
    ])

    with open(md_path, "w") as f:
        f.write("\n".join(lines))
    print(f"Report saved to {md_path}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Docker Config Benchmark for InvokeAI SDXL")
    parser.add_argument("configs", nargs="*", default=None,
                        help=f"Configs to test (default: all). Choices: {', '.join(CONFIGS)}")
    args = parser.parse_args()

    configs_to_run = args.configs if args.configs else CONFIGS
    for c in configs_to_run:
        if c not in CONFIGS:
            print(f"ERROR: Unknown config '{c}'. Choices: {', '.join(CONFIGS)}")
            sys.exit(1)

    print("=" * 60)
    print("Docker Config Benchmark - InvokeAI SDXL on AMD ROCm")
    print("=" * 60)
    print()

    if not COMPOSE_FILE.exists():
        print(f"ERROR: docker-compose.yml not found at {COMPOSE_FILE}")
        sys.exit(1)

    print(f"Compose file: {COMPOSE_FILE}")
    print(f"Graph template: {GRAPH_TEMPLATE}")
    print(f"Configs to test: {', '.join(configs_to_run)}")
    print(f"Images per config: {len(TEST_IMAGES)}")
    print()

    graph_template = load_graph_template()
    print()

    # model_keys is resolved once the first service is up; reused across configs
    model_keys = None

    results = {
        "timestamp": datetime.now().isoformat(),
        "compose_file": str(COMPOSE_FILE),
        "configs": [],
    }

    for i, config_name in enumerate(configs_to_run):
        print("=" * 60)
        print(f"[{i+1}/{len(configs_to_run)}] Config: {config_name}")
        print("=" * 60)

        config_result = {
            "config": config_name,
            "images": [],
        }

        def record_fail(error):
            for img in TEST_IMAGES:
                config_result["images"].append({
                    "prompt": img["prompt"], "seed": img["seed"],
                    "label": img["label"], "time_s": None, "error": error,
                })
            results["configs"].append(config_result)

        if not start_service(config_name):
            record_fail("service_start_failed")
            continue

        if not wait_for_api():
            record_fail("api_timeout")
            stop_service()
            continue

        # Resolve model keys on first successful API connection
        if model_keys is None:
            model_keys = ensure_models_installed()
            if model_keys is None:
                record_fail("model_install_failed")
                stop_service()
                continue
            graph = resolve_graph(graph_template, model_keys)
            print(f"  Graph resolved with {len(model_keys)} model key(s)")

        nightly_versions = get_nightly_versions(config_name)
        if nightly_versions:
            config_result["nightly_versions"] = nightly_versions

        for img in TEST_IMAGES:
            print(f"\n  Generating: \"{img['prompt']}\" (seed={img['seed']}, {img['label']})...")

            batch_id = enqueue_image(graph, img["prompt"], img["seed"])
            if batch_id is None:
                config_result["images"].append({
                    "prompt": img["prompt"], "seed": img["seed"],
                    "label": img["label"], "time_s": None, "error": "enqueue_failed",
                })
                continue

            elapsed = wait_for_batch(batch_id)
            config_result["images"].append({
                "prompt": img["prompt"],
                "seed": img["seed"],
                "label": img["label"],
                "time_s": round(elapsed, 2) if elapsed is not None else None,
                "error": None if elapsed is not None else "timeout_or_failed",
            })

        results["configs"].append(config_result)

        print()
        stop_service()

        if i < len(configs_to_run) - 1:
            print("  Cooling down for 5s...")
            time.sleep(5)

    print()
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print()

    print(f"{'Config':<30} {'Warmup (s)':>10} {'Warmed (s)':>10}")
    print("-" * 52)
    for entry in results["configs"]:
        warmup = entry["images"][0]["time_s"]
        warmed = entry["images"][1]["time_s"]
        warmup_str = f"{warmup:.1f}" if warmup is not None else "FAIL"
        warmed_str = f"{warmed:.1f}" if warmed is not None else "FAIL"
        print(f"{entry['config']:<30} {warmup_str:>10} {warmed_str:>10}")
        if entry.get("nightly_versions"):
            for pkg, ver in entry["nightly_versions"].items():
                print(f"  {pkg}={ver}")

    print()
    save_results(results)
    print("\nDone.")


if __name__ == "__main__":
    main()
