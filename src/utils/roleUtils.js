export const ROLES = {
  ADMIN: "ADMIN",
  NETWORK: "NETWORK",
  DEALER: "DEALER",
  SUBDEALER: "SUBDEALER",
};

export function getRoleFromId(id) {
  if (!id || id.length !== 8) return null;
  const prefix = id.charAt(0);
  const map = {
    0: ROLES.ADMIN,
    1: ROLES.NETWORK,
    2: ROLES.DEALER,
    3: ROLES.SUBDEALER,
  };
  return map[prefix] || null;
}

export function getNavItems(role) {
  const all = [
    // Visible to ALL roles
    { label: "Dashboard", path: "/dashboard", icon: "Dashboard" },
    { label: "Πελάτες", path: "/customers", icon: "People" },

    // ADMIN only
    { label: "Network", path: "/networks", icon: "Hub", roles: [ROLES.ADMIN] },

    // ADMIN + NETWORK see the dealers list
    {
      label: "Dealers",
      path: "/dealers",
      icon: "Store",
      roles: [ROLES.ADMIN, ROLES.NETWORK],
    },

    // ADMIN + NETWORK + DEALER see subdealers
    {
      label: "Sub-dealers",
      path: "/subdealers",
      icon: "PersonCheck",
      roles: [ROLES.ADMIN, ROLES.NETWORK, ROLES.DEALER],
    },

    // Visible to ALL roles (each sees their own scoped view)
    { label: "Αιτήματα", path: "/requests", icon: "Inbox" },

    // ADMIN + NETWORK + DEALER
    {
      label: "Προμήθειες",
      path: "/commissions",
      icon: "Percent",
      roles: [ROLES.ADMIN, ROLES.NETWORK, ROLES.DEALER],
    },

    // ADMIN + NETWORK + DEALER — each sees their own read-only pricelist
    // (ADMIN edits it, NETWORK and DEALER only view it)
    {
      label: "Τιμοκατάλογος",
      path: "/pricelist",
      icon: "LocalOffer",
      roles: [ROLES.ADMIN, ROLES.NETWORK, ROLES.DEALER],
    },
  ];

  return all.filter((item) => !item.roles || item.roles.includes(role));
}
