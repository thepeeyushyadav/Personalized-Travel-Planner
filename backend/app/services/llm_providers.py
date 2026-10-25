from abc import ABC, abstractmethod
from typing import Optional


class LLMProvider(ABC):
    """Abstract base class for LLM providers."""

    @abstractmethod
    async def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Generate a response from the LLM."""
        pass


class GroqProvider(LLMProvider):
    """Groq API LLM provider."""

    def __init__(self, api_key: str, model: str = "llama3-8b-8192"):
        from groq import Groq
        self.client = Groq(api_key=api_key)
        self.model = model

    async def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            max_tokens=4096,
            temperature=0.7
        )
        return response.choices[0].message.content


class HuggingFaceProvider(LLMProvider):
    """Hugging Face Inference API provider."""

    def __init__(self, api_key: str, model: str = "mistralai/Mistral-7B-Instruct-v0.3"):
        self.api_key = api_key
        self.model = model
        self.api_url = f"https://api-inference.huggingface.co/models/{model}"

    async def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        import httpx
        full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
        headers = {"Authorization": f"Bearer {self.api_key}"}
        payload = {"inputs": full_prompt, "parameters": {"max_new_tokens": 2048}}

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(self.api_url, headers=headers, json=payload)
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                return data[0].get("generated_text", "")
            return str(data)


class OllamaProvider(LLMProvider):
    """Ollama local LLM provider."""

    def __init__(self, base_url: str = "http://localhost:11434", model: str = "llama3"):
        self.base_url = base_url
        self.model = model

    async def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        import httpx
        payload = {
            "model": self.model,
            "prompt": prompt,
            "system": system_prompt or "",
            "stream": False
        }
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(f"{self.base_url}/api/generate", json=payload)
            data = response.json()
            return data.get("response", "")
