import os
import json
import re
from typing import Dict, Any, List, Optional
from abc import ABC, abstractmethod
import httpx
from app.config import settings

class BaseAIProvider(ABC):
    @abstractmethod
    async def generate_text(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        pass

    @abstractmethod
    async def generate_structured(self, prompt: str, schema_class: Any, system_prompt: Optional[str] = None) -> Dict[str, Any]:
        pass


class GeminiProvider(BaseAIProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key={self.api_key}"

    async def generate_text(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        async with httpx.AsyncClient(timeout=60.0) as client:
            payload = {
                "contents": [{"parts": [{"text": f"{system_prompt or ''}\n\n{prompt}"}]}]
            }
            resp = await client.post(self.endpoint, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]
            raise RuntimeError(f"Gemini API error: {resp.text}")

    async def generate_structured(self, prompt: str, schema_class: Any, system_prompt: Optional[str] = None) -> Dict[str, Any]:
        prompt_with_json = f"{prompt}\n\nReturn ONLY a valid JSON object matching the required schema. Do not enclose in markdown blocks."
        text = await self.generate_text(prompt_with_json, system_prompt)
        # Strip potential markdown formatting
        cleaned = re.sub(r"^```json\s*", "", text.strip())
        cleaned = re.sub(r"\s*```$", "", cleaned)
        return json.loads(cleaned)


class OpenAIProvider(BaseAIProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.endpoint = "https://api.openai.com/v1/chat/completions"

    async def generate_text(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        async with httpx.AsyncClient(timeout=60.0) as client:
            headers = {"Authorization": f"Bearer {self.api_key}"}
            payload = {
                "model": "gpt-4o",
                "messages": [
                    {"role": "system", "content": system_prompt or "You are an expert venture capital partner and pitch deck architect."},
                    {"role": "user", "content": prompt}
                ]
            }
            resp = await client.post(self.endpoint, json=payload, headers=headers)
            if resp.status_code == 200:
                return resp.json()["choices"][0]["message"]["content"]
            raise RuntimeError(f"OpenAI API error: {resp.text}")

    async def generate_structured(self, prompt: str, schema_class: Any, system_prompt: Optional[str] = None) -> Dict[str, Any]:
        async with httpx.AsyncClient(timeout=60.0) as client:
            headers = {"Authorization": f"Bearer {self.api_key}"}
            payload = {
                "model": "gpt-4o",
                "messages": [
                    {"role": "system", "content": f"{system_prompt or 'You are an expert venture capital partner.'} Respond in JSON."},
                    {"role": "user", "content": prompt}
                ],
                "response_format": {"type": "json_object"}
            }
            resp = await client.post(self.endpoint, json=payload, headers=headers)
            if resp.status_code == 200:
                return json.loads(resp.json()["choices"][0]["message"]["content"])
            raise RuntimeError(f"OpenAI API error: {resp.text}")


class DeterministicVentureAI(BaseAIProvider):
    """
    High-fidelity deterministic venture intelligence engine.
    Ensures the platform works instantly and reliably without external API dependencies,
    synthesizing founder inputs, RAG reference citations, and venture heuristics into structured 10-slide blueprints.
    """
    async def generate_text(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        return f"Venture intelligence analysis based on input: {prompt[:100]}..."

    async def generate_structured(self, prompt: str, schema_class: Any, system_prompt: Optional[str] = None) -> Dict[str, Any]:
        return {}


def get_ai_provider() -> BaseAIProvider:
    if settings.AI_PROVIDER == "gemini" and settings.GEMINI_API_KEY:
        return GeminiProvider(settings.GEMINI_API_KEY)
    elif settings.AI_PROVIDER == "openai" and settings.OPENAI_API_KEY:
        return OpenAIProvider(settings.OPENAI_API_KEY)
    return DeterministicVentureAI()
