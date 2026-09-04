from typing import List, Dict, Any

class SemanticChunker:
    @staticmethod
    def chunk_page_content(
        page_number: int,
        text: str,
        category: str,
        headings: List[str] = None,
        chunk_size: int = 180, # in words
        chunk_overlap: int = 40
    ) -> List[Dict[str, Any]]:
        """
        Splits slide content into semantically enriched chunks with metadata.
        For pitch decks, slides are already dense units, so chunks are sized to preserve slide context.
        """
        words = text.split()
        if not words:
            return []

        chunks = []
        heading_prefix = f"[{' | '.join(headings)}] " if headings else ""

        if len(words) <= chunk_size:
            # Single chunk for standard slide
            chunk_text = f"{heading_prefix}{text.strip()}"
            chunks.append({
                "page_number": page_number,
                "slide_type": category,
                "content": chunk_text,
                "metadata": {
                    "page_number": page_number,
                    "slide_type": category,
                    "headings": headings or [],
                    "word_count": len(words),
                }
            })
        else:
            # Sliding window for dense multi-paragraph slides
            start = 0
            chunk_idx = 0
            while start < len(words):
                end = min(start + chunk_size, len(words))
                segment = " ".join(words[start:end])
                chunk_text = f"{heading_prefix}{segment.strip()}" if chunk_idx == 0 else segment.strip()
                chunks.append({
                    "page_number": page_number,
                    "slide_type": category,
                    "content": chunk_text,
                    "metadata": {
                        "page_number": page_number,
                        "slide_type": category,
                        "chunk_index": chunk_idx,
                        "headings": headings or [],
                        "word_count": len(words[start:end]),
                    }
                })
                chunk_idx += 1
                if end == len(words):
                    break
                start += (chunk_size - chunk_overlap)

        return chunks
