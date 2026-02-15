import { useAtomValue } from 'jotai';
import { settingsAtom } from '@/stores/settingsStore';
import type { Rule, RuleTrigger, RuleCondition, RuleAction } from '@/types';

export function useRules() {
    const settings = useAtomValue(settingsAtom);
    const rules = settings.rules || [];

    const evaluateCondition = (condition: RuleCondition, context: any): boolean => {
        const { field, operator, value } = condition;
        const contextValue = context[field];

        switch (operator) {
            case 'exists':
                return contextValue !== undefined && contextValue !== null && contextValue !== '';
            case 'not_exists':
                return contextValue === undefined || contextValue === null || contextValue === '';
            case 'equals':
                return contextValue === value;
            case 'not_equals':
                return contextValue !== value;
            case 'contains':
                if (Array.isArray(contextValue)) {
                    return contextValue.includes(value);
                }
                if (typeof contextValue === 'string') {
                    return contextValue.includes(String(value));
                }
                return false;
            default:
                return false;
        }
    };

    const evaluateRule = (rule: Rule, context: any): RuleAction[] | null => {
        if (!rule.enabled) return null;

        const allConditionsMet = rule.conditions.every(condition =>
            evaluateCondition(condition, context)
        );

        return allConditionsMet ? rule.actions : null;
    };

    const getAppliedActions = (trigger: RuleTrigger, context: any): RuleAction[] => {
        const triggerRules = rules.filter(r => r.trigger === trigger);
        const allActions: RuleAction[] = [];

        triggerRules.forEach(rule => {
            const actions = evaluateRule(rule, context);
            if (actions) {
                allActions.push(...actions);
            }
        });

        return allActions;
    };

    const applyRules = (trigger: RuleTrigger, context: any, data: any) => {
        const actions = getAppliedActions(trigger, context);
        const updatedData = { ...data };

        actions.forEach(action => {
            updatedData[action.field as keyof any] = action.value;
        });

        return updatedData;
    };

    return {
        evaluateRules: getAppliedActions,
        applyRules
    };
}
