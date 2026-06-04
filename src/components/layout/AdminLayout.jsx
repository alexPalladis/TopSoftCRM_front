import { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  IconButton,
  Toolbar,
  AppBar,
  Badge,
  Tooltip,
  Chip,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import HubIcon from "@mui/icons-material/Hub";
import StoreIcon from "@mui/icons-material/Store";
import PersonIcon from "@mui/icons-material/Person";
import InboxIcon from "@mui/icons-material/Inbox";
import PercentIcon from "@mui/icons-material/Percent";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useAuth } from "../../context/AuthContext";
import { getNavItems } from "../../utils/roleUtils";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const SIDEBAR_WIDTH = 230;

const iconMap = {
  Dashboard: <DashboardIcon fontSize="small" />,
  People: <PeopleIcon fontSize="small" />,
  Hub: <HubIcon fontSize="small" />,
  Store: <StoreIcon fontSize="small" />,
  PersonCheck: <PersonIcon fontSize="small" />,
  Inbox: <InboxIcon fontSize="small" />,
  Percent: <PercentIcon fontSize="small" />,
  LocalOffer: <LocalOfferIcon fontSize="small" />,
};

const roleColors = {
  ADMIN: "#ef4444",
  NETWORK: "#3b82f6",
  DEALER: "#22c55e",
  SUBDEALER: "#f59e0b",
};

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = getNavItems(user?.role);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.username?.slice(0, 2).toUpperCase() || "Unknown";
  const roleColor = roleColors[user?.role] || "#6b7280";

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: "#f8f9fb" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: SIDEBAR_WIDTH,
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            background: "#fff",
            border: "none",
            borderRight: "0.5px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            p: 2,
            borderBottom: "0.5px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              background: "#1f6feb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 16,
              fontFamily: "monospace",
            }}
          >
            T
          </Box>
          <Typography sx={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>
            TopSoft CRM
          </Typography>
        </Box>

        {/* Role badge */}
        <Box sx={{ px: 1.5, py: 1 }}>
          <Box
            sx={{
              background: "#eff6ff",
              border: "0.5px solid #bfdbfe",
              borderRadius: 1.5,
              px: 1.5,
              py: 0.8,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: roleColor,
              }}
            />
            <Typography
              sx={{
                fontSize: 11,
                color: "#1d4ed8",
                fontWeight: 600,
                letterSpacing: "0.06em",
              }}
            >
              {user?.role}
            </Typography>
          </Box>
        </Box>

        {/* Nav */}
        <List dense sx={{ flex: 1, px: 1 }}>
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.path);
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.3 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 1.5,
                    borderLeft: active
                      ? `2px solid #1d4ed8`
                      : "2px solid transparent",
                    background: active ? "#eff6ff" : "transparent",
                    color: active ? "#1d4ed8" : "#6b7280",
                    "&:hover": { background: "#f9fafb", color: "#111827" },
                    py: 0.9,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 34, color: "inherit" }}>
                    {iconMap[item.icon]}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: 13,
                      fontWeight: active ? 600 : 400,
                    }}
                  />
                  {item.path === "/requests" && (
                    <Chip
                      label="3"
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: 10,
                        background: "#fee2e2",
                        color: "#dc2626",
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* Footer */}
        <Box
          sx={{
            p: 1.5,
            borderTop: "0.5px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Avatar
            sx={{
              width: 30,
              height: 30,
              background: "#dbeafe",
              color: "#1d4ed8",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {initials}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 500,
                color: "#111827",
                lineHeight: 1.3,
              }}
            >
              {user?.username}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>
              {user?.role}
            </Typography>
          </Box>
          <Tooltip title="Προφίλ">
            <IconButton
              size="small"
              onClick={() => navigate("/profile")}
              sx={{ color: "#9ca3af", "&:hover": { color: "#1f6feb" } }}
            >
              <AccountCircleIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Αποσύνδεση">
            <IconButton
              size="small"
              onClick={handleLogout}
              sx={{ color: "#9ca3af", "&:hover": { color: "#ef4444" } }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Drawer>

      {/* Main */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            background: "#fff",
            borderBottom: "0.5px solid #e5e7eb",
            color: "#111827",
          }}
        >
          <Toolbar
            variant="dense"
            sx={{ minHeight: 52, px: 3, justifyContent: "space-between" }}
          >
            <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
              {navItems.find((n) => location.pathname.startsWith(n.path))
                ?.label || "Dashboard"}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Tooltip title="Ειδοποιήσεις">
                <IconButton size="small" sx={{ color: "#6b7280" }}>
                  <Badge badgeContent={3} color="error">
                    <NotificationsIcon fontSize="small" />
                  </Badge>
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box sx={{ flex: 1, p: 3, overflow: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
