import { useEffect, useState } from "react";
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
  IconButton,
  Toolbar,
  AppBar,
  Badge,
  Tooltip,
  Chip,
  useTheme,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import HubIcon from "@mui/icons-material/Hub";
import StoreIcon from "@mui/icons-material/Store";
import PersonIcon from "@mui/icons-material/Person";
import InboxIcon from "@mui/icons-material/Inbox";
import PercentIcon from "@mui/icons-material/Percent";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import HistoryIcon from "@mui/icons-material/History";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import SearchIcon from "@mui/icons-material/Search";
import { useAuth } from "../../context/AuthContext";
import { useThemeMode } from "../../context/ThemeContext";
import { getNavItems } from "../../utils/roleUtils";
import { ticketsApi } from "../../services/tickets";
import GlobalSearch from "./GlobalSearch";

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
  History: <HistoryIcon fontSize="small" />,
};

const roleColors = {
  ADMIN: "#ef4444",
  NETWORK: "#3b82f6",
  DEALER: "#22c55e",
  SUBDEALER: "#f59e0b",
};

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const navItems = getNavItems(user?.role);
  const isDark = mode === "dark";

  const [pendingCount, setPendingCount] = useState(0);
  // ── Search state lives HERE — single source of truth ──────────────────────
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await ticketsApi.pendingCount();
        setPendingCount(res.data ?? 0);
      } catch {
        /* silent */
      }
    };
    fetchPending();
    const interval = setInterval(fetchPending, 60_000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.username?.slice(0, 2).toUpperCase() || "??";
  const roleColor = roleColors[user?.role] || "#6b7280";

  // ── Adaptive colors ────────────────────────────────────────────────────────
  const sidebarBg = isDark ? "#161b22" : "#fff";
  const sidebarBdr = isDark ? "#30363d" : "#e5e7eb";
  const topbarBg = isDark ? "#161b22" : "#fff";
  const pageContentBg = isDark ? "#0d1117" : "#f8f9fb";
  const textPrimary = isDark ? "#e6edf3" : "#111827";
  const textMuted = isDark ? "#8b949e" : "#6b7280";
  const activeItemBg = isDark ? "#1f2937" : "#eff6ff";
  const activeColor = isDark ? "#58a6ff" : "#1d4ed8";
  const roleBadgeBg = isDark ? "#1f2937" : "#eff6ff";
  const roleBadgeBdr = isDark ? "#30363d" : "#bfdbfe";
  const searchBtnBg = isDark ? "#1c2128" : "#f3f4f6";
  const searchBtnBdr = isDark ? "#30363d" : "#e5e7eb";

  return (
    <Box
      sx={{ display: "flex", minHeight: "100vh", background: pageContentBg }}
    >
      {/* GlobalSearch — controlled by searchOpen state */}
      <GlobalSearch
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onOpenRequest={() => setSearchOpen(true)}
      />

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <Drawer
        variant="permanent"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            boxSizing: "border-box",
            background: sidebarBg,
            border: "none",
            borderRight: `0.5px solid ${sidebarBdr}`,
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            p: 2,
            borderBottom: `0.5px solid ${sidebarBdr}`,
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
          <Typography
            sx={{ fontWeight: 600, fontSize: 14, color: textPrimary }}
          >
            TopSoft CRM
          </Typography>
        </Box>

        {/* Role badge */}
        <Box sx={{ px: 1.5, py: 1 }}>
          <Box
            sx={{
              background: roleBadgeBg,
              border: `0.5px solid ${roleBadgeBdr}`,
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
                color: activeColor,
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
            const isRequests = item.path === "/requests";
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.3 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 1.5,
                    borderLeft: active
                      ? `2px solid ${activeColor}`
                      : "2px solid transparent",
                    background: active ? activeItemBg : "transparent",
                    color: active ? activeColor : textMuted,
                    "&:hover": {
                      background: isDark ? "#1f2937" : "#f9fafb",
                      color: textPrimary,
                    },
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
                  {isRequests && pendingCount > 0 && (
                    <Chip
                      label={pendingCount}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: 10,
                        background: "#fee2e2",
                        color: "#dc2626",
                        fontWeight: 600,
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
            borderTop: `0.5px solid ${sidebarBdr}`,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Avatar
            sx={{
              width: 30,
              height: 30,
              background: isDark ? "#1f2937" : "#dbeafe",
              color: activeColor,
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
                color: textPrimary,
                lineHeight: 1.3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.username}
            </Typography>
            <Typography sx={{ fontSize: 11, color: textMuted }}>
              {user?.role}
            </Typography>
          </Box>
          <Tooltip title="Προφίλ">
            <IconButton
              size="small"
              onClick={() => navigate("/profile")}
              sx={{ color: textMuted, "&:hover": { color: activeColor } }}
            >
              <AccountCircleIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Αποσύνδεση">
            <IconButton
              size="small"
              onClick={handleLogout}
              sx={{ color: textMuted, "&:hover": { color: "#ef4444" } }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Drawer>

      {/* ── Main area ─────────────────────────────────────────────────────── */}
      <Box
        sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}
      >
        <AppBar
          position="static"
          elevation={0}
          sx={{
            background: topbarBg,
            borderBottom: `0.5px solid ${sidebarBdr}`,
            color: textPrimary,
          }}
        >
          <Toolbar
            variant="dense"
            sx={{ minHeight: 52, px: 3, justifyContent: "space-between" }}
          >
            <Typography
              sx={{ fontWeight: 600, fontSize: 15, color: textPrimary }}
            >
              {navItems.find((n) => location.pathname.startsWith(n.path))
                ?.label || "Dashboard"}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* Search trigger button */}
              <Tooltip title="Αναζήτηση (Ctrl+K)">
                <Box
                  onClick={() => setSearchOpen(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setSearchOpen(true);
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.5,
                    py: 0.6,
                    cursor: "pointer",
                    borderRadius: 1.5,
                    background: searchBtnBg,
                    border: `0.5px solid ${searchBtnBdr}`,
                    transition: "border-color 0.15s",
                    "&:hover": { borderColor: activeColor },
                    userSelect: "none",
                  }}
                >
                  <SearchIcon sx={{ fontSize: 14, color: textMuted }} />
                  <Typography sx={{ fontSize: 12, color: textMuted }}>
                    Αναζήτηση...
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.3,
                      ml: 0.5,
                    }}
                  >
                    {["Ctrl", "K"].map((k) => (
                      <Box
                        key={k}
                        sx={{
                          border: `0.5px solid ${sidebarBdr}`,
                          borderRadius: 0.8,
                          px: 0.6,
                          fontSize: 10,
                          color: textMuted,
                          fontFamily: "monospace",
                          lineHeight: 1.7,
                        }}
                      >
                        {k}
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Tooltip>

              {/* Dark / Light toggle */}
              <Tooltip title={isDark ? "Φωτεινό θέμα" : "Σκοτεινό θέμα"}>
                <IconButton
                  size="small"
                  onClick={toggleMode}
                  sx={{
                    color: textMuted,
                    "&:hover": { color: activeColor },
                    transition: "color 0.2s",
                  }}
                >
                  {isDark ? (
                    <LightModeIcon fontSize="small" />
                  ) : (
                    <DarkModeIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>

              {/* Bell */}
              <Tooltip title="Εκκρεμή αιτήματα">
                <IconButton
                  size="small"
                  sx={{ color: textMuted }}
                  onClick={() => navigate("/requests")}
                >
                  <Badge
                    badgeContent={pendingCount > 0 ? pendingCount : null}
                    color="error"
                  >
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
