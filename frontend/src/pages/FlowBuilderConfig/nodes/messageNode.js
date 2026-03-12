import {
  ArrowForwardIos,
  ContentCopy,
  Delete,
  Message
} from "@mui/icons-material";
import React, { memo } from "react";
import { Handle } from "react-flow-renderer";
import { useNodeStorage } from "../../../stores/useNodeStorage";
import { useTheme, Typography, Box, IconButton, Stack } from "@mui/material";

export default memo(({ data, isConnectable, id }) => {
  const storageItems = useNodeStorage();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        background: isDark 
          ? "rgba(30, 41, 59, 0.9)" 
          : "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(12px)",
        padding: "12px",
        borderRadius: "16px",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
        boxShadow: isDark 
          ? "0 10px 30px rgba(0,0,0,0.5)" 
          : "0 10px 30px rgba(0,0,0,0.1)",
        minWidth: "220px",
        position: "relative",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: isDark 
            ? "0 15px 40px rgba(0,0,0,0.7)" 
            : "0 15px 40px rgba(0,0,0,0.2)",
          transform: "translateY(-2px)"
        }
      }}
    >
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

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ 
            p: 0.5, 
            borderRadius: "8px", 
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            color: "#3b82f6",
            display: "flex"
          }}>
            <Message sx={{ fontSize: "18px" }} />
          </Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.text.secondary, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            MENSAGEM
          </Typography>
        </Stack>

        <Stack direction="row" spacing={0.5}>
          <IconButton 
            size="small" 
            onClick={() => {
              storageItems.setNodesStorage(id);
              storageItems.setAct("duplicate");
            }}
            sx={{ p: "4px", color: theme.palette.text.secondary }}
          >
            <ContentCopy sx={{ fontSize: "14px" }} />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => {
              storageItems.setNodesStorage(id);
              storageItems.setAct("delete");
            }}
            sx={{ p: "4px", color: theme.palette.error.main }}
          >
            <Delete sx={{ fontSize: "14px" }} />
          </IconButton>
        </Stack>
      </Stack>

      <Box sx={{ 
        mt: 1, 
        p: 1.5, 
        borderRadius: "12px", 
        backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.02)",
        border: `1px dashed ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.1)"}`
      }}>
        <Typography sx={{ color: theme.palette.text.primary, fontSize: "13px", lineHeight: 1.4 }}>
          {data.label || "Sem conteúdo..."}
        </Typography>
      </Box>

      <Handle
        type="source"
        position="right"
        style={{
          background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
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
