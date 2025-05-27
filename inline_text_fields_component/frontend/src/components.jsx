import React, { useEffect, useCallback } from "react";
import { Streamlit, withStreamlitConnection } from "streamlit-component-lib";
import InlineTextFieldsView from "./InlineTextFieldsView"; // We'll create this next

function StreamlitInlineTextFieldsWrapper({ args }) {
  const {
    sentences_data: sentencesData, // Data from Python, renamed for JS convention
    render_results_mode: renderResultsMode,
    validation_rules_for_frontend: validationRules,
    theme: streamlitTheme, // Theme object from Streamlit
  } = args;

  // Callback to send the current state of user inputs back to Streamlit
  const handleInputsChange = useCallback((allUserInputs) => {
    Streamlit.setComponentValue(allUserInputs);
  }, []);

  // Effect to inform Streamlit about the component's desired height
  useEffect(() => {
    Streamlit.setFrameHeight();
  }, [sentencesData, streamlitTheme, renderResultsMode]); // Adjust height if these key props change

  // sentencesData is crucial, render null or a loader if it's not ready
  if (!sentencesData) {
    return null;
  }

  return (
    <InlineTextFieldsView
      sentencesData={sentencesData}
      renderResultsMode={renderResultsMode}
      validationRules={validationRules}
      streamlitTheme={streamlitTheme} // Pass the theme received from Streamlit
      onInputsChange={handleInputsChange} // Pass the callback
    />
  );
}

export default withStreamlitConnection(StreamlitInlineTextFieldsWrapper);