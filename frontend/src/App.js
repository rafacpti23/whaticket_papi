import React, { useState, useEffect, useMemo } from "react";
import api from "./services/api";
import "react-toastify/dist/ReactToastify.css";
import { QueryClient, QueryClientProvider } from "react-query";
import { ptBR } from "@material-ui/core/locale";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { useMediaQuery } from "@material-ui/core";
import ColorModeContext from "./layout/themeContext";
import { ActiveMenuProvider } from "./context/ActiveMenuContext";
import Favicon from "react-favicon";
import { getBackendUrl } from "./config";
import Routes from "./routes";
import defaultLogoLight from "./assets/logo.png";
import defaultLogoDark from "./assets/logo-black.png";
import defaultLogoFavicon from "./assets/favicon.ico";
import useSettings from "./hooks/useSettings";
import { BrowserRouter } from "react-router-dom";
import { 
  createTheme as createThemeV5, 
  ThemeProvider as ThemeProviderV5, 
  StyledEngineProvider 
} from "@mui/material/styles";

const queryClient = new QueryClient();

const App = () => {
  const [locale, setLocale] = useState();
  const appColorLocalStorage =
    localStorage.getItem("primaryColorLight") ||
    localStorage.getItem("primaryColorDark") ||
    "#065183";
  const appNameLocalStorage = localStorage.getItem("appName") || "";
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const preferredTheme = window.localStorage.getItem("preferredTheme");
  const [mode, setMode] = useState(
    preferredTheme ? preferredTheme : prefersDarkMode ? "dark" : "light"
  );
  const savedThemeStyle = localStorage.getItem("themeStyle") || "classic";
  const normalizedThemeStyle =
    savedThemeStyle === "default" ? "classic" : savedThemeStyle;
  const [themeStyle, setThemeStyle] = useState(normalizedThemeStyle);
  const [primaryColorLight, setPrimaryColorLight] =
    useState(appColorLocalStorage);
  const [primaryColorDark, setPrimaryColorDark] =
    useState(appColorLocalStorage);
  const [appLogoLight, setAppLogoLight] = useState(defaultLogoLight);
  const [appLogoDark, setAppLogoDark] = useState(defaultLogoDark);
  const [appLogoFavicon, setAppLogoFavicon] = useState(defaultLogoFavicon);
  const [appName, setAppName] = useState(appNameLocalStorage);
  const { getPublicSetting } = useSettings();

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === "light" ? "dark" : "light";
          window.localStorage.setItem("preferredTheme", newMode);
          return newMode;
        });
      },
      setPrimaryColorLight,
      setPrimaryColorDark,
      setAppLogoLight,
      setAppLogoDark,
      setAppLogoFavicon,
      setAppName,
      setThemeStyle: (style) => {
        const nextStyle = style === "default" ? "classic" : style;
        setThemeStyle(nextStyle);
        window.localStorage.setItem("themeStyle", nextStyle);
      },
      appLogoLight,
      appLogoDark,
      appLogoFavicon,
      appName,
      mode,
      themeStyle,
    }),
    [appLogoLight, appLogoDark, appLogoFavicon, appName, mode, themeStyle]
  );

  const theme = useMemo(
    () =>
      createTheme(
        {
          scrollbarStyles: {
            "&::-webkit-scrollbar": {
              width: "4px",
              height: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              boxShadow: "inset 0 0 6px rgba(0, 0, 0, 0.3)",
              backgroundColor: mode === "light" ? "#F3F3F3" : "#2D3133",
            },
          },
          scrollbarStylesSoft: {
            "&::-webkit-scrollbar": {
              width: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: mode === "light" ? "#F3F3F3" : "#2D3133",
            },
          },
          palette: {
            type: mode,
            primary: {
              main: mode === "light" ? primaryColorLight : primaryColorDark,
            },
            secondary: {
              main: themeStyle === "premium"
                ? "#10B981"
                : (mode === "light" ? "#151718" : "#cfd8dc")
            },
            background: {
              default: themeStyle === "premium"
                ? (mode === "light" ? "#F8FAFC" : "#0F172A")
                : (mode === "light" ? "#eef2f6" : "#121212"),
              paper: themeStyle === "premium"
                ? (mode === "light" ? "rgba(255, 255, 255, 0.8)" : "rgba(30, 41, 59, 0.7)")
                : (mode === "light" ? "#FFFFFF" : "#1E1E1E"),
            },
            text: {
              primary: mode === "light" ? "#1C2E36" : "#F1F5F9",
              secondary: mode === "light" ? "#637381" : "#94A3B8",
            },
            action: {
              hover:
                mode === "light"
                  ? "rgba(79, 70, 229, 0.08)"
                  : "rgba(129, 140, 248, 0.12)",
              selected:
                mode === "light"
                  ? "rgba(79, 70, 229, 0.12)"
                  : "rgba(129, 140, 248, 0.16)",
            },
            divider: themeStyle === "premium"
              ? (mode === "light" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)")
              : (mode === "light" ? "#E0E0E0" : "#2D3133"),
          },
          mode,
          borderRadius: themeStyle === "premium" ? "20px" : "16px",
          spacing: 8,
          shape: {
            borderRadius: themeStyle === "premium" ? 20 : 16,
          },
          props: {
            MuiButton: {
              variant: "contained",
              color: "primary",
              fullWidth: false,
              size: "small",
            },
            MuiTextField: {
              variant: "outlined",
              fullWidth: true,
              size: "small",
            },
            MuiSelect: {
              variant: "outlined",
              fullWidth: true,
              size: "small",
            },
            MuiMenu: {
              getContentAnchorEl: null,
            },
          },
          overrides: {
            MuiAppBar: {
              root: {
                background: themeStyle === "premium"
                  ? (mode === "light" ? "rgba(255, 255, 255, 0.7) !important" : "rgba(15, 23, 42, 0.7) !important")
                  : (mode === "light" ? (mode === "light" ? primaryColorLight : primaryColorDark) + " !important" : "#151718 !important"),
                backdropFilter: themeStyle === "premium" ? "blur(12px) saturate(180%)" : "none",
                boxShadow: themeStyle === "premium" ? "0 4px 6px -1px rgba(0, 0, 0, 0.05)" : "none",
                borderBottom: themeStyle === "premium" ? (mode === "light" ? "1px solid rgba(0,0,0,0.05)" : "1px solid rgba(255,255,255,0.05)") : "none",
                transition: "all 0.3s ease",
                color: mode === "light" ? "#1E293B !important" : "#F8FAFC !important",
                "& .MuiToolbar-root": {
                  color: "inherit",
                  "& .MuiTypography-root": {
                    color: "inherit",
                    fontWeight: 700,
                  },
                  "& .MuiSvgIcon-root": {
                    color: "inherit",
                  },
                  "& .MuiIconButton-root": {
                    color: "inherit",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                  },
                },
              },
            },
            MuiIconButton: {
              root: {
                borderRadius: 12,
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "scale(1.05)",
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              },
            },
            MuiToolbar: {
              root: {
                backgroundColor: themeStyle === "premium" 
                  ? "transparent"
                  : (mode === "light" ? "#F8FAFC" : "#0F172A"),
                color: mode === "light" ? "#1E293B" : "#F8FAFC",
                "& .MuiTypography-root": {
                  color: "inherit",
                },
                "& .MuiSvgIcon-root": {
                  color: "inherit",
                },
              },
            },
            MuiTypography: {
              root: {
                color: mode === "light" ? "#1E293B" : "#F8FAFC",
              },
            },
            MuiSvgIcon: {
              root: {
                color: "inherit",
              },
            },
            MuiFormLabel: {
              root: {
                color: mode === "dark" ? "#FFFFFF" : "inherit",
                "&.Mui-focused": {
                  color: mode === "dark" ? "#FFFFFF" : "inherit",
                },
              },
            },
            MuiInputLabel: {
              root: {
                color: mode === "dark" ? "#FFFFFF" : "inherit",
                "&.Mui-focused": {
                  color: mode === "dark" ? "#FFFFFF" : "inherit",
                },
              },
            },
            MuiFormHelperText: {
              root: {
                color: mode === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.54)",
              },
            },
            MuiCssBaseline: {
              "@global": {
                "*::-webkit-scrollbar": {
                  width: "4px",
                  height: "4px",
                },
                "*::-webkit-scrollbar-thumb": {
                  backgroundColor: mode === "light" ? "#CBD5E1" : "#334155",
                  borderRadius: "2px",
                },
                "*::-webkit-scrollbar-track": {
                  backgroundColor: "transparent",
                },
                body: {
                  backgroundColor: themeStyle === "premium"
                    ? (mode === "light" ? "#F8FAFC" : "#0F172A")
                    : (mode === "light" ? "#eef2f6" : "#121212"),
                  transition: "background-color 0.3s ease",
                },
                ".MuiPaper-root": {
                  backgroundColor: themeStyle === "premium"
                    ? (mode === "light" ? "rgba(255, 255, 255, 0.8) !important" : "rgba(30, 41, 59, 0.7) !important")
                    : (mode === "light" ? "#FFFFFF" : "#1E1E1E !important"),
                  backdropFilter: themeStyle === "premium" ? "blur(12px) saturate(180%)" : "none",
                  boxShadow: themeStyle === "premium" ? "0 8px 32px 0 rgba(31, 38, 135, 0.07)" : "none",
                  border: themeStyle === "premium" ? (mode === "light" ? "1px solid rgba(255, 255, 255, 0.18)" : "1px solid rgba(255, 255, 255, 0.08)") : "none",
                },
                ".MuiDrawer-paper": {
                  background: themeStyle === "premium"
                    ? (mode === "light" ? "rgba(255, 255, 255, 0.8) !important" : "rgba(15, 23, 42, 0.9) !important")
                    : (mode === "light" ? "linear-gradient(180deg, #FDFBF7 0%, #F2EFE9 100%)" : "#151718 !important"),
                  backdropFilter: themeStyle === "premium" ? "blur(16px) saturate(180%)" : "none",
                  borderRight: mode === "light" ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.08)",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important",
                },
              },
            },
            MuiButton: {
              root: {
                textTransform: "none",
                borderRadius: 8,
                fontWeight: "400",
                fontSize: "13px",
                padding: "6px 12px",
                minWidth: "auto",
                height: "32px",
                letterSpacing: "0.2px",
              },
              contained: {
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "none",
                },
              },
              containedPrimary: {
                backgroundColor: mode === "light" ? primaryColorLight : primaryColorDark,
                color: mode === "light" ? "#FFFFFF" : "#0B0E14",
                fontWeight: themeStyle === "premium" ? "600" : "400",
                "&:hover": {
                  backgroundColor: mode === "light" ? primaryColorLight : primaryColorDark,
                  filter: "brightness(0.9)",
                },
              },
              outlined: {
                borderColor: mode === "light" ? "#e0e0e0" : "#FFFFFF",
                color: mode === "light" ? "#1C2E36" : "#FFFFFF",
                backgroundColor:
                  mode === "light"
                    ? "transparent"
                    : "rgba(255, 255, 255, 0.05)",
                "&:hover": {
                  backgroundColor:
                    mode === "light"
                      ? "rgba(0, 0, 0, 0.04)"
                      : "rgba(255, 255, 255, 0.1)",
                  borderColor: mode === "light" ? "#8a8a8a" : "#FFFFFF",
                },
              },
            },
            MuiTextField: {
              root: {
                "& .MuiOutlinedInput-root": {
                  borderRadius: 12,
                  backgroundColor: mode === "light" ? "#e0e0e0" : "#245798",
                  "& fieldset": {
                    borderColor: mode === "light" ? "#bebebe" : "#fff",
                  },
                  "&:hover fieldset": {
                    borderColor: mode === "light" ? "#8a8a8a" : "#d6d6d6",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: mode === "light" ? "#bebebe" : "#fff",
                  },
                },
              },
            },
            MuiPaper: {
              root: {
                backgroundColor:
                  mode === "light" ? "#FFFFFF" : "#1E2021 !important",
                "&.MuiAppBar-root": {
                  backgroundColor:
                    mode === "light"
                      ? "#008ff0 !important"
                      : "#151718 !important",
                },
              },
              rounded: {
                borderRadius: 8,
              },
              elevation1: {
                boxShadow:
                  mode === "light"
                    ? "0 1px 3px rgba(0,0,0,0.05)"
                    : "0 1px 3px rgba(0,0,0,0.2)",
              },
            },
            MuiCard: {
              root: {
                backgroundColor:
                  mode === "light" ? "#FFFFFF" : "#1E2021 !important",
                borderRadius: 16,
                border:
                  mode === "light" ? "1px solid #e0e0e0" : "1px solid #2D3133",
                boxShadow: "none",
              },
            },
            MuiListItem: {
              root: {
                borderRadius: themeStyle === "premium" ? "0 20px 20px 0" : 12,
                margin: themeStyle === "premium" ? "4px 8px 4px 0" : 0,
                color: mode === "light" ? "#1C2E36" : "#FFFFFF",
                "& .MuiListItemIcon-root": {
                  color: mode === "light" ? "#1C2E36" : "#FFFFFF",
                  minWidth: "40px",
                  "& .MuiSvgIcon-root": {
                    color: "inherit",
                    fontSize: "20px",
                  },
                },
                "& .MuiListItemText-primary": {
                  color: mode === "light" ? "#1C2E36" : "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: 500,
                },
                "&$selected": {
                  backgroundColor: mode === "light" ? "rgba(79, 70, 229, 0.08)" : "rgba(129, 140, 248, 0.12)",
                  color: mode === "light" ? primaryColorLight : primaryColorDark,
                  borderLeft: "none",
                  "& .MuiListItemIcon-root": {
                    color: "inherit",
                    "& .MuiSvgIcon-root": {
                      color: "inherit",
                    },
                  },
                  "& .MuiListItemText-primary": {
                    color: "inherit",
                    fontWeight: 700,
                  },
                  "&:hover": {
                    backgroundColor: mode === "light" ? "rgba(79, 70, 229, 0.12)" : "rgba(129, 140, 248, 0.16)",
                  },
                },
                "&:hover": {
                  backgroundColor: mode === "light" ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.05)",
                  color: mode === "light" ? primaryColorLight : "#FFFFFF",
                  "& .MuiListItemIcon-root": {
                    color: "inherit",
                  },
                  "& .MuiListItemText-primary": {
                    color: "inherit",
                  },
                },
              },
              selected: {},
              button: {
                "&:hover": {
                  backgroundColor: "rgba(1, 161, 154, 0.1)",
                },
              },
            },
            MuiTab: {
              root: {
                textTransform: "none",
                fontSize: "13px",
                fontWeight: "400",
                minHeight: "36px",
                padding: "6px 30px",
                color: mode === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.54)",
                "&.Mui-selected": {
                  color: mode === "light" ? primaryColorLight : "#FFFFFF",
                  fontWeight: "bold",
                },
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "#FFFFFF",
                },
              },
            },
            MuiChip: {
              root: {
                borderRadius: 12,
                height: "24px",
              },
              sizeSmall: {
                height: "20px",
              },
            },
            MuiListSubheader: {
              root: {
                color: mode === "light" ? "#637381" : "#94A3B8",
                fontWeight: 700,
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "1px",
              },
            },
          },
          typography: {
            fontFamily: [
              "-apple-system",
              "BlinkMacSystemFont",
              '"Segoe UI"',
              "Roboto",
              '"Helvetica Neue"',
              "Arial",
              "sans-serif",
            ].join(","),
            allVariants: {
              color: mode === "dark" ? "#FFFFFF" : "inherit",
            },
            h1: {
              fontWeight: 500,
              fontSize: 35,
              letterSpacing: "-0.24px",
            },
            h2: {
              fontWeight: 500,
              fontSize: 29,
              letterSpacing: "-0.24px",
            },
            h3: {
              fontWeight: 500,
              fontSize: 24,
              letterSpacing: "-0.06px",
            },
            h4: {
              fontWeight: 500,
              fontSize: 20,
              letterSpacing: "-0.06px",
            },
            h5: {
              fontWeight: 500,
              fontSize: 16,
              letterSpacing: "-0.05px",
            },
            h6: {
              fontWeight: 500,
              fontSize: 14,
              letterSpacing: "-0.05px",
            },
          },
          calculatedLogoLight: () => {
            if (
              appLogoDark !== defaultLogoDark &&
              appLogoLight === defaultLogoLight
            ) {
              return appLogoDark;
            }
            return appLogoLight;
          },
          calculatedLogoDark: () => {
            if (
              appLogoDark === defaultLogoDark &&
              appLogoLight !== defaultLogoLight
            ) {
              return appLogoLight;
            }
            return appLogoDark;
          },
          mode,
          appLogoLight,
          appLogoDark,
          appLogoFavicon,
          appName,
        },
        locale
      ),
    [
      appLogoLight,
      appLogoDark,
      appLogoFavicon,
      appName,
      locale,
      mode,
      primaryColorDark,
      primaryColorLight,
    ]
  );

  const themeV5 = useMemo(
    () =>
      createThemeV5({
        palette: {
          mode: mode,
          primary: {
            main: mode === "light" ? primaryColorLight : primaryColorDark,
          },
          text: {
            primary: mode === "light" ? "#1C2E36" : "#F1F5F9",
            secondary: mode === "light" ? "#637381" : "#94A3B8",
          },
        },
      }),
    [mode, primaryColorLight, primaryColorDark]
  );

  useEffect(() => {
    const i18nlocale = localStorage.getItem("i18nextLng");
    if (i18nlocale) {
      const browserLocale =
        i18nlocale.substring(0, 2) + i18nlocale.substring(3, 5);
      if (browserLocale === "ptBR") {
        setLocale(ptBR);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("preferredTheme", mode);
  }, [mode]);

  useEffect(() => {
    getPublicSetting("primaryColorLight")
      .then((color) => {
        setPrimaryColorLight(color || "#008ff0");
      })
      .catch((error) => {
        console.log("Error reading setting", error);
      });
    getPublicSetting("primaryColorDark")
      .then((color) => {
        setPrimaryColorDark(color || "#008ff0");
      })
      .catch((error) => {
        console.log("Error reading setting", error);
      });
    getPublicSetting("appLogoLight")
      .then((file) => {
        setAppLogoLight(
          file ? getBackendUrl() + "/public/" + file : defaultLogoLight
        );
      })
      .catch((error) => {
        console.log("Error reading setting", error);
      });
    getPublicSetting("appLogoDark")
      .then((file) => {
        setAppLogoDark(
          file ? getBackendUrl() + "/public/" + file : defaultLogoDark
        );
      })
      .catch((error) => {
        console.log("Error reading setting", error);
      });
    getPublicSetting("appLogoFavicon")
      .then((file) => {
        setAppLogoFavicon(
          file ? getBackendUrl() + "/public/" + file : defaultLogoFavicon
        );
      })
      .catch((error) => {
        console.log("Error reading setting", error);
      });
    getPublicSetting("appName")
      .then((name) => {
        setAppName(name || "WhatsApp");
      })
      .catch((error) => {
        console.log("!==== Erro ao carregar temas: ====!", error);
        setAppName("WhatsApp");
      });
  }, [getPublicSetting]);

  return (
    <BrowserRouter>
      <StyledEngineProvider injectFirst>
        <ThemeProviderV5 theme={themeV5}>
          <Favicon url={appLogoFavicon} />
          <ColorModeContext.Provider value={{ colorMode }}>
            <ThemeProvider theme={theme}>
              <QueryClientProvider client={queryClient}>
                <ActiveMenuProvider>
                  <Routes />
                </ActiveMenuProvider>
              </QueryClientProvider>
            </ThemeProvider>
          </ColorModeContext.Provider>
        </ThemeProviderV5>
      </StyledEngineProvider>
    </BrowserRouter>
  );
};

export default App;
