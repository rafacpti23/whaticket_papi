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
            mode: mode,
            primary: {
              main: themeStyle === "premium"
                ? (mode === "light" ? "#4F46E5" : "#6366F1")
                : (mode === "light" ? "#008ff0" : "#008ff0")
            },
            secondary: {
              main: themeStyle === "premium"
                ? "#10B981"
                : (mode === "light" ? "#151718" : "#151718")
            },
            textPrimary: mode === "light" ? "#1C2E36" : "#FFFFFF",
            borderPrimary: mode === "light" ? "#E0E0E0" : "#2D3133",
            dark: { main: mode === "light" ? "#1C2E36" : "#FFFFFF" },
            light: { main: mode === "light" ? "#F3F3F3" : "#1C2E36" },
            fontColor: mode === "light" ? "#1C2E36" : "#FFFFFF",
            background: {
              default: themeStyle === "premium"
                ? (mode === "light" ? "#F8FAFC" : "#0B0E14")
                : (mode === "light" ? "#eef2f6" : "#151718"),
              paper: themeStyle === "premium"
                ? (mode === "light" ? "#FFFFFF" : "#111827")
                : (mode === "light" ? "#FFFFFF" : "#1E2021"),
            },
            text: {
              primary: mode === "light" ? "#1C2E36" : "#FFFFFF",
              secondary: mode === "light" ? "#637381" : "#D1D5DB",
            },
            action: {
              hover:
                mode === "light"
                  ? "rgba(0, 210, 255, 0.1)"
                  : "rgba(0, 210, 255, 0.2)",
              selected:
                mode === "light"
                  ? "rgba(0, 210, 255, 0.2)"
                  : "rgba(0, 210, 255, 0.3)",
            },
            divider: themeStyle === "premium"
              ? (mode === "light" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)")
              : (mode === "light" ? "#E0E0E0" : "#2D3133"),
            tabHeaderBackground: mode === "light" ? "#fff" : "#1E2021",
            optionsBackground: mode === "light" ? "#fafafa" : "#1E2021",
            fancyBackground: mode === "light" ? "#fafafa" : "#1E2021",
            total: mode === "light" ? "#fff" : "#1E2021",
            messageIcons: mode === "light" ? "#1C2E36" : "#FFFFFF",
            inputBackground: mode === "light" ? "#FFFFFF" : "#1E2021",
            barraSuperior: themeStyle === "premium" || mode === "dark"
              ? "#5850EC"
              : (mode === "light" ? "#008ff0" : "#151718"),
            barraLateral: themeStyle === "premium" || mode === "dark"
              ? "#5850EC"
              : "#F7F5F2", // Base bege clara
            boxticket: mode === "light" ? "#EEE" : "#1E2021",
            campaigntab: mode === "light" ? "#ededed" : "#1E2021",
            corIconesbarra: themeStyle === "premium" || mode === "dark" ? "#FFFFFF" : "#2D3748",
            fundologoLateral: themeStyle === "premium" || mode === "dark"
              ? "#5850EC"
              : "#FDFBF7",
            corTextobarraLateral: themeStyle === "premium" || mode === "dark" ? "#FFFFFF" : "#2D3748",
            options: mode === "light" ? "#fafafa" : "#333",
            fontecor: mode === "light" ? "#1C2E36" : "#008ff0",
            bordabox: mode === "light" ? "#eee" : "#333",
            newmessagebox: mode === "light" ? "#eee" : "#333",
            inputdigita: mode === "light" ? "#fff" : "#333",
            contactdrawer: mode === "light" ? "#fff" : "#333",
            announcements: mode === "light" ? "#ededed" : "#333",
            login: mode === "light" ? "#fff" : "#333",
            announcementspopover: mode === "light" ? "#fff" : "#333",
            chatlist: mode === "light" ? "#eee" : "#333",
            boxlist: mode === "light" ? "#ededed" : "#333",
            boxchatlist: mode === "light" ? "#ededed" : "#333",
            MuiAppBar: {
              root: {
                background: themeStyle === "premium" || mode === "dark"
                  ? "#5850EC !important"
                  : (mode === "light" ? "#008ff0 !important" : "#151718 !important"),
                boxShadow: themeStyle === "premium" ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)" : "none",
                borderBottom: themeStyle === "premium" ? "1px solid rgba(255,255,255,0.05)" : "none",
                "& .MuiToolbar-root": {
                  backgroundColor: "transparent !important",
                  "& .MuiTypography-root": {
                    color: "#FFFFFF",
                    fontWeight: 700,
                  },
                  "& .MuiSvgIcon-root": {
                    color: "#FFFFFF",
                  },
                  "& .MuiIconButton-root": {
                    color: "#FFFFFF",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.15)",
                    },
                  },
                },
              },
            },
            MuiIconButton: {
              root: {
                color: mode === "light" ? "#1C2E36" : "#FFFFFF",
                "&:hover": {
                  backgroundColor: "rgba(1, 161, 154, 0.1)",
                  color: mode === "light" ? "#1C2E36" : "#FFFFFF",
                },
              },
            },
            MuiToolbar: {
              root: {
                backgroundColor: mode === "light" ? "#008ff0" : "#151718",
                color: "#FFFFFF",
                "& .MuiTypography-root": {
                  color: "#FFFFFF",
                },
                "& .MuiSvgIcon-root": {
                  color: "#FFFFFF",
                },
                "& .MuiIconButton-root": {
                  color: "#FFFFFF",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                },
                "& .MuiButton-root": {
                  color: "#FFFFFF",
                },
              },
            },
            MuiTypography: {
              root: {
                color: mode === "light" ? "#1C2E36" : "#FFFFFF !important",
              },
            },
            MuiSvgIcon: {
              root: {
                color: mode === "light" ? "#1C2E36" : "#FFFFFF",
              },
            },
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
                  backgroundColor: mode === "light" ? "#F3F3F3" : "#2D3133",
                  borderRadius: "2px",
                },
                "*::-webkit-scrollbar-track": {
                  backgroundColor: mode === "light" ? "#fafafa" : "#151718",
                },
                body: {
                  backgroundColor: mode === "light" ? "#eef2f6" : "#151718",
                },
                ".MuiPaper-root": {
                  backgroundColor: themeStyle === "premium"
                    ? (mode === "light" ? "#FFFFFF" : "#111827")
                    : (mode === "light" ? "#FFFFFF" : "#1E2021 !important"),
                },
                ".MuiCard-root": {
                  backgroundColor: themeStyle === "premium"
                    ? (mode === "light" ? "#FFFFFF" : "#111827")
                    : (mode === "light" ? "#FFFFFF" : "#1E2021 !important"),
                },
                ".MuiDrawer-paper": {
                  background: themeStyle === "premium" || mode === "dark"
                    ? "#5850EC !important"
                    : "linear-gradient(180deg, #FDFBF7 0%, #F2EFE9 100%) !important",
                  borderRight: mode === "light" ? "1px solid #E2E8F0" : "none",
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
                backgroundColor: themeStyle === "premium" ? "#00D2FF" : "rgba(4, 197, 188, 0.2)",
                color: themeStyle === "premium" ? "#0B0E14" : "#008ff0",
                fontWeight: themeStyle === "premium" ? "600" : "400",
                "&:hover": {
                  backgroundColor: themeStyle === "premium" ? "#00B4D8" : "rgba(4, 197, 188, 0.3)",
                  color: themeStyle === "premium" ? "#0B0E14" : "#008ff0",
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
                color: themeStyle === "premium" ? "#FFFFFF" : (mode === "light" ? "#1C2E36" : "#FFFFFF"),
                "& .MuiListItemIcon-root": {
                  color: themeStyle === "premium" ? "#FFFFFF" : (mode === "light" ? "#1C2E36" : "#FFFFFF"),
                  minWidth: "40px",
                  "& .MuiSvgIcon-root": {
                    color: themeStyle === "premium" ? "#FFFFFF" : (mode === "light" ? "#1C2E36" : "#FFFFFF"),
                    fontSize: "20px",
                  },
                },
                "& .MuiListItemText-primary": {
                  color: themeStyle === "premium" ? "#FFFFFF" : (mode === "light" ? "#1C2E36" : "#FFFFFF"),
                  fontSize: "14px",
                  fontWeight: 500,
                },
                "&$selected": {
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  color: "#FFFFFF",
                  borderLeft: "none",
                  "& .MuiListItemIcon-root": {
                    color: "inherit",
                    "& .MuiSvgIcon-root": {
                      color: "inherit",
                    },
                  },
                  "& .MuiListItemText-primary": {
                    color: "#FFFFFF",
                    fontWeight: 700,
                  },
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                  },
                },
                "&:hover": {
                  backgroundColor: themeStyle === "premium" ? "rgba(255, 255, 255, 0.05)" : "rgba(1, 161, 154, 0.1)",
                  color: themeStyle === "premium" ? "#FFFFFF" : (mode === "light" ? "#1C2E36" : "#FFFFFF"),
                  "& .MuiListItemIcon-root": {
                    color: themeStyle === "premium" ? "#FFFFFF" : (mode === "light" ? "#1C2E36" : "#FFFFFF"),
                  },
                  "& .MuiListItemText-primary": {
                    color: themeStyle === "premium" ? "#FFFFFF" : (mode === "light" ? "#1C2E36" : "#FFFFFF"),
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
                  color: themeStyle === "premium" ? "#FFFFFF" : "#008ff0",
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
    </BrowserRouter>
  );
};

export default App;
