import {
  ArrowForwardIos,
  ContentCopy,
  Delete,
  DynamicFeed
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
        border: `1px solid ${isDark ? "rgba(139, 92, 246, 0.3)" : "rgba(139, 92, 246, 0.15)"}`,
        boxShadow: isDark 
          ? "0 10px 30px rgba(0,0,0,0.5)" 
          : "0 10px 30px rgba(0,0,0,0.1)",
        minWidth: "200px",
        position: "relative"
      }}
    >
      <Handle
        type="target"
        position="left"
        style={{
          background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
          width: "14px",
          height: "14px",
          left: "-7px",
          top: "24px",
          border: "3px solid #fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        isConnectable={isConnectable}
      >
        <ArrowForwardIos sx={{ color: "#fff", fontSize: "6px", ml: "1px" }} />
      </Handle>

      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ 
              p: 0.5, 
              borderRadius: "8px", 
              backgroundColor: "rgba(139, 92, 246, 0.1)",
              color: "#8b5cf6",
              display: "flex"
            }}>
              <DynamicFeed sx={{ fontSize: "18px" }} />
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>
              MENU INTERATIVO
            </Typography>
          </Stack>

          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" onClick={() => { storageItems.setNodesStorage(id); storageItems.setAct("duplicate"); }} sx={{ p: "4px" }}>
              <ContentCopy sx={{ fontSize: "14px" }} />
            </IconButton>
            <IconButton size="small" onClick={() => { storageItems.setNodesStorage(id); storageItems.setAct("delete"); }} sx={{ p: "4px", color: theme.palette.error.main }}>
              <Delete sx={{ fontSize: "14px" }} />
            </IconButton>
          </Stack>
        </Stack>

        <Box sx={{ 
          p: 1.5, 
          borderRadius: "12px", 
          backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(139, 92, 246, 0.05)",
        }}>
          <Typography sx={{ color: theme.palette.text.primary, fontSize: "12px", lineHeight: 1.4 }}>
            {data.message || "Defina a mensagem do menu..."}
          </Typography>
        </Box>

        <Stack spacing={0.8}>
          {data.arrayOption.map((option, index) => (
            <Box
              key={index}
              sx={{
                p: "6px 10px",
                borderRadius: "8px",
                backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#fff",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <Typography sx={{ fontSize: "11px", color: theme.palette.text.primary, fontWeight: 500 }}>
                {`[${option.number}] ${option.value}`}
              </Typography>
              
              <Handle
                type="source"
                position="right"
                id={"a" + option.number}
                style={{
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  width: "12px",
                  height: "12px",
                  right: "-18px",
                  border: "3px solid #fff",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                isConnectable={isConnectable}
              >
                <ArrowForwardIos sx={{ color: "#fff", fontSize: "5px", ml: "1px" }} />
              </Handle>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
});
