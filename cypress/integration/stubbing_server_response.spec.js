/// <reference types="cypress" />

const bankAccountsFixture = require('../fixtures/bank-accounts.json')
const notificationFixture = require('../fixtures/notifications.json')

describe('INTERCEPT & STUBBING SERVER RESPONSE', () => {

	const accountList = bankAccountsFixture.data.listBankAccount

	before(() => {
		cy.log("📃 STUB SERVER RESPONSE FOR NOTIFICATIONS")
		cy.intercept('GET', `${Cypress.env('apiUrl')}/notifications`, notificationFixture)

		cy.log("📃 STUB SERVER RESPONSE FOR BANK ACCOUNTS")
		cy.stubGQL('listBankAccount', bankAccountsFixture)

		cy.visit('/')
		cy.loginByXstate('Katharina_Bernier')
	})

	accountList.forEach((account) => {
		it(`🔎 Verify that stubbed "${account.bankName}" is in the list of accounts`, () => {
			cy.log("📃 CLICK ON BANK ACCOUNTS")
			cy.getDtLike('sidenav-bankaccounts').click()
			cy.getDtLike('bankaccount-list').should('contain', account.bankName)
		});
	})

	it('🔎 Verify that stubbed notification is in the list', () => {
		cy.log("📃 CLICK ON NOTIFICATIONS")
		cy.getDtLike('sidenav-notifications').click()
	});

});
