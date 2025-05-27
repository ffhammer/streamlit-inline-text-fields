import React, { useState, useEffect, useCallback } from "react";
import levenshtein from "fast-levenshtein";

// --- Helper: Text Normalization ---
function normalizeTextForValidation(text, ignoreAccents) {
  if (typeof text !== "string") return "";
  let normalized = text.toLowerCase();
  if (ignoreAccents) {
    normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  return normalized;
}

// --- Helper: Client-side Validation ---
function getClientSideValidationStatus(userInput, solution, validationRules) {
  if (!userInput || userInput.trim() === "") {
    return solution.trim() === "" ? "perfect" : "empty";
  }
  const normUserInput = normalizeTextForValidation(
    userInput,
    validationRules.ignore_accents
  );
  const normSolution = normalizeTextForValidation(
    solution,
    validationRules.ignore_accents
  );

  if (normUserInput === normSolution) {
    return "perfect";
  }
  if (validationRules.accepted_levenshtein_distance > 0) {
    if (typeof levenshtein.get === "function") {
      const distance = levenshtein.get(normUserInput, normSolution);
      if (distance <= validationRules.accepted_levenshtein_distance) {
        return "acceptable";
      }
    } else {
      console.warn(
        "Levenshtein library not available on client-side for 'acceptable' check."
      );
    }
  }
  return "false";
}

// --- Helper: Shade Color (Basic) ---
function shadeColor(color, percent) {
  if (
    !color ||
    typeof color !== "string" ||
    !color.startsWith("#") ||
    (color.length !== 7 && color.length !== 4)
  ) {
    // Try to handle rgb/rgba or return a fallback
    if (color && (color.startsWith("rgb(") || color.startsWith("rgba("))) {
      // This is a very basic attempt and won't be perfect for rgba with alpha
      // For simplicity, we'll just return a slightly modified version or a fixed shade
      // A proper library would be needed for robust rgba shading
      return color.replace(
        /(\d+)(,|\))/g,
        (match, p1, p2) =>
          `${Math.max(
            0,
            Math.min(255, parseInt(p1) + (percent > 0 ? 20 : -20))
          )}${p2}`
      );
    }
    return color || "#808080"; // Grey fallback if color is invalid
  }
  // Handle hex
  let hex = color;
  if (hex.length === 4) {
    // Expand shorthand hex
    hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  try {
    let R = parseInt(hex.substring(1, 3), 16);
    let G = parseInt(hex.substring(3, 5), 16);
    let B = parseInt(hex.substring(5, 7), 16);

    R = parseInt(String((R * (100 + percent)) / 100));
    G = parseInt(String((G * (100 + percent)) / 100));
    B = parseInt(String((B * (100 + percent)) / 100));

    R = R < 255 ? R : 255;
    R = R > 0 ? R : 0;
    G = G < 255 ? G : 255;
    G = G > 0 ? G : 0;
    B = B < 255 ? B : 255;
    B = B > 0 ? B : 0;

    R = Math.round(R);
    G = Math.round(G);
    B = Math.round(B);

    const RR = R.toString(16).padStart(2, "0");
    const GG = G.toString(16).padStart(2, "0");
    const BB = B.toString(16).padStart(2, "0");

    return `#${RR}${GG}${BB}`;
  } catch (e) {
    console.error("Error shading hex color:", e);
    return color;
  }
}

function InlineTextFieldsView({
  sentencesData,
  renderResultsMode,
  validationRules,
  streamlitTheme, // Received from Streamlit HOC (e.g., { primaryColor, backgroundColor, secondaryBackgroundColor, textColor, font })
  onInputsChange,
  perfect_color,
  acceptable_color,
  false_color,
  empty_color,
  freezeInputs,
}) {
  // --- Theme Setup ---
  // Directly use Streamlit's theme properties where available, with sensible fallbacks.
  const stFont = streamlitTheme?.font || "sans-serif";
  const stTextColor = streamlitTheme?.textColor || "rgb(225, 228, 241)";
  const stPrimaryColor = streamlitTheme?.primaryColor || "rgb(255, 75, 75)"; // Streamlit's default pinkish-red
  const stSecondaryBgColor =
    streamlitTheme?.secondaryBackgroundColor || "#F0F2F6"; // Common widget background
  const stBorderColor =
    streamlitTheme?.borderColor || shadeColor(stSecondaryBgColor, -20); // Use Streamlit's borderColor or derive
  // Define colors for validation states.
  // Users can override these by passing, e.g., theme.customComponent.inlineTextFields.fieldBorderColor

  const theme = {
    fontFamily: stFont,
    textColor: stTextColor,
    textSegmentColor: stTextColor, // Text segments use the main text color

    fieldBgColor: stSecondaryBgColor,

    fieldBorderColor: stBorderColor,
    fieldFocusBorderColor: stPrimaryColor,

    // Correct state: soft green
    correctBgColor: perfect_color || "#e6f9ec", // very light green

    // False state: soft red
    falseBgColor: false_color || "#ffeaea", // very light red

    // Acceptable state: soft yellow
    acceptableBgColor: acceptable_color || "#fffbe6", // very light yellow

    // Empty state: soft gray
    emptyBgColor: empty_color || stSecondaryBgColor, // very light gray
  };

  // --- State for User Inputs ---
  const initializeInputs = useCallback(() => {
    return sentencesData.map((sentence) =>
      sentence.filter((segment) => segment.type === "field").map(() => "")
    );
  }, [sentencesData]);

  const [userInputs, setUserInputs] = useState(initializeInputs());


   useEffect(() => {
   if (!freezeInputs) {
     setUserInputs(initializeInputs());
   }
 }, [initializeInputs, freezeInputs]);

  // --- State for Client-Side Validation Visuals ---
  const [validationDisplayStates, setValidationDisplayStates] = useState([]);
  useEffect(() => {
    if (renderResultsMode && sentencesData && userInputs && validationRules) {
      const newValidationStates = userInputs.map(
        (sentenceInputs, sentenceIndex) => {
          const fieldsInSentence = sentencesData[sentenceIndex].filter(
            (s) => s.type === "field"
          );
          return sentenceInputs.map((inputValue, fieldIndexInSentence) => {
            if (fieldIndexInSentence < fieldsInSentence.length) {
              const solution = fieldsInSentence[fieldIndexInSentence].solution;
              return getClientSideValidationStatus(
                inputValue,
                solution,
                validationRules
              );
            }
            return "empty";
          });
        }
      );
      setValidationDisplayStates(newValidationStates);
    } else {
      setValidationDisplayStates([]);
    }
  }, [userInputs, sentencesData, renderResultsMode, validationRules]);

  // --- Handle Input Change ---
  const handleSingleInputChange = (sentenceIdx, fieldIdxInSentence, value) => {
    const newUserInputs = userInputs.map((sentence, sIdx) =>
      sIdx === sentenceIdx
        ? sentence.map((input, fIdx) =>
            fIdx === fieldIdxInSentence ? value : input
          )
        : sentence
    );
    setUserInputs(newUserInputs);
    onInputsChange(newUserInputs);
  };

  // --- Dynamic Input Sizing based on solution length ---
  const getInputWidthStyle = (solutionText) => {
    const charWidthApproximation = 0.6; // Adjusted for typical sans-serif fonts
    const minChars = 3;
    const maxChars = 30;
    let numChars = Math.max(
      minChars,
      solutionText ? solutionText.length : minChars
    );
    numChars = Math.min(numChars, maxChars);
    // Using 'em' for width makes it scale with the font size of the input field itself.
    // Add a bit for padding/cursor.
    return {
      width: `${Math.max(3.5, numChars * charWidthApproximation + 1.5)}em`,
      minWidth: `${Math.max(2.5, minChars * charWidthApproximation)}em`,
    };
  };

  // --- Rendering ---
  if (!sentencesData || sentencesData.length === 0) {
    return (
      <div style={{ fontFamily: theme.fontFamily, color: theme.textColor }}>
        Loading...
      </div>
    );
  }

  // Base font size for the component will be inherited from Streamlit's body.
  // We use 'em' units for padding/margins to scale with this inherited font size.
  return (
    <div
      style={{
        fontFamily: theme.fontFamily,
        color: theme.textColor,
        lineHeight: "2.2",
        fontSize: "inherit",
      }}
    >
      {sentencesData.map((sentenceSegments, sentenceIndex) => {
        let fieldIndexInSentence = 0;
        return (
          <div
            key={`sentence-${sentenceIndex}`}
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "baseline",
              marginBottom: "0.8em",
              gap: "0.2em 0.4em", // Smaller gap for a tighter look
            }}
          >
            {sentenceSegments.map((segment, segmentIndex) => {
              if (segment.type === "text") {
                return (
                  <span
                    key={`text-${sentenceIndex}-${segmentIndex}`}
                    style={{
                      color: theme.textSegmentColor,
                      whiteSpace: "pre-wrap",
                      padding: "0.1em 0",
                    }}
                    dangerouslySetInnerHTML={{ __html: segment.content }}
                  />
                );
              } else if (segment.type === "field") {
                const currentFieldInputIndex = fieldIndexInSentence++;
                const inputValue =
                  userInputs[sentenceIndex]?.[currentFieldInputIndex] ?? "";
                const solutionForSizing = segment.solution || "";

                // Default border radius from Streamlit theme or a fallback
                const borderRadius = streamlitTheme?.baseRadius || "0.375rem"; // e.g., "small", "medium", or "0.5rem"

                let fieldStyle = {
                  border: `1px solid ${theme.fieldBorderColor}`,
                  borderRadius: borderRadius, // Use Streamlit's baseRadius
                  padding: "0.3em 0.5em", // Adjusted padding
                  fontFamily: "inherit", // Inherit from parent div (which uses theme.fontFamily)
                  fontSize: "inherit", // Inherit font size from parent
                  backgroundColor: theme.fieldBgColor,
                  color: theme.textColor, // Input text color from theme
                  ...getInputWidthStyle(solutionForSizing),
                  boxSizing: "border-box",
                  lineHeight: "1.5", // Normal line height for input itself
                  transition:
                    "border-color 0.15s ease-in-out, background-color 0.15s ease-in-out",
                  outline: "none", // Remove default browser outline, rely on border for focus
                };

                let currentBorderColor = theme.fieldBorderColor;

                if (
                  renderResultsMode &&
                  validationDisplayStates[sentenceIndex]?.[
                    currentFieldInputIndex
                  ]
                ) {
                  const status =
                    validationDisplayStates[sentenceIndex][
                      currentFieldInputIndex
                    ];
                  if (status === "perfect") {
                    fieldStyle.backgroundColor = theme.correctBgColor;
                    fieldStyle.borderColor = theme.fieldBorderColor;
                    currentBorderColor = theme.fieldBorderColor;
                  } else if (status === "acceptable") {
                    fieldStyle.backgroundColor = theme.acceptableBgColor;
                    fieldStyle.borderColor = theme.fieldBorderColor;
                    currentBorderColor = theme.fieldBorderColor;
                  } else if (status === "false") {
                    fieldStyle.backgroundColor = theme.falseBgColor;
                    fieldStyle.borderColor = theme.fieldBorderColor;
                    currentBorderColor = theme.fieldBorderColor;
                  } else if (
                    status === "empty" &&
                    solutionForSizing.trim() !== ""
                  ) {
                    fieldStyle.backgroundColor = theme.emptyBgColor;
                    fieldStyle.borderColor = theme.fieldBorderColor;
                    currentBorderColor = theme.fieldBorderColor;
                  }
                }

                return (
                  <input
                    key={`field-${sentenceIndex}-${currentFieldInputIndex}`}
                    type="text"
                    // when frozen, show either the user’s last value or the solution‐sized underscores as the “value”
                    value={
                      freezeInputs
                        ? inputValue || solutionForSizing.replace(/./g, "_")
                        : inputValue
                    }
                    // only show placeholder when not frozen
                    placeholder={
                      !freezeInputs && !renderResultsMode
                        ? solutionForSizing.replace(/./g, "_")
                        : ""
                    }
                    readOnly={freezeInputs}
                    onChange={(e) =>
                      !freezeInputs &&
                      handleSingleInputChange(
                        sentenceIndex,
                        currentFieldInputIndex,
                        e.target.value
                      )
                    }
                    style={fieldStyle}
                    onFocus={(e) =>
                      (e.target.style.borderColor = theme.fieldFocusBorderColor)
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = currentBorderColor)
                    }
                  />
                );
              }
              return null;
            })}
          </div>
        );
      })}
    </div>
  );
}

export default InlineTextFieldsView;
