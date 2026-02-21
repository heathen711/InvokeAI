# Docker ROCm Config Benchmark — Step-by-Step Guide

Benchmarks InvokeAI SDXL image generation across 6 ROCm environment configurations
running in Docker. Measures cold-start time (first image after launch) and sustained
throughput (subsequent images with warm caches).

**Hardware tested:** AMD Radeon PRO V620 (gfx1030 / RDNA 2, 30 GB VRAM)
**Model:** SDXL — Juggernaut XL v9 + sdxl-vae-fp16-fix
**Resolution:** 840×1256 @ 30 steps, dpmpp_3m_k, CFG 7.5

**Total time:** Allow 45–90 minutes for a full 6-config run (model downloads on first
run ~15–30 min, then ~10 minutes per config).

---

## Prerequisites

Before you begin, confirm all of the following are in place.

| Requirement | How to check / install |
|---|---|
| Linux host | Tested on Ubuntu 22.04 LTS |
| AMD GPU with ROCm support | ROCm ≥ 6.3; install from [rocm.docs.amd.com](https://rocm.docs.amd.com/) |
| Docker Engine 24+ | `docker --version`; install from [docs.docker.com](https://docs.docker.com/engine/install/) |
| Docker Compose v2 | `docker compose version` (note: `docker compose`, not `docker-compose`) |
| User in the `docker` group | `groups` should list `docker`; if not: `sudo usermod -aG docker $USER` then **log out and back in** |
| Python 3.10+ | `python3 --version` |
| `requests` Python library | `pip install requests` |
| Port 9090 free | Stop any running InvokeAI instance: `pkill -f invokeai-web` |
| Internet access | Required to pull the Docker image (~7 GB) and on the first run (models download from HuggingFace, ~6 GB) |
| ~20 GB free disk space | ~7 GB for Docker image + ~6 GB for models + working space |

---

## Step 1 — Clone the repository

```bash
git clone https://github.com/heathen711/InvokeAI.git ~/InvokeAI
cd ~/InvokeAI
```

All remaining commands in this guide are run from the `~/InvokeAI` directory unless
otherwise noted. If you cloned to a different location, substitute your path everywhere
`~/InvokeAI` appears.

---

## Step 2 — Pull the base Docker image

The benchmark uses `invokeai-amd:current` as its base image. Pull the pre-built image
from GitHub Container Registry (~7 GB download):

```bash
docker pull ghcr.io/heathen711/invokeai:amd-rocm7.1
docker tag  ghcr.io/heathen711/invokeai:amd-rocm7.1 invokeai-amd:current
```

This replaces the 10–20 minute build step. The image contains InvokeAI with
PyTorch 2.10 + ROCm 7.1 support, pre-installed and ready to run.

> **Prefer to build locally?** If you want to build from source instead, run:
> ```bash
> cd ~/InvokeAI
> docker build -f docker/Dockerfile.official -t invokeai-amd:current .
> ```
> This takes 10–20 minutes on the first build.

---

## Step 3 — Create your data directory and configure `.env`

The containers share a single InvokeAI data root (models, database, outputs). Create it:

```bash
mkdir -p ~/invokeai-data
```

Docker containers can only access GPU devices if they run with the same numeric group IDs
as the host. Copy the provided example file and fill in your values:

```bash
cd ~/InvokeAI
cp docker/.env.example docker/.env
nano docker/.env
```

Set the three required values (replace the `GID` commands below with their output):

```bash
# Find your group IDs:
getent group video | cut -d: -f3   # → VIDEO_GID  (typically 44)
getent group render | cut -d: -f3  # → RENDER_GID (typically 993)
```

Your `docker/.env` should look like this when done (use your actual numbers):

```
INVOKEAI_DATA_DIR=/home/YOUR_USERNAME/invokeai-data
VIDEO_GID=44
RENDER_GID=993
IMAGE_LABEL=official
```

Save and close: in `nano`, press **Ctrl+O**, **Enter**, then **Ctrl+X**.

**Optional hardware-specific overrides** (uncomment in `docker/.env` if needed):

| Variable | When to set |
|---|---|
| `HSA_OVERRIDE_GFX_VERSION` | GPU not natively recognised by the installed ROCm version (see `.env.example` for values) |
| `TORCH_BLAS_PREFER_HIPBLASLT` | Discrete GPUs only — **do not set on APUs** (causes regressions) |

---

## Step 4 — (Optional) Configure the nightly index

The `nightly` config installs AMD nightly PyTorch wheels at container startup — no
separate image build is needed. It uses the same `invokeai-amd:current` base image as
all other configs.

The default index targets RDNA 2 discrete GPUs. Override it in `docker/.env` if your
GPU is a different architecture:

| Architecture | Add this line to `docker/.env` |
|---|---|
| RDNA 2 discrete (gfx1030, V620) | *(default — no change needed)* |
| Strix Halo (gfx1151) | `NIGHTLY_INDEX=https://rocm.nightlies.amd.com/v2-staging/gfx1151/` |
| RDNA 3 discrete (gfx1100) | `NIGHTLY_INDEX=https://rocm.nightlies.amd.com/v2-staging/gfx110X-dgpu/` |

> **First run:** The nightly container downloads ~2.5 GB of wheels and installs them
> before InvokeAI starts. The benchmark script allows up to **8 minutes** for this.
> A Docker volume (`nightly-uv-cache`) caches the downloaded wheels so subsequent
> runs start in the normal ~50 seconds.
>
> **To clear the cache and force a fresh download:**
> ```bash
> docker volume rm docker_nightly-uv-cache
> ```

---

## Step 5 — Run the benchmark

```bash
cd ~/InvokeAI

python3 benchmarks/docker-config-benchmark.py
```

The script runs all 6 configs in sequence. For each one it:

1. Starts the Docker service
2. Waits for the InvokeAI API to become ready (up to 8 minutes for nightly, ~1 minute for others)
3. **First config only:** downloads the two required models from HuggingFace (~6 GB total — allow 15–30 minutes depending on connection speed)
4. Generates 2 images (cold-start warmup + warmed run) and records timing
5. Stops the service and waits 5 seconds before the next config

**To test only specific configs:**

```bash
# Run just the two most informative configs
python3 benchmarks/docker-config-benchmark.py find-mode-2-naive-off nightly
```

Available configs: `baseline`, `naive-off`, `find-mode-2-naive-off`,
`find-mode-5-naive-off`, `full-combo`, `nightly`

---

## Step 6 — Read the results

When the script finishes it prints the full path to two result files:

- `docker-benchmark-results.json` — raw timing data including nightly package versions
- `docker-benchmark-report.md` — formatted summary table

The files are written to a `test-data/` directory **at the same level as your `InvokeAI/`
folder**. If you cloned to `~/InvokeAI`, results are at `~/test-data/`.

**Warmup** = cold MIOpen kernel compilation time (one-time per config, per reboot).
**Warmed** = steady-state generation speed.

---

## Benchmark Results

**Hardware:** AMD Radeon PRO V620 (gfx1030 / RDNA 2, 30 GB VRAM)
**Date:** 2026-02-21
**InvokeAI:** v6.11.1.post1
**Nightly:** torch `2.11.0a0+rocm7.12.0a20260211`, triton `3.6.0+git3ea79241.rocm7.12.0a20260211`

| Config | Warmup (s) | Warmed (s) | Warmup speedup vs baseline | Status |
|---|---|---|---|---|
| `baseline` | 343.2 | 38.1 | — | OK |
| `naive-off` | 76.3 | 38.1 | 4.5× | OK |
| `find-mode-2-naive-off` | 58.2 | 38.5 | **5.9×** ← best stable | OK |
| `find-mode-5-naive-off` | 76.3 | 38.1 | 4.5× | OK |
| `full-combo` | 64.3 | 38.5 | 5.3× | OK |
| `nightly` | 48.1 | 40.1 | **7.1×** ← best overall | OK |

### Findings

- **Sustained throughput is identical across all configs** (~38–40 s/image). The MIOpen
  environment variables only affect cold-start kernel compilation time, not steady-state
  inference speed.

- **`find-mode-2-naive-off` is the best stable config** — 5.9× faster cold-start with
  no sustained penalty. Recommended for production use with official PyTorch ROCm wheels.

- **`find-mode-5` (heuristic mode) adds nothing** over plain `naive-off` on gfx1030 —
  both land at 76.3 s warmup. Mode 5 is not beneficial on RDNA 2.

- **`full-combo` warmup (64.3 s) is slower than `find-mode-2-naive-off` alone (58.2 s).**
  `PYTORCH_MIOPEN_SUGGEST_NHWC=0` and `PYTORCH_HIP_ALLOC_CONF` add ~6 s overhead on
  RDNA 2. NHWC tuning targets CDNA (MI200/MI300) hardware; it is mildly negative on RDNA.

- **Nightly wheels give the best cold-start (48.1 s)** but sustained ticks up by ~2 s
  (40.1 vs 38.1). The alpha torch 2.11 wheels are not yet at parity with stable 2.10 for
  sustained throughput on gfx1030.

---

## What Each Config Tests

| Config | Environment Variables | Purpose |
|---|---|---|
| `baseline` | _(none)_ | Default MIOpen exhaustive kernel search |
| `naive-off` | `MIOPEN_DEBUG_CONV_DIRECT_NAIVE_CONV_FWD=0` | Disable the slowest naive conv path |
| `find-mode-2-naive-off` | `MIOPEN_FIND_MODE=2` + naive-off | Fast kernel selection ← **best stable** |
| `find-mode-5-naive-off` | `MIOPEN_FIND_MODE=5` + naive-off | Heuristic kernel selection |
| `full-combo` | find-mode-2 + naive-off + `PYTORCH_MIOPEN_SUGGEST_NHWC=0` + `PYTORCH_HIP_ALLOC_CONF` | Memory allocator + NHWC layout tuning |
| `nightly` | find-mode-2 + naive-off + `PYTORCH_MIOPEN_SUGGEST_NHWC=0` + `TORCH_ROCM_AOTRITON_ENABLE_EXPERIMENTAL=1` + AMD nightly torch | Nightly wheels with all recommended flags |

**Variable notes:**
- `PYTORCH_MIOPEN_SUGGEST_NHWC=0` — NHWC layout hints target MI200/MI300 (CDNA). On RDNA
  hardware this defaults to `0` on ROCm < 7.0; setting it explicitly ensures correct
  behaviour on ROCm 7.x.
- `TORCH_ROCM_AOTRITON_ENABLE_EXPERIMENTAL=1` — AOTriton is the default in official
  PyTorch ROCm wheels (likely a no-op there), but AMD's nightly builds may gate
  additional paths behind this flag. Included in `nightly` where it is most relevant.

---

## Troubleshooting

**`permission denied while trying to connect to the Docker daemon`**
Your user is not in the `docker` group. Run:
```bash
sudo usermod -aG docker $USER
```
Then **log out and log back in** (or run `newgrp docker` in the current shell).

---

**`permission denied` on `/dev/kfd` or `/dev/dri`**
`VIDEO_GID` or `RENDER_GID` in `docker/.env` does not match the host system. Verify:
```bash
ls -la /dev/kfd /dev/dri/card* /dev/dri/renderD*
# /dev/dri/card*    → video group  → VIDEO_GID
# /dev/kfd          → render group → RENDER_GID
# /dev/dri/renderD* → render group → RENDER_GID
```
Update `docker/.env` with the correct numbers shown in the `ls` output.

---

**`Ports are not available: listen tcp 0.0.0.0:9090`**
Something is already using port 9090. Stop it before running the benchmark:
```bash
pkill -f invokeai-web
# or find and stop whatever is on port 9090:
sudo ss -tlnp | grep 9090
```

---

**API never becomes ready (timeout)**
Check what the container is doing:
```bash
docker compose -f ~/InvokeAI/docker/docker-compose.yml logs --tail=50
```
Common causes:
- *First run with empty data directory* — `invokeai.yaml` does not exist yet and InvokeAI
  is initialising. This is normal; the script's 8-minute timeout should cover it.
- *GPU not detected* — check the `VIDEO_GID` / `RENDER_GID` values above.
- *Nightly install still running* — the nightly config downloads ~2.5 GB before starting.
  Wait for the full 8-minute timeout before concluding it has failed.

---

**`amdgpu: device lost from bus` during generation**
GPU thermal throttling. Set fans to 100% before benchmarking:
```bash
echo 1   | sudo tee /sys/class/drm/card*/device/hwmon/hwmon*/pwm1_enable
echo 255 | sudo tee /sys/class/drm/card*/device/hwmon/hwmon*/pwm1
```
Reset fans to automatic control when done:
```bash
echo 2 | sudo tee /sys/class/drm/card*/device/hwmon/hwmon*/pwm1_enable
```

---

**Model download fails or times out**
Models (~6 GB) download from HuggingFace on the first run. If download fails:
1. Leave the first service running (`docker compose -f ~/InvokeAI/docker/docker-compose.yml up -d baseline`)
2. Open `http://localhost:9090` in your browser
3. Download the models manually via the InvokeAI web UI
4. Stop the service and re-run the benchmark

---

**`nightly` config fails during wheel install**
Check the container log (command above). Common causes:

- *No builds available today* — AMD's nightly index has a rolling window. Wait for the
  next build or check the index URL directly in your browser to confirm packages exist.
- *Wrong architecture index* — ensure `NIGHTLY_INDEX` in `docker/.env` matches your GPU.
  See the index table in Step 4.
- *Download timed out* — nightly wheels are ~2.5 GB total. Retry, or run the nightly
  config in isolation: `python3 benchmarks/docker-config-benchmark.py nightly`
