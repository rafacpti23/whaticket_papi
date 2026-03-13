import { createContext } from "react";

const ColorModeContext = createContext({
    toggleColorMode: () => { },
    setThemeStyle: () => { },
    themeStyle: "classic"
});

export default ColorModeContext;
