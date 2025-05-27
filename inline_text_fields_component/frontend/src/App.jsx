import { useState } from "react";
import FillInBlanks from "./FillinBlanks"; 

const defaultTheme = {
  primaryColor: 'orange',
  secondaryBackgroundColor:"rgb(8, 61, 167)",
  textColor:"rgb(0, 0, 0)",
  font: 'sans-serif',
};

function App() {
  const [result, setResult] = useState(null);

  const segments = [
    ["Yesterday I ", " playing football and I ", " it very much"],
    ["Nice I love to ", " football as well"],
  ];
  const options = [
    { id: "play", label: "play" },
    { id: "played", label: "played" },
    { id: "enjoy", label: "enjoy" },
    { id: "enjoyed", label: "enjoyed" },
  ];

  return (
    <div style={{ padding: 32, background: "#181818", minHeight: "100vh" }}>
      <h2 style={{ color: defaultTheme.textColor, textAlign: "center", fontFamily: defaultTheme.font }}>
        Fill in the Blanks Demo
      </h2>
      <FillInBlanks
        segments={segments}
        options={options}
        theme={defaultTheme}
        onChange={setResult}
      />
      <pre style={{ color: defaultTheme.textColor, marginTop: 32, fontFamily: defaultTheme.font }}>
        Current state: {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}

export default App;