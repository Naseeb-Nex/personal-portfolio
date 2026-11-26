import asyncio
import httpx
import json
import sys

BASE_URL = "http://localhost:8000/api"

async def test_agent():
    async with httpx.AsyncClient() as client:
        # 1. Get session token
        print("--- Initializing Session ---")
        init_res = await client.post(f"{BASE_URL}/session/init")
        if init_res.status_code != 200:
            print(f"Failed to init session: {init_res.text}")
            return
            
        data = init_res.json()
        token = data["token"]
        print(f"Session token: {token}\n")
        
        headers = {"Authorization": f"Bearer {token}"}
        
        queries = [
            "Tell me about yourself (summary)",
            "What is your education?",
            "What are your technical skills?",
            "Where have you worked?",
            "Do you have any certifications?",
            "Tell me about the Beach Sand project."
        ]
        
        for q in queries:
            print(f"--- Query: {q} ---")
            async with client.stream("POST", f"{BASE_URL}/chat/stream", json={"message": q}, headers=headers, timeout=60.0) as response:
                if response.status_code != 200:
                    print(f"Error {response.status_code}: {await response.aread()}")
                    continue
                    
                async for line in response.aiter_lines():
                    if not line.strip(): continue
                    if line.startswith("data: "):
                        content = line[6:]
                        if content == "[DONE]":
                            print("[DONE]")
                        else:
                            try:
                                parsed = json.loads(content)
                                if "type" in parsed and parsed["type"] not in ["thinking", "text"]:
                                    print(f"UI Component Emitted: {parsed['type']}")
                                    print(f"Data: {json.dumps(parsed.get('data', {}), indent=2)}")
                                elif parsed.get("type") == "text":
                                    print(f"Agent Text: {parsed.get('content')}")
                            except json.JSONDecodeError:
                                print(f"Raw data: {content}")
            print("\n")
            await asyncio.sleep(5)

if __name__ == "__main__":
    asyncio.run(test_agent())
