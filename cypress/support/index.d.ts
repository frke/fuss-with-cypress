declare namespace Cypress {
    interface Chainable<Subject> {

        /**
         * Get element by data-test selector like (provide partial value for selector)
         * @example
         * cy.getDtLike('gnin-userna')
         *
         * "signin-username" is full value
         */
        getDtLike(selectorLike: string, ...args): Chainable<any>

    }
}