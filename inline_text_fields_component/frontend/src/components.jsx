import React, { useEffect, useCallback } from "react";
import { Streamlit, withStreamlitConnection } from "streamlit-component-lib";
import InlineTextFieldsView from "./InlineTextFieldsView"; // We'll create this next

function StreamlitInlineTextFieldsWrapper({ args, theme }) {
  const {
    sentences_data: sentencesData, // Data from Python, renamed for JS convention
    render_results_mode: renderResultsMode,
    validation_rules_for_frontend: validationRules,
    color_kwargs : color_kwargs, 
    freeze_inputs: freezeInputs,
  } = args;

    const {
      perfect: perfectColor = null,
      acceptable: acceptableColor = null,
      false: falseColor = null,
      empty: emptyColor = null,
    } = color_kwargs || {};

    // Callback to send the current state of user inputs back to Streamlit
    const handleInputsChange = useCallback((allUserInputs) => {
      Streamlit.setComponentValue(allUserInputs);
    }, []);

    // Effect to inform Streamlit about the component's desired height
    useEffect(() => {
      Streamlit.setFrameHeight();
    }, [sentencesData, theme, renderResultsMode]); // Adjust height if these key props change

    // sentencesData is crucial, render null or a loader if it's not ready
    if (!sentencesData) {
      return null;
    }

    return (
      <InlineTextFieldsView
        sentencesData={sentencesData}
        renderResultsMode={renderResultsMode}
        validationRules={validationRules}
        streamlitTheme={theme} // Pass the theme received from Streamlit
        onInputsChange={handleInputsChange}
        perfect_color={perfectColor}
        acceptable_color={acceptableColor}
        false_color={falseColor}
        empty_color={emptyColor}
        freezeInputs={freezeInputs}
      />
    );
  }

export default withStreamlitConnection(StreamlitInlineTextFieldsWrapper);