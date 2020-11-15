export const byTextAscending = <T extends {}>(getTextProperty: (object: T) => string) => (objectA: T, objectB: T) => {
    const upperA = getTextProperty(objectA).toUpperCase();
    const upperB = getTextProperty(objectB).toUpperCase();
    if (upperA < upperB) {
        return -1;
    }
    if (upperA > upperB) {
        return 1;
    }
    return 0;
};

export const byTextDescending = <T extends {}>(getTextProperty: (object: T) => string) => (objectA: T, objectB: T) => {
    const upperA = getTextProperty(objectA).toUpperCase();
    const upperB = getTextProperty(objectB).toUpperCase();
    if (upperA > upperB) {
        return -1;
    }
    if (upperA < upperB) {
        return 1;
    }
    return 0;
};

/**
 * get the value of a deeply nested object
 *
 * @param p {(string | number)[]} the path in array format. ex: ["user", "messages"]
 * @param o {Record<string,unknown>} the object or array that is being traversed
 */
export const get = (p: (string | number)[], o: Record<string, unknown>) => {
    return p.reduce((xs: any, x: any) => (xs && xs[x] ? xs[x] : null), o);
};
