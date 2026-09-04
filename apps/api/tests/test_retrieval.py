import pytest
from app.services.vector_store import VectorStore

def test_embedding_generation_and_cosine():
    text_a = "SaaS enterprise annual contract value gross margin ARR recurring revenue"
    text_b = "B2B software pricing model ACV subscription gross profit"
    text_c = "Agricultural organic pesticide farm equipment fertilizer biology"

    vec_a = VectorStore.generate_embedding(text_a)
    vec_b = VectorStore.generate_embedding(text_b)
    vec_c = VectorStore.generate_embedding(text_c)

    assert len(vec_a) == 384
    sim_ab = VectorStore.cosine_similarity(vec_a, vec_b)
    sim_ac = VectorStore.cosine_similarity(vec_a, vec_c)

    # Vector store embeddings preserve venture domain semantic similarity
    assert sim_ab > sim_ac
