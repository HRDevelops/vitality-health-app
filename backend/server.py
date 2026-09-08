"""
Infra shim required by the platform's supervisor config (uvicorn on :8001).
The real Vitality Health & Fitness API is a Node.js/Express + TypeScript app
living in /app/server (Repository -> Service -> Controller pattern).
This process spawns that Express app as a child process and transparently
reverse-proxies every /api/* request to it. It contains zero business logic.
"""
import os
import asyncio
import subprocess
from pathlib import Path

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

load_dotenv(Path(__file__).parent / ".env")

NODE_SERVER_DIR = str(Path(__file__).parent.parent / "server")
NODE_PORT = os.environ.get("NODE_SERVER_PORT", "8010")

app = FastAPI(title="Vitality API Gateway")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

node_process: subprocess.Popen | None = None


@app.on_event("startup")
async def start_node_backend():
    global node_process
    # Defensively free the internal port in case a previous reload cycle
    # left an orphaned Express process bound to it.
    subprocess.run(["fuser", "-k", f"{NODE_PORT}/tcp"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    await asyncio.sleep(1)
    child_env = {**os.environ, "PORT": NODE_PORT}
    node_process = subprocess.Popen(
        ["yarn", "dev"],
        cwd=NODE_SERVER_DIR,
        env=child_env,
    )
    async with httpx.AsyncClient() as client:
        for _ in range(60):
            try:
                r = await client.get(f"http://localhost:{NODE_PORT}/api/v1/health", timeout=2.0)
                if r.status_code < 500:
                    break
            except Exception:
                pass
            await asyncio.sleep(1)


@app.on_event("shutdown")
def stop_node_backend():
    if node_process is not None:
        node_process.terminate()
        try:
            node_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            node_process.kill()
    subprocess.run(["fuser", "-k", f"{NODE_PORT}/tcp"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def proxy(path: str, request: Request):
    target_url = f"http://localhost:{NODE_PORT}/api/{path}"
    body = await request.body()
    forward_headers = {
        k: v for k, v in request.headers.items() if k.lower() not in ("host", "content-length")
    }
    async with httpx.AsyncClient() as client:
        upstream = await client.request(
            request.method,
            target_url,
            params=request.query_params,
            headers=forward_headers,
            content=body,
            timeout=30.0,
        )
    response_headers = {
        k: v
        for k, v in upstream.headers.items()
        if k.lower() not in ("content-encoding", "transfer-encoding", "content-length", "connection")
    }
    return Response(
        content=upstream.content,
        status_code=upstream.status_code,
        headers=response_headers,
        media_type=upstream.headers.get("content-type"),
    )
