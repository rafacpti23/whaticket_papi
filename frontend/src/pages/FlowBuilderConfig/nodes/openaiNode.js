import {
  ArrowForwardIos,
  ContentCopy,
  Delete
} from "@mui/icons-material";
import React, { memo } from "react";
import { Handle } from "react-flow-renderer";
import { useNodeStorage } from "../../../stores/useNodeStorage";
import { useTheme, Typography, Box, IconButton, Stack } from "@mui/material";
import { SiOpenai } from "react-icons/si";

export default memo(({ data, isConnectable, id }) => {
  const storageItems = useNodeStorage();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        background: isDark 
          ? "rgba(10, 25, 41, 0.95)" 
          : "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(12px)",
        padding: "12px",
        borderRadius: "20px",
        border: `2px solid ${isDark ? "rgba(16, 185, 129, 0.4)" : "rgba(16, 185, 129, 0.2)"}`,
        boxShadow: isDark 
          ? "0 0 20px rgba(16, 185, 129, 0.2)" 
          : "0 10px 30px rgba(16, 185, 129, 0.1)",
        minWidth: "220px",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <Box sx={{ 
        position: "absolute", 
        top: -20, 
        right: -20, 
        width: 60, 
        height: 60, 
        background: "rgba(16, 185, 129, 0.1)", 
        borderRadius: "50%", 
        filter: "blur(20px)" 
      }} />

      <Handle
        type="target"
        position="left"
        style={{
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          width: "14px",
          height: "14px",
          left: "-7px",
          border: "3px solid #fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        isConnectable={isConnectable}
      >
        <ArrowForwardIos sx={{ color: "#fff", fontSize: "6px", ml: "1px" }} />
      </Handle>

      <Stack spacing={1}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ 
              p: 0.8, 
              borderRadius: "10px", 
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              color: "#10b981",
              display: "flex"
            }}>
              <SiOpenai style={{ fontSize: "20px" }} />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 900, color: theme.palette.text.primary, letterSpacing: "1px" }}>
              OPENAI (IA)
            </Typography>
          </Stack>

          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" onClick={() => { storageItems.setNodesStorage(id); storageItems.setAct("duplicate"); }}>
              <ContentCopy sx={{ fontSize: "14px" }} />
            </IconButton>
            <IconButton size="small" onClick={() => { storageItems.setNodesStorage(id); storageItems.setAct("delete"); }} sx={{ color: theme.palette.error.main }}>
              <Delete sx={{ fontSize: "14px" }} />
            </IconButton>
          </Stack>
        </Stack>

        <Box sx={{ 
          mt: 1, 
          p: 1.5, 
          borderRadius: "12px", 
          backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
          border: `1px solid ${isDark ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.05)"}`
        }}>
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: "11px", fontWeight: 500 }}>
            Configurado com inteligência GPT. Este bloco processa linguagem natural.
          </Typography>
        </Box>
      </Stack>

      <Handle
        type="source"
        position="right"
        style={{
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          width: "14px",
          height: "14px",
          right: "-7px",
          border: "3px solid #fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        isConnectable={isConnectable}
      >
        <ArrowForwardIos sx={{ color: "#fff", fontSize: "6px", ml: "1px" }} />
      </Handle>
    </Box>
  );
});
