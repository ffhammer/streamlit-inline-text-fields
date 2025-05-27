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
st.header("5. Render Results in Frontend with Custom Colors")
st.write(
    "`render_results_in_frontend = True`. Fields should change color as you type, using custom colors."
)
sentences_render_results = [
    "The sun is {hot}.",
    "An apple is a {fruit}, not a {vegetable}.",
    "This is an {example} with Levenshtein.",
]
st.write("Input Sentences:")
st.json(sentences_render_results)

# Define custom colors for border and background
# Format: {status: (borderColor, backgroundColor)}
custom_validation_colors = {
    "perfect": "rgba(144, 238, 144, 0.3)",
    "acceptable": "rgba(255, 218, 185, 0.4)",
    "false": "rgba(255, 160, 122, 0.3)",
    "empty": "rgba(220, 220, 220, 0.2)",
}
st.write("Custom Colors Applied:")
st.json(custom_validation_colors)


results_render = inline_text_fields(
    sentences_with_solutions=sentences_render_results,
    render_results_in_frontend=True,
    ignore_accents=True,
    accepted_levenshtein_distance=1,  # Allow Levenshtein for "acceptable"
    key="render_results_fields_custom_colors",
    color_kwargs=custom_validation_colors,  # Pass the custom colors
)
st.write("Returned Validation (Python-side):")
st.json(results_render)
st.markdown("---")

# --- 6. Freeze Inputs ---
st.header("6. Freeze Inputs")
st.write("`freeze = True`. Fields should be non-editable, preserving their last state.")

# Use a session state variable to toggle freeze
if "freeze_example_inputs" not in st.session_state:
    st.session_state.freeze_example_inputs = [
        ["initial"],  # Sentence 1, Field 1
        ["content", "here"],  # Sentence 2, Field 1, Field 2
    ]
if "freeze_toggle_state" not in st.session_state:
    st.session_state.freeze_toggle_state = False

sentences_freeze = [
    "This field should be {frozen}.",
    "And {this} one {too}.",
]
st.write("Input Sentences:")
st.json(sentences_freeze)

# Button to toggle freeze state
if st.button("Toggle Freeze State"):
    st.session_state.freeze_toggle_state = not st.session_state.freeze_toggle_state

st.write(f"Currently Frozen: {st.session_state.freeze_toggle_state}")

# To make this example interactive with freeze, we need to manage the inputs
# outside the component if we want to "pre-fill" them before freezing.
# However, the component itself will handle preserving its state when freeze is toggled.

# For a simple demonstration of freeze, we can show it with initial empty or pre-filled values.
# Let's demonstrate with pre-filled values that get frozen.
# The component will receive its state from Streamlit's internal state management for the key.

# If we want to simulate pre-filled values that then get frozen,
# we'd typically have the user input them first, then toggle freeze.
# The component's `key` ensures state is maintained across reruns.

results_freeze = inline_text_fields(
    sentences_with_solutions=sentences_freeze,
    render_results_in_frontend=True,  # So we can see the state
    freeze=st.session_state.freeze_toggle_state,
    key="freeze_example_fields",  # Key is important for state preservation
    color_kwargs=custom_validation_colors,  # Use colors from previous example
)

st.write("Returned Validation (Python-side):")
st.json(results_freeze)
st.markdown("---")
