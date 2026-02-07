import { createContext } from "react";

const ColorModeContext = createContext({
    toggleColorMode: () => { },
    setThemeStyle: () => { },
    themeStyle: "default"
});

export default ColorModeContext;