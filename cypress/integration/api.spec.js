/// <reference type="cypress"/>

describe('API', function () {

	beforeEach(function () {
		cy.loginByXstate('Katharina_Bernier')
	})

	it('🔎 Verify length of notifications', () => {
		cy.request("GET", `${Cypress.env('apiUrl')}/notifications`).then(response => {
			expect(response.status).to.eq(200)
			expect(response.body.results.length).to.be.greaterThan(0);
			expect(response.body.results).to.have.length(8)
			cy.wrap(response.body.results[0])
				.its('userFullName')
				.should('be.oneOf', ['Ibrahim Dickens', 'Edgar Johns', 'Kaylin Homenick'])
		})
	});

	it('🔎 Verify bank account is created via API', () => {
		cy.log("📃 CLICK ON BANK ACCOUNTS")
		cy.getDtLike('sidenav-bankaccounts').click()
		cy.getDtLike('bankaccount-list').should('not.contain', "MyBank")

		cy.log("📃 CREATE BANK ACCOUNT VIA API")
		cy.createBankAccount("MyBank", '1111111111', '111456111')

		cy.reload()
		cy.getDtLike('bankaccount-list').should('contain', "MyBank")
	});

	it('🔎 Verify notifications are created via API', () => {
		cy.log("📃 CREATE NOTIFICATIONS VIA API")
		cy.createNotifications()

		cy.log("📃 CLICK ON NOTIFICATIONS")
		cy.getDtLike('sidenav-notifications').click()
	});

})
