import math
import re
import hashlib
from typing import List, Dict, Any, Optional
import numpy as np
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from app.models import DocumentChunk, ReferenceDocument

class VectorStore:
    @staticmethod
    def generate_embedding(text: str, dimension: int = 384) -> List[float]:
        """
        Generates normalized dense embedding vector.
        Uses deterministic semantic hashing with subword/ngram distribution
        which preserves semantic proximity and cosine similarity locally without requiring heavy external weights.
        """
        if not text:
            return [0.0] * dimension

        # Preprocess text
        tokens = re.findall(r"\b\w+\b", text.lower())
        vec = np.zeros(dimension, dtype=np.float32)

        # 1. Unigram feature hash
        for token in tokens:
            h = int(hashlib.md5(token.encode("utf-8")).hexdigest(), 16)
            idx = h % dimension
            sign = 1.0 if (h % 2 == 0) else -1.0
            vec[idx] += sign * (1.0 + math.log(1 + len(token)))

        # 2. Bigram context hash
        for i in range(len(tokens) - 1):
            bigram = f"{tokens[i]}_{tokens[i+1]}"
            h = int(hashlib.sha256(bigram.encode("utf-8")).hexdigest(), 16)
            idx = h % dimension
            sign = 1.0 if (h % 2 == 0) else -1.0
            vec[idx] += sign * 1.5

        # 3. Venture concept booster
        venture_concepts = {
            "problem": 0, "solution": 24, "market": 48, "tam": 72, "sam": 73, "som": 74,
            "revenue": 96, "arr": 97, "mrr": 98, "pricing": 100, "competition": 120,
            "competitor": 121, "advantage": 122, "gtm": 144, "sales": 145, "team": 168,
            "founders": 169, "financials": 192, "ebitda": 193, "burn": 194, "funding": 216,
            "seed": 217, "valuation": 218, "traction": 240, "pilot": 241, "growth": 242
        }
        for word in tokens:
            if word in venture_concepts:
                idx = venture_concepts[word] % dimension
                vec[idx] += 2.5

        # Normalize
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

    @staticmethod
    def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
        if not vec_a or not vec_b:
            return 0.0
        a = np.array(vec_a, dtype=np.float32)
        b = np.array(vec_b, dtype=np.float32)
        dot = np.dot(a, b)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return float(dot / (norm_a * norm_b))

    @staticmethod
    async def search(
        db: AsyncSession,
        query: str,
        project_id: Optional[str] = None,
        slide_types: Optional[List[str]] = None,
        top_k: int = 6,
        max_chunks_per_doc: int = 2
    ) -> List[Dict[str, Any]]:
        """
        RAG Retrieval with slide category filtering and diversity enforcement (max_chunks_per_doc).
        """
        query_vec = VectorStore.generate_embedding(query, settings.EMBEDDING_DIMENSION)

        # Build SQL query
        stmt = select(DocumentChunk, ReferenceDocument).join(
            ReferenceDocument, DocumentChunk.document_id == ReferenceDocument.id
        )
        if project_id:
            stmt = stmt.where(ReferenceDocument.project_id == project_id)
        if slide_types:
            stmt = stmt.where(DocumentChunk.slide_type.in_(slide_types))

        result = await db.execute(stmt)
        rows = result.all()

        scored_results = []
        for chunk, doc in rows:
            chunk_vec = chunk.embedding_json
            if chunk_vec:
                score = VectorStore.cosine_similarity(query_vec, chunk_vec)
                # Boost if slide_type explicitly matches desired category
                if slide_types and chunk.slide_type in slide_types:
                    score = min(1.0, score + 0.15)
                scored_results.append({
                    "chunk_id": chunk.id,
                    "document_id": doc.id,
                    "document_name": doc.filename,
                    "page_number": chunk.page_number,
                    "slide_type": chunk.slide_type,
                    "content": chunk.content,
                    "metadata": chunk.metadata_json or {},
                    "score": round(score, 4),
                })

        # Sort by similarity score descending
        scored_results.sort(key=lambda x: x["score"], reverse=True)

        # Apply diversity filter (maximum chunks per document)
        final_results = []
        doc_counts: Dict[str, int] = {}

        for item in scored_results:
            doc_id = item["document_id"]
            current_count = doc_counts.get(doc_id, 0)
            if current_count < max_chunks_per_doc:
                final_results.append(item)
                doc_counts[doc_id] = current_count + 1
                if len(final_results) >= top_k:
                    break

        return final_results
