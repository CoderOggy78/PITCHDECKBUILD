import pytest
from app.services.pdf_processor import PDFProcessor
from app.services.classifier import SlideClassifier

def test_extract_metrics():
    sample_text = """
    Our Total Addressable Market (TAM) is $14.2B with a 18.5% CAGR.
    Current customer ACV: $48,000 with 82% gross margin.
    CAC is $4,500 yielding 5.3x LTV multiple.
    """
    metrics = PDFProcessor._extract_metrics(sample_text)
    metric_values = [m["value"] for m in metrics]
    
    assert any("$14.2B" in v for v in metric_values)
    assert any("82%" in v or "18.5%" in v for v in metric_values)
    assert any("5.3x" in v for v in metric_values)

def test_slide_classifier():
    prob_text = "The crisis of undetected pipeline leaks costs municipalities $14B. Inefficient manual acoustic audits fail to catch anomalies."
    prob_res = SlideClassifier.classify_page(prob_text, headings=["The Water Leak Crisis"], page_num=1, total_pages=10)
    assert prob_res["category"] == "problem"
    assert prob_res["confidence"] > 0.5

    tam_text = "Total Addressable Market is $14.4B based on 300,000 global utilities at $48,000 annual contract value."
    tam_res = SlideClassifier.classify_page(tam_text, headings=["TAM SAM SOM Sizing"], page_num=3, total_pages=10)
    assert tam_res["category"] in ["tam_sam_som", "market"]

    team_text = "Leadership Team: CEO ex-utility director, CTO PhD in machine learning, VP of Engineering."
    team_res = SlideClassifier.classify_page(team_text, headings=["Leadership & Founders"], page_num=7, total_pages=10)
    assert team_res["category"] == "team"
