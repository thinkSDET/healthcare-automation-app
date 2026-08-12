/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import { Link } from "react-router-dom";

type ContextualBackLinkProps = {
  to: string;
  label: string;
  className?: string;
};

/**
 * Explicit parent-route navigation.
 * Prefer this over browser history when a clear parent exists.
 */
function ContextualBackLink({
  to,
  label,
  className = "secondary-button",
}: ContextualBackLinkProps) {
  return (
    <Link to={to} className={className}>
      ← {label}
    </Link>
  );
}

export default ContextualBackLink;
