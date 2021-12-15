import Validate from 'mw.validation';

export function computeInitialStateErrorMessage(state, rules) {
    for (const propertyName in rules) {
        const input = state[propertyName];
        if (input && input instanceof Object) {
            const event = {
                name: propertyName,
                value: input.value,
                viewValue: input.viewValue,
                values: input.values,
            };
            state = genericHandleChange(rules, state, event);
        }
    }
    return state;
}

export function validate(rules, value) {
    const validationResult = Validate.validation.firstError(
        Validate.validation.validateView(value, rules)
    );

    return validationResult != null ? validationResult.message : null;
}

export function genericHandleChange(rules, state, event) {
    if (rules[event.name]) {
        if (event.values !== undefined) {
            // Le cas d'un champs qui possède des valeurs multiple
            const { values } = event;
            return {
                ...state,
                [event.name]: {
                    ...state[event.name],
                    values,
                },
            };
        }
        if (event.viewValue !== undefined) {
            // Le cas d'un date par exemple on valide du text et non un objet date
            const { viewValue, value } = event;
            const inputRules = rules[event.name];
            const message = validate(inputRules, viewValue);
            return {
                ...state,
                [event.name]: {
                    ...state[event.name],
                    value,
                    viewValue,
                    message,
                },
            };
        }
        // le cas le plus répandu, on valide une "value" simple
        const { value } = event;
        const inputRules = rules[event.name];
        const message = validate(inputRules, value);
        return {
            ...state,
            [event.name]: {
                ...state[event.name],
                value,
                message,
            },
        };
    }
    console.warn(`Attention le champ ${event.name} n'est pas traité`);
    return state;
}