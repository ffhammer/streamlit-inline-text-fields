# example.py
import streamlit as st
from inline_text_fields_component import (
    inline_text_fields,
)  # Assuming the component is in this directory

st.set_page_config(layout="wide")

st.title("Inline Text Fields Component Demo")
st.markdown("---")

# --- 1. Basic Example ---
st.header("1. Basic Usage")
st.write("Default delimiter: `{}`. No special validation rules.")
sentences_basic = [
    "The quick brown {fox} jumps over the lazy {dog}.",
    "My favorite color is {blue}.",
    "An empty field: {}",  # Test with an empty solution
    "A field at the end: {end}",
    "{Start} of a sentence.",
]
st.write("Input Sentences:")
st.json(sentences_basic)

results_basic = inline_text_fields(
    sentences_with_solutions=sentences_basic, key="basic_fields"
)
st.write("Returned Validation:")
st.json(results_basic)
st.markdown("---")


# --- 2. Custom Delimiter ---
st.header("2. Custom Delimiter")
st.write("Using `__solution__` as the delimiter.")
sentences_custom_delim = [
    "Paris is the capital of __France__.",
    "Water boils at __100__ degrees Celsius.",
    "A single char delimiter: _test_ (will be handled by Python if delimiter='_').",
]
st.write("Input Sentences:")
st.json(sentences_custom_delim)

results_custom_delim = inline_text_fields(
    sentences_with_solutions=sentences_custom_delim,
    delimiter="__",  # Using "__" as start and end
    key="custom_delimiter_fields",
)
st.write("Returned Validation (with '__' delimiter):")
st.json(results_custom_delim)

# Example with single character delimiter
results_single_char_delim = inline_text_fields(
    sentences_with_solutions=["This is a _test_ with single char."],
    delimiter="_",
    key="single_char_delimiter",
)
st.write("Returned Validation (with '_' delimiter):")
st.json(results_single_char_delim)
st.markdown("---")


# --- 3. Accent Ignorance ---
st.header("3. Accent Ignorance")
st.write("`ignore_accents = True`. Try typing 'cafe' for 'café'.")
sentences_accents = [
    "I would like a {café} au lait.",
    "The city of {Köln} is in Germany.",
]
st.write("Input Sentences:")
st.json(sentences_accents)

results_accents = inline_text_fields(
    sentences_with_solutions=sentences_accents, ignore_accents=True, key="accent_fields"
)
st.write("Returned Validation (accents ignored):")
st.json(results_accents)
st.markdown("---")


# --- 4. Levenshtein Distance ---
st.header("4. Levenshtein Distance")
st.write("`accepted_levenshtein_distance = 1`. Minor typos should be 'acceptable'.")
sentences_levenshtein = [
    "The {weather} is nice today.",
    "Programming is {fun}.",
    "This is a {longerphrase} for testing.",
]
st.write("Input Sentences:")
st.json(sentences_levenshtein)

results_levenshtein = inline_text_fields(
    sentences_with_solutions=sentences_levenshtein,
    accepted_levenshtein_distance=1,
    key="levenshtein_fields",
)
st.write("Returned Validation (Levenshtein distance 1):")
st.json(results_levenshtein)

st.write("`accepted_levenshtein_distance = 2` and `ignore_accents = True`.")
sentences_levenshtein_accents = [
    "El {niño} juega en el parque.",  # Try "nino" or "ninos"
    "This is {déjà vu} all over again.",  # Try "deja vuu"
]
st.write("Input Sentences:")
st.json(sentences_levenshtein_accents)
results_levenshtein_accents = inline_text_fields(
    sentences_with_solutions=sentences_levenshtein_accents,
    ignore_accents=True,
    accepted_levenshtein_distance=2,
    key="levenshtein_accent_fields",
)
st.write("Returned Validation (Levenshtein 2, accents ignored):")
st.json(results_levenshtein_accents)
st.markdown("---")


# --- 5. Render Results in Frontend ---
st.header("5. Render Results in Frontend")
st.write(
    "`render_results_in_frontend = True`. Fields should change color as you type (based on client-side check)."
)
sentences_render_results = [
    "The sun is {hot}.",
    "An apple is a {fruit}, not a {vegetable}.",
]
st.write("Input Sentences:")
st.json(sentences_render_results)

# For this example, let's also use some validation rules so the frontend has something to work with
results_render = inline_text_fields(
    sentences_with_solutions=sentences_render_results,
    render_results_in_frontend=True,
    ignore_accents=True,  # So frontend can also ignore accents for its display
    accepted_levenshtein_distance=0,  # Frontend simple check is exact match after normalization
    key="render_results_fields",
)
st.write("Returned Validation (Python-side):")
st.json(results_render)
st.markdown("---")


# --- 6. Custom Theme ---
st.header("6. Custom Theme")
st.write("Applying a custom theme to change colors.")
custom_theme = {
    "textColor": "navy",
    "fontFamily": "Georgia, serif",
    "fieldBgColor": "#e6f7ff",
    "fieldBorderColor": "lightblue",
    "fieldFocusBorderColor": "dodgerblue",
    "correctBg": "lightgreen",
    "correctBorder": "1px solid green",
    "falseBg": "lightpink",
    "falseBorder": "1px solid darkred",
    "emptyBg": "#f0f0f0",
    "emptyBorder": "1px solid #c0c0c0",
    "textSegmentColor": "darkslateblue",
}
st.write("Theme being applied:")
st.json(custom_theme)

sentences_theme = [
    "This component uses a [custom] theme.",
    "The fields should look [different].",
]
st.write("Input Sentences:")
st.json(sentences_theme)

results_theme = inline_text_fields(
    sentences_with_solutions=sentences_theme,
    delimiter="[]",  # Using a different delimiter for this example
    render_results_in_frontend=True,  # Good to see theme with validation colors
    theme=custom_theme,
    key="theme_fields",
)
st.write("Returned Validation (with custom theme):")
st.json(results_theme)
st.markdown("---")

st.sidebar.info("Try editing the fields and see the returned JSON update!")
