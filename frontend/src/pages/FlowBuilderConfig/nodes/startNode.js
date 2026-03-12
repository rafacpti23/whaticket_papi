import { ArrowForwardIos, Message, RocketLaunch } from "@mui/icons-material";
import React, { memo } from "react";
import { Handle } from "react-flow-renderer";
import { useTheme, Typography, Box, Stack } from "@mui/material";

export default memo(({ data, isConnectable }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        background: isDark 
          ? "rgba(15, 23, 42, 0.9)" 
          : "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(12px)",
        padding: "16px",
        borderRadius: "20px",
        border: `2px solid ${isDark ? "rgba(34, 197, 94, 0.3)" : "rgba(34, 197, 94, 0.1)"}`,
        boxShadow: "0 10px 40px rgba(34, 197, 94, 0.15)",
        minWidth: "240px",
        position: "relative"
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ 
            p: 1, 
            borderRadius: "12px", 
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            color: "#22c55e",
            display: "flex"
          }}>
            <RocketLaunch sx={{ fontSize: "20px" }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: theme.palette.text.primary, lineHeight: 1.2 }}>
              INÍCIO DO FLUXO
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Gatilho de entrada
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ 
          p: 1.5, 
          borderRadius: "12px", 
          backgroundColor: isDark ? "rgba(34, 197, 94, 0.05)" : "rgba(34, 197, 94, 0.02)",
        }}>
          <Typography sx={{ color: theme.palette.text.primary, fontSize: "12px", fontStyle: "italic" }}>
            "Todo grande atendimento começa por aqui."
          </Typography>
        </Box>
      </Stack>

      <Handle
        type="source"
        position="right"
        style={{
          background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
          width: "16px",
          height: "16px",
          right: "-8px",
          border: "4px solid #fff",
          boxShadow: "0 4px 10px rgba(34, 197, 94, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        isConnectable={isConnectable}
      >
        <ArrowForwardIos sx={{ color: "#fff", fontSize: "7px", ml: "1px" }} />
      </Handle>
    </Box>
  );
});
