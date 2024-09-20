export const merge = (...objects: object[]): object => {
    return objects.reduce((merged: any, obj: any) => {
        Object.keys(obj).forEach(key => {
            if (obj.hasOwnProperty(key)) {
                merged[key] = obj[key];
            }
        });
        return merged;
    }, {});
};
