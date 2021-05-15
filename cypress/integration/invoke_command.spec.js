/// <reference type="cypress"/>

describe('INVOKE COMMAND', () => {

	beforeEach(() => {
		cy.visit('/')
	})

	it('Verify button text equals "Sign In"', () => {

		cy.log('📃 VERIFY BUTTON TEXT - CYPRESS ASSERTION')
		cy.get('button').should('have.text', 'Sign In')

		cy.log('📃 VERIFY BUTTON TEXT - jQuery ASSERTION')
		cy.get('button').then(button => {
			expect(button.text()).to.equal('Sign In')
		})

		cy.log('📃 INVOKE TEXT FUNCTION ON ELEMENT')
		cy.get('button').invoke('text').then(text => {
			expect(text).to.equal('Sign In')
		})

	});

	it('Modifying CSS and Attributes with invoke command', () => {

		cy.log('📃 CHANGE ELEMENT ATTRIBUTE VALUES')
		cy.get('#username').invoke('css', 'display', 'none')

		cy.log('📃 PAUSE TEST')
		cy.pause()

		cy.log('📃 CHANGE ELEMENT CSS VALUES')
		cy.get('#password').invoke('attr', 'type', 'checkbox')

	});

})