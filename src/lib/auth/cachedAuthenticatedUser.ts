import { cache } from "react";

import { resolveAuthenticatedUser } from "@/services/authenticationService";

export const getAuthenticatedUser = cache(resolveAuthenticatedUser);
