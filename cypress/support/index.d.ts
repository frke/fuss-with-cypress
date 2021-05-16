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

        /**
         * Logs in bypassing UI by triggering XState login event
         */
        loginByXstate(username: string, password?: string): Chainable<any>;

        /**
         * Creates bank account via API
         */
        createBankAccount(bankName?: string, accountNumber?: string, routingNumber?: string): Chainable<any>;

        /**
         * Creates notifications (like, comment, payment via API
         */
        createNotifications(): Chainable<any>;

    }
}