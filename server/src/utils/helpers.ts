import jwt from "jsonwebtoken";

export const extractDomain = (email: string): string => {
  const parts = email.split("@");
  if (parts.length !== 2) {
    throw new Error("Invalid email format");
  }
  return parts[1].toLowerCase();
};

export const getSchoolName = (domain: string): string => {
  // Extract school name from domain
  // e.g., "stanford.edu" -> "Stanford"
  // e.g., "cs.columbia.edu" -> "Columbia"
  
  const parts = domain.split(".");
  const eduIndex = parts.findIndex((p) => p === "edu" || p === "ac");
  
  if (eduIndex > 0) {
    // Get the part before .edu or .ac
    const schoolPart = parts[eduIndex - 1];
    return capitalizeFirst(schoolPart);
  }
  
  // For other domains, use the first part
  return capitalizeFirst(parts[0]);
};

const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const generateToken = (payload: { id: string; email: string; schoolId: string }): string => {
  return jwt.sign(payload, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "7d",
  });
};

export const formatUserResponse = (user: any, school: any) => {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    schoolId: user.schoolId,
    schoolName: school?.name || "Unknown School",
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  };
};

