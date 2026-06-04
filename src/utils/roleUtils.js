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
    { label: "Dashboard", path: "/dashboard", icon: "Dashboard" },
    { label: "Πελάτες", path: "/customers", icon: "People" },
    { label: "Network", path: "/networks", icon: "Hub", roles: [ROLES.ADMIN] },
    {
      label: "Dealers",
      path: "/dealers",
      icon: "Store",
      roles: [ROLES.ADMIN, ROLES.NETWORK],
    },
    {
      label: "Sub-dealers",
      path: "/subdealers",
      icon: "PersonCheck",
      roles: [ROLES.ADMIN, ROLES.NETWORK, ROLES.DEALER],
    },
    { label: "Αιτήματα", path: "/requests", icon: "Inbox" },
    {
      label: "Προμήθειες",
      path: "/commissions",
      icon: "Percent",
      roles: [ROLES.ADMIN, ROLES.NETWORK, ROLES.DEALER],
    },
    {
      label: "Τιμοκατάλογος",
      path: "/pricelist",
      icon: "LocalOffer",
      roles: [ROLES.ADMIN],
    },
  ];
  return all.filter((item) => !item.roles || item.roles.includes(role));
}
