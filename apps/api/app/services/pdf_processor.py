import os
import re
from pathlib import Path
from typing import List, Dict, Any, Optional
import fitz # PyMuPDF
from pypdf import PdfReader

class PDFProcessor:
    @staticmethod
    def extract_text_and_pages(file_path: str) -> List[Dict[str, Any]]:
        """
        Extracts structured page text, headings, numbers, and detected metrics from a PDF.
        Uses PyMuPDF as primary high-performance engine, with pypdf as fallback.
        """
        results = []
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"PDF file not found at {file_path}")

        # Primary extraction using PyMuPDF (fitz)
        try:
            doc = fitz.open(file_path)
            for page_num in range(len(doc)):
                page = doc[page_num]
                text = page.get_text("text") or ""
                
                # Extract blocks to find potential headings
                blocks = page.get_text("blocks")
                headings = []
                for b in blocks:
                    block_text = b[4].strip()
                    # Heuristic for headings: short text, uppercase or title-case, first few lines
                    if len(block_text) > 0 and len(block_text) < 80 and ("\n" not in block_text or len(block_text.split("\n")) <= 2):
                        if any(char.isupper() for char in block_text):
                            headings.append(block_text)

                # Extract key numbers, currency, percentages, metrics
                metrics = PDFProcessor._extract_metrics(text)
                companies = PDFProcessor._extract_potential_companies(text)

                results.append({
                    "page_number": page_num + 1,
                    "text": text.strip(),
                    "headings": headings[:4],
                    "metrics": metrics,
                    "companies": companies,
                    "word_count": len(text.split()),
                })
            doc.close()
            return results
        except Exception as e:
            # Fallback using pypdf
            reader = PdfReader(file_path)
            for idx, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                metrics = PDFProcessor._extract_metrics(text)
                companies = PDFProcessor._extract_potential_companies(text)
                results.append({
                    "page_number": idx + 1,
                    "text": text.strip(),
                    "headings": [],
                    "metrics": metrics,
                    "companies": companies,
                    "word_count": len(text.split()),
                })
            return results

    @staticmethod
    def _extract_metrics(text: str) -> List[Dict[str, Any]]:
        metrics = []
        # Match dollar values ($50M, $1.2B, $500k, $25,000)
        dollars = re.findall(r"\$\s*\d+(?:\.\d+)?\s*(?:B|M|K|k|billion|million|thousand)?", text, re.IGNORECASE)
        for d in set(dollars[:5]):
            metrics.append({"type": "currency", "value": d.strip()})

        # Match percentages (e.g. 45%, 82.5%, 3.5x)
        percentages = re.findall(r"\b\d+(?:\.\d+)?\s*%", text)
        for p in set(percentages[:5]):
            metrics.append({"type": "percentage", "value": p.strip()})

        # Match multiples (e.g. 10x, 3.5x)
        multipliers = re.findall(r"\b\d+(?:\.\d+)?\s*x\b", text, re.IGNORECASE)
        for m in set(multipliers[:3]):
            metrics.append({"type": "multiple", "value": m.strip()})

        # Match standard SaaS metrics (ARR, MRR, CAC, LTV, CAGR)
        saas_keywords = ["ARR", "MRR", "TAM", "SAM", "SOM", "CAC", "LTV", "CAGR", "EBITDA", "MAU", "DAU"]
        for kw in saas_keywords:
            match = re.search(rf"\b{kw}\b(?:\s*[:=–-]?\s*([^\n,]{{1,30}}))?", text, re.IGNORECASE)
            if match:
                val = match.group(1).strip() if match.group(1) else kw
                metrics.append({"type": kw.upper(), "value": f"{kw}: {val}"})

        return metrics[:10]

    @staticmethod
    def _extract_potential_companies(text: str) -> List[str]:
        # Simple entity/brand extraction heuristic looking for Capitalized sequences near competitor/market words
        potential = []
        patterns = [
            r"vs\.?\s+([A-Z][A-Za-z0-9]+(?:\s+[A-Z][A-Za-z0-9]+)?)",
            r"Competitors?:\s*([^\n]+)",
            r"Alternative[s]?:\s*([^\n]+)",
        ]
        for p in patterns:
            matches = re.findall(p, text)
            for m in matches:
                if isinstance(m, str):
                    for item in m.split(","):
                        cleaned = item.strip()
                        if 2 < len(cleaned) < 40:
                            potential.append(cleaned)
        return list(set(potential))[:6]
