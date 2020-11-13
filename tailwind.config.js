/* eslint-disable @typescript-eslint/no-var-requires */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
    purge: ['./src/**/*.html', './src/**/*.tsx'],
    future: {
        // https://tailwindcss.com/docs/upcoming-changes#remove-deprecated-gap-utilities
        removeDeprecatedGapUtilities: true,
        // https://tailwindcss.com/docs/upcoming-changes#purge-layers-by-default
        purgeLayersByDefault: true,
    },
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter var', ...defaultTheme.fontFamily.sans],
            },
        },
    },
    variants: {},
    plugins: [require('@tailwindcss/custom-forms'), require('@tailwindcss/typography')],
};
