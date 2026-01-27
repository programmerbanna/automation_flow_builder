/**
 * Logic for evaluating condition rules against an email
 */

export interface ConditionRule {
  field: string;
  operator: "equals" | "not_equals" | "includes" | "starts_with" | "ends_with";
  value: string;
  join?: "AND" | "OR";
}

/**
 * Evaluates a single rule against the provided email
 */
const evaluateRule = (rule: ConditionRule, email: string): boolean => {
  const targetValue = (email || "").toLowerCase().trim();
  const compareValue = (rule.value || "").toLowerCase().trim();

  switch (rule.operator) {
    case "equals":
      return targetValue === compareValue;
    case "not_equals":
      return targetValue !== compareValue;
    case "includes":
      return targetValue.includes(compareValue);
    case "starts_with":
      return targetValue.startsWith(compareValue);
    case "ends_with":
      return targetValue.endsWith(compareValue);
    default:
      return false;
  }
};

/**
 * Evaluates a list of rules against the provided email
 * - First rule has no join (it's the base result)
 * - Subsequent rules apply join with the previous result
 */
export const evaluateCondition = (
  rules: ConditionRule[],
  email: string,
): boolean => {
  console.log(`[Condition Debug] Starting evaluation for email: "${email}"`);
  console.log(
    `[Condition Debug] Rules to check:`,
    JSON.stringify(rules, null, 2),
  );

  if (!rules || !Array.isArray(rules) || rules.length === 0) {
    console.log(`[Condition Debug] No rules found, returning FALSE`);
    return false;
  }

  // Initial result from the first rule
  let result = evaluateRule(rules[0], email);
  console.log(`[Condition Debug] Step 0 (Rule 1) result: ${result}`);

  // Apply subsequent rules with their joins
  for (let i = 1; i < rules.length; i++) {
    const rule = rules[i];
    const ruleResult = evaluateRule(rule, email);
    const oldResult = result;

    if (rule.join === "AND") {
      result = result && ruleResult;
    } else if (rule.join === "OR") {
      result = result || ruleResult;
    }
    console.log(
      `[Condition Debug] Step ${i} (Rule ${i + 1}) [${rule.join}]: ${oldResult} -> ${result} (Rule output: ${ruleResult})`,
    );
  }

  console.log(`[Condition Debug] FINAL EVALUATION RESULT: ${result}`);
  return result;
};
