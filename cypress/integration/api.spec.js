/// <reference type="cypress"/>

describe('API', function () {

	beforeEach(function () {
		cy.visit('/')
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

})