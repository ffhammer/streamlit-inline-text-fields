import React, { useState, useEffect, useCallback } from "react";

// --- Helper: Text Normalization (similar to Python's _normalize_text_for_validation) ---
function normalizeTextForValidation(text, ignoreAccents) {
  if (typeof text !== 'string') return '';
  let normalized = text.toLowerCase();
  if (ignoreAccents) {
    normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  return normalized;
}

// --- Helper: Client-side Validation (for visual feedback if renderResultsMode is true) ---
// Note: This is a simplified version. Python performs the definitive validation.
// For 'acceptable' (Levenshtein), a JS library would be needed for full client-side parity.
function getClientSideValidationStatus(userInput, solution, validationRules) {
  if (!userInput || userInput.trim() === "") {
    // If solution is also empty, it's perfect, otherwise empty.
    return solution.trim() === "" ? "perfect" : "empty";
  }

  const normUserInput = normalizeTextForValidation(userInput, validationRules.ignore_accents);
  const normSolution = normalizeTextForValidation(solution, validationRules.ignore_accents);

  if (normUserInput === normSolution) {
    return "perfect";
  }
  // If renderResultsMode is on and not perfect, mark as 'false' for client display.
  // Python will handle the 'acceptable' state based on Levenshtein distance.
  return "false";
}


function InlineTextFieldsView({
  sentencesData,
  renderResultsMode,
  validationRules,
  streamlitTheme,
  onInputsChange,
}) {
  // --- Theme Setup ---
  const defaultTheme = {
    textColor: "rgb(49, 51, 63)",
    fontFamily: "sans-serif",
    fieldBgColor: "#FFFFFF",
    fieldBorderColor: "#CCCCCC",
    fieldFocusBorderColor: streamlitTheme?.primaryColor || "rgb(255, 75, 75)", // Use Streamlit's primary or a fallback
    textSegmentColor: "inherit", // Text segments usually inherit text color
    // Validation state styles (backgrounds are subtle, borders more prominent)
    correctBg: "rgba(40, 167, 69, 0.1)",
    acceptableBg: "rgba(255, 193, 7, 0.1)",
    falseBg: "rgba(220, 53, 69, 0.1)",
    emptyBg: "rgba(240, 242, 246, 0.5)", // Slightly off-white for empty
    correctBorder: `1px solid ${streamlitTheme?.primaryColor || "rgb(40, 167, 69)"}`,
    acceptableBorder: "1px solid rgb(255, 193, 7)",
    falseBorder: "1px solid rgb(220, 53, 69)",
    emptyBorder: "1px solid #D0D0D0",
  };
  // Merge Streamlit theme with defaults. Streamlit theme takes precedence.
  const theme = { ...defaultTheme, ...streamlitTheme };


  // --- State for User Inputs ---
  // Initialize userInputs based on the number of fields in sentencesData
  const initializeInputs = useCallback(() => {
    return sentencesData.map(sentence =>
      sentence.filter(segment => segment.type === "field").map(() => "") // One empty string per field
    );
  }, [sentencesData]);

  const [userInputs, setUserInputs] = useState(initializeInputs());

  // Re-initialize if sentencesData structure changes (e.g., new problem loaded)
  useEffect(() => {
    setUserInputs(initializeInputs());
  }, [initializeInputs]); // Depends on sentencesData via initializeInputs


  // --- State for Client-Side Validation Visuals (if renderResultsMode is true) ---
  const [validationDisplayStates, setValidationDisplayStates] = useState([]);

  useEffect(() => {
    if (renderResultsMode && sentencesData && userInputs && validationRules) {
      const newValidationStates = userInputs.map((sentenceInputs, sentenceIndex) => {
        const fieldsInSentence = sentencesData[sentenceIndex].filter(s => s.type === 'field');
        return sentenceInputs.map((inputValue, fieldIndexInSentence) => {
          if (fieldIndexInSentence < fieldsInSentence.length) {
            const solution = fieldsInSentence[fieldIndexInSentence].solution;
            return getClientSideValidationStatus(inputValue, solution, validationRules);
          }
          return "empty"; // Should ideally not be reached
        });
      });
      setValidationDisplayStates(newValidationStates);
    } else {
      setValidationDisplayStates([]); // Clear validation styles if not in results mode
    }
  }, [userInputs, sentencesData, renderResultsMode, validationRules]);


  // --- Handle Input Change ---
  const handleSingleInputChange = (sentenceIdx, fieldIdxInSentence, value) => {
    const newUserInputs = userInputs.map((sentence, sIdx) => {
      if (sIdx === sentenceIdx) {
        return sentence.map((input, fIdx) => (fIdx === fieldIdxInSentence ? value : input));
      }
      return sentence;
    });
    setUserInputs(newUserInputs);
    onInputsChange(newUserInputs); // Notify Streamlit about the change
  };

  // --- Dynamic Input Sizing ---
  // Sets the 'size' attribute, which is a simple way for character-based width.
  const getInputVisualSize = (text, placeholderSolution) => {
    const minSize = Math.max(5, placeholderSolution ? Math.floor(placeholderSolution.length * 0.8) : 5);
    const currentLength = text ? text.length : 0;
    return Math.max(minSize, currentLength > 0 ? Math.floor(currentLength * 1.1) : minSize, 5) + 1; // Add a little buffer
  };

  // --- Rendering ---
  if (!sentencesData || sentencesData.length === 0) {
    return <div style={{ fontFamily: theme.fontFamily, color: theme.textColor }}>Loading...</div>;
  }

  return (
    <div style={{ fontFamily: theme.fontFamily, color: theme.textColor, lineHeight: '2.4' }}>
      {sentencesData.map((sentenceSegments, sentenceIndex) => {
        let fieldIndexInSentence = 0; // Counter for fields within the current sentence
        return (
          <div
            key={`sentence-${sentenceIndex}`}
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "baseline", // Aligns text and input fields nicely on their baseline
              marginBottom: "16px",
              gap: "2px 6px", // row-gap column-gap
            }}
          >
            {sentenceSegments.map((segment, segmentIndex) => {
              if (segment.type === "text") {
                return (
                  <span
                    key={`text-${sentenceIndex}-${segmentIndex}`}
                    style={{ color: theme.textSegmentColor, whiteSpace: "pre-wrap" }}
                    dangerouslySetInnerHTML={{ __html: segment.content }} // Allows HTML entities like   if needed
                  />
                );
              } else if (segment.type === "field") {
                const currentFieldInputIndex = fieldIndexInSentence;
                fieldIndexInSentence++;

                const inputValue = userInputs[sentenceIndex]?.[currentFieldInputIndex] ?? "";
                const solutionForPlaceholder = segment.solution || "";

                let fieldStyle = {
                  border: `1px solid ${theme.fieldBorderColor}`,
                  borderRadius: "6px",
                  padding: "6px 10px",
                  fontFamily: "inherit", // Inherit from parent div
                  fontSize: "inherit",
                  backgroundColor: theme.fieldBgColor,
                  color: theme.textColor,
                  minWidth: `${getInputVisualSize("", solutionForPlaceholder) * 0.8}ch`, // Use 'ch' for character-based min-width
                  maxWidth: '350px', // Prevent excessively wide inputs
                  boxSizing: 'border-box',
                  lineHeight: '1.5', // Normal line height for input itself
                };

                if (renderResultsMode && validationDisplayStates[sentenceIndex]?.[currentFieldInputIndex]) {
                  const status = validationDisplayStates[sentenceIndex][currentFieldInputIndex];
                  if (status === "perfect") {
                    fieldStyle.backgroundColor = theme.correctBg;
                    fieldStyle.border = theme.correctBorder;
                  } else if (status === "acceptable") { // Note: JS version doesn't fully evaluate this
                    fieldStyle.backgroundColor = theme.acceptableBg;
                    fieldStyle.border = theme.acceptableBorder;
                  } else if (status === "false") {
                    fieldStyle.backgroundColor = theme.falseBg;
                    fieldStyle.border = theme.falseBorder;
                  } else if (status === "empty" && solutionForPlaceholder.trim() !== "") {
                     fieldStyle.backgroundColor = theme.emptyBg;
                     fieldStyle.border = theme.emptyBorder;
                  }
                }

                return (
                  <input
                    key={`field-${sentenceIndex}-${currentFieldInputIndex}`}
                    type="text"
                    value={inputValue}
                    placeholder={renderResultsMode ? "" : solutionForPlaceholder.replace(/./g, '＿')} // Underscores for length hint
                    onChange={(e) =>
                      handleSingleInputChange(sentenceIndex, currentFieldInputIndex, e.target.value)
                    }
                    style={fieldStyle}
                    onFocus={(e) => e.target.style.borderColor = theme.fieldFocusBorderColor}
                    onBlur={(e) => { // Revert to status border or default theme border
                        const status = renderResultsMode ? validationDisplayStates[sentenceIndex]?.[currentFieldInputIndex] : null;
                        if (status === "perfect") e.target.style.borderColor = theme.correctBorder.split(' ')[2];
                        else if (status === "acceptable") e.target.style.borderColor = theme.acceptableBorder.split(' ')[2];
                        else if (status === "false") e.target.style.borderColor = theme.falseBorder.split(' ')[2];
                        else if (status === "empty" && solutionForPlaceholder.trim() !== "") e.target.style.borderColor = theme.emptyBorder.split(' ')[2];
                        else e.target.style.borderColor = theme.fieldBorderColor;
                    }}
                    // The 'size' attribute is an alternative for width, but style.minWidth with 'ch' is often better
                    // size={getInputVisualSize(inputValue, solutionForPlaceholder)}
                  />
                );
              }
              return null; // Should not happen with valid segment types
            })}
          </div>
        );
      })}
    </div>
  );
}

export default InlineTextFieldsView;