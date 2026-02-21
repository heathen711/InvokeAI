#!/bin/bash
set -e

# Optionally install AMD nightly PyTorch wheels at runtime.
# Set NIGHTLY_INDEX to an architecture-specific AMD nightly index URL, e.g.:
#   https://rocm.nightlies.amd.com/v2-staging/gfx103X-dgpu/   (RDNA 2 discrete)
#   https://rocm.nightlies.amd.com/v2-staging/gfx1151/        (Strix Halo)
# When set, torch and torchvision are reinstalled from that index before startup.
if [ -n "${NIGHTLY_INDEX}" ]; then
    echo "==> Installing nightly PyTorch from ${NIGHTLY_INDEX}..."

    # rocm-sdk-devel provides the ROCm runtime libraries that nightly torch depends on
    uv pip install rocm-sdk-devel \
        --index-url "${NIGHTLY_INDEX}"

    # --upgrade forces uv past the already-installed stable wheels to the latest pre-release
    uv pip install --pre --upgrade \
        torch torchvision \
        --index-url "${NIGHTLY_INDEX}" \
        --extra-index-url https://pypi.org/simple/

    # Record installed versions for benchmark traceability
    {
        uv pip show torch       | awk '/^Version:/{print "torch=" $2}'
        uv pip show torchvision | awk '/^Version:/{print "torchvision=" $2}'
        uv pip show triton      | awk '/^Version:/{print "triton=" $2}'
        uv pip show rocm 2>/dev/null | awk '/^Version:/{print "rocm=" $2}' || true
    } > /opt/nightly-versions.txt
    echo "==> Nightly versions:"
    cat /opt/nightly-versions.txt
fi

TIMESTAMP=$(date -Iseconds)
LOG_DIR="/invokeai/root/logs/${SERVICE_NAME}"
LOG_FILE="${LOG_DIR}/${TIMESTAMP}.log"

mkdir -p "${LOG_DIR}"

# On the very first run invokeai.yaml does not exist yet — InvokeAI creates it on startup.
# Fall back to starting without a custom config so the container does not crash.
if [ -f /invokeai/root/invokeai.yaml ]; then
    TEMP_CONFIG="/tmp/invokeai.${SERVICE_NAME}.yaml"
    cp /invokeai/root/invokeai.yaml "$TEMP_CONFIG"
    cat >> "$TEMP_CONFIG" << CONFIG

log_handlers: ["console", "file=${LOG_FILE}"]
CONFIG
    exec invokeai-web --root /invokeai/root --config "$TEMP_CONFIG"
else
    exec invokeai-web --root /invokeai/root
fi
