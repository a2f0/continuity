import policy from "./agent-tool.json";

export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [2, "always", policy.subject.types],
    "header-max-length": [2, "always", policy.subject.maxLength],
  },
};
