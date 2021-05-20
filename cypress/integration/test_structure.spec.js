/// <reference types="cypress" />

context('SUITE', () => {

	beforeEach(() => {
		cy.log("CONTEXT LEVEL")
	})

	describe('GROUP I', () => {

		it('Verify nested 1', () => {
			cy.log("GROUP Test")
		});

		it('Verify nested 2', () => {
			cy.log("GROUP Test")
		});

		it('Verify nested 3', () => {
			cy.log("GROUP Test")
		});
	})

	describe('GROUP II', () => {

		beforeEach(() => {
			cy.log("GROUP LEVEL")
		})

		it.only('Verify nested 1', () => {
			cy.log("GROUP Test")
		});

		it('Verify nested 2', () => {
			cy.log("GROUP Test")
		});
	})

	it('Verify 1', () => {
		cy.log("Test")
	})

	it('Verify 2', () => {
		cy.log("Test")
	})

})
