// Small classnames joiner — filters out falsy values so conditional
// classes can be written as `cn("base", isActive && "active")`.
export const cn = (...classes) => classes.filter(Boolean).join(" ");
